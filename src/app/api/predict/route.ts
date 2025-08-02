// app/api/predict/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export async function POST() {
  try {
    const imagePath = path.join(process.cwd(), "public", "images", "esp32.jpg");

    // Cek apakah gambar ada
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: "No image found from ESP32" }, { status: 404 });
    }

    // Jalankan script Python untuk prediksi
    const pythonScript = path.join(process.cwd(), "predict_esp32.py");

    const prediction = await runPythonPrediction(pythonScript, imagePath);

    return NextResponse.json({
      success: true,
      prediction: prediction,
      imagePath: "/images/esp32.jpg",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: "Failed to predict disease" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const imagePath = path.join(process.cwd(), "public", "images", "esp32.jpg");

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({
        hasImage: false,
        message: "No image available",
      });
    }

    const stats = fs.statSync(imagePath);

    return NextResponse.json({
      hasImage: true,
      imageUrl: "/images/esp32.jpg",
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
    });
  } catch (error) {
    console.error("Get image info error:", error);
    return NextResponse.json({ error: "Failed to get image info" }, { status: 500 });
  }
}

function runPythonPrediction(scriptPath: string, imagePath: string): Promise<{ prediction?: string; confidence?: number; error?: string }> {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath, imagePath]);

    let dataString = "";
    let errorString = "";

    python.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${errorString}`));
        return;
      }

      try {
        // Parse hasil JSON dari Python
        const result = JSON.parse(dataString.trim());
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse Python output: ${parseError}`));
      }
    });
  });
}
