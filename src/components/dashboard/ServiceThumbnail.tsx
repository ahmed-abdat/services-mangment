"use client";

import { Label } from "@/components/ui/label";
import { ChangeEvent, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Thumbnail } from "@/types/upload-serves";

export default function ServiceThumbnail({
  thumbnail,
  setThumbnail,
}: {
  thumbnail: Thumbnail;
  setThumbnail: (thumbnail: Thumbnail) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handelOnThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    // check if the file is image or not
    if (file && file.type.split("/")[0] === "image") {
      const thumbnail = {
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      };
      setThumbnail(thumbnail);
    }
  };

  const clearThumbnail = () => {
    setThumbnail(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    // check if the file is image or not
    if (file && file.type.split("/")[0] === "image") {
      const thumbnail = {
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      };
      setThumbnail(thumbnail);
    }
  };


  return (
    <Card
      className="w-full "
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="px-4 pt-3 pb-5">
        <CardTitle className="font-semibold text-lg text-center">
          service thumbnail
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {thumbnail ? (
          <>
            <div className="relative w-full h-[250px] max-w-full pb-4">
              <Image
                src={thumbnail?.url}
                fill
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 30vw"
                priority={true}
                loading="eager"
                alt="thumbnail"
                className="w-full h-full object-contain rounded-md"
              />
              <Button
                className="absolute -top-10 left-0 h-7 w-7 font-roboto"
                variant="outline"
                onClick={clearThumbnail}
              >
                X
              </Button>
            </div>
          </>
        ) : isDragging ? (
          <div className="border rounded-md w-full h-48 flex justify-center items-center ">
            <span className="font-aljazira text-[1.2rem] text-gray-900">
              أفلت الصورة هنا
            </span>
          </div>
        ) : (
          <div className="border rounded-md w-full h-48 flex justify-center items-center ">
            <label className="cursor-pointer w-full h-full flex items-center justify-center rounded-md">
              <input
                type="file"
                hidden={true}
                onChange={handelOnThumbnailChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-cloud-upload"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </label>
            <div className="border rounded-md p-2 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-150"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
