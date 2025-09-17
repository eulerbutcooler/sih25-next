import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import { posts, users } from "@/utils/db/schema";
import { sql, eq } from "drizzle-orm";
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
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "5000", 10); // Default 5km radius
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    console.log(
      `Searching for posts near lat: ${lat}, lng: ${lng}, radius: ${radius}m`
    );

    // Query for posts within the specified radius using PostGIS
    // Using sql.raw to avoid parameter type issues
    const nearbyPosts = await db
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
        // Calculate distance in meters using geography
        distance: sql<number>`ST_Distance(${
          posts.location
        }, ST_GeogFromText('POINT(${sql.raw(lng.toString())} ${sql.raw(
          lat.toString()
        )})')::geography)`,
        // Author details
        authorName: users.fullName,
        authorUsername: users.username,
        authorRole: users.role,
        authorAvatar: users.avatarUrl,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(
        sql`ST_DWithin(${posts.location}, ST_GeogFromText('POINT(${sql.raw(
          lng.toString()
        )} ${sql.raw(lat.toString())})')::geography, ${radius})`
      )
      .orderBy(
        sql`ST_Distance(${posts.location}, ST_GeogFromText('POINT(${sql.raw(
          lng.toString()
        )} ${sql.raw(lat.toString())})')::geography)`
      )
      .limit(limit);

    console.log(`Found ${nearbyPosts.length} posts in database`);

    // Transform posts data
    const transformedPosts = nearbyPosts.map((post) => {
      // Parse coordinates
      const coordinates = post.location
        ? parseLocationCoordinates(post.location)
        : null;

      // Generate avatar URL if not provided
      const avatarUrl =
        post.authorAvatar ||
        `https://placehold.co/48x48/18181b/fcd34d?text=${
          post.authorName
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "U"
        }`;

      // Format time ago
      const timeAgo = getTimeAgo(post.createdAt);

      return {
        id: post.id,
        uuid: post.uuid,
        title: `${post.hazardType
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())} Alert`,
        location: post.locationName || "Unknown Location",
        severity: post.severity,
        type: post.hazardType,
        description: post.caption || "",
        imageUrl: post.mediaUrl,
        mediaType: post.mediaType,
        coordinates: coordinates || { lat: 0, lng: 0 },
        distance: Math.round(post.distance || 0), // Distance in meters
        author: {
          name: post.authorName || post.authorUsername || "Anonymous",
          role: post.authorRole,
          avatar: avatarUrl,
        },
        status: post.status,
        createdAt: post.createdAt,
        timeAgo,
      };
    });

    return NextResponse.json({
      posts: transformedPosts,
      center: { lat, lng },
      radius,
      count: transformedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching nearby posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby posts" },
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
