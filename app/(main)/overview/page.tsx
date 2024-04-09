"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileUp, FolderPlus, NotepadText } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function OverviewPage() {
  const { user } = useUser();

  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const create = useMutation(api.documents.create);

  const onCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}`)
    );

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center justify-center">
        <Image
          src="/logo-light.png"
          height="80"
          width="80"
          alt="Logo"
          className="dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          height="80"
          width="80"
          alt="Logo"
          className="hidden dark:block"
        />
      </div>
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Ink
      </h2>
      <div className="flex justify-center items-center flex-wrap gap-2">
        <Button className={isMobile ? "" : "w-48"} size="lg" onClick={onCreate}>
          <FolderPlus className={isMobile ? "" : "mr-2"} />
          {isMobile ? "" : "Add folder"}
        </Button>
        <Button className={isMobile ? "" : "w-48"} size="lg" onClick={onCreate}>
          <FileUp className={isMobile ? "" : "mr-2"} />
          {isMobile ? "" : "Upload file"}
        </Button>
        <Button className={isMobile ? "" : "w-48"} size="lg" onClick={onCreate}>
          <NotepadText className={isMobile ? "" : "mr-2"} />
          {isMobile ? "" : "Add document"}
        </Button>
      </div>
    </div>
  );
}
