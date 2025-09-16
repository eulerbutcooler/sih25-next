"use server";

import { redirect } from "next/navigation";
import { serverSignOut } from "@/utils/auth-server";

export async function signout() {
  try {
    const result = await serverSignOut();

    if (!result.success) {
      console.error("Server signout error:", result.error);
      // Still redirect even if there's an error to prevent user from being stuck
      redirect("/signin?error=signout-failed");
    }

    redirect("/signin");
  } catch (error) {
    console.error("Unexpected signout error:", error);
    redirect("/signin?error=signout-failed");
  }
}
