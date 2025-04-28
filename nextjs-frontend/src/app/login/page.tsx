"use client";
import { useState } from "react";
import axios from "@/utils/axios";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "@/types";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Kirim request login ke backend
      const credentials: LoginCredentials = { username, password };
      const response = await axios.post<LoginResponse>("/login", credentials);

      // Pastikan kita mengakses struktur respons dengan benar
      const { data } = response;

      if (!data?.token) {
        throw new Error("Token tidak ditemukan dalam respons");
      }

      // Simpan token di localStorage
      localStorage.setItem("token", data.token);

      // Opsional: Simpan juga informasi user jika diperlukan
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect ke dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Login error:", err);

      // Tampilkan pesan error yang lebih spesifik
      setError(
        error.response?.data?.message ||
          "Username atau password salah. Silakan coba lagi."
      );

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
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6 transition-all text-gray-900"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Login Sistem
          </h1>
          <p className="text-gray-500">Masukkan kredensial Anda</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
      </form>
    </div>
  );
}
