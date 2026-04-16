"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Authentication failed");
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);

      // Redirect based on role returned from the server (or current state)
      const userRole = data.role || role;
      router.push(`/dashboard/${userRole}`);
      
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-[#111] border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 shadow-lg">
              <span className="text-xl">🚀</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              {isLogin ? "Enter your credentials to continue" : "Join the future of collaborative learning"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                className="w-full p-3.5 bg-black border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full p-3.5 bg-black border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role Selection (Only for Register) */}
            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">I am a...</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3.5 bg-black border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs">
              {isLogin ? "New to CodeClass?" : "Already have an account?"}{" "}
              <span
                className="text-blue-500 font-bold cursor-pointer hover:underline ml-1"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Register now" : "Login here"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}