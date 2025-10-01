// src/utils/uploadImage.js
export async function uploadImage(file) {
  // Vite uses import.meta.env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary env variables (VITE_CLOUDINARY_*).");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();

  // 'file' can be a File object or a data URL string (base64); Cloudinary accepts both
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Cloudinary upload failed: " + text);
  }

  const data = await res.json();
  // return secure_url (hosted URL) and public_id (for deletion)
  return { secure_url: data.secure_url, public_id: data.public_id, raw: data };
}
