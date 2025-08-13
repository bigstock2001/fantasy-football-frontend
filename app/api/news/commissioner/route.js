import { NextResponse } from "next/server";

export async function GET() {
  // Replace with a real fetch to your CMS if/when you have it.
  return NextResponse.json({ message: "", items: [] });
}
