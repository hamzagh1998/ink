"use client";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";
import {
  File,
  FilePlus,
  FolderClosed,
  FolderPlus,
  Inbox,
  NotepadText,
  Smile,
} from "lucide-react";

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ElementRef, useEffect, useRef, useState } from "react";
import { IconPicker } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FolderDialog } from "../../_components/folder-dialog";
import { CldUploadWidget } from "next-cloudinary";

export default function FolderDetailPage() {
  const router = useRouter();
  const { folderId } = useParams();

  const folder = useQuery(api.folders.getFolder, {
    id: folderId as Id<"folders">,
  });
  const [fileId, setFileId] = useState<Id<"files"> | undefined>(undefined);

  const updateFolderName = useMutation(api.folders.updateFolderName);
  const createDocument = useMutation(api.documents.createDocument);
  const addFolderChild = useMutation(api.folders.addChild);
  const saveFile = useMutation(api.files.saveFile);
  const file = useQuery(api.files.getFileById, { id: fileId });

  const isMobile = useMediaQuery("(max-width: 768px)");

  const inputRef = useRef<ElementRef<"textarea">>(null);

  const [isEdit, setIsEdit] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);

  const [folderName, setFolderName] = useState("");

  const onSave = () => {
    updateFolderName({
      folderId: folderId as Id<"folders">,
      title: folderName,
      icon: folder?.icon,
    });
    setIsEdit(false);
  };

  const onCreateDocument = async () => {
    const promise = createDocument({
      title: "Untitled",
      parentFolder: folderId as Id<"folders">,
    }).then(async (document) => {
      await addFolderChild({
        folderId: folderId as Id<"folders">,
        child: {
          id: document._id,
          title: document.title,
          icon: document.icon,
          type: "document",
        },
      });
      router.push(`/document/${document._id}`);
    });
  };

  const disableInput = () => setIsEdit(false);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
      onSave();
    }
  };

  const onIconSelect = (icon: string) => {
    updateFolderName({
      folderId: folderId as Id<"folders">,
      title: folderName,
      icon: icon,
    });
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
      parentFolder: folderId as Id<"folders">,
    });
    await addFolderChild({
      folderId: folderId as Id<"folders">,
      child: {
        id: file._id,
        title: file.title,
        type: "file",
      },
    });
  };

  useEffect(() => {
    if (!folder) return;

    setFolderName(folder.title);
  }, [folder]);

  const onSeeFileDetail = async () => {
    if (!file) return;
    const viwedFiles = [
      "png",
      "jpg",
      "jpeg",
      "svg",
      "gif",
      "bmp",
      "mp3",
      "avi",
      "mp4",
      "mkv",
      "mov",
      "webm",
    ];
    const format = file.format || "";
    if (!viwedFiles.includes(format)) {
      return window.open(file.url, "_blank");
    }
    router.push(
      `/file/${file._id}?title=${encodeURIComponent(file.title)}&fileType=${encodeURIComponent(format)}&url=${encodeURIComponent(file.url)}`
    );
  };

  useEffect(() => {
    onSeeFileDetail();
  }, [file]);

  if (!folder) {
    return (
      <div className="p-12 max-sm:p-4">
        <div className="flex justify-between items-center">
          <div className="fex justify-center items-end gap-2">
            <div className="flex items-end justify-center gap-4 group/icon pt-6">
              <p className="text-6xl hover:opacity-75 transition max-sm:text-2xl">
                <Skeleton className="h-14 w-[60px]" />
              </p>
              <h2
                className={cn(
                  "flex items-center justify-start gap-4 text-6xl font-medium max-sm:text-2xl cursor-pointer",
                  isMobile ? "p-0 w-[87%]" : "w-[582px]"
                )}
                onClick={() => setIsEdit(true)}
              >
                <Skeleton className="h-14 w-[45%]" />
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 max-sm:p-4">
      <div className="flex justify-between items-center">
        <div className="fex justify-center items-end gap-2">
          <div className="flex items-end justify-center group/icon pt-6">
            {folder.icon ? (
              <IconPicker onChange={onIconSelect}>
                <p className="text-6xl hover:opacity-75 transition max-sm:text-2xl">
                  {folder.icon}
                </p>
              </IconPicker>
            ) : (
              <IconPicker asChild onChange={onIconSelect}>
                <Button
                  className="text-muted-foreground text-xs"
                  variant="outline"
                  size="sm"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </IconPicker>
            )}

            {isEdit ? (
              <TextareaAutosize
                ref={inputRef}
                onBlur={disableInput}
                onKeyDown={onKeyDown}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="text-6xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none max-sm:text-2xl"
              />
            ) : (
              <h2
                className={cn(
                  "flex items-center justify-start gap-4 text-6xl font-medium max-sm:text-2xl cursor-pointer",
                  isMobile ? "p-0 w-[87%]" : "w-[582px]"
                )}
                onClick={() => setIsEdit(true)}
              >
                {folder?.title}
              </h2>
            )}
          </div>
        </div>
        <div className="flex justify-center items-end gap-4">
          <FolderPlus
            className="cursor-pointer"
            size={isMobile ? 18 : 32}
            onClick={() => setShowFolderModal(true)}
          />
          <div>
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
                  <FilePlus
                    className="cursor-pointer"
                    size={isMobile ? 18 : 32}
                  />
                </div>
              )}
            </CldUploadWidget>
          </div>
          <NotepadText
            className="cursor-pointer"
            size={isMobile ? 18 : 32}
            onClick={onCreateDocument}
          />
        </div>
      </div>
      <div className="w-full h-[1px] bg-slate-400 mt-6"></div>
      <div className="w-full mt-6 flex justify-start items-center gap-[1%] flex-wrap">
        {folder.children?.length ? (
          folder.children.map((child) => (
            <Card
              key={child.id}
              className="relative w-[24%] h-64 mb-4 max-sm:w-[49%]"
            >
              <CardHeader className="h-[75%] flex items-center justify-center">
                {child.type === "folder" ? (
                  <FolderClosed className="w-full h-full" />
                ) : child.type === "file" ? (
                  <File className="w-full h-full" />
                ) : (
                  <NotepadText className="w-full h-full" />
                )}
              </CardHeader>
              <CardContent className="flex w-full items-start justify-center">
                <Link
                  href={
                    child.type === "folder"
                      ? "/folder/" + child.id
                      : child.type === "document"
                        ? "/document/" + child.id
                        : ""
                  }
                  onClick={() =>
                    child.type === "file"
                      ? setFileId(child.id as Id<"files">)
                      : null
                  }
                >
                  <p className="text-left text-xl max-sm:text-md font-bold text-secondary-foreground cursor-pointer hover:underline">
                    {child.icon}
                    {child.title.length > 20 && isMobile
                      ? child.title.slice(0, 17) + "..."
                      : child.title}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="w-full h-full text-center">
            <Inbox className="w-[30%] h-[20%] m-auto" />
            <p className="font-bold text-2xl max-sm:text-lg">
              This Folder is empty!
            </p>
          </div>
        )}
      </div>
      <FolderDialog
        parentFolder={folderId as Id<"folders">}
        show={showFolderModal}
        setShow={setShowFolderModal}
      />
    </div>
  );
}
