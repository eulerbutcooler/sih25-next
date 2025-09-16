"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import { posts, users } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

interface CreatePostData {
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  hazardType: string;
  severity: string;
  mediaFile: File;
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Authentication error:", authError);
    redirect("/signin?error=not-authenticated");
  }

  // Extract form data
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const hazardType = formData.get("hazardType") as string;
  const severity = formData.get("severity") as string;
  const mediaFile = formData.get("mediaFile") as File;

  // Validate required fields
  if (!description || !location || !hazardType || !severity || !mediaFile) {
    redirect("/create-post?error=missing-fields");
  }

  if (!latitude || !longitude) {
    redirect("/create-post?error=location-required");
  }

  // Get user from our database
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, user.id))
    .limit(1);

  if (!dbUser) {
    console.error("User not found in database");
    redirect("/signin?error=user-not-found");
  }

  // Upload media file to Supabase Storage
  const fileExt = mediaFile.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("posts")
    .upload(filePath, mediaFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    redirect("/create-post?error=upload-failed");
  }

  // Get the public URL of the uploaded file
  const {
    data: { publicUrl },
  } = supabase.storage.from("posts").getPublicUrl(filePath);

  // Determine media type
  const mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";

  // Create the post in database
  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        userId: dbUser.id,
        caption: description,
        mediaUrl: publicUrl,
        mediaType: mediaType as "image" | "video",
        location: `POINT(${longitude} ${latitude})`,
        locationName: location,
        hazardType: hazardType as any,
        severity: severity as "low" | "medium" | "high" | "critical",
        status: "pending",
      })
      .returning();

    if (!newPost) {
      // If post creation fails, clean up the uploaded file
      await supabase.storage.from("posts").remove([filePath]);
      redirect("/create-post?error=post-creation-failed");
    }
  } catch (dbError) {
    console.error("Database error:", dbError);
    // Clean up uploaded file on database error
    await supabase.storage.from("posts").remove([filePath]);
    redirect("/create-post?error=database-error");
  }

  // Revalidate the home page to show the new post
  revalidatePath("/home");

  // Redirect to home page on success
  redirect("/home");
}

export async function getCurrentUserLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  // This would typically be handled on the client side
  // This is a placeholder for server-side location detection if needed
  return null;
}
