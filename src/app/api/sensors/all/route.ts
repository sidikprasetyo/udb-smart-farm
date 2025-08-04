/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface SensorData {
  id: string;
  name: string;
  value: string;
  status?: string;
  icon?: any;
  waktu?: string | number;
  timestamp?: string | number;
}

export async function GET() {
  try {
    console.log("🔍 Fetching ALL sensor types from database...");

    const snapshot = await getDocs(collection(firestore, "dataHistoryPTLM"));
    const allData: SensorData[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SensorData[];

    // Sort berdasarkan waktu terbaru
    allData.sort((a, b) => {
      const dateA = new Date(a.waktu || a.timestamp || 0).getTime();
      const dateB = new Date(b.waktu || b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    const uniqueSensorNames = [...new Set(allData.map(item => item.name))];
    console.log(`📊 Found ${allData.length} total records`);
    console.log(`🏷️  Sensor types: ${uniqueSensorNames.join(', ')}`);

    const sensorStats = uniqueSensorNames.map(sensorName => {
      const count = allData.filter(item => item.name === sensorName).length;
      return `${sensorName}: ${count}`;
    });
    console.log(`📈 Records per sensor: ${sensorStats.join(', ')}`);

    return NextResponse.json(allData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch all sensor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch all sensor data", details: error.message },
      { status: 500 }
    );
  }
}
