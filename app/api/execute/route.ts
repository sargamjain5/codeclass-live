import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const id = Math.random().toString(36).substring(7);
    const tempDir = path.join(process.cwd(), "temp_exec");
    await fs.mkdir(tempDir, { recursive: true });

    let fileName = "";
    let dockerImage = "";
    let runCommand = "";

    switch (language) {
      case "python":
        fileName = `s_${id}.py`;
        dockerImage = "python:3.10-slim";
        runCommand = `python /app/${fileName}`;
        break;
      case "javascript":
        fileName = `s_${id}.js`;
        dockerImage = "node:18-slim";
        runCommand = `node /app/${fileName}`;
        break;
      case "cpp":
        fileName = `s_${id}.cpp`;
        dockerImage = "gcc:latest";
        runCommand = `g++ /app/${fileName} -o /app/out && /app/out`;
        break;
      case "java":
        fileName = `Main.java`; 
        const javaFolder = path.join(tempDir, id);
        await fs.mkdir(javaFolder, { recursive: true });
        dockerImage = "openjdk:17-slim";
        runCommand = `javac /app/Main.java && java -cp /app Main`;
        break;
      default:
        return NextResponse.json({ error: "Unsupported language" });
    }

    const filePath = language === "java" 
      ? path.join(process.cwd(), "temp_exec", id, fileName) 
      : path.join(tempDir, fileName);
    
    await fs.writeFile(filePath, code);

    const mountPath = language === "java" ? path.join(tempDir, id) : tempDir;
    const { stdout, stderr } = await execAsync(
      `docker run --rm -v "${mountPath}":/app --memory="128m" --cpus="0.5" ${dockerImage} sh -c "${runCommand}"`,
      { timeout: 7000 }
    ).catch(e => e); 

    await fs.rm(filePath, { force: true });
    if (language === "java") await fs.rm(mountPath, { recursive: true, force: true });

    return NextResponse.json({ stdout: stdout || "", stderr: stderr || "" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}