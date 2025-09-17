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
  conversationParticipants: many(conversationParticipants),
  sentMessages: many(messages),
}));

// Messaging tables
export const conversations = pgTable("conversations", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity(),
    conversationId: bigint("conversation_id", { mode: "number" })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversation_user_idx").on(table.conversationId, table.userId),
    primaryKey({
      columns: [table.conversationId, table.userId],
    }),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    conversationId: bigint("conversation_id", { mode: "number" })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: bigint("sender_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    messageType: text("message_type").default("text").notNull(), // text, image, location, etc.
    metadata: text("metadata"), // JSON string for additional data
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_sender_idx").on(table.senderId),
    index("messages_created_at_idx").on(table.createdAt),
  ]
);

// Relations
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
