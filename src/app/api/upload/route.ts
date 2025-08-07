import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Content-Type
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);

    let buffer: ArrayBuffer;
    
    // 2. Handle berbagai format input
    if (contentType?.includes('multipart/form-data')) {
      // Jika menggunakan FormData
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { message: "No file found in request" }, 
          { status: 400 }
        );
      }
      
      buffer = await file.arrayBuffer();
    } else {
      // Jika raw binary data
      buffer = await req.arrayBuffer();
    }

    const data = Buffer.from(buffer);

    // 3. Validasi ukuran file
    if (data.length === 0) {
      return NextResponse.json(
        { message: "Empty file received" }, 
        { status: 400 }
      );
    }

    console.log('File size:', data.length, 'bytes');

    // 4. Validasi apakah ini gambar JPEG
    const isJPEG = data[0] === 0xFF && data[1] === 0xD8;
    if (!isJPEG) {
      console.log('Warning: File may not be a valid JPEG');
    }

    const dirPath = path.join(process.cwd(), "public", "images");

    // Pastikan folder ada
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Created directory:', dirPath);
    }

    // Buat nama file unik berdasarkan timestamp
    const timestamp = Date.now();
    const fileName = `esp32_${timestamp}.jpg`;
    const filePath = path.join(dirPath, fileName);

    // Simpan file baru
    fs.writeFileSync(filePath, data);
    console.log('File saved:', filePath);

    // Verify file was saved correctly
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not saved properly');
    }

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
      try {
        fs.unlinkSync(deletePath);
        console.log('Deleted old file:', oldFile);
      } catch (err) {
        console.error('Failed to delete file:', oldFile, err);
      }
    }

    // 5. Return informasi lebih lengkap
    return NextResponse.json({ 
      message: "Image saved successfully", 
      fileName,
      filePath: `/images/${fileName}`, // URL untuk akses gambar
      fileSize: data.length,
      timestamp 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      message: "Failed to save image", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}