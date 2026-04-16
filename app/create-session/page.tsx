"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSession() {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const createSession = () => {
    if (!title || !time || !password) {
      return alert("Fill all fields");
    }

    const sessions =
      JSON.parse(localStorage.getItem("sessions") || "[]");

    const newSession = {
      id: Date.now().toString(),
      title,
      time,
      password,
    };

    localStorage.setItem(
      "sessions",
      JSON.stringify([...sessions, newSession])
    );

    alert("Session scheduled!");

    router.push("/dashboard");
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-4">Create Session</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-3 p-2 bg-gray-900"
      />

      <input
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="block mb-3 p-2 bg-gray-900"
      />

      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block mb-3 p-2 bg-gray-900"
      />

      <button
        onClick={createSession}
        className="bg-blue-600 px-4 py-2"
      >
        Schedule
      </button>
    </div>
  );
}