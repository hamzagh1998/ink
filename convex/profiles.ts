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

export const getProfile = query({
  args: { skip: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.skip) return;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .first();

    return profile;
  },
});

export const checkOrCreateProfile = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .first();

    if (existingProfile) return existingProfile;

    const profile = await ctx.db.insert("profiles", {
      userId: identity.subject,
      name: identity.name!,
      firstName: identity.givenName!,
      lastName: identity.familyName!,
      email: identity.email!,
      plan: "free",
      storageUsageInMb: 0,
      userType: "regular",
      createdAt: new Date().toUTCString(),
    });

    return profile;
  },
});
