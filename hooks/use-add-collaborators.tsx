import { create } from "zustand";

type AddCollaboratorsStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
};

export const useAddCollaborators = create<AddCollaboratorsStore>(
  (set, get) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    toggle: () => set({ isOpen: !get().isOpen }),
  })
);
