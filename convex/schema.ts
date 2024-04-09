import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    userType: v.string(),
    plan: v.string(),
    storageUsageInMb: v.number(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  workspaces: defineTable({
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    children: v.optional(
      v.array(v.object({ type: v.string(), id: v.string() }))
    ),
    isShared: v.boolean(),
    usersIds: v.array(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  folders: defineTable({
    title: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    isArchived: v.boolean(),
    parentFolder: v.optional(v.id("folders")),
    itemType: v.string(),
    isPublished: v.boolean(),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentFolder"]),

  files: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentFolder: v.optional(v.id("folders")),
    itemType: v.string(),
    isPublished: v.boolean(),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
    sizeInMb: v.number(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentFolder"]),

  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentFolder: v.optional(v.id("folders")),
    itemType: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
    createdAt: v.string(),
    lastUpdate: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentFolder"]),
});
