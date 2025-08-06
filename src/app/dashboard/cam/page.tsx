"use client"; // ✅ wajib di baris pertama

import { useRouter } from "next/navigation"; // ✅ pakai next/navigation, bukan next/router
import Button from "@/components/elements/Button";
import CameraFragment from "@/components/fragments/CameraFragment";
import React from "react";

const Cam = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.replace("/dashboard");
  };

  return (
    <div className="p-4 w-full h-screen bg-black">
      <div className="flex items-center justify-between gap-4 p-5">
        <h1 className="font-bold text-3xl text-white">Smartfarm Camera</h1>
        <div>
          <Button className="bg-red-500 rounded-lg h-10 w-34 text-white font-semibold text-base" onClick={handleCancel}>Cancel Picture</Button>
        </div>
      </div>
      <CameraFragment />
    </div>
  );
};

export default Cam;
