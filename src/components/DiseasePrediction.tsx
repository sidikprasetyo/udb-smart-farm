"use client";

import React, { useState, useRef, useCallback } from "react";
import { Camera, Upload, Zap, RotateCcw, Info } from "lucide-react";
import Image from "next/image";

interface PredictionResult {
  prediction: string;
  confidence: number;
  solution?: {
    treatment: string[];
    prevention: string[];
    urgency: string;
    estimated_loss: string;
  };
  all_predictions?: Record<string, number>;
}

interface AnalysisResult {
  success: boolean;
  prediction: PredictionResult;
  imagePath?: string;
  timestamp: string;
  mode: "esp32" | "camera" | "upload";
}

const DiseasePrediction: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<"esp32" | "camera" | "upload">("esp32");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (mode: string, file?: File) => {
    setIsAnalyzing(true);
    try {
      let response;

      if (mode === "upload" && file) {
        const formData = new FormData();
        formData.append("image", file);

        response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "upload" }),
        });
      } else if (mode === "camera") {
        response = await fetch("/api/camera", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "capture" }),
        });
      } else {
        // ESP32 mode
        response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "esp32" }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
      setResult({
        success: false,
        prediction: {
          prediction: "error",
          confidence: 0,
        },
        timestamp: new Date().toISOString(),
        mode: mode as "esp32" | "camera" | "upload",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 16MB)
      if (file.size > 16 * 1024 * 1024) {
        alert("File size too large. Please select an image under 16MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Analyze image
      analyzeImage("upload", file);
    },
    [analyzeImage]
  );

  const handleModeChange = useCallback((mode: "esp32" | "camera" | "upload") => {
    setSelectedMode(mode);
    setResult(null);
    setPreviewImage(null);

    if (mode !== "upload" && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDiseaseName = (disease: string) => {
    return disease.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">AI Disease Detection</h1>
        <p className="text-gray-600">Analisis penyakit tanaman cabai menggunakan kecerdasan buatan</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => handleModeChange("esp32")} className={`p-4 rounded-lg border-2 transition-all ${selectedMode === "esp32" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}>
          <Zap className="h-8 w-8 mx-auto mb-2" />
          <h3 className="font-semibold">ESP32 Camera</h3>
          <p className="text-sm text-gray-600">Analisis dari kamera ESP32</p>
        </button>

        <button onClick={() => handleModeChange("camera")} className={`p-4 rounded-lg border-2 transition-all ${selectedMode === "camera" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}>
          <Camera className="h-8 w-8 mx-auto mb-2" />
          <h3 className="font-semibold">Live Camera</h3>
          <p className="text-sm text-gray-600">Capture langsung dari kamera</p>
        </button>

        <button onClick={() => handleModeChange("upload")} className={`p-4 rounded-lg border-2 transition-all ${selectedMode === "upload" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}>
          <Upload className="h-8 w-8 mx-auto mb-2" />
          <h3 className="font-semibold">Upload Image</h3>
          <p className="text-sm text-gray-600">Upload gambar dari device</p>
        </button>
      </div>

      {/* Action Section */}
      <div className="bg-white rounded-lg border p-6">
        {selectedMode === "upload" ? (
          <div className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-3 border border-gray-300 rounded-lg" />
            {previewImage && (
              <div className="text-center">
                <div className="relative max-w-xs mx-auto">
                  <Image src={previewImage} alt="Preview" width={300} height={200} className="rounded-lg border object-cover" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => analyzeImage(selectedMode)}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  {selectedMode === "esp32" ? "Analyze ESP32 Image" : "Capture & Analyze"}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
            <span className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleString()}</span>
          </div>

          {result.success ? (
            <div className="space-y-6">
              {/* Main Result */}
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800">{formatDiseaseName(result.prediction.prediction)}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-lg text-gray-600">Confidence: {(result.prediction.confidence * 100).toFixed(1)}%</span>
                    {result.prediction.solution && <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getUrgencyColor(result.prediction.solution.urgency)}`}>{result.prediction.solution.urgency} Priority</span>}
                  </div>
                </div>

                {result.imagePath && (
                  <div className="relative max-w-sm mx-auto">
                    <Image src={result.imagePath} alt="Analyzed image" width={400} height={300} className="rounded-lg border shadow-sm object-cover" />
                  </div>
                )}
              </div>

              {/* Confidence Breakdown */}
              {result.prediction.all_predictions && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Confidence Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(result.prediction.all_predictions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([disease, confidence]) => (
                        <div key={disease} className="flex items-center gap-3">
                          <span className="w-24 text-sm text-gray-600">{formatDiseaseName(disease)}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${confidence * 100}%` }} />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{(confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Treatment Solution */}
              {result.prediction.solution && result.prediction.prediction !== "healthy" && (
                <div className="bg-red-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Treatment Recommendations</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Immediate Treatment</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.prediction.solution.treatment.slice(0, 3).map((treatment, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{treatment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Prevention</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.prediction.solution.prevention.slice(0, 3).map((prevention, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{prevention}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-red-200">
                    <span className="text-sm text-red-600">Estimated Loss: {result.prediction.solution.estimated_loss}</span>
                    <button className="text-sm text-red-700 hover:text-red-800 underline">View Detailed Solution</button>
                  </div>
                </div>
              )}

              {/* Healthy Plant Message */}
              {result.prediction.prediction === "healthy" && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-green-600 space-y-2">
                    <h4 className="font-semibold text-lg">Tanaman Sehat! 🌱</h4>
                    <p className="text-sm">Tanaman Anda dalam kondisi baik. Lanjutkan perawatan rutin untuk menjaga kesehatan tanaman.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-red-600 space-y-2">
              <h3 className="text-lg font-semibold">Analysis Failed</h3>
              <p className="text-sm">Unable to analyze the image. Please try again or check your connection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseasePrediction;
