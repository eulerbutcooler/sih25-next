import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import { likes, users, posts } from "@/utils/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Get current user and check if post exists in one query
    const [currentUser] = await db
      .select({
        userId: users.id,
        postExists: posts.id,
      })
      .from(users)
      .leftJoin(posts, eq(posts.id, postId))
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    if (!currentUser.postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has already liked this post and toggle in one transaction
    const result = await db.transaction(async (tx) => {
      const [existingLike] = await tx
        .select()
        .from(likes)
        .where(
          and(eq(likes.userId, currentUser.userId), eq(likes.postId, postId))
        )
        .limit(1);

      if (existingLike) {
        // Unlike the post
        await tx
          .delete(likes)
          .where(
            and(eq(likes.userId, currentUser.userId), eq(likes.postId, postId))
          );

        return { liked: false, message: "Post unliked successfully" };
      } else {
        // Like the post
        await tx.insert(likes).values({
          userId: currentUser.userId,
          postId: postId,
        });

        return { liked: true, message: "Post liked successfully" };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
