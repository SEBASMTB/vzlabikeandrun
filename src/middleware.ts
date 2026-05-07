import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token");
  const { pathname } = request.nextUrl;

  // Public admin pages (no auth required)
  const isLoginPage = pathname === "/admin/login";

  // If not logged in and not on login page, redirect to login server-side
  if (!token && pathname.startsWith("/admin") && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and on login page, redirect to dashboard
  if (token && isLoginPage) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
