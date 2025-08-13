// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname, search } = req.nextUrl;
  // Public paths that never require auth:
  const publicPrefixes = [
    "/login",
    "/api/login",
    "/api/logout",
    "/_next",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/public",
  ];
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuthed = req.cookies.get("ffd_auth")?.value;
  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Protect everything except the public assets & login endpoints above.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/login|api/logout|login).*)"],
};
