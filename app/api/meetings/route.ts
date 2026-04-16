import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Your DB connection utility
import { Meeting } from "@/models/Meeting";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newMeeting = await Meeting.create(body);
    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const meetings = await Meeting.find().sort({ startTime: -1 });
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}