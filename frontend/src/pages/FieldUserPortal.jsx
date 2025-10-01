// src/pages/FieldUserPortal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProject as addProjectToDB } from "../services/projectService";
import { uploadImage } from "../utils/uploadImage";

export default function FieldUserPortal({ addProject, user, projects, authLoading }) {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    region: "",
    area: "",
    method: "",
    vintage: "",
    description: "",
    file: null, // Verified image (base64 from CaptureUpload)
    agree: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // ✅ Load verified image from CaptureUpload (stored in localStorage)
  useEffect(() => {
    const verifiedImage = localStorage.getItem("verifiedImage");
    if (verifiedImage) {
      setForm((prev) => ({ ...prev, file: verifiedImage }));
      localStorage.removeItem("verifiedImage");
    }
  }, []);

  // 🔹 Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // 🔹 Redirect to CaptureUpload page
  const handleFileRedirect = () => {
    navigate("/capture-upload");
  };

  // 🔹 Submit project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      alert("You must be logged in to submit a project.");
      return;
    }

    if (!form.name || !form.organization || !form.region || !form.file || !form.agree) {
      alert("Please fill all required fields and agree to terms.");
      return;
    }

    try {
      setSubmitting(true);

      const credits = estimateCredits(form.area, form.method, form.vintage);

const projectData = {
  name: form.name,
  organization: form.organization,
  region: form.region,
  area: form.area,
  method: form.method,
  vintage: form.vintage,
  credits,   // ✅ auto-generated
  description: form.description,
};


      // 🔹 Upload image to Cloudinary
      let fileToUpload = form.file;
      if (typeof fileToUpload === "string" && fileToUpload.startsWith("data:")) {
        fileToUpload = dataURLtoFile(fileToUpload, `${form.name || "project"}-evidence.jpg`);
      }

      const { secure_url, public_id } = await uploadImage(fileToUpload);

      const projectDataWithImage = {
        ...projectData,
        image: secure_url,
        imagePublicId: public_id,
      };

      const newId = await addProjectToDB(user.uid, projectDataWithImage);

      const newProject = {
        id: newId,
        ...projectDataWithImage,
        status: "pending",
        uid: user.uid,
      };

      addProject(newProject);

      // reset form
      setForm({
        name: "",
        organization: "",
        region: "",
        area: "",
        method: "",
        vintage: "",
        description: "",
        file: null,
        agree: false,
      });
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("Failed to submit project. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const localProjects = projects.filter((p) => p.uid === user?.uid);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">
        Register Blue Carbon Project
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Project Name"
            className="w-full border rounded-lg p-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="Organization"
              className="w-full border rounded-lg p-2"
            />
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Region / District"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Area (ha)"
              className="w-full border rounded-lg p-2"
            />
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Method</option>
              <option value="plantation">Plantation</option>
              <option value="natural_regeneration">Natural Regeneration</option>
              <option value="mixed">Mixed Approach</option>
            </select>
            <input
              type="number"
              name="vintage"
              value={form.vintage}
              onChange={handleChange}
              placeholder="Vintage (year)"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description / Species Mix / Notes"
            className="w-full border rounded-lg p-2"
          />

          {/* Image Verification */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload baseline evidence (GeoJSON, images, drone orthomosaic)
            </label>

            {form.file && (
              <img
                src={form.file}
                alt="Verified"
                className="mb-2 w-64 h-64 object-cover rounded-lg shadow"
              />
            )}

            <button
              type="button"
              onClick={handleFileRedirect}
              className={`w-full border rounded-lg p-2 ${
                form.file ? "bg-green-100 text-green-700" : "bg-gray-100"
              }`}
            >
              {form.file ? "✅ Image Verified" : "Upload & Verify Image"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <label>I affirm data is accurate to my knowledge</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>

        {/* USER PROJECT LIST (REAL-TIME) */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Submitted Projects</h3>
          {localProjects.length === 0 ? (
            <p className="text-gray-500">No projects submitted yet.</p>
          ) : (
            <div className="grid gap-6">
              {localProjects.map((p) => (
                <div key={p.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-sm text-gray-600">
                      {p.organization} | {p.region}
                    </p>
                    <p className="text-sm">
                      Area: {p.area} ha | Method: {p.method} | Year: {p.vintage}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{p.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      {p.status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

function estimateCredits(area, method, vintage) {
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - vintage + 1);

  let rate = 5; // default tons/ha/yr
  if (method === "plantation" || method === "mangrove") rate = 7;
  if (method === "seagrass") rate = 5;
  if (method === "mixed") rate = 6;

  return Math.round(area * rate * years);
}
