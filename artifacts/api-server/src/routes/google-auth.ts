import { Router, type IRouter } from "express";
import { OAuth2Client } from "google-auth-library";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { createSession } from "../lib/session";

const router: IRouter = Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4173/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4173";

function getOAuthClient() {
  return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// Step 1 — redirect browser to Google consent screen
router.get("/auth/google", (_req, res) => {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
  res.redirect(url);
});

// Step 2 — Google redirects back here with ?code=...
router.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    res.redirect(`${FRONTEND_URL}/login?error=google_cancelled`);
    return;
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
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
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
});

export default router;
