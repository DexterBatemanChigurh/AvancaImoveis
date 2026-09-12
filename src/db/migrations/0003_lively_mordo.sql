ALTER TABLE "search_alerts" ADD COLUMN "confirm_token" text;--> statement-breakpoint
ALTER TABLE "search_alerts" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "search_alerts" ADD CONSTRAINT "search_alerts_confirm_token_unique" UNIQUE("confirm_token");