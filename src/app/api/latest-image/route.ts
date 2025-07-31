import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const latestFilePath = path.join(process.cwd(), 'public', 'images', 'latest.txt');

    if (!fs.existsSync(latestFilePath)) {
      return NextResponse.json({ message: 'No image found', imageUrl: null }, { status: 200 });
    }

    const fileName = fs.readFileSync(latestFilePath, 'utf-8');
    return NextResponse.json({ imageUrl: `/images/${fileName}` }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Error fetching latest image', imageUrl: null }, { status: 500 });
  }
}
