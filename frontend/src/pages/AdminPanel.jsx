// src/pages/AdminPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import { updateProjectStatus } from "../services/projectService"; // Firestore function

export default function AdminPanel({ projects }) {
  // 🔄 Update Firestore directly
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateProjectStatus(id, newStatus);
      console.log(`✅ Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating project status. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-100 p-8 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-2xl"></div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-700 via-emerald-700 to-sky-800 bg-clip-text text-transparent drop-shadow-xl"
      >
        Admin Panel – Project Approvals
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {projects.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 italic">
            No projects submitted yet.
          </p>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              className="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl overflow-hidden transition-all"
            >
              {project.fileUrl || project.image ? (
                <img
                  src={project.fileUrl || project.image}
                  alt={project.name}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 flex items-center justify-center text-gray-400 bg-gray-100">
                  No Image
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{project.description}</p>

                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                    project.status === "approved"
                      ? "bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                      : project.status === "pending"
                      ? "bg-gradient-to-r from-yellow-300 to-amber-500 text-gray-900"
                      : "bg-gradient-to-r from-red-400 to-pink-600 text-white"
                  }`}
                >
                  {project.status?.toUpperCase() || "PENDING"}
                </span>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateStatus(project.id, "approved")}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition shadow"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(project.id, "pending")}
                    className="flex-1 px-3 py-2 bg-yellow-400 text-gray-900 rounded-xl text-sm hover:bg-yellow-500 transition shadow"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(project.id, "rejected")}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition shadow"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
