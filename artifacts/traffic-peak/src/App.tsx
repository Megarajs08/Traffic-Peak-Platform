import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { CookieBanner } from "@/components/layout/CookieBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TypingTest from "@/pages/typing-test";
import Learn from "@/pages/learn";
import Games from "@/pages/games";
import Leaderboard from "@/pages/leaderboard";
import Dashboard from "@/pages/dashboard";
import Certificates from "@/pages/certificates";
import VerifyCertificate from "@/pages/verify-certificate";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import Disclaimer from "@/pages/disclaimer";
import CookiePolicy from "@/pages/cookie-policy";
import SitemapPage from "@/pages/sitemap-page";
import AdminPanel from "@/pages/admin/index";
import PostForm from "@/pages/admin/post-form";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/typing-test" component={TypingTest} />
      <Route path="/learn" component={Learn} />
      <Route path="/games" component={Games} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/certificates" component={Certificates} />
      <Route path="/verify-certificate/:certificateId" component={VerifyCertificate} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* Info & Legal */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/sitemap" component={SitemapPage} />
      {/* Admin */}
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/posts/new" component={PostForm} />
      <Route path="/admin/posts/:id/edit" component={PostForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <CookieBanner />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
