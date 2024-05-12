import { v } from "convex/values";
import { Context } from "vm";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Common function to check authentication and ownership
async function checkAuthAndOwnership(
  ctx: Context,
  userId: string,
  documentId: Id<"documents">
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

export const getDocuments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .collect();

    return documents;
  },
});

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await checkAuthAndOwnership(ctx, userId, args.id);

    const updatedDocument = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    return updatedDocument;
  },
});

export const createDocument = mutation({
  args: {
    title: v.string(),
    parentFolder: v.optional(v.id("folders")),
    parentWorkSpace: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      parentFolder: args.parentFolder,
      parentWorkSpace: args.parentWorkSpace,
      itemType: "document",
      isPrivate: false,
      userId,
      isArchived: false,
      isPublished: false,
      createdAt: new Date().toUTCString(),
    });

    return checkAuthAndOwnership(ctx, userId, documentId);
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const removeFromParent = async (
      ctx: Context,
      documentId: Id<"documents">,
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
            (child: { id: Id<"documents"> }) => child.id !== documentId
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
            (child: { id: Id<"documents"> }) => child.id !== documentId
          ),
        });
      }
    };

    const document = await checkAuthAndOwnership(ctx, userId, args.id);

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (document) {
      const type = document.parentFolder ? "folder" : "workspace";
      const parent = document.parentFolder
        ? document.parentFolder
        : document.parentWorkSpace;
      await removeFromParent(ctx, document._id, parent, type);
      await ctx.db.delete(document._id);
    }
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
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await checkAuthAndOwnership(ctx, userId, args.documentId);

    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new Error("Not found");
    }

    // if (document.userId !== userId) {
    //   throw new Error("Unauthorized");
    // }

    await ctx.db.patch(id, {
      ...rest,
      icon: args.icon
        ? args.icon === "remove"
          ? undefined
          : args.icon
        : document.icon,
    });

    const parentType = document.parentFolder ? "folders" : "workspaces";
    const parentId: Id<"workspaces" | "folders"> = document.parentFolder
      ? document.parentFolder!
      : document.parentWorkSpace!;

    const parent = await ctx.db
      .query(parentType)
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("_id"), parentId))
      .first();

    if (parent?.children) {
      const updatedChildren = parent.children.map((child) =>
        child.id === document._id
          ? {
              ...child,
              title: args.title ? args.title : document.title,
              icon: args.icon
                ? args.icon === "remove"
                  ? undefined
                  : args.icon
                : child.icon,
            }
          : child
      );

      await ctx.db.patch(parentId, {
        ...parent,
        children: updatedChildren,
      });
    }
    return await checkAuthAndOwnership(ctx, userId, args.id);
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new Error("Not found");
    }

    // if (document.userId !== userId) {
    //   throw new Error("Unauthorized");
    // }

    const updatedDocument = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return updatedDocument;
  },
});
