import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const buffer = await req.arrayBuffer();
    const data = Buffer.from(buffer);

    // Simpan ke public/images/esp32.jpg
    const dirPath = path.join(process.cwd(), 'public', 'images');
    const filePath = path.join(dirPath, 'esp32.jpg');

    // Pastikan folder 'images' ada
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, data);

    return NextResponse.json({ message: 'Image saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to save image' }, { status: 500 });
  }
}
