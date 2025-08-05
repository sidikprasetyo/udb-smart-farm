"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Button from "@/components/elements/Button";
import Image from "next/image";
import { Camera, Brain, RotateCcw, Save, X, Play, Square } from "lucide-react";

interface PredictionResult {
  prediction: string;
  confidence: number;
  solution?: {
    name: string;
    description: string;
    treatment: string[];
    prevention: string[];
  };
  timestamp: string;
}

interface CapturePreview {
  id: string;
  url: string;
  timestamp: string;
  analysis?: PredictionResult;
}

const Cam = () => {
  const [activeMode, setActiveMode] = useState<"capture" | "realtime">("capture");
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturePreview, setCapturePreview] = useState<CapturePreview | null>(null);
  const [realtimePrediction, setRealtimePrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const realtimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const startCamera = useCallback(async (deviceId?: string, isRotating = false) => {
    try {
      setIsCameraReady(false);
      setCameraError(null);

      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      // Set timeout for camera initialization
      initTimeoutRef.current = setTimeout(() => {
        setCameraError("Timeout: Kamera tidak dapat diinisialisasi dalam 10 detik");
        setIsCameraReady(false);
      }, 10000);

      // Stop existing stream with proper cleanup
      if (streamRef) {
        streamRef.getTracks().forEach((track) => {
          track.stop();
        });
        setStreamRef(null);

        // Add small delay when rotating to allow proper camera release
        if (isRotating) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Request camera permissions and stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: deviceId ? undefined : "environment",
        },
      });

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                // Clear timeout on success
                if (initTimeoutRef.current) {
                  clearTimeout(initTimeoutRef.current);
                }

                setStreamRef(stream);
                setIsCameraReady(true);
                setCameraError(null);
                console.log("Camera initialized successfully");
              })
              .catch((error) => {
                console.error("Error playing video:", error);
                setIsCameraReady(false);
                setCameraError("Error memulai video: " + error.message);
              });
          }
        };

        // Handle video errors
        videoRef.current.onerror = (error) => {
          console.error("Video error:", error);
          setIsCameraReady(false);
          setCameraError("Error pada video stream");
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraReady(false);

      // Clear timeout on error
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Akses kamera ditolak. Silakan izinkan akses kamera di browser.");
        } else if (error.name === "NotFoundError") {
          setCameraError("Kamera tidak ditemukan. Pastikan kamera terhubung.");
        } else if (error.name === "NotReadableError") {
          setCameraError("Kamera sedang digunakan aplikasi lain atau device sedang switching.");
        } else {
          setCameraError("Error mengakses kamera: " + error.message);
        }
      }
    }
  }, []);

  // Get available devices
  useEffect(() => {
    let mounted = true;

    const initDevices = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported in this browser");
        }

        // Request permission first
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Get device list
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter((d) => d.kind === "videoinput");

        if (mounted) {
          setDevices(videoDevices);

          if (videoDevices.length > 0) {
            await startCamera(videoDevices[0].deviceId);
          } else {
            console.warn("No video devices found");
            setCameraError("Tidak ada kamera yang ditemukan pada device ini.");
            setIsCameraReady(false);
          }
        }
      } catch (error) {
        console.error("Error initializing camera:", error);
        if (mounted) {
          setIsCameraReady(false);
        }
      }
    };

    initDevices();

    return () => {
      mounted = false;
      if (streamRef) {
        streamRef.getTracks().forEach((track) => track.stop());
      }
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [startCamera]);

  // Rotate camera
  const handleRotateCamera = async () => {
    if (devices.length <= 1) return;

    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    setIsCameraReady(false);
    setCameraError(null);

    try {
      await startCamera(devices[nextIndex].deviceId, true);
    } catch (error) {
      console.error("Error rotating camera:", error);
      setIsCameraReady(false);
      setCameraError("Gagal mengganti kamera. Coba lagi dalam beberapa detik.");

      // Retry after a short delay
      setTimeout(async () => {
        try {
          await startCamera(devices[nextIndex].deviceId, true);
        } catch (retryError) {
          console.error("Retry error:", retryError);
        }
      }, 2000);
    }
  };

  // Capture image
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

        const newCapture: CapturePreview = {
          id: Date.now().toString(),
          url: dataURL,
          timestamp: new Date().toLocaleString(),
        };

        setCapturePreview(newCapture);
      }
    }
  };

  // Analyze captured image
  const analyzeCapture = async () => {
    if (!capturePreview) return;

    setIsAnalyzing(true);
    try {
      // Convert dataURL to blob
      const response = await fetch(capturePreview.url);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");
      formData.append("mode", "upload");

      const analysisResponse = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const result = await analysisResponse.json();

      if (result.success && result.prediction) {
        const analysisResult: PredictionResult = {
          prediction: result.prediction.prediction || "unknown",
          confidence: result.prediction.confidence || 0,
          solution: result.prediction.solution,
          timestamp: new Date().toLocaleString(),
        };

        setCapturePreview((prev) => (prev ? { ...prev, analysis: analysisResult } : null));
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save capture
  const saveCapture = async () => {
    if (!capturePreview) return;

    try {
      const response = await fetch(capturePreview.url);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, `capture_${Date.now()}.jpg`);

      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setCapturePreview(null);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Real-time analysis
  const startRealtimeAnalysis = () => {
    setIsRealtimeActive(true);
    setRealtimePrediction(null);

    realtimeIntervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && isCameraReady) {
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  const formData = new FormData();
                  formData.append("image", blob, "realtime.jpg");
                  formData.append("mode", "upload");

                  const response = await fetch("/api/predict", {
                    method: "POST",
                    body: formData,
                  });

                  const result = await response.json();

                  if (result.success && result.prediction) {
                    const prediction: PredictionResult = {
                      prediction: result.prediction.prediction || "unknown",
                      confidence: result.prediction.confidence || 0,
                      solution: result.prediction.solution,
                      timestamp: new Date().toLocaleString(),
                    };

                    setRealtimePrediction(prediction);
                  }
                }
              },
              "image/jpeg",
              0.7
            );
          } catch (error) {
            console.error("Realtime analysis error:", error);
          }
        }
      }
    }, 3000); // Analyze every 3 seconds
  };

  const stopRealtimeAnalysis = () => {
    setIsRealtimeActive(false);
    if (realtimeIntervalRef.current) {
      clearInterval(realtimeIntervalRef.current);
      realtimeIntervalRef.current = null;
    }
    setRealtimePrediction(null);
  };

  // Get disease color
  const getDiseaseColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "leaf_curl":
      case "leaf curl":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "leaf_spot":
      case "leaf spot":
        return "text-red-600 bg-red-50 border-red-200";
      case "whitefly":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "yellowish":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Format disease name for display
  const formatDiseaseName = (prediction: string) => {
    return prediction.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Video Stream */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-xl font-bold">Smart Farm Camera</h1>
            <p className="text-sm opacity-75">
              {activeMode === "capture" ? "Capture Mode" : "Real-time Analysis"}
              {devices.length > 0 && ` • Camera ${currentDeviceIndex + 1}/${devices.length}`}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-black/30 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => {
                setActiveMode("capture");
                stopRealtimeAnalysis();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === "capture" ? "bg-white text-black" : "text-white hover:bg-white/20"}`}
            >
              <Camera className="h-4 w-4 inline mr-2" />
              Capture
            </button>
            <button onClick={() => setActiveMode("realtime")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeMode === "realtime" ? "bg-white text-black" : "text-white hover:bg-white/20"}`}>
              <Brain className="h-4 w-4 inline mr-2" />
              Real-time
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Prediction Overlay */}
      {activeMode === "realtime" && realtimePrediction && (
        <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4" />
            <span className="font-medium">AI Detection</span>
          </div>
          <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getDiseaseColor(realtimePrediction.prediction)}`}>
            {formatDiseaseName(realtimePrediction.prediction)} ({Math.round(realtimePrediction.confidence * 100)}%)
          </div>
          <p className="text-xs opacity-75 mt-1">{realtimePrediction.timestamp}</p>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
        {activeMode === "capture" ? (
          // Capture Mode Controls
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleRotateCamera}
              disabled={devices.length <= 1}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
            >
              <RotateCcw size={20} />
            </button>
            <button onClick={handleCapture} disabled={!isCameraReady} className="w-20 h-20 bg-white hover:bg-gray-100 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all shadow-lg disabled:cursor-not-allowed">
              <div className="w-14 h-14 border-4 border-gray-400 rounded-full" />
            </button>
            <div className="w-12 h-12" /> {/* Spacer */}
          </div>
        ) : (
          // Real-time Mode Controls
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleRotateCamera}
              disabled={devices.length <= 1}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
            >
              <RotateCcw size={20} />
            </button>
            {!isRealtimeActive ? (
              <button
                onClick={startRealtimeAnalysis}
                disabled={!isCameraReady}
                className="w-20 h-20 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all shadow-lg disabled:cursor-not-allowed"
              >
                <Play size={24} />
              </button>
            ) : (
              <button onClick={stopRealtimeAnalysis} className="w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg">
                <Square size={24} />
              </button>
            )}
            <div className="w-12 h-12" /> {/* Spacer */}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-3">
          <p className="text-white/75 text-sm">
            {activeMode === "capture" ? "Tekan tombol putih untuk mengambil foto" : isRealtimeActive ? "AI sedang menganalisis secara real-time..." : "Tekan tombol hijau untuk memulai analisis real-time"}
          </p>
        </div>
      </div>

      {/* Capture Preview Modal */}
      {capturePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Preview Capture</h3>
              <button onClick={() => setCapturePreview(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="mb-4">
              <Image src={capturePreview.url} alt="Capture Preview" width={500} height={256} className="w-full h-64 object-cover rounded-lg border" />
              <p className="text-sm text-gray-500 mt-2">Captured: {capturePreview.timestamp}</p>
            </div>

            {/* Analysis Result */}
            {capturePreview.analysis && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">AI Analysis Result</h4>
                <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getDiseaseColor(capturePreview.analysis.prediction)}`}>
                  {formatDiseaseName(capturePreview.analysis.prediction)} ({Math.round(capturePreview.analysis.confidence * 100)}%)
                </div>
                {capturePreview.analysis.solution && (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-800 mb-2">Solusi & Penanganan:</h5>

                    {capturePreview.analysis.solution.treatment && capturePreview.analysis.solution.treatment.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Penanganan:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {capturePreview.analysis.solution.treatment.slice(0, 3).map((treatment, index) => (
                            <li key={index}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {capturePreview.analysis.solution.prevention && capturePreview.analysis.solution.prevention.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Pencegahan:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {capturePreview.analysis.solution.prevention.slice(0, 3).map((prevention, index) => (
                            <li key={index}>{prevention}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!capturePreview.analysis ? (
                <Button onClick={analyzeCapture} disabled={isAnalyzing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              ) : (
                <Button onClick={saveCapture} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Image
                </Button>
              )}

              <Button onClick={() => setCapturePreview(null)} className="px-6 border border-gray-300 hover:bg-gray-50 text-gray-700">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(!isCameraReady || cameraError) && (
        <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-4">
            {cameraError ? (
              // Error State
              <div>
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <p className="text-lg mb-2 text-red-300">Gagal Mengakses Kamera</p>
                <p className="text-sm opacity-75 mb-4">{cameraError}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCameraError(null);
                      setIsCameraReady(false);
                      window.location.reload();
                    }}
                    className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                  >
                    Coba Lagi
                  </button>
                  <p className="text-xs opacity-50">Tips: Pastikan izin kamera telah diberikan dan tidak ada aplikasi lain yang menggunakan kamera</p>
                </div>
              </div>
            ) : (
              // Loading State
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg mb-2">Menginisialisasi kamera...</p>
                <p className="text-sm opacity-75 mb-4">Pastikan izin kamera telah diberikan</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                  Refresh Halaman
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cam;
