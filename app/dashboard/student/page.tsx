"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();

  // Manual Join State
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [password, setPassword] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalName, setModalName] = useState("");
  const [modalPass, setModalPass] = useState("");

  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    fetch("/api/meetings")
      .then((res) => res.json())
      .then((data) => setAvailableClasses(data))
      .catch((err) => console.error("Error fetching classes:", err));
  }, []);

  const handleManualJoin = async () => {
    if (!name || !sessionId) return alert("Name and Session ID are required");

    const res = await fetch(`/api/meetings?sessionId=${sessionId}`);
    const meeting = await res.json();

    if (!res.ok || !meeting) return alert("Invalid Session ID. Class not found.");
    if (meeting.password && password !== meeting.password) return alert("Incorrect Password.");

    router.push(`/room?sessionId=${sessionId}&name=${name}&role=student`);
  };

  const openQuickJoinModal = (meeting: any) => {
    setModalData(meeting);
    setModalName(name); // Pre-fill with name if already typed in main box
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!modalName.trim()) return alert("Name is required");
    if (modalData.password && modalPass !== modalData.password) return alert("Incorrect Password");

    router.push(`/room?sessionId=${modalData.sessionId}&name=${modalName}&role=student`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white relative">
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#111]">
        <h1 className="text-xl font-black text-green-500 tracking-tighter uppercase">Student Portal</h1>
        <button onClick={() => router.push('/')} className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-md text-xs font-bold uppercase">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MANUAL JOIN */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black mb-6 text-green-500 italic">JOIN A CLASSROOM</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-black p-4 rounded-xl border border-white/10 outline-none focus:border-green-500 transition-all text-sm" />
                <input type="text" placeholder="Session ID (1776...)" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="bg-black p-4 rounded-xl border border-white/10 outline-none focus:border-green-500 transition-all text-sm font-mono" />
              </div>
              <input type="password" placeholder="Room Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black p-4 rounded-xl border border-white/10 outline-none focus:border-green-500 transition-all text-sm" />
              <button onClick={handleManualJoin} className="w-full bg-green-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 active:scale-95">Enter Room 🎓</button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="bg-[#111] p-6 rounded-3xl border border-white/5">
          <h2 className="text-[10px] font-black mb-6 text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Available Now
          </h2>
          <div className="space-y-3">
            {availableClasses.map((m: any) => (
              <div key={m.sessionId} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold">{m.tutorName}'s Class</p>
                  <span className="text-[8px] px-2 py-0.5 rounded-full font-black bg-green-500/10 text-green-500 uppercase italic">Live</span>
                </div>
                <button onClick={() => openQuickJoinModal(m)} className="w-full text-[10px] bg-zinc-800 py-2.5 rounded-lg font-black uppercase group-hover:bg-green-600 transition-all">Quick Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🛡️ THEMED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#161b22] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.1)] animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-1 text-green-500 italic">SECURE ACCESS</h3>
            <p className="text-zinc-500 text-xs mb-6 uppercase tracking-wider">Joining: {modalData?.tutorName}'s Room</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-600 ml-1 uppercase">Identify Yourself</label>
                <input type="text" value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="Full Name" className="w-full bg-black p-3.5 rounded-xl border border-white/10 focus:border-green-500 outline-none transition-all" />
              </div>

              {modalData?.password && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1 uppercase">Enter Room Key</label>
                  <input type="password" value={modalPass} onChange={(e) => setModalPass(e.target.value)} placeholder="••••••••" className="w-full bg-black p-3.5 rounded-xl border border-white/10 focus:border-green-500 outline-none transition-all" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-zinc-500 hover:text-white transition-all">Cancel</button>
                <button onClick={handleModalSubmit} className="flex-[2] bg-green-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all">Confirm Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}