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

export const getFolders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folders = await ctx.db
      .query("folders")
      // .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .collect();

    return folders;
  },
});

export const getFolder = query({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folders = await ctx.db
      .query("folders")
      // .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    return folders;
  },
});

export const getFolderChildren = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folder = await ctx.db
      .query("folders")
      // .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.folderId))
      .first();

    return folder?.children;
  },
});

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

    return await ctx.db.get(folderId);
  },
});
export const updateFolderName = mutation({
  args: {
    title: v.string(),
    icon: v.optional(v.string()),
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folder = await ctx.db.get(args.folderId);

    if (!folder) return;

    await ctx.db.patch(args.folderId, {
      ...folder,
      title: args.title,
      icon: args.icon,
    });

    const parentType = folder.parentFolder ? "folders" : "workspaces";
    const parentId: Id<"workspaces" | "folders"> = folder.parentFolder
      ? folder.parentFolder!
      : folder.parentWorkSpace!;

    const parent = await ctx.db
      .query(parentType)
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("_id"), parentId))
      .first();

    if (parent?.children) {
      const updatedChildren = parent.children.map((child) =>
        child.id === folder._id
          ? {
              ...child,
              title: args.title ? args.title : folder.title,
              icon: args.icon,
            }
          : child
      );

      await ctx.db.patch(parentId, {
        ...parent,
        children: updatedChildren,
      });
    }

    return await ctx.db.get(args.folderId);
  },
});

export const addChild = mutation({
  args: {
    folderId: v.id("folders"),
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

    const folder = await ctx.db.get(args.folderId);

    if (folder) {
      // Ensure children is an array
      folder.children = folder.children || [];

      await ctx.db.patch(args.folderId, {
        ...folder,
        children: [...folder.children, args.child],
      });
    }

    return await ctx.db.get(args.folderId);
  },
});

export const addCollaborator = mutation({
  args: { ids: v.array(v.string()), folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const folder = await ctx.db
      .query("folders")
      // .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.folderId))
      .first();

    if (!folder) return;
    // Get the workspace of each user
    for (const id of args.ids) {
      const userWorkspace = await ctx.db
        .query("workspaces")
        .filter((q: any) => q.eq(q.field("userId"), id))
        .first();

      if (userWorkspace) {
        // Add the folderId to the user's workspace
        if (userWorkspace.children)
          await ctx.db.patch(userWorkspace._id, {
            ...userWorkspace,
            children: [
              ...userWorkspace.children,
              {
                id: folder._id,
                type: "folder",
                title: folder?.title,
                icon: folder?.icon,
              },
            ],
          });
      }
    }
  },
});

export const deleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const removeFromParent = async (
      ctx: Context,
      folderId: Id<"folders">,
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
            (child: { id: Id<"folders"> }) => child.id !== folderId
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
            (child: { id: Id<"folders"> }) => child.id !== folderId
          ),
        });
      }
    };

    const onDeleteFolderChildren = async (folderId: Id<"folders">) => {
      const folder = await ctx.db.get(folderId);
      if (!folder) return;
      folder.children = folder?.children || [];
      //* Delete folder
      if (folder.children.length) {
        for (const child of folder.children) {
          if (child.type === "folder") {
            await onDeleteFolderChildren(child.id as Id<"folders">);
          } else if (child.type === "document") {
            const document = await ctx.db
              .query("documents")
              .withIndex("by_user_parent", (q) =>
                q.eq("userId", userId).eq("parentFolder", folderId)
              )
              .filter((q) => q.eq(q.field("_id"), child.id))
              .first();
            //* Delete document
            if (document) {
              await ctx.db.delete(document._id);
            }
          } else if (child.type === "file") {
            const file = await ctx.db
              .query("files")
              .withIndex("by_user_parent", (q) =>
                q.eq("userId", userId).eq("parentFolder", folderId)
              )
              .filter((q) => q.eq(q.field("_id"), child.id))
              .first();

            // TODO: Delete file from storage bucket
            //* Delete file
            if (file) {
              await ctx.db.delete(file._id);
            }
          }
        }
      }
      const type = folder.parentFolder ? "folder" : "workspace";
      const parent = folder.parentFolder
        ? folder.parentFolder
        : folder.parentWorkSpace;

      if (folder.userId !== userId) {
        throw new Error("Unauthorized");
      }

      await removeFromParent(
        ctx,
        folder._id,
        parent as Id<"folders" | "workspaces">,
        type
      ); //* Remove it from parent children field!
      await ctx.db.delete(folder._id);
    };

    await onDeleteFolderChildren(args.id);
  },
});
