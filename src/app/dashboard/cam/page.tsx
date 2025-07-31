import Button from "@/components/elements/Button";
import CameraFragment from "@/components/fragments/CameraFragment";
import React from "react";

const Cam = () => {
  return (
    <div className="container mx-auto p-4 w-full h-screen bg-white ">
      <div className="flex items-center justify-between gap-4 p-5">
        <h1 className="font-bold text-3xl text-slate-600">Camera Page</h1>
        <div>
          <Button>Cancel Picture</Button>
        </div>
      </div>
      <CameraFragment />
    </div>
  );
};

export default Cam;
