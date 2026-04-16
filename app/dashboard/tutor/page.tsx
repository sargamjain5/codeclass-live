"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorDashboard() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [startTime, setStartTime] = useState("");
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to keep statuses fresh
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch("/api/meetings");
        const data = await res.json();
        if (res.ok) setPastMeetings(data);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
      }
    };
    fetchMeetings();
    const savedName = localStorage.getItem("tutorName");
    if (savedName) setName(savedName);
  }, []);

  // --- NEW STATUS LOGIC ---
  const getMeetingStatus = (startStr: string) => {
    const start = new Date(startStr);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later
    const now = currentTime;

    if (now < start) {
      return { label: "UPCOMING", color: "bg-blue-500/10 text-blue-400" };
    } else if (now >= start && now <= end) {
      return { label: "LIVE NOW", color: "bg-green-500/10 text-green-500 animate-pulse" };
    } else {
      return { label: "OVER / ENDED", color: "bg-zinc-800 text-zinc-500" };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tutorName");
    router.push("/");
  };

  const handleSchedule = async (isLiveNow = false) => {
    if (!name.trim()) return alert("Please enter your display name");
    if (!isLiveNow && !startTime) return alert("Please select a schedule time");

    setLoading(true);
    localStorage.setItem("tutorName", name);

    const sessionId = Date.now().toString();
    const scheduledDate = isLiveNow ? new Date() : new Date(startTime);

    const meetingData = {
      tutorName: name,
      sessionId,
      password,
      startTime: scheduledDate,
      status: isLiveNow ? "live" : "scheduled", // We still save this, but UI uses time-based logic
    };

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (res.ok) {
        if (isLiveNow) {
          router.push(`/room?sessionId=${sessionId}&name=${name}&role=tutor&pass=${password}`);
        } else {
          alert("Meeting Scheduled Successfully!");
          const updated = await fetch("/api/meetings").then(r => r.json());
          setPastMeetings(updated);
        }
      }
    } catch (err) {
      alert("Error saving meeting to database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#111]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">C</div>
          <h1 className="text-lg font-black tracking-tighter uppercase">Tutor <span className="text-blue-500">Console</span></h1>
        </div>
        <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase">Logout</button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-black mb-8">Setup Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <input type="text" placeholder="Tutor Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 transition-all" />
                <input type="password" placeholder="Password (Optional)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 transition-all" />
            </div>

            <div className="space-y-3 mb-10">
              <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Schedule Timing</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={() => setStartTime(new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16))} className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-bold uppercase hover:border-blue-500/50">+30 Min</button>
                    <button onClick={() => setStartTime(new Date(Date.now() + 24 * 60 * 60000).toISOString().slice(0, 16))} className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-bold uppercase hover:border-blue-500/50">Tomorrow</button>
                  </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button disabled={loading} onClick={() => handleSchedule(true)} className="flex-[2] bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">START INSTANT</button>
              <button disabled={loading} onClick={() => handleSchedule(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-5 rounded-2xl font-black text-sm tracking-widest transition-all">SCHEDULE</button>
            </div>
          </div>
        </div>

        {/* RIGHT: HISTORY PANEL WITH DYNAMIC STATUS */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-3xl border border-white/5 shadow-2xl h-[600px] flex flex-col">
            <h2 className="text-xs font-black mb-6 text-zinc-500 uppercase tracking-[0.2em]">Meeting History</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {pastMeetings.length > 0 ? pastMeetings.map((m: any) => {
                const statusInfo = getMeetingStatus(m.startTime);
                return (
                  <div key={m.sessionId} className="p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <p className="text-[10px] font-mono text-zinc-600 tracking-tighter">ID: {m.sessionId}</p>
                    </div>
                    <p className="text-xs font-bold text-zinc-200">{new Date(m.startTime).toLocaleDateString()} @ {new Date(m.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    
                    {/* Only allow rejoining if the meeting isn't "Over" */}
                    {statusInfo.label !== "OVER / ENDED" && (
                      <button 
                        onClick={() => router.push(`/room?sessionId=${m.sessionId}&name=${name}&role=tutor`)}
                        className="mt-4 w-full text-[10px] bg-white text-black py-2.5 rounded-xl font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                      >
                        Join Room
                      </button>
                    )}
                  </div>
                );
              }) : (
                <p className="text-center text-[10px] font-bold uppercase opacity-20 mt-10 tracking-widest">No meetings yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}