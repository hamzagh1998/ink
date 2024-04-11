import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  documentId: Id<"files">
) {
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new Error("Not found");
  }

  if (document.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return document;
}

export const getFiles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const files = await ctx.db
      .query("files")
      .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .collect();

    return files;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});
