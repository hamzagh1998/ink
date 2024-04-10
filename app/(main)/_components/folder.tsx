"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  Folder as FolderClosed,
  FolderOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface FolderProps {
  level: number;
  id: string;
  title: string;
  icon?: string;
}

export function Folder({ level, id, title, icon }: FolderProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <main>
      <div
        className="flex justify-between items-center pl-3 gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
        style={{
          paddingLeft: level ? `${level * 12 + 12}px` : "12px",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full flex justify-between items-center">
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
            {icon ? (
              <div>{icon}</div>
            ) : isOpen ? (
              <FolderOpen size={18} />
            ) : (
              <FolderClosed size={18} />
            )}
            <p
              className="hover:text-secondary-foreground line-clamp-1"
              onClick={() => router.push("/document/" + id)}
            >
              {title}
            </p>
          </div>
          <EllipsisVertical
            className="hover:text-secondary-foreground"
            size={18}
          />
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          !isOpen && "h-0 opacity-0",
          isOpen && "opacity-100"
        )}
      ></div>
    </main>
  );
}
