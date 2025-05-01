// src/app/login/page.tsx
"use client";
import { useState } from "react";
import axios from "@/utils/axios"; // Use the configured axios instance
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import type { Karyawan } from "@/types"; // Assuming Karyawan type exists for user data

interface LoginResponse {
  user: Karyawan;
  // No token expected in response body anymore
}

export default function Login() {
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Changed from username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send login request to backend with login_identifier
      const credentials = { login_identifier: loginIdentifier, password };
      // Axios instance already configured withCredentials: true
      await axios.post<LoginResponse>("/login", credentials);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;
      console.error("Login error:", err);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(" ");
        setError(`Login gagal: ${errorMessages}`);
      } else {
        // Handle general authentication errors
        setError(
          error.response?.data?.message ||
            "Login gagal. Periksa kembali username/email dan password Anda."
        );
      }

      // Animasi error
      const form = document.querySelector("form");
      form?.classList.add("animate-shake");
      setTimeout(() => form?.classList.remove("animate-shake"), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a202c] w-full p-0 m-0 absolute inset-0">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6 transition-all text-gray-100"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Login Sistem
          </h1>
          <p className="text-gray-400">Masukkan kredensial Anda</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="login_identifier" // Changed from username
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username atau Email {/* Changed label */}
            </label>
            <input
              id="login_identifier" // Changed from username
              type="text"
              placeholder="Masukkan username atau email" // Changed placeholder
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-md flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memproses...
            </>
          ) : (
            "Login"
          )}
        </button>
        <p className="text-sm text-center text-gray-400">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Daftar di sini
          </a>
        </p>
      </form>
    </div>
  );
}

