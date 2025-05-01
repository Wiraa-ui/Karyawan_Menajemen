"use client";
import { useEffect, useState, useRef } from "react";
import axios from "@/utils/axios";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Jabatan, ApiResponse } from "@/types";
import ActionButton from "@/components/ActionButton";

export default function JabatanPage() {
  const router = useRouter();
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Jabatan>>({
    nama: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formRef = useRef<HTMLDivElement>(null); // 🆕 referensi untuk scroll

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // No need to check localStorage for token, HttpOnly cookie handles auth
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      setLoading(true);
      try {
        const jabatanRes = await axios.get<ApiResponse<Jabatan[]>>("/jabatans");
        if (jabatanRes.data.success) {
          setJabatans(jabatanRes.data.data || []);
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        console.error("Error fetching data:", error);
        setError("Gagal memuat data");
        if (error.response && error.response.status === 401) {
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
      // No need to check localStorage for token, HttpOnly cookie handles auth
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      let res;
      if (isEditing && currentId) {
        res = await axios.put<ApiResponse<Jabatan>>(
          `/jabatans/${currentId}`,
          formData
        );
      } else {
        res = await axios.post<ApiResponse<Jabatan>>("/jabatans", formData);
      }

      if (res.data.success) {
        const updatedRes = await axios.get<ApiResponse<Jabatan[]>>("/jabatans");
        if (updatedRes.data.success) {
          setJabatans(updatedRes.data.data || []);
        }

        setFormData({ nama: "" });
        setIsEditing(false);
        setCurrentId(null);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Error saving jabatan:", error);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan data"
      );
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (jabatan: Jabatan) => {
    setFormData({ nama: jabatan.nama });
    setIsEditing(true);
    setCurrentId(jabatan.id);

    // 🔽 Scroll otomatis ke form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jabatan ini?"))
      return;

    setLoading(true);
    setError("");

    try {
      // No need to check localStorage for token, HttpOnly cookie handles auth
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      const res = await axios.delete<ApiResponse<null>>(`/jabatans/${id}`);
      if (res.data.success) {
        const updatedRes = await axios.get<ApiResponse<Jabatan[]>>("/jabatans");
        if (updatedRes.data.success) {
          setJabatans(updatedRes.data.data || []);
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Error deleting jabatan:", err);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat menghapus data"
      );
      if (error.response && error.response.status === 401) {
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

  const filteredJabatans = jabatans.filter((jabatan) =>
    jabatan.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manajemen Jabatan</h1>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {/* Form */}
      <div
        className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl"
        ref={formRef} // 🆕 referensi form
      >
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Jabatan" : "Tambah Jabatan Baru"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium mb-1">
                Nama Jabatan
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
                ? "Update Jabatan"
                : "Tambah Jabatan"}
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
          placeholder="Cari jabatan..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Daftar Jabatan</h2>

        {loading && !jabatans.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredJabatans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredJabatans.map((jabatan) => (
                  <tr key={jabatan.id} className="text-center">
                    <td className="py-3 px-4">{jabatan.id}</td>
                    <td className="py-3 px-4">{jabatan.nama}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2 justify-center items-center">
                        <ActionButton
                          label="Edit"
                          onClick={() => handleEdit(jabatan)}
                          variant="edit"
                        />
                        <ActionButton
                          label="Hapus"
                          onClick={() => handleDelete(jabatan.id)}
                          variant="delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? "Tidak ada jabatan yang sesuai dengan pencarian"
              : "Belum ada data jabatan"}
          </div>
        )}
      </div>
    </div>
  );
}
