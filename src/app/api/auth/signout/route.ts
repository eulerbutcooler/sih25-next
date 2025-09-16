import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Signout error:", error);
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 }
      );
    }

    // Clear any additional session data if needed
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear any auth-related cookies
    response.cookies.delete("supabase-auth-token");
    response.cookies.delete("supabase.auth.token");

    return response;
  } catch (error) {
    console.error("Unexpected signout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signout" },
      { status: 500 }
    );
  }
}

// Support GET method as well for flexibility
export async function GET(request: NextRequest) {
  return POST(request);
}
