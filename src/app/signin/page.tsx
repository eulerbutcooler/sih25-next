import Link from "next/link";
import { signin } from "./actions";

interface SigninPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function SigninPage({ searchParams }: SigninPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="max-w-md mx-auto h-screen bg-black overflow-y-auto p-6">
      <div className="text-center mb-8">
        <i className="fas fa-shield-halved text-5xl text-amber-300"></i>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">
          Welcome Back
        </h1>
        <p className="text-gray-500">Sign in to Apat-Sahay</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-xl">
          <p className="text-red-300 text-sm">
            {error === "missing-fields" && "Please fill in all required fields"}
            {error === "invalid-credentials" && "Invalid email or password"}
            {error === "email-not-confirmed" &&
              "Please confirm your email address first"}
            {error === "too-many-attempts" &&
              "Too many sign in attempts. Please try again later"}
            {error === "signin-failed" && "Sign in failed. Please try again"}
            {error === "server-error" &&
              "Server error occurred. Please try again"}
            {![
              "missing-fields",
              "invalid-credentials",
              "email-not-confirmed",
              "too-many-attempts",
              "signin-failed",
              "server-error",
            ].includes(error) && "An error occurred. Please try again"}
          </p>
        </div>
      )}

      <form action={signin} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-400">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-400"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="Your password"
            required
          />
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full bg-amber-300 text-black font-bold py-3 px-4 rounded-xl hover:bg-amber-400 transition-colors"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-1 border-gray-800" />
        <span className="px-3 text-sm text-gray-500">or</span>
        <hr className="flex-1 border-gray-800" />
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-amber-300 hover:text-amber-400 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-2">
        <div className="flex justify-center space-x-6 text-xs">
          <Link href="#" className="text-gray-500 hover:text-amber-300">
            Privacy Policy
          </Link>
          <Link href="#" className="text-gray-500 hover:text-amber-300">
            Terms of Service
          </Link>
          <Link href="#" className="text-gray-500 hover:text-amber-300">
            Help
          </Link>
        </div>
        <p className="text-xs text-gray-600">
          © 2025 Apat-Sahay. All rights reserved.
        </p>
      </div>
    </div>
  );
}
