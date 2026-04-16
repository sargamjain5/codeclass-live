import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";

export async function POST(req: Request) {
  await connectDB();

  const user = requireAuth(req);

  if (!user || user.role !== "tutor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, scheduledAt } = await req.json();

  const sessionId = Date.now().toString(); // simple unique ID

  const session = await Session.create({
    title,
    tutorId: user.id,
    sessionId,
    scheduledAt,
  });

  return NextResponse.json(session);
}