"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, LogOut } from "lucide-react";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export default function PasswordProtection({
  children,
}: PasswordProtectionProps) {
  const { signOut } = useSupabaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("zeno-auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    } else {
      // If password protection is not authenticated, also clear any stale Supabase sessions
      signOut().catch(console.error);
    }
    setIsLoading(false);
  }, [signOut]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === "zeno2025") {
      setIsAuthenticated(true);
      localStorage.setItem("zeno-auth", "authenticated");
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleLogout = async () => {
    // Sign out from both systems
    setIsAuthenticated(false);
    localStorage.removeItem("zeno-auth");

    // Also sign out from Supabase to ensure clean session
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out from Supabase:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Zeno Knowledge Hub
            </CardTitle>
            <CardDescription>
              Please enter the password to access the knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Access Knowledge Hub
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      {/* Logout button - fixed position */}
      <Button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
        size="sm"
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
