// src/services/authService.js
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function registerFieldUser(email, password, profile = {}) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;
  await setDoc(doc(db, "users", uid), {
    email,
    role: "field",
    createdAt: serverTimestamp(),
    ...profile,
  });
  return userCred.user;
}

export async function loginUser(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const userSnap = await getDoc(doc(db, "users", userCred.user.uid));
  return { authUser: userCred.user, profile: userSnap.exists() ? userSnap.data() : null };
}

export async function signOut() {
  await fbSignOut(auth);
}
