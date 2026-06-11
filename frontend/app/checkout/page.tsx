/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { LogOut, ArrowRight, Loader2, Landmark, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Visitor } from "@/shared/types";

// Inner checkout form that reads from search parameters
function CheckoutForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    visitor: Visitor;
    durationText: string;
  } | null>(null);

  // Autofill token from URL
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken.toUpperCase());
    }
  }, [searchParams]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      return toast.error("Please enter your 6-character visitor token.");
    }

    setLoading(true);
    const toastId = toast.loading("Checking out...");

    try {
      const response = await api.patch<{ visitor: Visitor; durationText: string }>(
        `/visitors/${token.trim()}/checkout`
      );

      if (response.success && response.data) {
        toast.success("Checked out successfully!", { id: toastId });
        setCheckoutData(response.data);
        
        // Trigger a nice confetti explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#10B981", "#555555"],
        });
      } else {
        toast.error(response.error || "Invalid token. Please check and try again.", {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during check-out.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setToken("");
    setCheckoutData(null);
  };

  if (checkoutData) {
    return (
      <div className="text-center py-6 px-4">
        <div className="flex justify-center mb-4 text-emerald-600">
          <CheckCircle className="h-14 w-14 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Check-Out Successful</h2>
        
        <p className="text-slate-700 mt-4 text-lg">
          Thank you, <span className="font-extrabold text-blue-600">{checkoutData.visitor.name}</span>!
        </p>
        
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Your stay has been recorded. Your visit lasted{" "}
          <span className="font-bold text-slate-800">{checkoutData.durationText}</span>.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl transition duration-150 text-sm shadow-sm"
          >
            Check Out Another Visitor
          </button>
          <a
            href="/"
            className="text-xs text-blue-600 hover:text-blue-500 font-semibold transition"
          >
            Back to Visitor Registration
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      <div>
        <label htmlFor="token" className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-2">
          Visitor Token <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="token"
          required
          maxLength={6}
          placeholder="Enter 6-char token (e.g. A3F9X1)"
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white font-extrabold tracking-widest text-xl font-mono transition-all duration-150"
        />
        <p className="text-[11px] text-slate-450 mt-2 text-center">
          You can find this token printed on your paper gate pass or beneath the QR code.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-blue-500/25"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Validating Token...
          </>
        ) : (
          <>
            Check Out
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <a
          href="/"
          className="text-xs text-slate-450 hover:text-slate-655 transition font-medium"
        >
          Need to register? Go to Check-In
        </a>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-slate-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-slate-250/60 rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center border-b border-slate-100 pb-6 mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-650 mb-4 border border-blue-500/20">
            <LogOut className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
            Visitor Check-Out
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Enter your token below to register your departure from the company premises.
          </p>
        </div>

        {/* Suspense Wrapper for SearchParams */}
        <Suspense
          fallback={
            <div className="flex justify-center py-6 text-slate-550 text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Loading token data...
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>
      </div>

      <div className="mt-8 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Landmark className="h-3.5 w-3.5" />
        Corporate HQ Security Portal
      </div>
    </main>
  );
}
