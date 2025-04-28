"use client";
import { useEffect, useRef, useState } from "react";
import axios from "@/utils/axios";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Unit, ApiResponse } from "@/types";

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Unit>>({
    nama: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formRef = useRef<HTMLDivElement>(null); // 🔽 Ref untuk scroll ke form

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      try {
        const unitRes = await axios.get<ApiResponse<Unit[]>>("/units");
        if (unitRes.data.success) {
          setUnits(unitRes.data.data || []);
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        console.error("Error fetching data:", err);
        setError("Gagal memuat data");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      let res;
      if (isEditing && currentId) {
        res = await axios.put<ApiResponse<Unit>>(
          `/units/${currentId}`,
          formData
        );
      } else {
        res = await axios.post<ApiResponse<Unit>>("/units", formData);
      }

      if (res.data.success) {
        const updatedRes = await axios.get<ApiResponse<Unit[]>>("/units");
        if (updatedRes.data.success) {
          setUnits(updatedRes.data.data || []);
        }

        setFormData({ nama: "" });
        setIsEditing(false);
        setCurrentId(null);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Error saving unit:", err);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan data"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setFormData({ nama: unit.nama });
    setIsEditing(true);
    setCurrentId(unit.id);

    // 🔽 Scroll ke form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus unit ini?")) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.delete<ApiResponse<null>>(`/units/${id}`);
      if (res.data.success) {
        const updatedRes = await axios.get<ApiResponse<Unit[]>>("/units");
        if (updatedRes.data.success) {
          setUnits(updatedRes.data.data || []);
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Error deleting unit:", err);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat menghapus data"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ nama: "" });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUnits = units.filter((unit) =>
    unit.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manajemen Unit</h1>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {/* Form */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl" ref={formRef}>
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Unit" : "Tambah Unit Baru"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium mb-1">
                Nama Unit
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              {loading
                ? "Memproses..."
                : isEditing
                ? "Update Unit"
                : "Tambah Unit"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl">
        <input
          type="text"
          placeholder="Cari unit..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Daftar Unit</h2>

        {loading && !units.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUnits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr
                    key={unit.id}
                    className="border-t border-gray-600 hover:bg-gray-600"
                  >
                    <td className="py-3 px-4">{unit.id}</td>
                    <td className="py-3 px-4">{unit.nama}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? "Tidak ada unit yang sesuai dengan pencarian"
              : "Belum ada data unit"}
          </div>
        )}
      </div>
    </div>
  );
}
