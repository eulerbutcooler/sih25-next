import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import {
  posts,
  users,
  postVerificationStatusEnum,
  severityEnum,
  hazardTypeEnum,
} from "@/utils/db/schema";
import { desc, sql, eq, and } from "drizzle-orm";

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
    const severity = searchParams.get("severity"); // Filter by severity
    const hazardType = searchParams.get("hazardType"); // Filter by hazard type
    const status = searchParams.get("status") || "verified"; // Default to verified posts

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];
    if (status && postVerificationStatusEnum.enumValues.includes(status as typeof postVerificationStatusEnum.enumValues[number])) {
      conditions.push(eq(posts.status, status as typeof postVerificationStatusEnum.enumValues[number]));
    }

    if (severity && severityEnum.enumValues.includes(severity as typeof severityEnum.enumValues[number])) {
      conditions.push(eq(posts.severity, severity as typeof severityEnum.enumValues[number]));
    }

    if (hazardType && hazardTypeEnum.enumValues.includes(hazardType as typeof hazardTypeEnum.enumValues[number])) {
      conditions.push(eq(posts.hazardType, hazardType as typeof hazardTypeEnum.enumValues[number]));
    }

    // Build the query with conditions
    const baseQuery = db
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
        // Get location coordinates as text
        location: sql<string>`ST_AsText(${posts.location})`,
        // Author details
        authorName: users.fullName,
        authorUsername: users.username,
        authorRole: users.role,
        authorAvatar: users.avatarUrl,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id));

    // Apply where conditions if any
    const query =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Execute the query with pagination and ordering
    const postsData = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const baseCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(posts);

    const countQuery =
      conditions.length > 0
        ? baseCountQuery.where(and(...conditions))
        : baseCountQuery;

    const [{ count: totalPosts }] = await countQuery;
    const totalPages = Math.ceil(totalPosts / limit);

    // Transform posts data
    const transformedPosts = postsData.map((post) => ({
      ...post,
      // Parse location coordinates
      coordinates: post.location
        ? parseLocationCoordinates(post.location)
        : null,
    }));

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
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// Helper function to parse PostGIS POINT coordinates
function parseLocationCoordinates(
  locationString: string
): { lat: number; lng: number } | null {
  try {
    // Format: "POINT(longitude latitude)"
    const match = locationString.match(/POINT\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(" ").map(Number);
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Error parsing coordinates:", error);
    return null;
  }
}
