import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs"; // ✅ IMPORTANT

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("ENV CHECK:", process.env.GROQ_API_KEY);

    const { prompt, code } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt missing" },
        { status: 400 }
      );
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful coding tutor.",
        },
        {
          role: "user",
          content: `Code:\n${code || ""}\n\nQuestion:\n${prompt}`,
        },
      ],
    });

    const reply =
      response.choices?.[0]?.message?.content || "No response from AI";

    console.log("AI RESPONSE:", reply);

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      { error: error.message || "AI failed" },
      { status: 500 }
    );
  }
}