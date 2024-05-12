"use client";

import { useEffect, useState } from "react";
import { File, HelpCircle, NotepadText } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useSearch } from "@/hooks/use-search";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Item {
  _id: Id<"documents" | "files">;
  _creationTime: number;
  title: string;
  itemType: string;
  icon?: string;
}

export const SearchCommand = () => {
  const router = useRouter();

  const [items, setItems] = useState<null | Item[]>(null);

  const documents = useQuery(api.documents.getSearch);
  const files = useQuery(api.files.getSearch);

  const [isMounted, setIsMounted] = useState(false);

  const isOpen = useSearch((store) => store.isOpen);
  const toggle = useSearch((store) => store.toggle);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!documents && !files) return;

    if (documents && !files) setItems([...documents]);
    if (!documents && files) setItems([...files]);
    if (documents && files) setItems([...documents, ...files]);
  }, [documents, files]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string, itemType: string) => {
    console.log("HelpCircle");

    itemType === "document"
      ? router.push(`/document/${id}`)
      : router.push(`/file/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search for document/file...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents/Files">
          {items &&
            items?.map((item) => (
              <CommandItem
                key={item._id}
                value={`${item._id}-${item.title}`}
                title={item.title}
                onSelect={() => onSelect(item._id, item.itemType)}
              >
                {item.icon ? (
                  <p className="mr-2 text-[18px]">{item.icon}</p>
                ) : item.itemType === "file" ? (
                  <File className="mr-2 h-4 w-4" />
                ) : (
                  <NotepadText className="mr-2 h-4 w-4" />
                )}
                <span onClick={() => onSelect(item._id, item.itemType)}>
                  {item.title}
                </span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
