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
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new Error("Not found");
  }

  if (document.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return document;
}

export const getStandalones = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .filter((q) => q.eq(q.field("parentFolder"), undefined))
      .order("desc")
      .collect();

    return folders;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentFolder: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.insert("folders", {
      title: args.title,
      parentFolder: args.parentFolder,
      itemType: "folder",
      isPrivate: false,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
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

      for (const document of documents) {
        await ctx.db.patch(document._id, {
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
