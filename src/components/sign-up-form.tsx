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
  <div className={cn("w-full max-w-2xl", className)} {...props}>
    <Card className="min-h-[620px] w-full py-10 sm:py-12">
      <CardHeader className="px-6 text-center sm:px-10">
        <CardTitle className="text-4xl font-semibold sm:text-5xl">
          Create Account
        </CardTitle>

        <CardDescription className="text-lg">
          Create a new account
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-10">
        <form onSubmit={handleSignUp} className="space-y-7">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-14 px-4 text-lg md:text-lg"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-lg">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              className="h-14 px-4 text-lg md:text-lg"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="repeat-password" className="text-lg">
              Confirm Password
            </Label>

            <Input
              id="repeat-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="h-14 px-4 text-lg md:text-lg"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-base text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-14 w-full bg-yellow-400 text-lg font-semibold text-black hover:bg-yellow-500"
          >
            {isLoading ? "Creating an account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t-0 bg-transparent px-6 sm:px-10">
        <p className="text-center text-lg text-muted-foreground">
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