// app/api/diseases/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try AI API first
    const aiApiUrl = "http://localhost:5000/diseases";

    try {
      const response = await fetch(aiApiUrl);

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          method: "ai_api",
          diseases: result.diseases,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      console.log("AI API not available, using static data");
    }

    // Fallback to static disease information
    const diseases = {
      healthy: {
        name: "Healthy (Sehat)",
        description: "Tanaman dalam kondisi sehat dan normal",
        urgency: "Low",
        estimated_loss: "0%",
      },
      leaf_curl: {
        name: "Leaf Curl (Keriting Daun)",
        description: "Penyakit yang menyebabkan daun menggulung dan keriting",
        causes: ["Virus (Chili Leaf Curl Virus)", "Serangan serangga vektor"],
        treatment: ["Semprot dengan insektisida", "Aplikasi pupuk mikro"],
        prevention: ["Gunakan varietas tahan virus", "Pengendalian serangga vektor"],
        urgency: "Medium",
        estimated_loss: "20-40%",
      },
      leaf_spot: {
        name: "Leaf Spot (Bercak Daun)",
        description: "Penyakit jamur yang menyebabkan bercak pada daun",
        causes: ["Jamur Cercospora sp.", "Kelembaban tinggi"],
        treatment: ["Fungisida berbahan aktif mankozeb", "Perbaikan drainase"],
        prevention: ["Hindari penyiraman pada daun", "Perbaiki sirkulasi udara"],
        urgency: "High",
        estimated_loss: "30-60%",
      },
      whitefly: {
        name: "Whitefly (Kutu Kebul)",
        description: "Serangan hama kutu kebul yang menghisap cairan tanaman",
        causes: ["Bemisia tabaci", "Kondisi lingkungan hangat"],
        treatment: ["Insektisida sistemik", "Perangkap kuning lengket"],
        prevention: ["Monitoring rutin", "Sanitasi gulma"],
        urgency: "High",
        estimated_loss: "25-50%",
      },
      yellowish: {
        name: "Yellowish (Menguning)",
        description: "Kondisi daun menguning karena berbagai faktor",
        causes: ["Kekurangan nitrogen", "Kelebihan air"],
        treatment: ["Aplikasi pupuk nitrogen", "Perbaikan drainase"],
        prevention: ["Pemupukan berimbang", "Pengaturan irigasi"],
        urgency: "Medium",
        estimated_loss: "15-30%",
      },
    };

    return NextResponse.json({
      success: true,
      method: "static",
      diseases: diseases,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Diseases API error:", error);
    return NextResponse.json({ error: "Failed to get disease information" }, { status: 500 });
  }
}
