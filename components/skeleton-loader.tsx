import { Skeleton } from "./ui/skeleton";

export function SkeletonLoader({ level = 0 }: { level: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
