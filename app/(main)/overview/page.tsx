"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  File,
  FileUp,
  Folder,
  FolderPlus,
  NotepadText,
  PenIcon,
  Save,
  UserRound,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";

import { api } from "@/convex/_generated/api";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkspace } from "@/hooks/user-workspace";

import { FolderDialog } from "../../(main)/_components/folder-dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { capitalize } from "@/utils/capitalize";

export default function OverviewPage() {
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { id, name, setWorkspaceName } = useWorkspace();

  const saveFile = useMutation(api.files.saveFile);

  const workspace = useQuery(api.workspaces.getUserWorkspace);
  const profile = useQuery(api.profiles.getProfile, { skip: false });
  const folders = useQuery(api.folders.getFolders);
  const files = useQuery(api.files.getFiles);
  const documents = useQuery(api.documents.getDocuments);
  const updateWorkspaceName = useMutation(api.workspaces.updateWorkspaceName);
  const createDocument = useMutation(api.documents.createDocument);
  const addWorkspaceChild = useMutation(api.workspaces.addChild);

  const { setWorkspaceData } = useWorkspace();

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const onSave = () => {
    updateWorkspaceName({
      workspaceId: workspace?._id!,
      name: workspace?.name!,
    });
    setIsEdit(false);
  };

  const onCreateDocument = async () => {
    const promise = createDocument({
      title: "Untitled",
      parentWorkSpace: id,
    }).then(async (document) => {
      const workspace = await addWorkspaceChild({
        workspaceId: id!,
        child: {
          id: document._id,
          title: document.title,
          icon: document.icon,
          type: "document",
        },
      });
      setWorkspaceData(
        workspace._id,
        workspace.name,
        workspace.children,
        workspace.users
      );
      router.push(`/document/${document._id}`);
    });

    toast.promise(promise, {
      loading: "Creating a new document...",
      success: "New document created!",
      error: "Failed to create a new document.",
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
      parentWorkSpace: id,
    });
    const workspaceData = await addWorkspaceChild({
      workspaceId: workspace?._id!,
      child: {
        id: file._id,
        title: file.title,
        type: "file",
      },
    });
    setWorkspaceData(
      workspaceData._id,
      workspaceData.name,
      workspaceData.children,
      workspaceData.users
    );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {workspace ? (
        <>
          <h2 className="flex items-center justify-center gap-4 mb-12 text-4xl font-medium max-sm:text-2xl">
            {isEdit ? (
              <Input
                type="text"
                value={name}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            ) : (
              name
            )}
            {isEdit ? (
              <Save className="cursor-pointer" onClick={onSave} />
            ) : (
              <PenIcon
                className="cursor-pointer"
                onClick={() => setIsEdit(true)}
              />
            )}
          </h2>
          <div className="flex justify-center items-center flex-wrap gap-4">
            <Card className={isMobile ? "p-0 w-[87%]" : "w-72"}>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-4">
                  <UserRound />
                  <p className="text-xl font-bold text-secondary-foreground">
                    {capitalize(profile?.plan!)} Plan
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className={isMobile ? "p-0 w-[87%]" : "w-72"}>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-4">
                  <Database />
                  <p className="text-xl font-bold text-secondary-foreground">
                    {profile?.storageUsageInMb}/1024MB
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="flex justify-center items-center flex-wrap gap-2">
            <Card className={isMobile ? "p-0" : "w-48"}>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-4">
                  <Folder />
                  <p className="text-xl font-bold text-secondary-foreground">
                    {folders ? folders.length : 0}
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className={isMobile ? "p-0" : "w-48"}>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-4">
                  <File />
                  <p className="text-xl font-bold text-secondary-foreground">
                    {files ? files.length : 0}
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className={isMobile ? "p-0" : "w-48"}>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-4">
                  <NotepadText />
                  <p className="text-xl font-bold text-secondary-foreground">
                    <p className="text-xl font-bold text-secondary-foreground">
                      {documents ? documents.length : 0}
                    </p>
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div>
            <h1 className="mb-4 mt-12 text-2xl font-medium max-sm:text-xl">
              Add New
            </h1>
            <div className="flex justify-center items-center flex-wrap gap-2">
              <Button
                className={isMobile ? "" : "w-48"}
                size="lg"
                onClick={() => setShowFolderModal(true)}
              >
                <FolderPlus className={isMobile ? "" : "mr-2"} />
                {isMobile ? "" : "Folder"}
              </Button>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_PRESET_NAME!}
                onSuccess={(results) => onUploadFile(results)}
              >
                {({ open }) => {
                  return (
                    <Button
                      className={isMobile ? "" : "w-48"}
                      size="lg"
                      onClick={() => open()}
                    >
                      <FileUp className={isMobile ? "" : "mr-2"} />
                      {isMobile ? "" : "File"}
                    </Button>
                  );
                }}
              </CldUploadWidget>

              <Button
                className={isMobile ? "" : "w-48"}
                size="lg"
                onClick={onCreateDocument}
              >
                <NotepadText className={isMobile ? "" : "mr-2"} />
                {isMobile ? "" : "Document"}
              </Button>
            </div>
          </div>
          <FolderDialog show={showFolderModal} setShow={setShowFolderModal} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
