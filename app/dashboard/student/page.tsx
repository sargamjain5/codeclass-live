"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Shield, Activity, LogOut, ArrowRight, 
  Gamepad2, Clock, Lock, Monitor, Copy, Check, Calendar 
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [password, setPassword] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modal & Data States
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

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Logic for Manual Join (with lockout) ---
  const handleManualJoin = async () => {
    if (!name || !sessionId) return alert("Name and Session ID are required");
    
    try {
      const res = await fetch(`/api/meetings?sessionId=${sessionId}`);
      const meeting = await res.json();

      if (!res.ok || !meeting) return alert("Invalid Session ID.");

      // BLOCK ENTRY IF OVER 1 HOUR
      const startTime = new Date(meeting.createdAt).getTime();
      const isExpired = Date.now() - startTime > 60 * 60 * 1000;
      
      if (isExpired) {
        alert("This session has expired and is no longer accessible.");
        return;
      }

      if (meeting.password && password !== meeting.password) {
        return alert("Incorrect Password.");
      }
      
      router.push(`/room?sessionId=${sessionId}&name=${name}&role=student`);
    } catch (e) {
      alert("Error joining session.");
    }
  };

  const openQuickJoinModal = (meeting: any) => {
    setModalData(meeting);
    setModalName(name);
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!modalName.trim()) return alert("Name is required");
    
    // Safety check for Quick Join lockout
    const startTime = new Date(modalData.createdAt).getTime();
    if (Date.now() - startTime > 60 * 60 * 1000) {
      alert("This session has expired.");
      setIsModalOpen(false);
      return;
    }
    
    if (modalData.password && modalPass !== modalData.password) return alert("Incorrect Password");
    router.push(`/room?sessionId=${modalData.sessionId}&name=${modalName}&role=student`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative font-sans overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
      
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase leading-none">Terminal</h1>
            <span className="text-[8px] text-zinc-500 font-mono mt-1">V2.0.4 // STUDENT_ACCESS</span>
          </div>
        </div>
        
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-all text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <LogOut size={12} /> Disconnect
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">
        
        {/* LEFT PANEL: DIRECT LINK */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-zinc-900/20 p-10 rounded-[40px] border border-white/5 backdrop-blur-md relative flex-1 flex flex-col justify-center shadow-2xl">
            <div className="mb-10">
              <h2 className="text-4xl font-black mb-2 italic tracking-tighter uppercase">Direct Link</h2>
              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.3em]">Establish Point-to-Point Protocol</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Alias</label>
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/60 p-4 rounded-2xl border border-white/5 outline-none focus:border-green-500/50 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Protocol ID</label>
                  <input type="text" placeholder="SESSION_ID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="w-full bg-black/60 p-4 rounded-2xl border border-white/5 outline-none focus:border-green-500/50 transition-all text-sm font-mono uppercase" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Secure Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/60 p-4 pl-12 rounded-2xl border border-white/5 outline-none focus:border-green-500/50 transition-all text-sm" />
                </div>
              </div>

              <button onClick={handleManualJoin} className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-green-500 hover:text-white transition-all shadow-xl active:scale-[0.98] mt-4">
                Initiate Handshake <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SESSION FEED (Scrollable & Expiry Logic) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-zinc-900/10 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-green-500" /> Session Feed
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Live Monitor</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {availableClasses.length > 0 ? (
              availableClasses.map((m: any) => {
                // CALC EXPIRY
                const startTime = new Date(m.createdAt).getTime();
                const isExpired = Date.now() - startTime > 60 * 60 * 1000;

                return (
                  <div 
                    key={m.sessionId} 
                    className={`border rounded-3xl p-5 transition-all group ${
                      isExpired 
                        ? "bg-zinc-900/10 border-white/5 opacity-50 grayscale" 
                        : "bg-black/40 border-white/5 hover:border-green-500/30 shadow-xl"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isExpired ? "bg-zinc-800 border-white/5" : "bg-white/5 border-white/10 group-hover:border-green-500/30"
                        }`}>
                          <User size={18} className={isExpired ? "text-zinc-600" : "text-zinc-500 group-hover:text-green-500"} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight">{m.tutorName}'s Lab</p>
                          {/* SHOW DATE AND TIME */}
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                            <Calendar size={10} /> {new Date(m.createdAt).toLocaleDateString()} // {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[7px] font-black px-2 py-1 rounded border uppercase tracking-[0.1em] ${
                        isExpired 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : "bg-green-500/10 text-green-500 border-green-500/20 animate-pulse"
                      }`}>
                        {isExpired ? "TERMINATED" : "ACTIVE"}
                      </span>
                    </div>

                    <div className="bg-black/60 rounded-xl p-3 flex items-center justify-between mb-4 border border-white/5 group-hover:border-green-500/10">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Monitor size={10} className="text-zinc-600 flex-shrink-0" />
                        <span className="text-[9px] font-mono text-zinc-400 truncate">{m.sessionId}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(m.sessionId)}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {copiedId === m.sessionId ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-zinc-600" />}
                      </button>
                    </div>

                    <button 
                      disabled={isExpired}
                      onClick={() => openQuickJoinModal(m)} 
                      className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 ${
                        isExpired 
                          ? "bg-zinc-900 text-zinc-700 cursor-not-allowed" 
                          : "bg-zinc-800 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      {isExpired ? "Session Terminated" : "Quick Entry"}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-3 opacity-40">
                <Clock size={32} />
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Broadcasts Detected</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-black/40 border-t border-white/5 text-center">
             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">All sessions auto-terminate after 60 mins</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,197,94,0.2); }
      `}</style>

      {/* ACCESS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-sm p-10 rounded-[48px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-green-600/10 rounded-2xl flex items-center justify-center mb-4 border border-green-500/20">
                <Shield className="text-green-500" size={28} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Authorized Access</h3>
              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] mt-2">{modalData?.tutorName}'s Terminal</p>
            </div>
            
            <div className="space-y-4">
              <input type="text" value={modalName} onChange={(e) => setModalName(e.target.value)} placeholder="Full Name" className="w-full bg-black/60 p-4 rounded-2xl border border-white/10 focus:border-green-500 outline-none transition-all text-sm" />
              {modalData?.password && (
                <input type="password" value={modalPass} onChange={(e) => setModalPass(e.target.value)} placeholder="Entry Passkey" className="w-full bg-black/60 p-4 rounded-2xl border border-white/10 focus:border-green-500 outline-none transition-all text-sm" />
              )}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-all">Abort</button>
                <button onClick={handleModalSubmit} className="flex-[2] bg-green-600 py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-green-600/20">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}