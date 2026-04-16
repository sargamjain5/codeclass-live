"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Trash2, Code2, Terminal as TerminalIcon, Copy, Check } from "lucide-react";

interface CodeEditorProps {
  code: string;
  setCode: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  roomId: string;
  onRun?: (data: { code: string; output: string; language: string }) => void;
}

export default function CodeEditor({ code, setCode, language, setLanguage, onRun }: CodeEditorProps) {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("> Compiling on local Docker engine...");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput(`> System Error: ${data.error}`);
      } else {
        // Show stderr if stdout is empty (common for syntax errors)
        const result = data.stderr || data.stdout || "Success (No Output)";
        setOutput(result);
        
        if (onRun) {
          onRun({ code, output: result, language });
        }
      }
    } catch (err) {
      setOutput("> Error: Local server connection failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-zinc-300 font-sans overflow-hidden">
      {/* TOOLBAR */}
      <div className="h-12 border-b border-white/5 bg-[#1a1a1a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Code2 size={16} className="text-blue-500" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={copyCode} className="p-2 hover:bg-white/5 rounded-lg">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 text-white disabled:bg-zinc-800 transition-all"
          >
            <Play size={12} fill="currentColor" />
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            automaticLayout: true,
            // backgroundColor removed to fix previous error
          }}
        />
      </div>

      {/* TERMINAL */}
      <div className="h-1/3 border-t border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="h-10 border-b border-white/5 flex items-center px-4 bg-black/40">
          <TerminalIcon size={14} className="text-zinc-500 mr-2" />
          <span className="text-[10px] font-black uppercase text-zinc-500">Terminal Output</span>
        </div>
        <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-zinc-300">{output || "No output yet..."}</pre>
        </div>
      </div>
    </div>
  );
}