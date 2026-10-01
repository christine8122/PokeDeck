"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      if (error) throw error;

      router.push("/auth/sign-up-success");
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
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-semibold">
            Create Account
          </CardTitle>

          <CardDescription className="text-base">
            Create a new account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-5">
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                className="h-12 px-4 text-base"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-base">
                Confirm Password
              </Label>

              <Input
                id="repeat-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="h-12 px-4 text-base"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-12 w-full bg-yellow-400 text-base font-semibold text-black hover:bg-yellow-500"
            >
              {isLoading ? "Creating an account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t-0 bg-transparent">
          <p className="text-base text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-red-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}