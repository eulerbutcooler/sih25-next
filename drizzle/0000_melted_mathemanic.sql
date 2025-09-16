CREATE TYPE "public"."media_file_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."post_verification_status" AS ENUM('pending', 'under_review', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'meidum', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'official', 'emergency', 'scientist', 'authority');--> statement-breakpoint
CREATE TABLE "followers" (
	"follower_id" bigint NOT NULL,
	"following_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "followers_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" bigint NOT NULL,
	"post_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"caption" text,
	"media_url" text NOT NULL,
	"media_type" "media_file_type" NOT NULL,
	"location" geography(Point, 4326) NOT NULL,
	"status" "post_verification_status" DEFAULT 'pending' NOT NULL,
	"severity" "severity" DEFAULT 'low' NOT NULL,
	"sentiment_score" real,
	"verified_by" bigint,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"supabase_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"username" varchar(50) NOT NULL,
	"full_name" text,
	"email" varchar(255) NOT NULL,
	"organization" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_followers_following_id" ON "followers" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "idx_likes_post_id" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_posts_location" ON "posts" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_posts_user_id" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_posts_created_at_desc" ON "posts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_posts_status" ON "posts" USING btree ("status") WHERE "posts"."status" in ('pending', 'under_review');