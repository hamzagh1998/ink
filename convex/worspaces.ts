import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  workspaceId: Id<"workspaces">
) {
  const document = await ctx.db.get(workspaceId);

  if (!document) {
    throw new Error("Not found");
  }

  if (document.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return document;
}

export const getWorkstaion = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("usersIds"), [userId]))
      .order("desc")
      .collect();

    return workspace;
  },
});

export const initUserWorkspace = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .first();

    if (existingWorkspace) return existingWorkspace;

    const workspace = await ctx.db.insert("workspaces", {
      name: identity.givenName! + "'s workspace",
      firstName: identity.givenName!,
      lastName: identity.familyName!,
      userId,
      isShared: false,
      usersIds: [],
      createdAt: new Date().toUTCString(),
    });

    return workspace;
  },
});
