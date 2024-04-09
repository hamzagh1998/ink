"use client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  return (
    <ClerkProvider publishableKey={clerkPublicKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
