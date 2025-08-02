import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const latestFilePath = path.join(imagesDir, 'latest.txt');

    // Check if latest.txt exists
    if (!fs.existsSync(latestFilePath)) {
      return NextResponse.json({
        message: 'No images uploaded yet',
        imageUrl: null,
        timestamp: null
      }, { status: 200 });
    }

    // Read latest filename
    const fileName = fs.readFileSync(latestFilePath, 'utf-8').trim();
    const filePath = path.join(imagesDir, fileName);

    // Verify the file actually exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        message: 'Latest image file not found',
        imageUrl: null,
        timestamp: null
      }, { status: 404 });
    }

    // Extract timestamp from filename
    const timestampMatch = fileName.match(/esp32_(\d+)\.jpg/);
    const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : null;

    // Get file stats
    const stats = fs.statSync(filePath);

    return NextResponse.json({
      imageUrl: `/images/${fileName}`,
      fileName,
      timestamp,
      uploadTime: timestamp ? new Date(timestamp).toISOString() : null,
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching latest image:', error);
    return NextResponse.json({
      message: 'Error fetching latest image',
      imageUrl: null,
      timestamp: null
    }, { status: 500 });
  }
}