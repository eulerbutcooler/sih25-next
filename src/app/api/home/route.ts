import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import {
  posts,
  users,
  likes,
  postVerificationStatusEnum,
  severityEnum,
  hazardTypeEnum,
} from "@/utils/db/schema";
import { desc, sql, eq, and, count } from "drizzle-orm";
import getTimeAgo from "@/utils/fns/timeago";
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const severity = searchParams.get("severity");
    const hazardType = searchParams.get("hazardType");
    const status = searchParams.get("status"); // Optional status filter - shows all posts by default

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];

    if (
      status &&
      postVerificationStatusEnum.enumValues.includes(status as typeof postVerificationStatusEnum.enumValues[number])
    ) {
      conditions.push(
        eq(
          posts.status,
          status as (typeof postVerificationStatusEnum.enumValues)[number]
        )
      );
    }

    if (severity && severityEnum.enumValues.includes(severity as typeof severityEnum.enumValues[number])) {
      conditions.push(
        eq(posts.severity, severity as (typeof severityEnum.enumValues)[number])
      );
    }

    if (hazardType && hazardTypeEnum.enumValues.includes(hazardType as typeof hazardTypeEnum.enumValues[number])) {
      conditions.push(
        eq(
          posts.hazardType,
          hazardType as (typeof hazardTypeEnum.enumValues)[number]
        )
      );
    }

    // Get current user for checking likes
    const [currentUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Build the main query with posts, authors, and like counts
    const postsWithLikes = db
      .select({
        // Post details
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

        // Author details
        authorName: users.fullName,
        authorUsername: users.username,
        authorRole: users.role,
        authorAvatar: users.avatarUrl,
        authorId: users.id,

        // Like count for this post
        likesCount: count(likes.postId),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(likes, eq(posts.id, likes.postId))
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
        posts.location,
        users.fullName,
        users.username,
        users.role,
        users.avatarUrl,
        users.id
      );

    // Apply where conditions if any
    const query =
      conditions.length > 0
        ? postsWithLikes.where(and(...conditions))
        : postsWithLikes;

    // Execute the query with pagination and ordering
    const postsData = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get posts that current user has liked
    const likedPostIds = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(eq(likes.userId, currentUser.id));

    const userLikedPosts = new Set(likedPostIds.map((l) => l.postId));

    // Get total count for pagination
    const baseCountQuery = db.select({ count: count() }).from(posts);

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

    const [{ count: totalPosts }] = await countQuery;
    const totalPages = Math.ceil(totalPosts / limit);

    // Transform posts data
    const transformedPosts = postsData.map((post) => {
      // Format time ago
      const timeAgo = getTimeAgo(post.createdAt);

      // Parse coordinates
      const coordinates = post.location
        ? parseLocationCoordinates(post.location)
        : null;

      const transformedPost = {
        id: post.id,
        uuid: post.uuid,
        author: post.authorName || post.authorUsername || "Unknown User",
        authorUsername: post.authorUsername,
        authorRole: post.authorRole,
        location: post.locationName || "Unknown Location",
        time: timeAgo,
        content: post.caption || "",
        image: post.mediaUrl,
        mediaType: post.mediaType,
        hazardType: post.hazardType,
        severity: post.severity,
        likes: post.likesCount || 0,
        comments: 0,
        status: post.status,
        coordinates,
        isLikedByUser: userLikedPosts.has(post.id),
        createdAt: post.createdAt,
      };

      // Debug logging for first few posts
      if (post.id <= 3) {
        console.log(`DEBUG Post ${post.id}:`, {
          authorName: post.authorName,
          authorUsername: post.authorUsername,
          authorId: post.authorId,
          resultAuthor: transformedPost.author,
          caption: post.caption,
          locationName: post.locationName,
        });
      }

      return transformedPost;
    });

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        severity,
        hazardType,
        status,
      },
      user: {
        id: currentUser.id,
      },
    });
  } catch (error) {
    console.error("Error fetching home feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch home feed" },
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
