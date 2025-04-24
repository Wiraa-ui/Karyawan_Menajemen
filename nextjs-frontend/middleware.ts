import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Dapatkan pathname dari request
  const path = request.nextUrl.pathname;

  // Tentukan path publik yang tidak memerlukan autentikasi
  const isPublicPath = path === "/login";

  // Cek apakah pengguna sudah terautentikasi dengan memeriksa token di cookie
  const token = request.cookies.get("auth_token")?.value || "";

  // Jika pengguna belum terautentikasi dan mencoba mengakses route yang dilindungi,
  // redirect ke halaman login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika pengguna sudah terautentikasi dan mencoba mengakses halaman login,
  // redirect ke dashboard (halaman utama)
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Lanjutkan request seperti biasa
  return NextResponse.next();
}

// Konfigurasi path yang akan dipantau oleh middleware ini
export const config = {
  matcher: ["/", "/dashboard", "/karyawan", "/jabatan", "/units", "/login"],
};
