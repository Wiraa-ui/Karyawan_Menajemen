import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("--- MIDDLEWARE EXECUTED ---"); // <--- Tambahkan ini
  // Dapatkan pathname dari request
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Path requested: ${path}`); // Log path

  // Tentukan path publik yang tidak memerlukan autentikasi
  const isPublicPath = path === "/login";

  // Cek apakah pengguna sudah terautentikasi dengan memeriksa token di cookie
  const cookieData = request.cookies.get("jwt_token"); // Get cookie object
  const token = cookieData?.value || "";
  console.log(`[Middleware] JWT Cookie Data:`, cookieData); // Log the whole cookie object
  console.log(`[Middleware] Extracted Token: ${token ? 'Present' : 'Missing'}`); // Log if token value exists

  // Jika pengguna belum terautentikasi dan mencoba mengakses route yang dilindungi,
  // redirect ke halaman login
  if (!isPublicPath && !token) {
    console.log("[Middleware] Redirecting to /login (Not public, no token)"); // Log redirect reason
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika pengguna sudah terautentikasi dan mencoba mengakses halaman login,
  // redirect ke dashboard (halaman utama)
  if (isPublicPath && token) {
    console.log("[Middleware] Redirecting to /dashboard (Public, token found)"); // Log redirect reason
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Lanjutkan request seperti biasa
  console.log("[Middleware] Allowing request to proceed."); // Log proceed reason
  return NextResponse.next();
}

// Konfigurasi path yang akan dipantau oleh middleware ini
export const config = {
  matcher: ["/", "/dashboard", "/karyawan", "/jabatan", "/units", "/login"],
};
