// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("ffd_session")?.value;
  const { pathname, search } = req.nextUrl;

  // Always allow Next internals & API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt|webp)$/i)
  ) {
    return NextResponse.next();
  }

  // Public routes
  const publicRoutes = ["/login", "/"];
  const isPublic = publicRoutes.includes(pathname);

  if (!token && !isPublic) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/locker-room", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
