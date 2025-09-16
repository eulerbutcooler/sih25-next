"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import { users } from "@/utils/db/schema";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Extract all form data
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = formData.get("role") as string;
  const organization = formData.get("organization") as string;
  const agreeToTerms = formData.get("agreeToTerms") === "on";

  // Basic validation - return error instead of redirecting immediately
  if (!fullName || !email || !password) {
    return redirect("/register?error=missing-fields");
  }

  if (password !== confirmPassword) {
    return redirect("/register?error=password-mismatch");
  }

  if (!agreeToTerms) {
    return redirect("/register?error=terms-not-agreed");
  }

  try {
    // Create user account in Supabase Auth without email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          organization: organization || null,
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      console.error("Auth error message:", authError.message);
      console.error("Auth error status:", authError.status);

      // Handle specific error cases
      if (authError.message?.includes("User already registered")) {
        return redirect("/register?error=user-exists");
      }
      if (authError.message?.includes("Invalid email")) {
        return redirect("/register?error=invalid-email");
      }
      if (authError.message?.includes("Password")) {
        return redirect("/register?error=weak-password");
      }

      return redirect(
        `/register?error=auth-failed&details=${encodeURIComponent(
          authError.message
        )}`
      );
    }

    if (!authData.user) {
      return redirect("/register?error=signup-failed");
    }

    // Create user record in our database immediately
    try {
      await db.insert(users).values({
        supabaseId: authData.user.id,
        fullName,
        email,
        role: role as
          | "citizen"
          | "official"
          | "emergency"
          | "scientist"
          | "authority",
        organization: organization || null,
        username: email.split("@")[0], // Generate username from email
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // If DB insert fails, we should clean up the Supabase user
      // For now, just redirect with error
      return redirect("/register?error=database-error");
    }

    // Redirect to home on success
    revalidatePath("/", "layout");
    redirect("/home");
  } catch (error: any) {
    // Don't log NEXT_REDIRECT as an error - it's expected behavior
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect errors
    }

    console.error("Signup error:", error);
    return redirect("/register?error=server-error");
  }
}
