import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex justify-center px-6 pt-16">

      {/* Login Card */}
      <Card className="w-full max-w-md  min-h-[500px]py-10">

        {/* Card Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            Log in
          </CardTitle>

          <CardDescription>
            Welcome back, trainer.
          </CardDescription>
        </CardHeader>

        {/* Login Form */}
        <CardContent>
          <form className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">

              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-red-700 text-muted-foreground hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />

            </div>

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Log in
            </Button>

          </form>
        </CardContent>

        {/* Create Account */}
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-red-700 text-foreground hover:underline"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>

      </Card>
    </main>
  );
}