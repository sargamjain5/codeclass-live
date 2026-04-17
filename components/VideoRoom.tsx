"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Draggable from "react-draggable";
import { getSocket } from "@/lib/socket";
import CodeEditor from "./CodeEditor";
import AIPanel from "./AIPanel";
import ProfessorReviewTab from "./ProfessorReviewTab";
import ArchitectureVisualizer from "./ArchitectureVisualizer";
import { Loader2, Code, MessageSquare, ShieldAlert, Monitor, Layout, LogOut } from "lucide-react";
import { Node, Edge } from 'reactflow';

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const nodeRef = useRef(null);

  // Layout State
  const [showEditor, setShowEditor] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "visualizer">("code");

  // Logic States
  const [code, setCode] = useState("// Start coding your solution...");
  const [language, setLanguage] = useState("python");
  const [lastRunData, setLastRunData] = useState<any>(null);

  // Lifted Visualizer State
  const [vizNodes, setVizNodes] = useState<Node[]>([]);
  const [vizEdges, setVizEdges] = useState<Edge[]>([]);

  // URL Params
  const sessionId = searchParams.get("sessionId") || "test-room";
  const role = searchParams.get("role") || "student";
  const userName = searchParams.get("name") || "Anonymous User";

  // --- SOCKETS ---
  useEffect(() => {
    socketRef.current = getSocket();
    socketRef.current.emit("join-room", sessionId);
    
    socketRef.current.on("student-code-executed", (data: any) => {
      if (role === "tutor") setLastRunData(data);
    });

    return () => {
      socketRef.current?.off("student-code-executed");
    };
  }, [sessionId, role]);

  const handleCodeExecution = useCallback((executionData: { code: string; output: string; language: string }) => {
    const dataToSend = { ...executionData, studentName: userName, sessionId };
    setLastRunData(dataToSend);
    if (role === "student" && socketRef.current) {
      socketRef.current.emit("code-run", dataToSend);
    }
  }, [userName, sessionId, role]);

  // --- ZEGO VIDEO (FIXED INIT) ---
  useEffect(() => {
    let isMounted = true;
    
    const initVideo = async () => {
      try {
        if (!isMounted || !containerRef.current) return;
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

        if (zpRef.current) {
          // Disable redirect callback before manual cleanup to prevent "Left Room" trigger
          zpRef.current.onReturnToHomeScreenClicked = null;
          zpRef.current.destroy();
          zpRef.current = null;
        }

        const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID) || 1229551732;
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "40990824d9dff7f992df09ab658c72dd";
        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, serverSecret, sessionId, Date.now().toString(), userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
          showPreJoinView: false,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showAudioVideoSettingsButton: true,
          onReturnToHomeScreenClicked: () => {
            // Only redirect if the user clicked the exit button, not on re-renders
            router.push(`/dashboard/${role}`);
          },
        });
      } catch (e) {
        console.error("Zego Init Error:", e);
      }
    };

    initVideo();

    return () => {
      isMounted = false;
      if (zpRef.current) {
        zpRef.current.onReturnToHomeScreenClicked = null;
        try { zpRef.current.destroy(); } catch (e) {}
      }
    };
  }, [sessionId, role, router, userName]); 
  // ⚠️ Removed activeTab from dependencies so it doesn't re-init on toggle

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white relative overflow-hidden">
      
      {/* NAVIGATION */}
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a] z-[60]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-widest">CodeClass Live</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                activeTab === "code" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Monitor size={12} /> Editor
            </button>
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                activeTab === "visualizer" ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Layout size={12} /> Visualizer
            </button>
          </div>

          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/20 hover:bg-white/5 transition-all"
          >
            {showEditor ? "Fullscreen Video" : "Split View"}
          </button>

          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            <MessageSquare className="w-3 h-3" /> AI Tutor
          </button>

          <Link href={`/dashboard/${role}`} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white text-black flex items-center gap-2">
            <LogOut size={12} /> Leave
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL: Persisted DOM via CSS visibility */}
        <div className={`transition-all duration-500 border-r border-white/5 bg-[#0d0d0d] shadow-2xl z-20 ${
          showEditor ? "w-1/2" : "w-0 overflow-hidden"
        }`}>
          {/* EDITOR WRAPPER */}
          <div className={`h-full w-full ${activeTab === "code" ? "block" : "hidden"}`}>
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              roomId={sessionId}
              onRun={handleCodeExecution}
            />
          </div>

          {/* VISUALIZER WRAPPER */}
          <div className={`h-full w-full ${activeTab === "visualizer" ? "block" : "hidden"}`}>
            <ArchitectureVisualizer 
              roomId={sessionId} 
              nodes={vizNodes}
              setNodes={setVizNodes}
              edges={vizEdges}
              setEdges={setVizEdges}
            />
          </div>
        </div>

        {/* RIGHT PANEL: Zego Video (Now stable) */}
        <div className="flex-1 bg-black relative z-10">
          <div className="absolute inset-0" ref={containerRef} />
        </div>

        {role === "tutor" && <ProfessorReviewTab lastRunData={lastRunData} />}
      </main>

      {showAI && (
        <Draggable nodeRef={nodeRef} handle=".handle" bounds="parent">
          <div ref={nodeRef} className="absolute top-20 right-10 w-[400px] h-[600px] z-[100] shadow-2xl">
            <AIPanel activeCode={code} language={language} onClose={() => setShowAI(false)} />
          </div>
        </Draggable>
      )}
    </div>
  );
}

export default function VideoRoom() {
  return (
    <Suspense fallback={
        <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Establishing Stream</p>
        </div>
      }>
      <RoomContent />
    </Suspense>
  );
}