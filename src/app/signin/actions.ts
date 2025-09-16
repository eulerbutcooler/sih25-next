"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signin(formData: FormData) {
  const supabase = await createClient();

  // Extract form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return redirect("/signin?error=missing-fields");
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return redirect("/signin?error=invalid-credentials");
      }
      if (error.message.includes("Email not confirmed")) {
        return redirect("/signin?error=email-not-confirmed");
      }
      if (error.message.includes("too many requests")) {
        return redirect("/signin?error=too-many-attempts");
      }

      return redirect("/signin?error=signin-failed");
    }

    if (!data.user) {
      return redirect("/signin?error=signin-failed");
    }

    // Successful login
    revalidatePath("/", "layout");
    redirect("/home");
  } catch (error: any) {
    // Don't log NEXT_REDIRECT as an error - it's expected behavior
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect errors
    }

    console.error("Sign in error:", error);
    return redirect("/signin?error=server-error");
  }
}
