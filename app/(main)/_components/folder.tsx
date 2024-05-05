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
  Trash2Icon,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

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
import { useWorkspace } from "@/hooks/user-workspace";
import { Files } from "./file";
import { ConfirmAlert } from "@/components/confirm-alert";

interface FolderProps {
  level: number;
  id: Id<"folders">;
  title: string;
  icon?: string;
  onOpen: () => void;
}

export function Folder({ level, id, title, icon, onOpen }: FolderProps) {
  const router = useRouter();

  const folderChildren = useQuery(api.folders.getFolderChildren, {
    folderId: id,
  });
  const createDocument = useMutation(api.documents.createDocument);
  const addFolderChild = useMutation(api.folders.addChild);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const saveFile = useMutation(api.files.saveFile);

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

  const updateWorkspace = async () => {
    router.push("/overview");
    await deleteFolder({ id });
  };

  const onUploadFile = async (results: any) => {
    if (!results) return;

    const { secure_url, original_filename, bytes, format } = results.info;

    const sizeInMb = bytes / (1024 * 1024);

    const file = await saveFile({
      title: original_filename,
      url: secure_url,
      format,
      sizeInMb,
      parentFolder: id,
    });
    await addFolderChild({
      folderId: id!,
      child: {
        id: file._id,
        title: file.title,
        type: "folder",
      },
    });
  };

  return (
    <main>
      <div
        className="flex justify-between items-center pl-3 gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
        style={{
          paddingLeft: level ? `${level * 12 + 12}px` : "12px",
        }}
      >
        <div className="w-full flex justify-between items-center line-clamp-1">
          <div className="flex justify-end items-center gap-2">
            {isOpen ? (
              <ChevronDown
                className="hover:text-secondary-foreground"
                size={18}
                onClick={() => setIsOpen(false)}
              />
            ) : (
              <ChevronRight
                className="hover:text-secondary-foreground"
                size={18}
                onClick={() => setIsOpen(true)}
              />
            )}
            <div onClick={() => router.push("/folder/" + id)}>
              {icon ? (
                <div>{icon}</div>
              ) : isOpen ? (
                <FolderOpen size={18} onClick={() => setIsOpen(false)} />
              ) : (
                <FolderClosed size={18} onClick={() => setIsOpen(true)} />
              )}
            </div>
            <p
              className="hover:text-secondary-foreground line-clamp-1"
              onClick={() => router.push("/folder/" + id)}
            >
              {title}
            </p>
          </div>
          <div className="flex justify-end items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical
                  className="hover:text-secondary-foreground"
                  size={18}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    setShowFolderModal(true);
                    onOpen();
                  }}
                >
                  <FolderPlus size={18} />
                  &ensp; Add Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_PRESET_NAME!}
                    onSuccess={(results) => onUploadFile(results)}
                  >
                    {({ open }) => (
                      <div
                        className="flex justify-start items-center w-full h-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the event from bubbling up
                          open();
                        }}
                      >
                        <FileUp size={18} />
                        &ensp; Add File
                      </div>
                    )}
                  </CldUploadWidget>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreateDocument}>
                  <NotepadText size={18} />
                  &ensp; Add Document
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmAlert
              title="Are you absolutely sure"
              content="This action cannot be undone. This will permanently delete this folder"
              cb={updateWorkspace}
            >
              <Trash2Icon className="hover:text-destructive" size={18} />
            </ConfirmAlert>
          </div>
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
            folderChildren.map((child: any) =>
              child.type === "folder" ? (
                <Folder
                  key={child.id}
                  id={child.id as Id<"folders">}
                  title={child.title}
                  icon={child.icon}
                  level={level + 1}
                  onOpen={onOpen}
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
                <Files
                  key={child.id}
                  id={child.id as Id<"files">}
                  level={level + 1}
                />
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
