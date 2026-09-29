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
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">

      {/* Login Card */}
      <Card className="min-h-[520px] w-full max-w-lg py-10">

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
          <form className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base"
              >
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 px-4 text-base"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-base"
                >
                  Password
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-base text-red-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 px-4 text-base"
              />

            </div>

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full bg-yellow-400 text-base font-semibold text-black hover:bg-yellow-500"
            >
              Log in
            </Button>

          </form>
        </CardContent>

        {/* Create Account */}
        <CardFooter className="justify-center border-t-0 bg-transparent">
          <p className="text-base text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-red-700 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>

      </Card>

    </main>
  );
}