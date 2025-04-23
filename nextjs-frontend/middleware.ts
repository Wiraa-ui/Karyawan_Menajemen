import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login";

  // Check if user is authenticated by looking for a token in cookies
  const token = request.cookies.get("auth_token")?.value || "";

  // If the user is not authenticated and trying to access a protected route,
  // redirect them to the login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If the user is authenticated and trying to access login page,
  // redirect them to the dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ["/", "/dashboard", "/karyawan", "/jabatan", "/units", "/login"],
};
