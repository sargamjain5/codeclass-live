"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0d1117] text-white">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-8">
        🚀 CodeClass Live
      </h1>

      <p className="text-gray-400 mb-6">
        Choose your role
      </p>

      <div className="flex gap-6">

        {/* TUTOR */}
        <button
          onClick={() => router.push("/dashboard/tutor")}
          className="bg-blue-600 px-6 py-3 rounded text-lg hover:bg-blue-700 transition"
        >
          👨‍🏫 Tutor
        </button>

        {/* STUDENT */}
        <button
          onClick={() => router.push("/dashboard/student")}
          className="bg-green-600 px-6 py-3 rounded text-lg hover:bg-green-700 transition"
        >
          👨‍🎓 Student
        </button>

      </div>
    </div>
  );
}