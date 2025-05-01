"use client";
import { useEffect, useRef, useState } from "react";
import axios from "@/utils/axios";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Karyawan, Unit, Jabatan, ApiResponse } from "@/types";
import SearchableSelect from "@/components/SearchableSelect";
import MultiSearchSelect from "@/components/MultiSearchSelect";
import ActionButton from "@/components/ActionButton";

export default function KaryawanPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement | null>(null);

  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Karyawan>>({
    nama: "",
    username: "",
    email: "",
    password: "",
    unit_id: 0,
    tanggal_bergabung: "",
  });
  const [selectedJabatans, setSelectedJabatans] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // No need to check localStorage for token, HttpOnly cookie handles auth
      // const token = localStorage.getItem("token");
      // if (!token) return router.push("/login");

      setLoading(true);
      try {
        const [kRes, uRes, jRes] = await Promise.all([
          axios.get<ApiResponse<Karyawan[]>>("/karyawans"),
          axios.get<ApiResponse<Unit[]>>("/units"),
          axios.get<ApiResponse<Jabatan[]>>("/jabatans"),
        ]);
        if (kRes.data.success) setKaryawans(kRes.data.data || []);
        if (uRes.data.success) setUnits(uRes.data.data || []);
        if (jRes.data.success) setJabatans(jRes.data.data || []);
      } catch (err: unknown) {
        setError("Gagal memuat data");
        const error = err as AxiosError<{ message?: string }>;
        if (error.response?.status === 401) {
          // localStorage.removeItem("token"); // Removed: Handled by HttpOnly cookie
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "unit_id" ? +value : value });
  };

  const handleUnitChange = (unitId: number) => {
    setFormData({ ...formData, unit_id: unitId });
  };

  const handleJabatanChange = (selectedIds: number[]) => {
    setSelectedJabatans(selectedIds);
  };

  const handleAddNewUnit = async (nama: string) => {
    const res = await axios.post<ApiResponse<Unit>>("/units", { nama });
    if (res.data.success && res.data.data) {
      setUnits([...units, res.data.data ?? {}]);
      setFormData({ ...formData, unit_id: res.data.data?.id ?? 0 });
    }
  };

  const handleAddNewJabatan = async (nama: string) => {
    const res = await axios.post<ApiResponse<Jabatan>>("/jabatans", { nama });
    if (res.data.success && res.data.data) {
      setJabatans([...jabatans, res.data.data ?? {}]);
      setSelectedJabatans((prev) => [...prev, res.data.data?.id ?? 0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = { ...formData, jabatans: selectedJabatans };

    try {
      // No need to check localStorage for token, HttpOnly cookie handles auth
      // const token = localStorage.getItem("token");
      // if (!token) return router.push("/login");

      const res =
        isEditing && currentId
          ? await axios.put<ApiResponse<Karyawan>>(
              `/karyawans/${currentId}`,
              dataToSend
            )
          : await axios.post<ApiResponse<Karyawan>>("/karyawans", dataToSend);

      if (res.data.success) {
        const updated = await axios.get<ApiResponse<Karyawan[]>>("/karyawans");
        if (updated.data.success) setKaryawans(updated.data.data || []);
        setFormData({
          nama: "",
          username: "",
          email: "",
          password: "",
          unit_id: 0,
          tanggal_bergabung: "",
        });
        setSelectedJabatans([]);
        setIsEditing(false);
        setCurrentId(null);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (karyawan: Karyawan) => {
    setFormData({
      nama: karyawan.nama,
      username: karyawan.username,
      email: karyawan.email,
      password: "",
      unit_id: karyawan.unit_id,
      tanggal_bergabung: karyawan.tanggal_bergabung,
    });
    setSelectedJabatans(karyawan.jabatans?.map((j) => j.id) || []);
    setIsEditing(true);
    setCurrentId(karyawan.id);

    // Scroll to top
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus karyawan ini?")) return;
    // No need to check localStorage for token, HttpOnly cookie handles auth
    // const token = localStorage.getItem("token");
    // if (!token) return router.push("/login");

    try {
      const res = await axios.delete<ApiResponse<null>>(`/karyawans/${id}`);
      if (res.data.success) {
        const updated = await axios.get<ApiResponse<Karyawan[]>>("/karyawans");
        if (updated.data.success) setKaryawans(updated.data.data || []);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Gagal menghapus data");
    }
  };

  const handleCancel = () => {
    setFormData({
      nama: "",
      username: "",
      email: "",
      password: "",
      unit_id: 0,
      tanggal_bergabung: "",
    });
    setSelectedJabatans([]);
    setIsEditing(false);
    setCurrentId(null);
  };

  const filteredKaryawans = karyawans.filter(
    (k) =>
      k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6" ref={topRef}>
      <h1 className="text-3xl font-bold mb-8">Manajemen Karyawan</h1>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {/* Form Input */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Karyawan" : "Tambah Karyawan Baru"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="nama"
              placeholder="Nama"
              required
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required={!isEditing}
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required={!isEditing}
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />

            <SearchableSelect
              options={units}
              value={formData.unit_id || null}
              onChange={handleUnitChange}
              onAddNew={handleAddNewUnit}
              placeholder="Pilih Unit"
              required
            />

            <MultiSearchSelect
              options={jabatans}
              values={selectedJabatans}
              onChange={handleJabatanChange}
              onAddNew={handleAddNewJabatan}
              placeholder="Pilih Jabatan"
              required
              maxSelection={2}
            />

            <input
              type="date"
              name="tanggal_bergabung"
              required
              value={formData.tanggal_bergabung}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              {loading
                ? "Memproses..."
                : isEditing
                ? "Update Karyawan"
                : "Tambah Karyawan"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Box */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl">
        <input
          type="text"
          placeholder="Cari karyawan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      {/* Data Table */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Daftar Karyawan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg">
            <thead className="bg-gray-600">
              <tr>
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Tanggal Bergabung</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKaryawans.map((karyawan) => (
                <tr
                  key={karyawan.id}
                  className="border-t border-gray-600 hover:bg-gray-600 text-center"
                >
                  <td className="py-6 px-4">{karyawan.nama}</td>
                  <td className="py-6 px-4">{karyawan.username}</td>
                  <td className="py-6 px-4">{karyawan.unit?.nama}</td>
                  <td className="py-6 px-4">
                    {karyawan.jabatans?.map((j) => j.nama).join(", ")}
                  </td>
                  <td className="py-3 px-4">{karyawan.tanggal_bergabung}</td>
                  <td className="py-3 px-4 flex justify-center space-x-2">
                    <ActionButton
                      label="Edit"
                      onClick={() => handleEdit(karyawan)}
                      variant="edit"
                    />
                    <ActionButton
                      label="Hapus"
                      onClick={() => handleDelete(karyawan.id)}
                      variant="delete"
                    />
                  </td>
                </tr>
              ))}
              {!filteredKaryawans.length && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-6">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
