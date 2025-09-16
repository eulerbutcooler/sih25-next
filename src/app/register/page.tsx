import Link from "next/link";
import { signup } from "./actions";

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="max-w-md mx-auto h-screen bg-black overflow-y-auto p-6">
      <div className="text-center mb-8">
        <i className="fas fa-shield-halved text-5xl text-amber-300"></i>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">
          Join Apat-Sahay
        </h1>
        <p className="text-gray-500">Help protect our oceans together</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-xl">
          <p className="text-red-300 text-sm">
            {error === "missing-fields" && "Please fill in all required fields"}
            {error === "password-mismatch" && "Passwords do not match"}
            {error === "terms-not-agreed" &&
              "Please agree to the terms and conditions"}
            {error === "signup-failed" &&
              "Failed to create account. Please try again."}
            {error === "database-error" &&
              "Database error occurred. Please try again."}
            {error === "user-exists" &&
              "An account with this email already exists."}
            {error === "invalid-email" && "Please enter a valid email address."}
            {error === "weak-password" &&
              "Password must be at least 6 characters long."}
            {error === "server-error" &&
              "Server error occurred. Please try again."}
            {error.startsWith("auth-failed") &&
              `Authentication failed: ${decodeURIComponent(
                error.split("details=")[1] || "Unknown error"
              )}`}
          </p>
        </div>
      )}

      <form action={signup} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-gray-400"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="Your full name"
            required
          />
        </div>

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

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="text-sm font-medium text-gray-400">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="form-input mt-1 w-full p-3 rounded-xl"
            defaultValue="citizen"
          >
            <option value="citizen">Citizen Reporter</option>
            <option value="official">Government Official</option>
            <option value="emergency">Emergency Services</option>
            <option value="scientist">Marine Scientist</option>
            <option value="authority">Port Authority</option>
          </select>
        </div>

        {/* Organization */}
        <div>
          <label
            htmlFor="organization"
            className="text-sm font-medium text-gray-400"
          >
            Organization
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="Your organization name (optional)"
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
            placeholder="••••••••"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-400"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input mt-1 w-full p-3 rounded-xl"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            className="mt-1"
            required
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-400">
            I agree to the{" "}
            <a href="#" className="text-amber-300 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-amber-300 hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Role Benefits */}
        <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-sm font-semibold text-amber-300 mb-2">
            Role Benefits:
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Report ocean hazards and incidents</li>
            <li>• Access to real-time hazard maps</li>
            <li>• Connect with emergency services</li>
            <li>• Earn community recognition badges</li>
          </ul>
        </div>

        {/* Register Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="primary-btn w-full bg-amber-300 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-xl"
          >
            Create Account
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Already have an account?
            <Link
              href="/signin"
              className="text-amber-300 font-semibold hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
