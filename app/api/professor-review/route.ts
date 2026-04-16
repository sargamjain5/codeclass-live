import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { code, output, language, studentName } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a Senior CS Professor. Analyze student code and output. Return ONLY a JSON object."
        },
        {
          role: "user",
          content: `
            Student: ${studentName}
            Language: ${language}
            Code: ${code}
            Output: ${output}

            Return this JSON structure:
            {
              "rating": "A" | "B" | "C" | "D" | "F",
              "summary": "Short headline of performance",
              "missingConcepts": ["concept1", "concept2"],
              "feedback": "Pedagogical advice for the tutor to give the student.",
              "severity": "low" | "medium" | "high"
            }
          `
        }
      ],
      model: "llama-3.3-70b-versatile", // Using Llama 3 for high reasoning
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (error) {
    return NextResponse.json({ error: "Groq Review Failed" }, { status: 500 });
  }
}