CREATE TABLE "search_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"district" text,
	"kind" "property_kind",
	"min_price" double precision,
	"max_price" double precision,
	"min_bedrooms" integer,
	"active" boolean DEFAULT true NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"last_notified_at" timestamp with time zone,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_alerts_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
