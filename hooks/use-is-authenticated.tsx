import { create } from "zustand";

type isAuthenticatedStore = {
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
};

export const useIsAuthenticated = create<isAuthenticatedStore>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (status: boolean) => set({ isAuthenticated: status }),
}));
