import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Workspace({
  level = 0,
  children,
}: {
  level?: number;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <main>
      <div
        style={{
          paddingLeft: level ? `${level * 12 + 12}px` : "12px",
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
      >
        <div className="flex justify-center items-center gap-2">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          Your workspace
        </div>
      </div>
      <div
        className={cn(
          "ml-3 transition-all duration-200 ease-in-out",
          !isOpen && "h-0 opacity-0",
          isOpen && "opacity-100"
        )}
      >
        {children}
      </div>
    </main>
  );
}
