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

    const folders = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("usersIds"), [userId]))
      .order("desc")
      .collect();

    return folders;
  },
});

export const createWorkspace = mutation({
  args: {
    isShared: v.optional(v.boolean()),
    usersIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await ctx.db.insert("workspaces", {
      name: identity.name!,
      userId,
      isShared: args.isShared ? args.isShared : false,
      usersIds: args.usersIds ? args.usersIds : [userId],
      createdAt: new Date().toUTCString(),
    });

    return workspace;
  },
});
