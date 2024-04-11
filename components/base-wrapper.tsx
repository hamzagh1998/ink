"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { useWorkspace } from "@/hooks/user-workspace";

export function BaseWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isAuthenticated } = useConvexAuth();

  const { setWorkspaceData } = useWorkspace();

  const checkOrCreateProfile = useMutation(api.profiles.checkOrCreateProfile);
  const initUserWorkspace = useMutation(api.workspaces.initUserWorkspace);

  //* if the user logged in for the 1st time we'll create new profile and workspace for him
  const initUserProfile = async () => {
    await checkOrCreateProfile();
    const workspace = await initUserWorkspace({});
    if (workspace) {
      setWorkspaceData(
        workspace._id,
        workspace.name,
        workspace.children,
        workspace.usersIds
      );
    }
    router.push("/overview");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    initUserProfile();
  }, [isAuthenticated]);

  return <div className="w-full h-full">{children}</div>;
}
