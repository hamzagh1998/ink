import { useState } from "react";
import { IconPicker } from "@/components/icon-picker";
import { Smile } from "lucide-react";
import { useMutation } from "convex/react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { api } from "@/convex/_generated/api";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/hooks/user-workspace";

export function FolderDialog({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const createFolder = useMutation(api.folders.createFolder);
  const addChild = useMutation(api.workspaces.addChild);

  const { id } = useWorkspace();

  const [validationErrors, setValidationErrors] = useState<
    z.ZodError | undefined
  >(undefined);

  const FolderSchema = z.lazy(() =>
    z
      .object({
        title: z
          .string()
          .min(2, {
            message: "Title must be at least 2 characters.",
          })
          .max(60, {
            message: "Title must not be longer than 60 characters.",
          }),
        icon: z.string().nullish(),
        description: z.string().optional().nullable(),
        isPrivate: z.boolean().default(false),
        password: z.string().nullish(),
      })
      .refine((data) => (data.isPrivate ? data.password : true), {
        message: "Password is required for private folders.",
        path: ["password"],
      })
      .refine(
        (data) =>
          data.isPrivate && data.password ? data.password.length >= 4 : true,
        {
          message: "Password must be at least 4 characters.",
          path: ["password"],
        }
      )
  );

  const [formData, setFormData] = useState({
    title: "",
    icon: null,
    description: "",
    isPrivate: false,
    password: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const onChangeIcon = (icon: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      icon: icon,
    }));
  };

  const handleSubmit = async () => {
    setValidationErrors(undefined);
    try {
      FolderSchema.parse(formData);
      const folder = await createFolder({
        title: formData.title,
        icon: formData.icon ? formData.icon : undefined,
        description: formData.description,
        isPrivate: formData.isPrivate,
        password: formData.password,
        parentWorkSpace: id,
      });
      addChild({ workspaceId: id!, child: { id: folder._id, type: "folder" } });
      setShow(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // If validation fails, set validation errors state
        setValidationErrors(error);
      }
    }
  };

  return (
    <>
      <Dialog open={show} onOpenChange={() => setShow(false)}>
        <DialogContent className="sm:max-w-[25%] w-full">
          <DialogHeader>
            <DialogTitle>Add new folder</DialogTitle>
          </DialogHeader>
          <div className="py-4 my-4">
            <div className="flex justify-center items-start my-4 gap-4">
              <div className="w-fit">
                <div>
                  <Label htmlFor="title" className="text-right">
                    Icon
                  </Label>
                </div>
                <IconPicker onChange={onChangeIcon}>
                  <Button
                    className="text-muted-foreground text-xs h-9"
                    variant="outline"
                    size="sm"
                  >
                    <Smile className="h-5 w-5 mr-2" />
                    {!formData.icon ? (
                      "Add Icon"
                    ) : (
                      <p className="text-lg hover:opacity-75 transition">
                        {formData.icon}
                      </p>
                    )}
                  </Button>
                </IconPicker>
              </div>
              <div className="w-full">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    "col-span-3 border",
                    validationErrors?.issues.find(
                      (issue) => issue.path[0] === "title"
                    ) && "border-red-500"
                  )}
                />
                {validationErrors?.issues.find(
                  (issue) => issue.path[0] === "title"
                ) && (
                  <p className="w-full text-right text-xs my-1 text-red-500">
                    {
                      validationErrors?.issues.find(
                        (issue) => issue.path[0] === "title"
                      )?.message
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="my-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3 h-32"
              />
            </div>
            <div className="flex items-center space-x-2 my-4">
              <Switch
                id="private"
                name="isPrivate"
                checked={formData.isPrivate}
                onCheckedChange={() =>
                  setFormData({ ...formData, isPrivate: !formData.isPrivate })
                }
              />
              <Label htmlFor="private">
                Private: {formData.isPrivate ? "Yes" : "No"}
              </Label>
            </div>
            {formData.isPrivate ? (
              <div className="my-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="******"
                  className={cn(
                    "col-span-3 border",
                    validationErrors?.issues.find(
                      (issue) => issue.path[0] === "password"
                    ) && "border-red-500"
                  )}
                />
                {validationErrors?.issues.find(
                  (issue) => issue.path[0] === "password"
                ) && (
                  <p className="w-full text-right text-xs my-1 text-red-500">
                    {
                      validationErrors?.issues.find(
                        (issue) => issue.path[0] === "password"
                      )?.message
                    }
                  </p>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
