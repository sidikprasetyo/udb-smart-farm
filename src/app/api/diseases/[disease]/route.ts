// app/api/diseases/[disease]/route.ts
import { NextResponse } from "next/server";

interface DiseaseSolution {
  name: string;
  description: string;
  causes?: string[];
  symptoms?: string[];
  treatment?: string[];
  prevention?: string[];
  organic_treatment?: string[];
  urgency: string;
  estimated_loss: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ disease: string }> }) {
  try {
    const { disease } = await params;

    // Try AI API first
    const aiApiUrl = `http://localhost:5000/diseases/${disease}/solution`;

    try {
      const response = await fetch(aiApiUrl);

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          method: "ai_api",
          disease: disease,
          solution: result.solution,
          treatment_schedule: result.treatment_schedule,
          cost_estimation: result.cost_estimation,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      console.log("AI API not available, using static data");
    }

    // Fallback to static disease solutions
    const solutions: Record<string, DiseaseSolution> = {
      healthy: {
        name: "Healthy (Sehat)",
        description: "Tanaman dalam kondisi sehat dan normal",
        treatment: ["Pemupukan rutin sesuai jadwal", "Penyiraman teratur", "Monitoring hama dan penyakit"],
        prevention: ["Sanitasi kebun rutin", "Rotasi tanaman", "Penggunaan varietas unggul"],
        urgency: "Low",
        estimated_loss: "0%",
      },
      leaf_curl: {
        name: "Leaf Curl (Keriting Daun)",
        description: "Penyakit yang menyebabkan daun menggulung dan keriting",
        causes: ["Virus (Chili Leaf Curl Virus)", "Serangan serangga vektor (kutu daun, thrips)", "Kondisi lingkungan ekstrem", "Kekurangan nutrisi"],
        symptoms: ["Daun menggulung ke atas atau ke bawah", "Daun menjadi tebal dan kaku", "Pertumbuhan tanaman terhambat", "Hasil panen menurun"],
        treatment: ["Semprot dengan insektisida untuk mengendalikan vektor", "Aplikasi pupuk mikro (Zn, B, Mo)", "Pengaturan kelembaban dan suhu optimal", "Pemangkasan daun yang terinfeksi parah"],
        prevention: ["Gunakan varietas tahan virus", "Pengendalian serangga vektor secara rutin", "Sanitasi lingkungan", "Rotasi tanaman", "Pemupukan seimbang NPK + mikro"],
        organic_treatment: ["Ekstrak daun mimba (neem)", "Larutan sabun insektisida", "Pupuk organik cair", "Kompos + biochar"],
        urgency: "Medium",
        estimated_loss: "20-40%",
      },
      leaf_spot: {
        name: "Leaf Spot (Bercak Daun)",
        description: "Penyakit jamur yang menyebabkan bercak pada daun",
        causes: ["Jamur Cercospora sp.", "Jamur Colletotrichum sp.", "Kelembaban tinggi", "Sirkulasi udara buruk"],
        symptoms: ["Bercak coklat atau hitam pada daun", "Bercak memiliki tepi kuning", "Daun menguning dan gugur", "Penurunan fotosintesis"],
        treatment: ["Fungisida berbahan aktif mankozeb atau klorotalonil", "Perbaikan drainase dan sirkulasi udara", "Pemangkasan daun terinfeksi", "Pengaturan jarak tanam optimal"],
        prevention: ["Hindari penyiraman pada daun", "Perbaiki sirkulasi udara", "Sanitasi kebun secara rutin", "Gunakan mulsa organik", "Aplikasi fungisida preventif"],
        organic_treatment: ["Larutan baking soda 1%", "Ekstrak bawang putih", "Trichoderma sp. (bio-fungisida)", "Compost tea"],
        urgency: "High",
        estimated_loss: "30-60%",
      },
      whitefly: {
        name: "Whitefly (Kutu Kebul)",
        description: "Serangan hama kutu kebul yang menghisap cairan tanaman",
        causes: ["Bemisia tabaci (kutu kebul)", "Kondisi lingkungan hangat dan lembab", "Tanaman stress", "Kurangnya predator alami"],
        symptoms: ["Daun menguning dan layu", "Embun jelaga (sooty mold) pada daun", "Kutu putih kecil di bawah daun", "Pertumbuhan tanaman terhambat"],
        treatment: ["Insektisida sistemik (imidakloprid)", "Perangkap kuning lengket", "Semprot air bertekanan", "Aplikasi predator alami (Encarsia formosa)"],
        prevention: ["Monitoring rutin dengan perangkap kuning", "Sanitasi gulma sekitar tanaman", "Penggunaan mulsa reflektif", "Penanaman tanaman perangkap", "Pengendalian biologis dengan parasitoid"],
        organic_treatment: ["Minyak neem", "Sabun insektisida", "Ekstrak daun tembakau", "Larutan alkohol 70%"],
        urgency: "High",
        estimated_loss: "25-50%",
      },
      yellowish: {
        name: "Yellowish (Menguning)",
        description: "Kondisi daun menguning karena berbagai faktor",
        causes: ["Kekurangan nitrogen", "Kelebihan air (waterlogging)", "Serangan penyakit akar", "Kekurangan unsur mikro (Fe, Mg)", "Stress lingkungan"],
        symptoms: ["Daun menguning mulai dari yang tua", "Pertumbuhan lambat", "Daun mudah gugur", "Sistem perakaran lemah"],
        treatment: ["Aplikasi pupuk nitrogen (urea/ZA)", "Perbaikan drainase tanah", "Aplikasi pupuk mikro (Fe, Mg, Zn)", "Pengaturan pH tanah 6.0-6.8", "Fungisida untuk penyakit akar"],
        prevention: ["Pemupukan berimbang NPK", "Perbaikan struktur tanah dengan kompos", "Pengaturan irigasi yang tepat", "Monitoring pH tanah rutin", "Aplikasi pupuk organik"],
        organic_treatment: ["Kompos matang", "Pupuk kandang fermentasi", "Aplikasi mikroorganisme tanah", "Mulsa organic"],
        urgency: "Medium",
        estimated_loss: "15-30%",
      },
    };

    const solution = solutions[disease];

    if (!solution) {
      return NextResponse.json({ error: "Disease not found" }, { status: 404 });
    }

    // Generate treatment schedule
    const treatmentSchedule = {
      immediate: ["Isolasi tanaman terinfeksi", "Aplikasi treatment utama"],
      daily: ["Monitoring perkembangan", "Aplikasi treatment lanjutan"],
      weekly: ["Evaluasi efektivitas treatment", "Aplikasi treatment preventif"],
      monthly: ["Assessment keseluruhan", "Pencegahan kekambuhan"],
    };

    // Generate cost estimation (in IDR)
    const baseCosts: Record<string, number> = {
      healthy: 100000,
      leaf_curl: 500000,
      leaf_spot: 750000,
      whitefly: 600000,
      yellowish: 300000,
    };

    const treatmentCost = baseCosts[disease] || 400000;
    const costEstimation = {
      treatment_cost: treatmentCost,
      prevention_cost: treatmentCost * 0.3,
      potential_loss: treatmentCost * 2,
      currency: "IDR",
    };

    return NextResponse.json({
      success: true,
      method: "static",
      disease: disease,
      solution: solution,
      treatment_schedule: treatmentSchedule,
      cost_estimation: costEstimation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Disease solution error:", error);
    return NextResponse.json({ error: "Failed to get disease solution" }, { status: 500 });
  }
}
