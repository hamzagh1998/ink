"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { ChevronsLeft, MenuIcon, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useWorkspace } from "@/hooks/user-workspace";

import { SearchItem } from "./search";
import { UserItem } from "./user-item";
import { Workspace } from "./workspace";
import { Folder } from "./folder";
import { Document } from "./document";

import { SkeletonLoader } from "@/components/skeleton-loader";

import { cn } from "@/lib/utils";

export function Navigation() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();

  const settings = useSettings();
  const params = useParams();
  const search = useSearch();
  const pathname = usePathname();
  const { children } = useWorkspace();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile || search.isOpen) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile, search]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6 hover:text-secondary-foreground" />
        </div>
        <div>
          <UserItem />
          <Workspace>
            <SearchItem level={1} icon={Search} onClick={search.onOpen} />
            {children ? (
              children.length ? (
                children
                  .sort((a, b) => {
                    const order = { folder: 1, document: 2, file: 3 };

                    return order[a.type] - order[b.type];
                  })
                  .map((child) =>
                    child.type === "folder" ? (
                      <Folder
                        key={child.id}
                        id={child.id as Id<"folders">}
                        title={child.title}
                        icon={child.icon}
                        level={1}
                      />
                    ) : child.type === "document" ? (
                      <Document
                        key={child.id}
                        id={child.id as Id<"documents">}
                        title={child.title}
                        icon={child.icon}
                        level={1}
                      />
                    ) : (
                      <></>
                    )
                  )
              ) : (
                <></>
              )
            ) : (
              <>
                <SkeletonLoader level={1} />
                <SkeletonLoader level={1} />
                <SkeletonLoader level={1} />
                <SkeletonLoader level={1} />
              </>
            )}
          </Workspace>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
}
