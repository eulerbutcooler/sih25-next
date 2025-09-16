import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import { posts, users, likes } from "@/utils/db/schema";
import { desc, sql, eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // Get user details from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get user's posts count by status
    const postsStats = await db
      .select({
        status: posts.status,
        count: count(),
      })
      .from(posts)
      .where(eq(posts.userId, dbUser.id))
      .groupBy(posts.status);

    // Calculate total posts and stats
    const totalPosts = postsStats.reduce((sum, stat) => sum + stat.count, 0);
    const verifiedPosts =
      postsStats.find((s) => s.status === "verified")?.count || 0;
    const pendingPosts =
      postsStats.find((s) => s.status === "pending")?.count || 0;
    const rejectedPosts =
      postsStats.find((s) => s.status === "rejected")?.count || 0;

    // Get user's total likes/upvotes across all their posts
    const [{ totalUpvotes }] = await db
      .select({
        totalUpvotes: count(),
      })
      .from(likes)
      .leftJoin(posts, eq(likes.postId, posts.id))
      .where(eq(posts.userId, dbUser.id));

    // Get query parameters for posts pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const offset = (page - 1) * limit;

    // Get user's posts with details
    const userPosts = await db
      .select({
        id: posts.id,
        uuid: posts.uuid,
        caption: posts.caption,
        mediaUrl: posts.mediaUrl,
        mediaType: posts.mediaType,
        locationName: posts.locationName,
        hazardType: posts.hazardType,
        severity: posts.severity,
        status: posts.status,
        createdAt: posts.createdAt,
        location: sql<string>`ST_AsText(${posts.location})`,
        likesCount: count(likes.postId),
      })
      .from(posts)
      .leftJoin(likes, eq(posts.id, likes.postId))
      .where(eq(posts.userId, dbUser.id))
      .groupBy(
        posts.id,
        posts.uuid,
        posts.caption,
        posts.mediaUrl,
        posts.mediaType,
        posts.locationName,
        posts.hazardType,
        posts.severity,
        posts.status,
        posts.createdAt,
        posts.location
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total user posts count for pagination
    const [{ totalUserPosts }] = await db
      .select({ totalUserPosts: count() })
      .from(posts)
      .where(eq(posts.userId, dbUser.id));

    const totalPages = Math.ceil(totalUserPosts / limit);

    // Transform posts data
    const transformedPosts = userPosts.map((post) => ({
      ...post,
      coordinates: post.location
        ? parseLocationCoordinates(post.location)
        : null,
    }));

    // Calculate accuracy percentage (verified posts / total posts)
    const accuracyPercentage =
      totalPosts > 0 ? Math.round((verifiedPosts / totalPosts) * 100) : 0;

    // Format join date
    const joinDate = new Date(dbUser.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        uuid: dbUser.uuid,
        username: dbUser.username,
        fullName: dbUser.fullName,
        email: dbUser.email,
        role: dbUser.role,
        organization: dbUser.organization,
        avatarUrl:
          dbUser.avatarUrl ||
          `https://placehold.co/96x96/18181b/fcd34d?text=${
            dbUser.fullName
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"
          }`,
        joinDate,
        verified: dbUser.role !== "citizen", // Consider officials and emergency personnel as verified
      },
      stats: {
        totalPosts,
        verifiedPosts,
        pendingPosts,
        rejectedPosts,
        totalUpvotes,
        accuracyPercentage,
      },
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: totalUserPosts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

// Helper function to parse PostGIS POINT coordinates
function parseLocationCoordinates(
  locationString: string
): { lat: number; lng: number } | null {
  try {
    // PostGIS returns format: POINT(longitude latitude)
    const match = locationString.match(/POINT\(([^)]+)\)/);
    if (!match) return null;

    const coords = match[1].split(" ");
    if (coords.length !== 2) return null;

    return {
      lng: parseFloat(coords[0]),
      lat: parseFloat(coords[1]),
    };
  } catch (error) {
    console.error("Error parsing coordinates:", error);
    return null;
  }
}
