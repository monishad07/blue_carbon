// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FieldUserPortal from "./pages/FieldUserPortal";
import AdminPanel from "./pages/AdminPanel";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import PublicMap from "./pages/PublicMap";
import ProjectDetails from "./pages/ProjectDetails";
import CaptureUpload from "./pages/CaptureUpload";
import Navbar from "./components/Navbar";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { subscribeAllProjects } from "./services/projectService";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔹 Firestore live subscription
  useEffect(() => {
    const unsubscribeProjects = subscribeAllProjects((liveProjects) => {
      setProjects(liveProjects);
    });
    return () => unsubscribeProjects();
  }, []);

  // 🔹 Firebase Auth subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const updateStatus = (id, newStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} setUser={setUser} handleLogout={handleLogout} />

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route index element={<Home projects={projects} />} />
          <Route path="login" element={<Login setUser={setUser} />} />
          <Route path="register" element={<Register />} />

          {/* ✅ Field User Portal */}
          <Route
            path="field-portal"
            element={
              <FieldUserPortal
                projects={projects}
                addProject={addProject}
                user={user}
                authLoading={authLoading}
              />
            }
          />

          <Route
            path="admin"
            element={<AdminPanel projects={projects} updateStatus={updateStatus} />}
          />
          <Route path="dashboard" element={<TransparencyDashboard />} />
          <Route path="map" element={<PublicMap />} />
          <Route path="project/:id" element={<ProjectDetails projects={projects} />} />
          <Route path="capture-upload" element={<CaptureUpload />} />
        </Routes>
      </main>
    </div>
  );
}
