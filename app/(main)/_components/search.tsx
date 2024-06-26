import { LucideIcon } from "lucide-react";

interface ItemProps {
  level?: number;
  icon: LucideIcon;
  onClick?: () => void;
}

export function SearchItem({ level = 0, icon: Icon, onClick }: ItemProps) {
  return (
    <div
      className="group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium hover:text-secondary-foreground"
      role="button"
      style={{
        paddingLeft: level ? `${level * 12 + 12}px` : "12px",
      }}
      onClick={onClick}
    >
      <Icon className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
      <span className="truncate">Search</span>
      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
