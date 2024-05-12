"use client";
import React, { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";

export function CollaboratorDialog({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const getUsersProfiles = useMutation(api.profiles.getUsersProfiles);

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"profiles">[]>([]);
  const [users, setUsers] = useState<any>([]);
  const [filtredUsers, setFiltredUsers] = useState<any>([]);

  const handleSubmit = () => {
    return;
  };

  const onGetUsers = async () => {
    const users = await getUsersProfiles({ name: search });
    setUsers(users);
  };

  const toggleUsers = async (userId: Id<"profiles">) => {
    const isUserExists = selectedUsers.filter(
      (selectedUserId: Id<"profiles">) => userId === selectedUserId
    )[0];
    isUserExists
      ? setSelectedUsers([
          ...selectedUsers.filter(
            (selectedUserId: Id<"profiles">) => selectedUserId !== userId
          ),
        ])
      : selectedUsers.length < 5
        ? setSelectedUsers([...selectedUsers, userId])
        : null;
  };

  const onAdd = async () => {
    try {
    } catch (error) {}
  };

  useEffect(() => {
    onGetUsers();
  }, []);

  useEffect(() => {
    (async () => {
      const users = await getUsersProfiles({ name: search });
      setFiltredUsers(users);
    })();
  }, [search]);

  return (
    <Dialog open={show} onOpenChange={() => setShow(false)}>
      <DialogContent className="sm:max-w-[30%] w-full">
        <DialogHeader>
          <DialogTitle>Add collaborators</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You can add up to 5 collaborators!
        </DialogDescription>
        <Input
          value={search}
          placeholder="Jhon Doe"
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtredUsers.length ? (
          filtredUsers.slice(0, 5).map((user: any) => (
            <div
              key={user._id}
              className="flex w-full justify-between items-center cursor-pointer p-1 hover:bg-primary-foreground"
              onClick={() => toggleUsers(user._id)}
            >
              <div className="w-full flex justify-start items-center gap-2">
                <img
                  className="rounded-full"
                  src={
                    "https://api.dicebear.com/8.x/initials/svg?seed=" +
                    user.name
                  }
                  alt="avatar"
                  width={35}
                  height={35}
                />
                <div>
                  <p>{user.name}</p>
                  <p className="text-xs float-left text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              {selectedUsers.includes(user._id) ? <Check size={18} /> : <></>}
            </div>
          ))
        ) : (
          <></>
        )}
        <DialogFooter>
          <div className="flex w-full justify-start items-center">
            {users.length ? (
              users
                .filter((user: any) => selectedUsers.includes(user._id))
                .map((user: any) => (
                  <img
                    key={user._id}
                    className="rounded-full ml-[-10px]"
                    src={
                      "https://api.dicebear.com/8.x/initials/svg?seed=" +
                      user.name
                    }
                    alt="avatar"
                    width={35}
                    height={35}
                  />
                ))
            ) : (
              <></>
            )}
          </div>
          <Button
            type="button"
            disabled={selectedUsers.length === 0}
            onClick={handleSubmit}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
