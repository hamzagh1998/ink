import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type Child = {
  id: string;
  type: "folder" | "file" | "document";
  title: string;
  icon?: string;
};

type WorkspaceStore = {
  id: Id<"workspaces"> | undefined;
  name: string | undefined;
  children: Child[] | undefined;
  users: Id<"profiles">[] | undefined;
  setWorkspaceName: (name: string) => void;
  setWorkspaceData: (
    id: Id<"workspaces">,
    name: string,
    children: Child[],
    users: Id<"profiles">[]
  ) => void;
};

export const useWorkspace = create<WorkspaceStore>((set) => ({
  id: undefined,
  name: undefined,
  users: undefined,
  children: undefined,
  setWorkspaceName: (name) => set({ name }),
  setWorkspaceData: (id, name, children, users) =>
    set({ id, name, children, users }),
}));
