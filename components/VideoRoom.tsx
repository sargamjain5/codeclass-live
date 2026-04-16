"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Draggable from "react-draggable";
import CodeEditor from "./CodeEditor";
import AIPanel from "./AIPanel";
import ProfessorReviewTab from "./ProfessorReviewTab"; 

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const nodeRef = useRef(null);

  const [showEditor, setShowEditor] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("python");
  const [lastRunData, setLastRunData] = useState<any>(null);

  const sessionId = searchParams.get("sessionId") || "test-room";
  const role = searchParams.get("role") || "student";
  const userName = searchParams.get("name") || "Anonymous";

  const handleCodeExecution = (executionData: { code: string; output: string; language: string }) => {
    setLastRunData({ ...executionData, studentName: userName });
  };

  useEffect(() => {
    let isMounted = true;

    const initVideo = async () => {
      try {
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
        if (!isMounted || !containerRef.current) return;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          1229551732, 
          "40990824d9dff7f992df09ab658c72dd", 
          sessionId, 
          Date.now().toString(), 
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          showPreJoinView: false,
          turnOnCameraWhenJoining: true,
          showUserList: true,
          onLeaveRoom: () => {
            if (zpRef.current) {
              try {
                zpRef.current.destroy();
              } catch (e) {
                console.warn("Zego internal cleanup handled");
              } finally {
                zpRef.current = null;
                router.replace(`/dashboard/${role}`);
              }
            }
          },
        });
      } catch (e) {
        console.error("Zego Initialization Failed:", e);
      }
    };

    initVideo();

    return () => {
      isMounted = false;
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (e) {
          console.log("Cleanup handled on unmount");
        } finally {
          zpRef.current = null;
        }
      }
    };
  }, [sessionId, role, router, userName]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white relative overflow-hidden">
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d1117]/80 backdrop-blur-md z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] font-black">C</div>
            <h1 className="text-xs font-black uppercase tracking-widest text-zinc-200">Live Classroom</h1>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Room: {sessionId}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditor(!showEditor)} className="px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/20">
            {showEditor ? "HIDE EDITOR" : "SHOW EDITOR"}
          </button>
          <button onClick={() => setShowAI(!showAI)} className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
            AI TUTOR
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`transition-all duration-500 ease-in-out border-r border-white/5 bg-[#1e1e1e] shadow-2xl z-20 ${showEditor ? "w-1/2" : "w-0 overflow-hidden"}`}>
          <CodeEditor 
            code={code} setCode={setCode} language={language} setLanguage={setLanguage} 
            roomId={sessionId} onRun={handleCodeExecution}
          />
        </div>
        <div className="flex-1 bg-black relative z-10">
          <div className="absolute inset-0" ref={containerRef} />
        </div>
        {role === "tutor" && <ProfessorReviewTab lastRunData={lastRunData} />}
      </div>

      {showAI && (
        <Draggable nodeRef={nodeRef} handle=".handle" bounds="parent">
          <div ref={nodeRef} className="absolute top-20 right-10 w-85 h-[550px] z-[9999]">
            <AIPanel activeCode={code} language={language} onClose={() => setShowAI(false)} />
          </div>
        </Draggable>
      )}
    </div>
  );
}

export default function VideoRoom() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center font-bold text-white">PREPARING CLASSROOM...</div>}>
      <RoomContent />
    </Suspense>
  );
}