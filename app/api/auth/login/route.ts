import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    console.log("LOGIN BODY:", body);

    const { email, password } = body;

    // 🔥 FIX: strict check
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login success",
      token,
      role: user.role,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}