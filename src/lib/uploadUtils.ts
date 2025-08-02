export const uploadToServer = async (dataURL: string) => {
  try {
    const blob = await (await fetch(dataURL)).blob();

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg", // atau image/png sesuai format
      },
      body: blob, // langsung kirim binary
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Upload berhasil:", data.fileName);
      alert("Gambar berhasil disimpan sebagai: " + data.fileName);
    } else {
      console.error("Upload gagal:", data.message);
    }
  } catch (error) {
    console.error("Error saat upload:", error);
  }
};
