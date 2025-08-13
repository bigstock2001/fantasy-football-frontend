// middleware.js
import { NextResponse } from "next/server";

// Pages we won't guard (static, api, login-required)
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/login-required" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Treat any of these cookies as “logged in”.
  const hasSession =
    req.cookies.get("ffd_session") ||
    req.cookies.get("ffd_token") ||
    req.cookies.get("token") ||
    req.cookies.get("session");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login-required";
    url.searchParams.set("next", pathname + (searchParams ? `?${searchParams}` : ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except /api, /_next/*, static files, and /login-required
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
