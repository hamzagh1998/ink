"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Switch } from "@radix-ui/react-switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FolderDialog({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isPrivate, setIsPrivate] = useState(false);

  const FolderSchema = z.object({
    title: z
      .string()
      .min(2, {
        message: "Title must be at least 10 characters.",
      })
      .max(60, {
        message: "Title must not be longer than 60 characters.",
      }),
    description: z
      .string()
      .min(2, {
        message: "Description must be at least 10 characters.",
      })
      .max(300, {
        message: "Description must not be longer than 300 characters.",
      })
      .optional(),
    isPrivate: z.boolean().default(false),
    password: z
      .string()
      .min(4, {
        message: "Password must be at least 4 characters.",
      })
      .max(300, {
        message: "Password must not be longer than 8 characters.",
      })
      .optional(),
  });

  return (
    <Dialog open={show} onOpenChange={() => setShow(false)}>
      <DialogContent className="sm:max-w-[25%] w-full">
        <DialogHeader>
          <DialogTitle>Add new folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              type="text"
              id="title"
              value="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value="@peduarte"
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="private" />
            <Label htmlFor="private">Private: {isPrivate ? "Yes" : "No"}</Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              value="@peduarte"
              placeholder="******"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
