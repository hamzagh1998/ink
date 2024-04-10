"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

import { useWorkspace } from "@/hooks/user-workspace";

export function Workspace({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { name } = useWorkspace();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <main>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center pl-3 gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
      >
        <div className="flex justify-center items-center gap-2">
          {isOpen ? (
            <ChevronDown
              className="hover:text-secondary-foreground"
              size={18}
            />
          ) : (
            <ChevronRight
              className="hover:text-secondary-foreground"
              size={18}
            />
          )}
          <Home
            className="hover:text-secondary-foreground"
            size={18}
            onClick={() => router.push("/overview")}
          />
          <p className="line-clamp-1">{name}</p>
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          !isOpen && "h-0 opacity-0",
          isOpen && "opacity-100"
        )}
      >
        {children}
      </div>
    </main>
  );
}
