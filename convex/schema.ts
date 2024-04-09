import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  folders: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentFolder: v.optional(v.id("folders")),
    itemType: v.string(),
    isPublished: v.boolean(),
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
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
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentFolder"]),
});
