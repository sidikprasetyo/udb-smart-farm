export const uploadToServer = async (dataURL: string): Promise<{ success: boolean; fileName?: string; message?: string }> => {
  try {
    const blob = await (await fetch(dataURL)).blob();

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: blob,
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Upload berhasil:", data.fileName);
      return { success: true, fileName: data.fileName, message: "Upload berhasil" };
    } else {
      console.error("Upload gagal:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error saat upload:", error);
    return { success: false, message: "Error saat upload" };
  }
};

export const uploadFileToServer = async (file: File): Promise<{ success: boolean; fileName?: string; message?: string }> => {
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Upload berhasil:", data.fileName);
      return { success: true, fileName: data.fileName, message: "Upload berhasil" };
    } else {
      console.error("Upload gagal:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error saat upload:", error);
    return { success: false, message: "Error saat upload" };
  }
};
