"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaCameraRotate } from "react-icons/fa6";

const CameraFragment = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const startCamera = async (deviceId?: string) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const handleRotateCamera = () => {
    if (devices.length === 0) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    startCamera(devices[nextIndex].deviceId);
  };

  const uploadToServer = async (dataURL: string) => {
    try {
      const blob = await (await fetch(dataURL)).blob();

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Upload berhasil:", data.fileName);
        alert("Gambar berhasil disimpan sebagai: " + data.fileName);
      } else {
        console.error("Upload gagal:", data.message);
      }
    } catch (error) {
      console.error("Error saat upload:", error);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg"); // gunakan JPEG
        setImage(dataURL);
        uploadToServer(dataURL); // kirim ke backend
      }
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Konversi ke URL untuk preview
    const imagePreviews = fileArray.map((file) => URL.createObjectURL(file));
    setSelectedImages(imagePreviews);

    // Jika ingin upload langsung, kirim fileArray ke server
    // fileArray.forEach(uploadSingleFile)
  };

  useEffect(() => {
    const init = async () => {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        startCamera(videoDevices[0].deviceId);
      }
    };
    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4">
      <video ref={videoRef} autoPlay playsInline className="rounded-md shadow fixed top-0 left-0 w-screen h-screen object-cover" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="mt-4 text-center">
        <label className="px-4 py-2 bg-purple-500 text-white rounded shadow cursor-pointer">
          <input type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" />
        </label>
      </div>

      <div className="button-wrapper bg-white rounded-full w-20 h-20 fixed bottom-10 left-1/2 -translate-x-1/2 flex justify-center items-center p-2">
        <button onClick={handleCapture} className="w-full h-full flex justify-center items-center border-2 border-slate-400 rounded-full"></button>
      </div>

      <div className="button-wrapper  w-20 h-20 fixed bottom-10 right-0 flex justify-center items-center p-2">
        <button onClick={handleRotateCamera} className="w-full h-full text-5xl flex justify-center items-center border-2 border-slate-400 rounded-full">
          <FaCameraRotate />
        </button>
      </div>
    </div>
  );
};

export default CameraFragment;
