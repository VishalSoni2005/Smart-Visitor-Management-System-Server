"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Landmark,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { isAuthenticated, removeToken, getAdminEmail } from "@/lib/auth";
import { Visitor } from "@/shared/types";
import StatsCards from "@/components/StatsCards";
import VisitorTable from "@/components/VisitorTable";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Authenticate Admin Session
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/login");
    } else {
      setAdminEmail(getAdminEmail());
    }
  }, [router]);

  // Load visitor log data
  const loadVisitors = useCallback(
    async (showRefreshingState = false) => {
      if (showRefreshingState) setRefreshing(true);

      try {
        const response = await api.get<Visitor[]>("/visitors");

        if (response.success && response.data) {
          setVisitors(response.data);
        } else {
          // Handle expiration or unauthorized state
          if (response.error?.includes("Unauthorized")) {
            removeToken();
            toast.error("Session expired. Please sign in again.");
            router.push("/admin/login");
          } else {
            toast.error(response.error || "Failed to retrieve logs.");
          }
        }
      } catch (err: any) {
        toast.error(
          err.message || "An error occurred fetching dashboard logs.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  // Trigger initial fetch
  useEffect(() => {
    if (isAuthenticated()) {
      loadVisitors();
    }
  }, [loadVisitors]);

  // Auto-refresh logs every 30 seconds
  useEffect(() => {
    if (!isAuthenticated()) return;

    const interval = setInterval(() => {
      loadVisitors(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadVisitors]);

  const handleSignOut = () => {
    removeToken();
    toast.success("Signed out successfully.");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Loading admin environment...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-250/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600 border border-blue-200">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                vTrace Admin Dashboard
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Authorized:{" "}
                <span className="font-mono text-slate-600 lowercase font-normal">
                  {adminEmail}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => loadVisitors(true)}
              disabled={refreshing}
              className="p-3 bg-white hover:bg-slate-55 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition duration-150 relative disabled:opacity-50 shadow-sm"
              title="Refresh logs"
            >
              <RefreshCw
                className={`h-4.5 w-4.5 ${refreshing ? "animate-spin text-blue-600" : ""}`}
              />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-600/20 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition duration-150 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Stats KPIs Grid */}
        <StatsCards visitors={visitors} />

        {/* Main Logs Table Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
              Live Visitor Log
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-refreshes every 30s
            </span>
          </div>
          <VisitorTable visitors={visitors} />
        </div>
      </div>
    </main>
  );
}
