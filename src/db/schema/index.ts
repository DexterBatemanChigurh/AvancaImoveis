import { relations } from "drizzle-orm";

import { activities } from "./activities";
import { clients } from "./clients";
import { dealProperties, deals } from "./deals";
import { owners } from "./owners";
import {
  documentCategories,
  properties,
  propertyDocuments,
  propertyPhotos,
} from "./properties";
import { stages } from "./stages";
import { users } from "./users";
import { visits } from "./visits";

/* ----------------------------- re-exports ----------------------------- */
export * from "./_shared";
export * from "./activities";
export * from "./clients";
export * from "./deals";
export * from "./owners";
export * from "./properties";
export * from "./stages";
export * from "./users";
export * from "./visits";

/* ------------------------------ relations ---------------------------- */

export const ownersRelations = relations(owners, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(owners, {
    fields: [properties.ownerId],
    references: [owners.id],
  }),
  photos: many(propertyPhotos),
  documents: many(propertyDocuments),
  deals: many(dealProperties),
  visits: many(visits),
}));

export const propertyPhotosRelations = relations(propertyPhotos, ({ one }) => ({
  property: one(properties, {
    fields: [propertyPhotos.propertyId],
    references: [properties.id],
  }),
}));

export const documentCategoriesRelations = relations(
  documentCategories,
  ({ many }) => ({
    documents: many(propertyDocuments),
  }),
);

export const propertyDocumentsRelations = relations(
  propertyDocuments,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyDocuments.propertyId],
      references: [properties.id],
    }),
    category: one(documentCategories, {
      fields: [propertyDocuments.categoryId],
      references: [documentCategories.id],
    }),
  }),
);

export const clientsRelations = relations(clients, ({ many }) => ({
  deals: many(deals),
  visits: many(visits),
  activities: many(activities),
}));

export const stagesRelations = relations(stages, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  client: one(clients, {
    fields: [deals.clientId],
    references: [clients.id],
  }),
  stage: one(stages, {
    fields: [deals.stageId],
    references: [stages.id],
  }),
  createdByUser: one(users, {
    fields: [deals.createdBy],
    references: [users.id],
  }),
  properties: many(dealProperties),
  visits: many(visits),
  activities: many(activities),
}));

export const dealPropertiesRelations = relations(dealProperties, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProperties.dealId],
    references: [deals.id],
  }),
  property: one(properties, {
    fields: [dealProperties.propertyId],
    references: [properties.id],
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  property: one(properties, {
    fields: [visits.propertyId],
    references: [properties.id],
  }),
  client: one(clients, {
    fields: [visits.clientId],
    references: [clients.id],
  }),
  deal: one(deals, {
    fields: [visits.dealId],
    references: [deals.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  client: one(clients, {
    fields: [activities.clientId],
    references: [clients.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  author: one(users, {
    fields: [activities.authorId],
    references: [users.id],
  }),
}));
