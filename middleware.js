// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Always allow: login pages, API routes, Next assets, and static files
  const isPublic =
    pathname === "/login" ||
    pathname === "/login-required" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname);

  if (isPublic) return NextResponse.next();

  // Require auth cookie for everything else
  const authed = req.cookies.get("ffd_auth")?.value;
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (pathname && pathname !== "/") url.searchParams.set("from", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match "everything", but we'll early-return for public paths above
export const config = {
  matcher: ["/:path*"],
};
