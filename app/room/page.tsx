"use client";

import VideoRoom from "@/components/VideoRoom";
import { Suspense } from "react";

export default function RoomPage() {
  return (
    // Suspense is required when using useSearchParams() in Next.js App Router
    <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading Room...</div>}>
      <VideoRoom />
    </Suspense>
  );
}