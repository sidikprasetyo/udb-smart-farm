"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { RotateCcw, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadToServer, uploadFileToServer } from "../../../lib/uploadUtils";
import { ImagePreviewModal } from "../../ImagePreviewModal";
import { ToastContainer } from "../../Toast";
import { useRouter } from "next/navigation";


interface ImageData {
  id: string;
  url: string;
  file?: File;
  name: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
}

const CameraFragment = () => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useRouter();


  // Toast functions
  const addToast = useCallback((type: "success" | "error" | "warning", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Camera functions
  const startCamera = async (deviceId?: string) => {
    try {
      if (streamRef) {
        streamRef.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamRef(stream);
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      addToast("error", "Gagal mengakses kamera");
      setIsCameraReady(false);
    }
  };

  const handleRotateCamera = () => {
    if (devices.length <= 1) {
      addToast("warning", "Tidak ada kamera lain tersedia");
      return;
    }

    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    setIsCameraReady(false);
    startCamera(devices[nextIndex].deviceId);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", 0.8);

        const newImage: ImageData = {
          id: Date.now().toString(),
          url: dataURL,
          name: `Camera_${new Date().toLocaleString()}.jpg`,
        };

        setSelectedImages((prev) => [...prev, newImage]);
        setIsModalOpen(true);
        addToast("success", "Foto berhasil diambil");
      }
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageData[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      file,
      name: file.name,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    setIsModalOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.file) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const image of selectedImages) {
      try {
        let result;
        if (image.file) {
          result = await uploadFileToServer(image.file);
        } else {
          result = await uploadToServer(image.url);
        }

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setIsUploading(false);
    setIsModalOpen(false);

    // Cleanup
    selectedImages.forEach((image) => {
      if (image.file) {
        URL.revokeObjectURL(image.url);
      }
    });
    setSelectedImages([]);

    // Show result
    if (successCount > 0) {
      addToast("success", `${successCount} gambar berhasil diupload`);
    }
    if (errorCount > 0) {
      addToast("error", `${errorCount} gambar gagal diupload`);
    }

    // Redirect to dashboard if at least one upload succeeded
    if (successCount > 0) {
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500); // beri sedikit delay agar toast bisa muncul sebentar
    }
  };

  // Initialize camera
  useEffect(() => {
    const init = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          await startCamera(videoDevices[0].deviceId);
        } else {
          addToast("error", "Tidak ada kamera ditemukan");
        }
      } catch (error) {
        console.error("Error initializing camera:", error);
        addToast("error", "Gagal menginisialisasi kamera");
      }
    };

    init();

    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach((track) => track.stop());
      }
      // Cleanup URLs
      selectedImages.forEach((image) => {
        if (image.file) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative mx-auto w-[90vw] h-[80vh] bg-black overflow-hidden text-white font-sans rounded-lg">

      {/* Video Stream */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* Loading Overlay */}
      {!isCameraReady && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Camera initialization...</p>
          </div>
        </div>
      )}

      {/* Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="text-white">
          </div>
          {selectedImages.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200"
            >
              <ImageIcon size={18} />
              <span>{selectedImages.length}</span>
            </button>
          )}
        </div>
      </div>


      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent z-10">
        <div className="flex items-center justify-center gap-6">
          {/* Gallery Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition transform active:scale-95 backdrop-blur-md shadow-lg"
          >
            <ImageIcon size={22} />
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={!isCameraReady}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 bg-red-500 rounded-full transition-all duration-200" />
          </button>

          {/* Rotate Button */}
          <button
            onClick={handleRotateCamera}
            disabled={devices.length <= 1}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition transform active:scale-95 backdrop-blur-md shadow-lg disabled:opacity-40"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        <p className="text-center text-white/80 mt-3 text-sm">Push the capture button to take a picture</p>
      </div>


      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" />

      {/* Image Preview Modal */}
      <ImagePreviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} images={selectedImages} onRemoveImage={handleRemoveImage} onUploadImages={handleUploadImages} isUploading={isUploading} />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default CameraFragment;
