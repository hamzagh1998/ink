"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";
import { Footer } from "./_components/footer";

export default function MarketingPage() {
  const router = useRouter();

  const { isAuthenticated } = useConvexAuth();

  const checkOrCreateProfile = useMutation(api.profiles.checkOrCreateProfile);
  const initUserWorkspace = useMutation(api.worspaces.initUserWorkspace);

  //* if the user logged in for the 1st time we'll create new profile and workspace for him
  const initUserProfile = async () => {
    await checkOrCreateProfile();
    await initUserWorkspace({});
    router.push("/overview");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    initUserProfile();
  }, [isAuthenticated]);

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
}
