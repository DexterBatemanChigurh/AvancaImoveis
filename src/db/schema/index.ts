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
import { propertyOwners } from "./property-owners";
import { proposals } from "./proposals";
import { sales } from "./sales";
import { sessions, users } from "./users";
import { stages } from "./stages";
import { visits } from "./visits";

/* ----------------------------- re-exports ----------------------------- */
export * from "./_shared";
export * from "./activities";
export * from "./alerts";
export * from "./clients";
export * from "./deals";
export * from "./owners";
export * from "./properties";
export * from "./property-owners";
export * from "./proposals";
export * from "./sales";
export * from "./stages";
export * from "./users";
export * from "./visits";

/* ------------------------------ relations ---------------------------- */

export const ownersRelations = relations(owners, ({ many }) => ({
  properties: many(propertyOwners),
  documents: many(propertyDocuments),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  owners: many(propertyOwners),
  photos: many(propertyPhotos),
  documents: many(propertyDocuments),
  deals: many(dealProperties),
  visits: many(visits),
}));

export const propertyOwnersRelations = relations(propertyOwners, ({ one }) => ({
  property: one(properties, {
    fields: [propertyOwners.propertyId],
    references: [properties.id],
  }),
  owner: one(owners, {
    fields: [propertyOwners.ownerId],
    references: [owners.id],
  }),
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
    owner: one(owners, {
      fields: [propertyDocuments.ownerId],
      references: [owners.id],
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
  proposals: many(proposals),
  sales: many(sales),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
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
  proposals: many(proposals),
  sale: one(sales, {
    fields: [deals.id],
    references: [sales.dealId],
  }),
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

export const proposalsRelations = relations(proposals, ({ one }) => ({
  deal: one(deals, {
    fields: [proposals.dealId],
    references: [deals.id],
  }),
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [proposals.propertyId],
    references: [properties.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  deal: one(deals, {
    fields: [sales.dealId],
    references: [deals.id],
  }),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [sales.propertyId],
    references: [properties.id],
  }),
}));
