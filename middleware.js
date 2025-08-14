// middleware.js
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/login-required",
  "/api/login",
  "/api/logout",
  "/favicon.ico",
];

export function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isNext = pathname.startsWith("/_next/") || pathname.startsWith("/static/");
  const isPublic = PUBLIC_PATHS.includes(pathname) || isApi || isNext;

  // Auth cookie set by /api/login
  const hasAuth = req.cookies.get("ffd_auth")?.value === "1";

  // If you’re at the root:
  //  - send logged-in users to Locker Room
  //  - let logged-out users see the root (or change to redirect to /login if you prefer)
  if (pathname === "/") {
    if (hasAuth) {
      const url = req.nextUrl.clone();
      url.pathname = "/locker-room";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Block protected pages if not logged in
  if (!isPublic && !hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login-required";
    url.search = search ? `${search}&from=${encodeURIComponent(pathname)}` : `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to everything so we can catch root, then exclude assets inside code above.
export const config = {
  matcher: "/:path*",
};
