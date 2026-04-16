import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";

export async function GET(req: Request) {
  await connectDB();

  const user = requireAuth(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessions;

  if (user.role === "tutor") {
    sessions = await Session.find({ tutorId: user.id });
  } else {
    sessions = await Session.find({});
  }

  return NextResponse.json(sessions);
}