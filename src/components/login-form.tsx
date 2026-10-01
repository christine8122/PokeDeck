"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { safeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const next = new URLSearchParams(window.location.search).get("next");
      router.push(safeNextPath(next, "/protected"));
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-lg", className)} {...props}>
      <Card className="min-h-[520px] w-full py-10">
        {/* Card Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-semibold">
            Log in
          </CardTitle>

          <CardDescription className="text-base">
            Welcome back, trainer.
          </CardDescription>
        </CardHeader>

        {/* Login Form */}
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 px-4 text-base"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>

                <Link
                  href="/auth/forgot-password"
                  className="text-base text-red-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 px-4 text-base"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-12 w-full bg-yellow-400 text-base font-semibold text-black hover:bg-yellow-500"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>

        {/* Create Account */}
        <CardFooter className="justify-center border-t-0 bg-transparent">
          <p className="text-base text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-red-700 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}