import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  primaryKey,
  pgEnum,
  uuid,
  bigint,
  real,
  customType,
  index,
} from "drizzle-orm/pg-core";

export const geographyPoint = customType<{ data: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

// ENUMs
export const userRoleEnum = pgEnum("user_role", [
  "citizen",
  "official",
  "emergency",
  "scientist",
  "authority",
]);
export const mediaFileTypeEnum = pgEnum("media_file_type", ["image", "video"]);
export const postVerificationStatusEnum = pgEnum("post_verification_status", [
  "pending",
  "under_review",
  "verified",
  "rejected",
]);
export const severityEnum = pgEnum("severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const hazardTypeEnum = pgEnum("hazard_type", [
  "cyclone",
  "hurricane",
  "flood",
  "tidal-flooding",
  "red-tide",
  "jellyfish",
  "high-waves",
  "oil-spill",
  "debris",
  "pollution",
  "erosion",
  "other",
]);

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  supabaseId: uuid("supabase_id").notNull().unique(),
  role: userRoleEnum("role").default("citizen").notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullName: text("full_name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  organization: text("organization"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caption: text("caption"),
    mediaUrl: text("media_url").notNull(),
    mediaType: mediaFileTypeEnum("media_type").notNull(),
    location: geographyPoint("location").notNull(),
    locationName: text("location_name"),
    hazardType: hazardTypeEnum("hazard_type").notNull(),
    status: postVerificationStatusEnum("status").default("pending").notNull(),
    severity: severityEnum("severity").default("low").notNull(),
    sentimentScore: real("sentiment_score"),
    verifiedById: bigint("verified_by", { mode: "number" }).references(
      () => users.id,
      { onDelete: "set null" }
    ),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // This is where you define indexes
    // 1. GIST index for PostGIS location data (for the map)
    index("idx_posts_location").using("gist", table.location),

    // 2. Index to quickly find a user's posts (for profile pages)
    index("idx_posts_user_id").on(table.userId),

    // 3. Index for the main chronological feed. .desc() adds DESC to the SQL.
    index("idx_posts_created_at_desc").on(table.createdAt.desc()),

    // 4. Partial index for the moderation queue.
    index("idx_posts_status")
      .on(table.status)
      .where(sql`${table.status} in ('pending', 'under_review')`),
  ]
);

export const followers = pgTable(
  "followers",
  {
    followerId: bigint("follower_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: bigint("following_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    // Index to efficiently find a user's followers
    index("idx_followers_following_id").on(table.followingId),
  ]
);

export const likes = pgTable(
  "likes",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: bigint("post_id", { mode: "number" })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.postId] }),
    // Index to efficiently count likes on a post
    index("idx_likes_post_id").on(table.postId),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
