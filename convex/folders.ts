import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  documentId: Id<"folders">
) {
  const folder = await ctx.db.get(documentId);

  if (!folder) {
    throw new Error("Not found");
  }

  if (folder.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return folder;
}

export const createFolder = mutation({
  args: {
    title: v.string(),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
    parentFolder: v.optional(v.id("folders")),
    parentWorkSpace: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folderId = await ctx.db.insert("folders", {
      title: args.title,
      parentFolder: args.parentFolder,
      parentWorkSpace: args.parentWorkSpace,
      isPrivate: args.isPrivate,
      password: args.password,
      icon: args.icon,
      children: [],
      itemType: "folder",
      userId,
      isArchived: false,
      isPublished: false,
      createdAt: new Date().toUTCString(),
    });

    return await checkAuthAndOwnership(ctx, userId, folderId);
  },
});

export const archive = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    await checkAuthAndOwnership(ctx, userId, args.id);

    const updatedDocument = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    const archiveChildren = async (folderId: Id<"folders">) => {
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentFolder", folderId)
        )
        .collect();

      const folders = await ctx.db
        .query("folders")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentFolder", folderId)
        )
        .collect();

      for (const folder of documents) {
        await ctx.db.patch(folder._id, {
          isArchived: true,
        });
      }

      for (const folder of folders) {
        await ctx.db.patch(folder._id, {
          isArchived: true,
        });
      }
    };

    archiveChildren(args.id);

    return updatedDocument;
  },
});
