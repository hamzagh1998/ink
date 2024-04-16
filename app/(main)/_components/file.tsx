"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { icons, Trash2Icon } from "lucide-react";

import { api } from "@/convex/_generated/api";

import { useWorkspace } from "@/hooks/user-workspace";

import { fileTypes } from "@/utils/files-icons";

interface FilesProps {
  id: Id<"files">;
  level: number;
}

export function Files({ level, id }: FilesProps) {
  const router = useRouter();

  const file = useQuery(api.files.getFileById, { id });
  const deleteFile = useMutation(api.files.deleteFile);
  const initUserWorkspace = useMutation(api.workspaces.initUserWorkspace);

  const { setWorkspaceData } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);

  const updateWorkspace = async () => {
    await deleteFile({ id });
    const workspace = await initUserWorkspace({});
    if (workspace) {
      setWorkspaceData(
        workspace._id,
        workspace.name,
        workspace.children,
        workspace.usersIds
      );
    }
    router.push("/overview");
  };

  let extension = "raw";
  if (file && file.format && Object.keys(fileTypes).includes(file.format)) {
    extension = file.format;
  }

  const onSeeDetail = async () => {
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
      `/file/${id}?title=${encodeURIComponent(file.title)}&fileType=${encodeURIComponent(format)}&url=${encodeURIComponent(file.url)}`
    );
  };

  //@ts-ignore
  const LucideIcon = icons[fileTypes[extension]];

  return (
    <main>
      {file ? (
        <div
          className="flex justify-between items-center pl-3 gap-2 group min-h-[27px] text-sm py-1 pr-3 my-4 w-full hover:bg-primary/5 text-muted-foreground font-medium cursor-pointer"
          style={{
            paddingLeft: level ? `${level * 12 + 12}px` : "12px",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-full flex justify-between items-center">
            <div className="flex justify-center items-center gap-2 hover:text-secondary-foreground">
              <div className="w-4 h-4">
                <LucideIcon size={18} />
              </div>
              <p className="line-clamp-1" onClick={onSeeDetail}>
                {file!.title}
              </p>
            </div>
            <Trash2Icon
              onClick={updateWorkspace}
              className="hover:text-destructive"
              size={18}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}
