"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/utils/axios"; // Sesuaikan path jika berbeda

export default function Sidebar({
  onSidebarToggle,
}: {
  onSidebarToggle?: (isCollapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notify parent component when sidebar state changes
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isCollapsed);
    }
  }, [isCollapsed, onSidebarToggle]);

  const handleLogout = async () => {
    try {
      await api.post("/logout"); // Menggunakan instance axios yang sudah pakai withCredentials
      router.push("/login"); // Redirect ke login setelah logout
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: "📊" },
    { path: "/karyawan", name: "Karyawan", icon: "👥" },
    { path: "/units", name: "Unit", icon: "🏢" },
    { path: "/jabatan", name: "Jabatan", icon: "💼" },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-screen transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } fixed left-0 top-0 z-40 shadow-xl`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold">Sistem Karyawan</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <div className="py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                href={item.path}
                className={`flex items-center p-3 ${
                  isCollapsed ? "justify-center" : "px-6"
                } ${
                  pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700 transition-colors"
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-0 w-full border-t border-gray-700 py-4 flex justify-center">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-600 rounded-md px-4 py-2 transition-all duration-300 ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          {!isCollapsed && <span className="font-semibold">Logout</span>}
        </button>
      </div>
    </div>
  );
}
