import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();
    const id = crypto.randomUUID();
    const tempDir = path.join(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let filePath = "";
    let cmd = "";
    let outPath = ""; // Track binary path separately

    switch (language) {
      case "python":
        filePath = path.join(tempDir, `${id}.py`);
        fs.writeFileSync(filePath, code);
        cmd = `python3 "${filePath}"`; // Added quotes for safety
        break;

      case "cpp":
        filePath = path.join(tempDir, `${id}.cpp`);
        outPath = path.join(tempDir, `${id}.out`);
        fs.writeFileSync(filePath, code);
        // Compile then Run. Using quotes for paths.
        cmd = `g++ "${filePath}" -o "${outPath}" && "${outPath}"`;
        break;

      case "javascript":
        filePath = path.join(tempDir, `${id}.js`);
        fs.writeFileSync(filePath, code);
        cmd = `node "${filePath}"`;
        break;

      default:
        return NextResponse.json({ error: "Language not supported" });
    }

    return new Promise((resolve) => {
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        // Cleanup files asynchronously to not block the response
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath);
          } catch (e) { console.error("Cleanup error:", e); }
        }, 100);

        if (stderr || error) {
          // Return compilation or execution errors
          resolve(NextResponse.json({ error: stderr || error?.message }));
        } else {
          resolve(NextResponse.json({ output: stdout }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}