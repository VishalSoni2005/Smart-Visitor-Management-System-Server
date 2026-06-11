/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShieldAlert, Loader2, ArrowRight, Home } from "lucide-react";
import { api } from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  // If already authenticated, bypass login screen
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return toast.error("Please enter both email and password.");
    }

    setLoading(true);
    const toastId = toast.loading("Authenticating admin access...");

    try {
      const response = await api.post<{ token: string; email: string }>("/auth/login", {
        email: email.trim(),
        password,
      });

      if (response.success && response.data) {
        setToken(response.data.token, response.data.email);
        toast.success("Login successful!", { id: toastId });
        router.push("/admin/dashboard");
      } else {
        toast.error(response.error || "Invalid administrative credentials.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An authentication error occurred.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-slate-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-slate-250/60 rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center border-b border-slate-100 pb-6 mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4 border border-amber-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
            Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            Authorization required. Enter security credentials to access dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-5 border-t border-slate-100 mt-5">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium"
          >
            <Home className="h-3.5 w-3.5" />
            Return to Check-In Portal
          </a>
        </div>
      </div>

      <div className="mt-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-xs leading-relaxed">
        Credentials Seeded:<br />
        <span className="font-mono text-slate-500 lowercase">admin@company.com</span> / <span className="font-mono text-slate-500">admin123</span>
      </div>
    </main>
  );
}
