// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("ffd_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    expires: new Date(0),
  });
  return res;
}
