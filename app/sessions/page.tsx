"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("sessions") || "[]");

    setSessions(data);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-4">Upcoming Sessions</h1>

      {sessions.map((s) => (
        <div key={s.id} className="border p-3 mb-3">
          <h2>{s.title}</h2>
          <p>{new Date(s.time).toLocaleString()}</p>

          <button
            onClick={() =>
              router.push(`/join?sessionId=${s.id}`)
            }
            className="bg-blue-600 px-3 py-1 mt-2"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}