import { NextResponse } from "next/server";
import { database } from "@/lib/firebaseConfig";
import { ref, set } from "firebase/database";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    let customTimestamp = null;
    
    // Try to parse JSON body if it exists
    if (body) {
      try {
        const parsedBody = JSON.parse(body);
        customTimestamp = parsedBody.timestamp;
      } catch {
        // Ignore JSON parse errors, use current time
      }
    }

    // Update system timestamp in Firebase
    const timestampRef = ref(database, "system/lastUpdate");
    const timestamp = customTimestamp || Date.now();

    await set(timestampRef, timestamp);

    return NextResponse.json({
      success: true,
      timestamp: timestamp,
      message: "System timestamp updated successfully",
    });
  } catch (error) {
    console.error("Error updating system timestamp:", error);
    return NextResponse.json({ error: "Failed to update system timestamp" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return current server time
    const now = Date.now();

    return NextResponse.json({
      timestamp: now,
      formatted: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error("Error getting system timestamp:", error);
    return NextResponse.json({ error: "Failed to get system timestamp" }, { status: 500 });
  }
}
