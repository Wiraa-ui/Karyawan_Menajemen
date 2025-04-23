"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login") {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname]);

  if (isAuthenticated === null && pathname !== "/login") {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Memuat...
      </div>
    );
  }

  const showSidebar = pathname !== "/login";

  // Handle sidebar state changes
  const handleSidebarToggle = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <div className="flex">
      {showSidebar && <Sidebar onSidebarToggle={handleSidebarToggle} />}
      <main
        className={`transition-all duration-300 p-4 w-full ${
          showSidebar ? (isSidebarCollapsed ? "ml-20" : "ml-64") : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
