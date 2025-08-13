// app/api/message-board/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // don't cache this route

// Simple in-memory store (resets on redeploy/cold start)
let MESSAGES = [];

// GET /api/message-board
export async function GET() {
  return NextResponse.json(
    { messages: MESSAGES },
    { headers: { "cache-control": "no-store" } }
  );
}

// POST /api/message-board { text }
export async function POST(req) {
  try {
    const body = await req.json();
    const text = (body?.text ?? "").toString().trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const message = {
      id: (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()),
      text: text.slice(0, 1000),
      when: new Date().toISOString(),
    };

    MESSAGES.push(message);
    if (MESSAGES.length > 100) MESSAGES = MESSAGES.slice(-100);

    return NextResponse.json({ ok: true, message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad JSON body" }, { status: 400 });
  }
}
