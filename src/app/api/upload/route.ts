import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const buffer = await req.arrayBuffer();
    const data = Buffer.from(buffer);

    const dirPath = path.join(process.cwd(), "public", "images");

    // Pastikan folder ada
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Buat nama file unik berdasarkan timestamp
    const timestamp = Date.now();
    const fileName = `esp32_${timestamp}.jpg`;
    const filePath = path.join(dirPath, fileName);

    // Simpan file baru
    fs.writeFileSync(filePath, data);

    // Simpan nama file terbaru ke latest.txt
    const latestFilePath = path.join(dirPath, "latest.txt");
    fs.writeFileSync(latestFilePath, fileName);

    // 🔁 Batasi hanya 200 gambar terbaru
    const files = fs
      .readdirSync(dirPath)
      .filter((file) => /^esp32_\d+\.jpg$/.test(file)) // hanya file esp32_*.jpg
      .sort((a, b) => {
        const timeA = parseInt(a.match(/\d+/)?.[0] || "0");
        const timeB = parseInt(b.match(/\d+/)?.[0] || "0");
        return timeB - timeA; // urut terbaru ke lama
      });

    const filesToDelete = files.slice(200); // sisakan 200 yang terbaru
    for (const oldFile of filesToDelete) {
      const deletePath = path.join(dirPath, oldFile);
      fs.unlinkSync(deletePath);
    }

    return NextResponse.json({ message: "Image saved successfully", fileName }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to save image" }, { status: 500 });
  }
}
