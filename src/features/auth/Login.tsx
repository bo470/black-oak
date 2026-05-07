import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { LogIn, Mail, Lock, Chrome } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/src/firebase";

import { useAuth } from "./AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { signInAnonymously } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password authentication is not enabled in the Firebase Console. Please contact the administrator.");
      } else if (err.code === 'auth/admin-restricted-operation') {
        setError("User registration is restricted. Please enable 'Enable create (sign-up)' in the Firebase Console under Authentication > Settings > User actions.");
      } else {
        setError(err.message || "Failed to login. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Google authentication is not enabled in the Firebase Console. Please contact the administrator.");
      } else if (err.code === 'auth/admin-restricted-operation') {
        setError("User registration is restricted. Please enable 'Enable create (sign-up)' in the Firebase Console under Authentication > Settings > User actions.");
      } else {
        setError(err.message || "Failed to login with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously();
      navigate("/");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Guest/Anonymous authentication is not enabled in the Firebase Console. Please contact the administrator.");
      } else if (err.code === 'auth/admin-restricted-operation') {
        setError("Guest access is restricted. Please enable 'Enable create (sign-up)' in the Firebase Console under Authentication > Settings > User actions.");
      } else {
        setError("Failed to sign in as guest. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 transition-colors duration-300 dark:bg-black">
      <Card className="w-full max-w-md border-slate-200 bg-white/50 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-500 dark:text-gray-400">
            Enter your credentials to access Black Oak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 dark:bg-gray-900 dark:text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800" 
              onClick={handleGuestLogin}
              disabled={loading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Guest
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-blue-500 hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
