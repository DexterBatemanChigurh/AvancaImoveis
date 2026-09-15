import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { documentCategories, propertyDocuments } from "@/db/schema";

export async function listDocumentCategories() {
  return db.query.documentCategories.findMany({
    orderBy: [asc(documentCategories.position)],
  });
}

export async function listActiveDocumentCategories() {
  return db.query.documentCategories.findMany({
    where: eq(documentCategories.active, true),
    orderBy: [asc(documentCategories.position)],
  });
}

export async function listDocumentsForProperty(propertyId: string) {
  return db.query.propertyDocuments.findMany({
    where: eq(propertyDocuments.propertyId, propertyId),
    with: { category: true },
    orderBy: [asc(propertyDocuments.createdAt)],
  });
}

export async function listDocumentsForOwner(ownerId: string) {
  return db.query.propertyDocuments.findMany({
    where: eq(propertyDocuments.ownerId, ownerId),
    with: { category: true },
    orderBy: [asc(propertyDocuments.createdAt)],
  });
}
