// src/components/UploadImage.jsx
import React, { useState } from "react";
import { uploadImage } from "../utils/uploadImage";
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // your firebase export

export default function UploadImage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const auth = getAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to upload images.");
      return;
    }

    try {
      setLoading(true);
      const { secure_url, public_id } = await uploadImage(file);

      // Save image record to Firestore (collection: images)
      await addDoc(collection(db, "images"), {
        url: secure_url,
        publicId: public_id,
        fileName: file.name,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      setImageUrl(secure_url);
      alert("Uploaded & saved!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p>Uploading…</p>}
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" style={{ width: 240 }} />
        </div>
      )}
    </div>
  );
}
