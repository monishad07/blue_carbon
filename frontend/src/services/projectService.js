// src/services/projectService.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

/**
 * addProject(uid, projectData)
 * - projectData: { name, organization, region, area, method, vintage, credits, description, image }
 *   ✅ image should be the Cloudinary URL (handled in uploadService.js)
 */
export async function addProject(uid, projectData) {
  const docRef = await addDoc(collection(db, "projects"), {
    ...projectData,
    uid,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// ✅ Subscribe to all projects (for Admin Panel)
export function subscribeAllProjects(callback) {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ✅ Subscribe to approved projects (for Transparency Dashboard & Public Map)
export function subscribeApprovedProjects(callback) {
  const q = query(
    collection(db, "projects"),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ✅ Subscribe to projects by specific user (for FieldUserPortal "My Projects")
export function subscribeUserProjects(uid, callback) {
  const q = query(
    collection(db, "projects"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

// ✅ Update project status (Admin approval)
export async function updateProjectStatus(projectId, newStatus) {
  const pRef = doc(db, "projects", projectId);
  await updateDoc(pRef, { status: newStatus });
}
