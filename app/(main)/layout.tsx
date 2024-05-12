"use client";
import { redirect } from "next/navigation";

import { Navigation } from "./_components/navigation";

import { SearchCommand } from "@/components/search-command";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";
import { Navbar } from "./_components/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = useIsAuthenticated();

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-full flex">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
}
