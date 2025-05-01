"use client";

// Remove unused useEffect import
import { useState } from "react";
import { usePathname } from "next/navigation"; // Remove unused useRouter import
import Sidebar from "./Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove unused state variables
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  // Remove unused router variable
  // const router = useRouter();

  // Remove the outdated useEffect hook that checks localStorage token
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token && pathname !== "/login" && pathname !== "/register") { // Allow /register too
  //     router.replace("/login");
  //   } else {
  //     setIsAuthenticated(true);
  //   }
  // }, [pathname, router]);

  // Since auth is handled by HttpOnly cookie and backend/axios interceptor,
  // this component mainly handles layout structure.
  // We just need to determine if the sidebar should be shown.

  // Define public paths where sidebar should not be shown
  const publicPaths = ["/login", "/register"];
  const showSidebar = !publicPaths.includes(pathname);

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
