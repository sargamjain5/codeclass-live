"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function JoinPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = params.get("sessionId");
    const name = params.get("name") || "User";

    if (sessionId) {
      router.push(`/room?sessionId=${sessionId}&name=${name}`);
    }
  }, []);

  return <div>Joining...</div>;
}