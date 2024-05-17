"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { NotepadText, Trash2Icon } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { ConfirmAlert } from "@/components/confirm-alert";

interface DocumentProps {
  id: Id<"documents">;
  level: number;
  title: string;
  icon?: string;
}

export function Document({ level, id, title, icon }: DocumentProps) {
  const router = useRouter();

  const profile = useQuery(api.profiles.getProfile, { skip: false });
  const document = useQuery(api.documents.getById, { documentId: id });
  const deleteDocument = useMutation(api.documents.deleteDocument);

  const [isOpen, setIsOpen] = useState(false);

  const updateWorkspace = () => {
    router.push("/overview");
    deleteDocument({ id });
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
        <div className="w-full flex justify-between items-center">
          <div className="flex justify-center items-center gap-2 hover:text-secondary-foreground">
            <div onClick={() => router.push("/document/" + id)}>
              {icon ? <div>{icon}</div> : <NotepadText size={18} />}
            </div>
            <p
              className="line-clamp-1"
              onClick={() => router.push("/document/" + id)}
            >
              {title}
            </p>
          </div>
          <div>
            <ConfirmAlert
              title="Are you absolutely sure"
              content="This action cannot be undone. This will permanently delete this document"
              cb={updateWorkspace}
            >
              {document?.userId === profile?.userId ? (
                <Trash2Icon className="hover:text-destructive" size={18} />
              ) : (
                <></>
              )}
            </ConfirmAlert>
          </div>
        </div>
      </div>
    </main>
  );
}
