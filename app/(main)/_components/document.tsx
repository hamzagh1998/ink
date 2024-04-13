"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { NotepadText, Trash2Icon } from "lucide-react";

interface DocumentProps {
  id: Id<"documents">;
  level: number;
  title: string;
  icon?: string;
}

export function Document({ level, id, title, icon }: DocumentProps) {
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
          <div className="flex justify-center items-center gap-2 hover:text-secondary-foreground">
            {icon ? <div>{icon}</div> : <NotepadText size={18} />}
            <p
              className="line-clamp-1"
              onClick={() => router.push("/document/" + id)}
            >
              {title}
            </p>
          </div>
          <Trash2Icon className="hover:text-destructive" size={18} />
        </div>
      </div>
    </main>
  );
}
