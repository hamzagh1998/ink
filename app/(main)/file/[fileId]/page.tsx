"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { Pencil, Save } from "lucide-react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Input } from "@/components/ui/input";

interface QueryParams {
  [key: string]: string | undefined;
}

export default function FileDetailPage() {
  const { fileId } = useParams();
  const [queryParams, setQueryParams] = useState<QueryParams>();

  const updateFileName = useMutation(api.files.updateFileName);

  const [title, setTitle] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Function to parse query parameters from window.location.search
    const getQueryParams = (): QueryParams => {
      const queryParams: QueryParams = {};
      const queryString = window.location.search.substring(1);
      const pairs = queryString.split("&");
      pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        queryParams[key] = decodeURIComponent(value);
      });
      return queryParams;
    };

    const params = getQueryParams();
    setQueryParams(params);
    setTitle(params.title as string);
  }, []);

  const viwedFiles = ["png", "jpg", "jpeg", "svg", "gif", "bmp"];

  const onSave = async () => {
    if (!queryParams) return;

    await updateFileName({
      fileId: fileId as Id<"files">,
      title: title,
    });
    const url = new URL(window.location.href);

    const titlePrms = new URL(window.location.href).searchParams.get("title");

    if (titlePrms) {
      url.searchParams.set("title", title);
      window.history.replaceState({}, "", url);
    }
    setIsEdit(false);
  };

  return (
    <>
      {queryParams ? (
        <div className="w-full h-full flex justify-center items-start py-8">
          {viwedFiles.includes(queryParams.fileType as string) ? (
            <div className="p-4">
              <CldImage
                width="800"
                height="800"
                src={queryParams.url as string}
                sizes="100vw"
                alt="Description of my image"
              />
              <p className="flex justify-between items-end mt-4">
                {isEdit ? (
                  <Input
                    type="text"
                    className="w-[90%]"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <p className="line-clamp-1">{title}</p>
                )}
                {isEdit ? (
                  <Save className="cursor-pointer h-9" onClick={onSave} />
                ) : (
                  <Pencil
                    className="cursor-pointer h-9"
                    onClick={() => setIsEdit(true)}
                  />
                )}
              </p>
            </div>
          ) : (
            <div className="p-4 w-1/3 h-1/2 max-sm:h-full max-sm:w-full">
              <CldVideoPlayer
                width="800"
                height="800"
                src={queryParams.url as string}
              />
              <p className="flex justify-between items-end mt-4">
                {isEdit ? (
                  <Input
                    type="text"
                    className="w-[90%]"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <p className="line-clamp-1">{title}</p>
                )}
                {isEdit ? (
                  <Save className="cursor-pointer h-9" onClick={onSave} />
                ) : (
                  <Pencil
                    className="cursor-pointer h-9"
                    onClick={() => setIsEdit(true)}
                  />
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
