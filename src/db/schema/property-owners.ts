import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { owners } from "./owners";
import { properties } from "./properties";

/**
 * Vínculo N:N imóvel ↔ proprietário — um imóvel pode ter mais de um
 * proprietário, e um proprietário pode ter vários imóveis. Substitui o
 * antigo `properties.owner_id` (1:1).
 */
export const propertyOwners = pgTable(
  "property_owners",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.propertyId, t.ownerId] }),
  }),
);

export type PropertyOwner = typeof propertyOwners.$inferSelect;
