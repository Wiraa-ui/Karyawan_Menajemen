// src/app/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
// Remove unused type imports
// import type { Unit, Jabatan } from "@/types";
// Import custom components
import SearchableSelect from "@/components/SearchableSelect";
import MultiSearchSelect from "@/components/MultiSearchSelect";

// Option type for custom components (assuming they expect id: number, nama: string)
interface CustomOption {
  id: number;
  nama: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    unit_id: null as number | null, // Use number | null for custom component
    tanggal_bergabung: "",
    jabatans: [] as number[], // Use number[] for custom component
  });
  const [units, setUnits] = useState<CustomOption[]>([]); // Use CustomOption
  const [jabatans, setJabatans] = useState<CustomOption[]>([]); // Use CustomOption
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/register/form-data");
        if (response.data.success) {
          // Ensure fetched data matches CustomOption structure (id: number, nama: string)
          setUnits(response.data.data.units as CustomOption[]);
          setJabatans(response.data.data.jabatans as CustomOption[]);
        } else {
          setError("Gagal memuat data form.");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data form.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific error when input changes
    if (formErrors[name]) {
      setFormErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handler for custom SearchableSelect (Unit)
  const handleUnitChange = (selectedId: number | null) => {
    setFormData((prev) => ({
      ...prev,
      unit_id: selectedId,
    }));
    // Clear unit error when changed
    if (formErrors.unit_id) {
      setFormErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { unit_id: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handler for custom MultiSearchSelect (Jabatan)
  const handleJabatanMultiChange = (selectedIds: number[]) => {
    // Limit is handled by the component itself (maxSelection prop)
    setFormData((prev) => ({
      ...prev,
      jabatans: selectedIds,
    }));
    // Clear jabatan error when changed
    if (formErrors.jabatans) {
      setFormErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jabatans: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const currentFormErrors: Record<string, string[]> = {};

    // Basic validation for custom select fields
    if (formData.unit_id === null) {
      currentFormErrors.unit_id = ["Unit wajib diisi."];
    }
    if (formData.jabatans.length === 0) {
      currentFormErrors.jabatans = ["Jabatan wajib diisi (minimal 1)."];
    }
    // Add other frontend validations if needed (e.g., password match)
    if (formData.password !== formData.password_confirmation) {
      currentFormErrors.password_confirmation = [
        "Konfirmasi password tidak cocok.",
      ];
    }

    setFormErrors(currentFormErrors);

    if (Object.keys(currentFormErrors).length > 0) {
      setError("Input tidak valid. Silakan periksa kembali.");
      // Animasi error
      const form = document.querySelector("form");
      form?.classList.add("animate-shake");
      setTimeout(() => form?.classList.remove("animate-shake"), 500);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Prepare data for backend (ensure IDs are strings if backend expects strings)
    const dataToSend = {
      ...formData,
      unit_id: formData.unit_id?.toString(), // Convert to string if needed
      jabatans: formData.jabatans.map((id) => id.toString()), // Convert to string array if needed
    };

    try {
      // Use dataToSend which might have converted IDs
      const response = await axiosInstance.post("/register", dataToSend);
      if (response.data.success) {
        alert("Registrasi berhasil! Silakan login.");
        router.push("/login");
      } else {
        // Handle validation errors specifically from backend
        if (response.data.errors) {
          setFormErrors(response.data.errors);
          setError("Input tidak valid. Silakan periksa kembali.");
        } else {
          setError(response.data.message || "Registrasi gagal.");
        }
        // Animasi error
        const form = document.querySelector("form");
        form?.classList.add("animate-shake");
        setTimeout(() => form?.classList.remove("animate-shake"), 500);
      }
    } catch (err: unknown) {
      type ApiErrorResponse = {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (
        isAxiosError<ApiErrorResponse>(err) &&
        err.response &&
        err.response.data
      ) {
        if (err.response.data.errors) {
          setFormErrors(err.response.data.errors);
          setError("Input tidak valid. Silakan periksa kembali.");
        } else {
          setError(
            err.response.data.message || "Terjadi kesalahan saat registrasi."
          );
        }
      } else {
        setError("Terjadi kesalahan saat registrasi.");
      }
      console.error(err);
      // Animasi error
      const form = document.querySelector("form");
      form?.classList.add("animate-shake");
      setTimeout(() => form?.classList.remove("animate-shake"), 500);
    } finally {
      setLoading(false);
    }
  };

  if (loading && units.length === 0 && jabatans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a202c] w-full p-0 m-0 absolute inset-0 text-white">
        Memuat data form...
      </div>
    );
  }

  // Define input class based on login page styling
  const inputClassName =
    "w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-1";
  const errorTextClassName = "text-red-400 text-xs mt-1"; // Adjusted error color

  return (
    // Main container matching login page
    <div className="min-h-screen flex items-center justify-center bg-[#1a202c] w-full p-4 md:p-0 absolute inset-0">
      {/* Form container - Using space-y-4 for slightly more vertical space between sections */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg space-y-4 transition-all text-gray-100">
        {/* Title and subtitle matching login page */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Registrasi Karyawan Baru
          </h1>
          <p className="text-gray-400">Masukkan detail Anda untuk mendaftar</p>
        </div>

        {/* Error message styling matching login page */}
        {error && !loading && (
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

        {/* Form - Using space-y-4 for sections */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="nama" className={labelClassName}>
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama"
              id="nama"
              required
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={handleChange}
              className={inputClassName}
            />
            {formErrors.nama && (
              <p className={errorTextClassName}>{formErrors.nama[0]}</p>
            )}
          </div>

          {/* Grid for Email and Username - Consistent gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="Masukkan email"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
              />
              {formErrors.email && (
                <p className={errorTextClassName}>{formErrors.email[0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className={labelClassName}>
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleChange}
                className={inputClassName}
              />
              {formErrors.username && (
                <p className={errorTextClassName}>
                  {formErrors.username[0]}
                </p>
              )}
            </div>
          </div>

          {/* Grid for Password and Password Confirmation - Consistent gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
              />
              {formErrors.password && (
                <p className={errorTextClassName}>
                  {formErrors.password[0]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password_confirmation" className={labelClassName}>
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                required
                placeholder="Ulangi password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={inputClassName}
              />
              {formErrors.password_confirmation && (
                <p className={errorTextClassName}>
                  {formErrors.password_confirmation[0]}
                </p>
              )}
            </div>
          </div>

          {/* Grid for Tanggal Bergabung, Unit, Jabatan - Consistent gap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Tanggal Bergabung */}
            <div>
              <label htmlFor="tanggal_bergabung" className={labelClassName}>
                Tgl. Bergabung
              </label>
              <input
                type="date"
                name="tanggal_bergabung"
                id="tanggal_bergabung"
                required
                value={formData.tanggal_bergabung}
                onChange={handleChange}
                className={inputClassName}
              />
              {formErrors.tanggal_bergabung && (
                <p className={errorTextClassName}>
                  {formErrors.tanggal_bergabung[0]}
                </p>
              )}
            </div>
            {/* Unit Selection using custom SearchableSelect */}
            <div>
              <label htmlFor="unit_id" className={labelClassName}>
                Unit
              </label>
              <SearchableSelect
                name="unit_id" // Pass name for potential form handling
                options={units}
                value={formData.unit_id}
                onChange={handleUnitChange}
                placeholder="Pilih Unit..."
                required // Use component's required prop for validation
                className="text-black" // Force text black for readability inside select
              />
              {formErrors.unit_id && (
                <p className={errorTextClassName}>
                  {formErrors.unit_id[0]}
                </p>
              )}
            </div>
            {/* Jabatan Selection using custom MultiSearchSelect */}
            <div>
              <label htmlFor="jabatans" className={labelClassName}>
                Jabatan (Maks. 2)
              </label>
              <MultiSearchSelect
                options={jabatans}
                values={formData.jabatans}
                onChange={handleJabatanMultiChange}
                placeholder="Pilih Jabatan..."
                required // Use component's required prop for validation
                maxSelection={2} // Explicitly set max selection
                className="text-black" // Force text black for readability inside select
              />
              {formErrors.jabatans && (
                <p className={errorTextClassName}>
                  {formErrors.jabatans[0]}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button - Added pt-2 for spacing */}
          <div className="pt-2">
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
                  Mendaftar...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </div>
        </form>

        {/* Link to Login matching login style */}
        <p className="text-sm text-center text-gray-400">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Login di sini
          </a>
        </p>
      </div>
    </div>
  );
}

