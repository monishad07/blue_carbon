import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

// 🔹 Firebase
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ✅ Validation Schema
const schema = yup
  .object({
    role: yup.string().required("Please select your role"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  .required();

export default function Login({ setUser }) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { role: "field", email: "", password: "" },
  });

  const navigate = useNavigate();
  const role = watch("role");

  // re-trigger validation when role changes
  useEffect(() => {
    trigger("email");
  }, [role, trigger]);

  const onSubmit = async (data) => {
    if (role === "admin") {
      // ✅ Hardcoded admin login
      if (data.email === "admin@example.com" && data.password === "admin123") {
        setUser({ role: "admin", email: data.email, username: "Admin" });
        localStorage.setItem("role", "admin");
        localStorage.setItem("email", data.email);
        navigate("/admin");
      } else {
        alert("Invalid admin credentials!");
      }
    } else if (role === "field") {
      try {
        // 1️⃣ Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const user = userCredential.user;

        // 2️⃣ Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // ❌ Don't manually setUser here — App.jsx will handle it
          localStorage.setItem("role", "field");
          localStorage.setItem("email", userData.email);

          // ✅ Navigate to portal
          navigate("/field-portal");
        } else {
          alert("User profile not found. Please register again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Select Role
            </label>
            <select
              {...register("role")}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="field">Field User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-red-500 text-xs mt-1">{errors.role?.message}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Enter your password"
            />
            <p className="text-red-500 text-xs mt-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Signup option only for Field Users */}
          {role === "field" && (
            <div className="text-sm text-center text-gray-600">
              <p>
                New User?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
