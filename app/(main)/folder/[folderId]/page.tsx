"use client";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ElementRef, useEffect, useRef, useState } from "react";
import { IconPicker } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { FilePlus, FolderPlus, NotepadText, Smile, X } from "lucide-react";

export default function FolderDetailPage() {
  const { folderId } = useParams();

  const folder = useQuery(api.folders.getFolder, {
    id: folderId as Id<"folders">,
  });
  const updateFolderName = useMutation(api.folders.updateFolderName);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const inputRef = useRef<ElementRef<"textarea">>(null);

  const [isEdit, setIsEdit] = useState(false);

  const [folderName, setFolderName] = useState("");

  const onSave = () => {
    updateFolderName({
      folderId: folderId as Id<"folders">,
      title: folderName,
      icon: folder?.icon,
    });
    setIsEdit(false);
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

  useEffect(() => {
    if (!folder) return;

    setFolderName(folder.title);
  }, [folder]);

  console.log(folder);

  if (!folder) {
    return;
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
          <FolderPlus className="cursor-pointer" size={isMobile ? 18 : 32} />
          <FilePlus className="cursor-pointer" size={isMobile ? 18 : 32} />
          <NotepadText className="cursor-pointer" size={isMobile ? 18 : 32} />
        </div>
      </div>
    </div>
  );
}
