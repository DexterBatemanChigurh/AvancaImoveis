ALTER TABLE "clients" ADD COLUMN "kind" "property_kind";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "min_bathrooms" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "min_area" double precision;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "desired_features" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "anonymized_at" timestamp with time zone;