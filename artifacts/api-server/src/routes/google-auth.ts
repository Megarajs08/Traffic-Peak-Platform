import { Router, type IRouter } from "express";
import { OAuth2Client } from "google-auth-library";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { createSession } from "../lib/session";

const router: IRouter = Router();

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  frontendUrl: string;
};

function getFrontendUrl(req: Parameters<IRouter["get"]>[1] extends (req: infer T, ...args: any[]) => any ? T : any) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  const proto = req.headers["x-forwarded-proto"]?.toString().split(",")[0] || req.protocol || "http";
  const host = req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

function getApiBaseUrl(req: Parameters<IRouter["get"]>[1] extends (req: infer T, ...args: any[]) => any ? T : any) {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  const proto = req.headers["x-forwarded-proto"]?.toString().split(",")[0] || req.protocol || "http";
  const host = req.headers.host || "localhost:4000";
  return `${proto}://${host}`;
}

function getGoogleOAuthConfig(req: any): GoogleOAuthConfig {
  const frontendUrl = getFrontendUrl(req);
  const apiBaseUrl = getApiBaseUrl(req);
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${apiBaseUrl}/api/auth/google/callback`,
    frontendUrl,
  };
}

function getOAuthClient(config: GoogleOAuthConfig) {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
}

// Step 1 — redirect browser to Google consent screen
router.get("/auth/google", (req, res) => {
  const config = getGoogleOAuthConfig(req);
  if (!config.clientId || !config.clientSecret) {
    res.redirect(`${config.frontendUrl}/login?error=google_not_configured`);
    return;
  }

  const client = getOAuthClient(config);
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
  res.redirect(url);
});

// Step 2 — Google redirects back here with ?code=...
router.get("/auth/google/callback", async (req, res) => {
  const config = getGoogleOAuthConfig(req);
  if (!config.clientId || !config.clientSecret) {
    res.redirect(`${config.frontendUrl}/login?error=google_not_configured`);
    return;
  }

  const code = req.query.code as string | undefined;
  if (!code) {
    res.redirect(`${config.frontendUrl}/login?error=google_cancelled`);
    return;
  }

  try {
    const client = getOAuthClient(config);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.redirect(`${config.frontendUrl}/login?error=google_no_email`);
      return;
    }

    const googleId = payload.sub;
    const email    = payload.email;
    const name     = payload.name ?? null;
    const avatar   = payload.picture ?? null;

    // Find existing user by googleId OR email
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.googleId, googleId), eq(usersTable.email, email)))
      .limit(1);

    let user = existing;

    if (user) {
      // Link googleId if not already set (user registered with email before)
      if (!user.googleId) {
        await db
          .update(usersTable)
          .set({ googleId, avatarUrl: user.avatarUrl ?? avatar })
          .where(eq(usersTable.id, user.id));
        user = { ...user, googleId, avatarUrl: user.avatarUrl ?? avatar };
      }
    } else {
      // New user — derive a unique username from their name/email
      const base = (name ?? email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 24);

      let username = base;
      let attempt  = 0;
      while (true) {
        const [taken] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.username, username))
          .limit(1);
        if (!taken) break;
        attempt++;
        username = `${base}_${attempt}`;
      }

      const [created] = await db
        .insert(usersTable)
        .values({ email, username, name, avatarUrl: avatar, googleId, passwordHash: "" })
        .returning();
      user = created;
    }

    await createSession(user.id, res);
    res.redirect(`${config.frontendUrl}/dashboard`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${config.frontendUrl}/login?error=google_failed`);
  }
});

export default router;
