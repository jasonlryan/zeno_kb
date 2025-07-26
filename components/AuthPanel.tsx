"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPanel() {
  const { user, role, loading, signUp, signIn, signOut } = useSupabaseAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn"); // Always default to sign in
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const fn = mode === "signIn" ? signIn : signUp;
      const { error } = await fn(email, password);
      if (error) {
        // If sign in fails, suggest sign up
        if (
          mode === "signIn" &&
          error.message.includes("Invalid login credentials")
        ) {
          setError(
            "Account not found. Please check your credentials or create a new account."
          );
        } else {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="zeno-headline text-2xl font-bold text-foreground">
            Zeno Knowledge Hub
          </CardTitle>
          <CardDescription>
            {mode === "signIn"
              ? "Sign in to your existing account"
              : "Create a new account (Warning: This will create a new user profile)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {mode === "signIn" ? "Sign In" : "Create New Account"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
            >
              {mode === "signIn"
                ? "Need to create an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
