import { createClient } from "@/utils/supabase/client";

/**
 * Sign out the current user and redirect to signin page
 * @param redirectTo - Optional path to redirect to after signout (defaults to '/signin')
 */
export async function signOut(redirectTo: string = "/signin"): Promise<void> {
  try {
    // Try API endpoint first for proper session cleanup
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // API signout successful, redirect
      window.location.href = redirectTo;
      return;
    }

    // Fallback to direct Supabase signout if API fails
    const supabase = createClient();
    await supabase.auth.signOut();

    // Redirect after successful signout
    window.location.href = redirectTo;
  } catch (error) {
    console.error("Signout error:", error);

    // Emergency fallback - still redirect to signin
    // This ensures user can't get stuck in authenticated state
    window.location.href = redirectTo;
  }
}
