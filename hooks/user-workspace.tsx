import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type WorkspaceStore = {
  id: Id<"workspaces"> | undefined;
  name: string | undefined;
  users: Id<"profiles">[] | undefined;
  setWorkspaceData: (
    id: Id<"workspaces">,
    name: string,
    users: Id<"profiles">[]
  ) => void;
};

export const useWorkspace = create<WorkspaceStore>((set) => ({
  id: undefined,
  name: undefined,
  users: undefined,
  setWorkspaceData: (id, name, users) => set({ id, name, users }),
}));
