import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  workspaceId: Id<"workspaces">
) {
  const workspace = await ctx.db.get(workspaceId);

  if (!workspace) {
    throw new Error("Not found");
  }

  if (workspace.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return workspace;
}

export const getUserWorkspace = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return workspace;
  },
});

export const getWorkspaceById = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.workspaceId))
      .first();

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

    const workspaceId = await ctx.db.insert("workspaces", {
      name: identity.givenName! + "'s workspace",
      firstName: identity.givenName!,
      lastName: identity.familyName!,
      userId,
      isShared: false,
      usersIds: [],
      children: [],
      createdAt: new Date().toUTCString(),
    });

    return checkAuthAndOwnership(ctx, userId, workspaceId);
  },
});

export const updateWorkspaceName = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await checkAuthAndOwnership(
      ctx,
      userId,
      args.workspaceId
    );

    await ctx.db.patch(args.workspaceId, {
      ...workspace,
      name: args.name,
    });

    return await checkAuthAndOwnership(ctx, userId, args.workspaceId);
  },
});

export const addChild = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    child: v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      icon: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const workspace = await checkAuthAndOwnership(
      ctx,
      userId,
      args.workspaceId
    );

    await ctx.db.patch(args.workspaceId, {
      ...workspace,
      children: [...workspace.children, args.child],
    });

    return await checkAuthAndOwnership(ctx, userId, args.workspaceId);
  },
});
