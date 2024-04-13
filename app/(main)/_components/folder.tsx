"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  FileUp,
  Folder as FolderClosed,
  FolderOpen,
  FolderPlus,
  NotepadText,
  Trash,
} from "lucide-react";

import { api } from "@/convex/_generated/api";

import { FolderDialog } from "./folder-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { Document } from "./document";

interface FolderProps {
  level: number;
  id: Id<"folders">;
  title: string;
  icon?: string;
}

export function Folder({ level, id, title, icon }: FolderProps) {
  const router = useRouter();

  const folderChildren = useQuery(api.folders.getFolderChildren, {
    folderId: id,
  });
  const createDocument = useMutation(api.documents.createDocument);
  const addFolderChild = useMutation(api.folders.addChild);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onCreateDocument = async () => {
    const promise = createDocument({
      title: "Untitled",
      parentFolder: id,
    }).then(async (document) => {
      await addFolderChild({
        folderId: id!,
        child: {
          id: document._id,
          title: document.title,
          icon: document.icon,
          type: "document",
        },
      });
      router.push(`/document/${document._id}`);
    });

    toast.promise(promise, {
      loading: "Creating a new document...",
      success: "New document created!",
      error: "Failed to create a new document.",
    });
  };
  return (
    <main>
      <div
        className="flex justify-between items-center pl-3 gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
        style={{
          paddingLeft: level ? `${level * 12 + 12}px` : "12px",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full flex justify-between items-center line-clamp-1">
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
              onClick={() => router.push("/folder/" + id)}
            >
              {title}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical
                className="hover:text-secondary-foreground"
                size={18}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowFolderModal(true)}>
                <FolderPlus size={18} />
                &ensp; Add Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileUp size={18} />
                &ensp; Add File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateDocument}>
                <NotepadText size={18} />
                &ensp; Add Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash size={18} />
                &ensp; Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          !isOpen && "h-0 opacity-0",
          isOpen && "opacity-100"
        )}
      >
        {isOpen ? (
          folderChildren ? (
            folderChildren.map((child) =>
              child.type === "folder" ? (
                <Folder
                  key={child.id}
                  id={child.id as Id<"folders">}
                  title={child.title}
                  icon={child.icon}
                  level={level + 1}
                />
              ) : child.type === "document" ? (
                <Document
                  key={child.id}
                  id={child.id as Id<"documents">}
                  title={child.title}
                  icon={child.icon}
                  level={level + 1}
                />
              ) : (
                <></>
              )
            )
          ) : (
            <>
              <SkeletonLoader level={level + 1} />
              <SkeletonLoader level={level + 1} />
              <SkeletonLoader level={level + 1} />
            </>
          )
        ) : (
          <></>
        )}
      </div>
      <FolderDialog
        parentFolder={id}
        show={showFolderModal}
        setShow={setShowFolderModal}
      />
    </main>
  );
}
