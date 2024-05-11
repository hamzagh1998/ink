import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);

  if (!file) {
    throw new Error("Not found");
  }

  if (file.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return file;
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

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return files;
  },
});

export const getFileById = query({
  args: { id: v.optional(v.id("files")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const file = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    return file;
  },
});

export const saveFile = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    parentFolder: v.optional(v.id("folders")),
    parentWorkSpace: v.optional(v.id("workspaces")),
    format: v.optional(v.string()),
    sizeInMb: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // if (!identity) {
    //   throw new Error("Not authenticated");
    // }

    const userId = identity?.subject;

    const fileId = await ctx.db.insert("files", {
      title: args.title,
      url: args.url,
      sizeInMb: args.sizeInMb,
      format: args.format,
      parentFolder: args.parentFolder,
      parentWorkSpace: args.parentWorkSpace,
      userId: userId as string,
      itemType: "file",
      isArchived: false,
      isPublished: false,
      isPrivate: false,
      createdAt: new Date().toUTCString(),
    });

    return await checkAuthAndOwnership(ctx, userId as string, fileId);
  },
});

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const removeFromParent = async (
      ctx: Context,
      fileId: Id<"files">,
      parentId: Id<"workspaces" | "folders">,
      type: "workspace" | "folder"
    ) => {
      if (type === "workspace") {
        const workspace = await ctx.db
          .query("workspaces")
          .withIndex("by_user", (q: any) => q.eq("userId", userId))
          .filter((q: any) => q.eq(q.field("_id"), parentId))
          .first();

        await ctx.db.patch(workspace._id, {
          ...workspace,
          children: workspace.children.filter(
            (child: { id: Id<"files"> }) => child.id !== fileId
          ),
        });
      } else if (type === "folder") {
        const folder = await ctx.db
          .query("folders")
          .withIndex("by_user", (q: any) => q.eq("userId", userId))
          .filter((q: any) => q.eq(q.field("_id"), parentId))
          .first();

        await ctx.db.patch(folder._id, {
          ...folder,
          children: folder.children.filter(
            (child: { id: Id<"files"> }) => child.id !== fileId
          ),
        });
      }
    };

    const file = await checkAuthAndOwnership(ctx, userId, args.id);

    if (file) {
      const type = file.parentFolder ? "folder" : "workspace";
      const parent = file.parentFolder
        ? file.parentFolder
        : file.parentWorkSpace;
      await removeFromParent(ctx, file._id, parent, type);
      await ctx.db.delete(args.id);
      // TODO: Remove from storage bucket
    }
  },
});

export const updateFileName = mutation({
  args: {
    fileId: v.id("files"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const file = await checkAuthAndOwnership(ctx, userId, args.fileId);

    await ctx.db.patch(args.fileId, {
      ...file,
      title: args.title,
    });

    const parentType = file.parentFolder ? "folders" : "workspaces";
    const parentId = file.parentFolder
      ? file.parentFolder
      : file.parentWorkSpace;

    const parent = await ctx.db
      .query(parentType)
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("_id"), parentId))
      .first();

    if (parent?.children) {
      const updatedChildren = parent.children.map((child) =>
        child.id === file._id ? { ...child, title: args.title } : child
      );

      await ctx.db.patch(parentId, {
        ...parent,
        children: updatedChildren,
      });
    }

    return await checkAuthAndOwnership(ctx, userId, args.fileId);
  },
});
