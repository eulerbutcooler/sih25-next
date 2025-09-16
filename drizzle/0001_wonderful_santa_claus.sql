CREATE TYPE "public"."hazard_type" AS ENUM('tidal-flooding', 'red-tide', 'jellyfish', 'high-waves', 'oil-spill', 'debris', 'pollution', 'erosion', 'other');--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "severity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "severity" SET DEFAULT 'low'::text;--> statement-breakpoint
DROP TYPE "public"."severity";--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "severity" SET DEFAULT 'low'::"public"."severity";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "severity" SET DATA TYPE "public"."severity" USING "severity"::"public"."severity";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "hazard_type" "hazard_type" NOT NULL;