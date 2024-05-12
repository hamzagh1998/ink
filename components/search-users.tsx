import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";

import { useAddCollaborators } from "@/hooks/use-add-collaborators";
import { Id } from "@/convex/_generated/dataModel";

interface Item {
  _id: Id<"profiles">;
  firstName: string;
  lastName: string;
  email: string;
}

export default function SearchUsers() {
  const [items, setItems] = useState<null | Item[]>(null);

  const [isMounted, setIsMounted] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<Id<"profiles">[]>([]);

  const isOpen = useAddCollaborators((store) => store.isOpen);
  const onClose = useAddCollaborators((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                value={`${item._id}-${item.firstName + item.lastName}`}
                title={item.firstName + item.lastName}
                onClick={() => setSelectedUsers([...selectedUsers, item._id])}
              >
                <span>{item.firstName + item.lastName}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
