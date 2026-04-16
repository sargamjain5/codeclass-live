"use client";

import { useState, useEffect } from "react";

export default function ProfessorReviewTab({ lastRunData }: { lastRunData: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lastRunData?.code) {
      handleGenerateReview(lastRunData);
    }
  }, [lastRunData]);

  const handleGenerateReview = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/professor-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      const newNotif = { ...result, id: Date.now() };
      setNotifications((prev) => [newNotif, ...prev]);

      // Auto-remove notification after 15 seconds to keep screen clean
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
      }, 15000);
    } catch (err) {
      console.error("Review Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* 🔵 LOADING INDICATOR (Top Right) */}
      {loading && (
        <div className="fixed top-20 right-6 z-[100] flex items-center gap-3 bg-blue-600 px-4 py-2 rounded-full shadow-lg shadow-blue-500/40 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Analyzing Code...</span>
        </div>
      )}

      {/* 🔔 NOTIFICATION POPUP STACK */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map((rev) => (
          <div 
            key={rev.id} 
            className="pointer-events-auto bg-[#161b22] border border-white/10 p-5 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 relative group overflow-hidden"
          >
            {/* Progress Bar (Visual Timer) */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-shrink-width" style={{ animationDuration: '15s' }} />

            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Professor Insight</span>
              </div>
              <button 
                onClick={() => removeNotif(rev.id)}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3 mb-3">
               <div className={`text-lg font-black ${rev.rating === 'A' ? 'text-green-500' : 'text-yellow-500'}`}>
                 {rev.rating}
               </div>
               <div className="flex-1">
                 <h3 className="text-xs font-bold text-white leading-tight">{rev.summary}</h3>
               </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed italic border-l-2 border-blue-500 pl-3 mb-3">
              "{rev.feedback}"
            </p>

            <div className="flex flex-wrap gap-1">
              {rev.missingConcepts?.map((c: string) => (
                <span key={c} className="text-[8px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded border border-white/5 font-bold uppercase">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}