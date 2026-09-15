CREATE TABLE "property_owners" (
	"property_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "property_owners_property_id_owner_id_pk" PRIMARY KEY("property_id","owner_id")
);
--> statement-breakpoint
ALTER TABLE "properties" DROP CONSTRAINT "properties_owner_id_owners_id_fk";
--> statement-breakpoint
ALTER TABLE "property_documents" ALTER COLUMN "property_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "property_documents" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Preserva os vínculos existentes (properties.owner_id 1:1) na nova tabela
-- N:N antes de apagar a coluna antiga — sem isso, todo proprietário já
-- vinculado a um imóvel perderia esse vínculo silenciosamente.
INSERT INTO "property_owners" ("property_id", "owner_id")
SELECT "id", "owner_id" FROM "properties" WHERE "owner_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "owner_id";