"use client";
import { useState } from "react";

export default function AIPanel({ activeCode, language, onClose }: any) {
  const [messages, setMessages] = useState([{ role: "ai", text: "How can I help with your code?" }]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, code: activeCode, language })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "AI Offline." }]);
    }
  };

  return (
    <div className="w-full h-full bg-[#111] border border-purple-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="handle p-3 bg-purple-900/20 border-b border-white/5 flex items-center justify-between cursor-move">
        <span className="text-[10px] font-black text-purple-400 uppercase">AI Mentor</span>
        <button onClick={onClose} className="hover:text-red-500">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded-lg text-xs ${m.role === 'ai' ? 'bg-zinc-800' : 'bg-blue-600'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-[#1a1a1a] flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-black border border-white/10 rounded px-2 text-xs" placeholder="Ask..." />
        <button onClick={handleSend} className="bg-purple-600 px-3 py-1 rounded text-[10px] font-bold">SEND</button>
      </div>
    </div>
  );
}