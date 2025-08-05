import { NextResponse } from "next/server";
import { database } from "@/lib/firebaseConfig";
import { ref, set, serverTimestamp } from "firebase/database";

export async function POST() {
  try {
    // Update system timestamp in Firebase
    const timestampRef = ref(database, "system/lastUpdate");
    const now = Date.now();

    await set(timestampRef, now);

    return NextResponse.json({
      success: true,
      timestamp: now,
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
