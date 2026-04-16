import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userName, role } = await req.json();

  const response = await fetch(
    "https://api.100ms.live/v2/room-tokens",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_MANAGEMENT_TOKEN`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: "YOUR_ROOM_ID",
        user_id: userName,
        role: role === "tutor" ? "host" : "guest",
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json({ token: data.token });
}