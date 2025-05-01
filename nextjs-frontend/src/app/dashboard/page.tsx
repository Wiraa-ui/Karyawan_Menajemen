"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/utils/axios";
import { ApiResponse, DashboardStats, TopUser } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalKaryawan: 0,
    totalLogin: 0,
    totalUnit: 0,
    totalJabatan: 0,
    topUsers: [],
  });

  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
  };

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/dashboard";
      if (dateRange.from && dateRange.to) {
        url += `?from_date=${dateRange.from}&to_date=${dateRange.to}`;
      }

      const res = await axios.get<ApiResponse<DashboardStats>>(url);
      const data = res.data;

      setStats({
        totalKaryawan: data.total_karyawan ?? 0,
        totalLogin: data.total_login ?? 0,
        totalUnit: data.total_unit ?? 0,
        totalJabatan: data.total_jabatan ?? 0,
        topUsers: data.top_users ?? [],
      });
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <div className="p-6 space-y-6 bg-[#1a202c] min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-white">Dashboard</h1>

      {/* Filter */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="date"
            className="bg-gray-700 rounded p-2 text-white"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />
          <input
            type="date"
            className="bg-gray-700 rounded p-2 text-white"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
          <button
            onClick={handleFetch}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
            disabled={loading}
          >
            {loading ? "Memuat..." : "Terapkan Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Karyawan",
            value: stats.totalKaryawan,
            color: "blue",
          },
          { label: "Total Login", value: stats.totalLogin, color: "green" },
          { label: "Total Unit", value: stats.totalUnit, color: "purple" },
          { label: "Total Jabatan", value: stats.totalJabatan, color: "red" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${colorClasses[stat.color]} p-4 rounded-xl text-white`}
          >
            <h3 className="text-lg font-semibold">{stat.label}</h3>
            <p className="text-3xl font-bold">{loading ? "..." : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Users */}
      <div className="bg-gray-800 p-4 rounded-xl text-white">
        <h2 className="text-xl font-semibold mb-4">Top Pengguna Aktif</h2>
        <p className="text-sm text-yellow-400 mb-4 bg-yellow-800 px-3 py-1 inline-block rounded-lg">
          Hanya menampilkan pengguna dengan login lebih dari 25x
        </p>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : stats.topUsers && stats.topUsers.length > 0 ? (
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">#</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Jabatan</th>
                <th className="p-2">Total Login</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers.map((user: TopUser, idx: number) => (
                <tr key={idx} className="border-t border-gray-700">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{user.nama}</td>
                  <td className="p-2">{user.unit?.nama || "-"}</td>
                  <td className="p-2">{user.jabatan || "-"}</td>
                  <td className="p-2">{user.login_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-400">Tidak ada data login</div>
        )}
      </div>
    </div>
  );
}
