"use client";

import React from "react";
import { Users, LogIn, LogOut, Award } from "lucide-react";
import { Visitor } from "@/shared/types";

interface StatsCardsProps {
  visitors: Visitor[];
}

export default function StatsCards({ visitors }: StatsCardsProps) {
  const now = new Date();
  const todayStr = now.toDateString();

  // Helper to check if a ISO date is today
  const isToday = (isoString: string) => {
    try {
      return new Date(isoString).toDateString() === todayStr;
    } catch {
      return false;
    }
  };

  // Calculations
  const totalAllTime = visitors.length;
  
  const totalToday = visitors.filter((v) => isToday(v.checkInTime)).length;
  
  const currentlyInside = visitors.filter((v) => v.status === "checked-in").length;
  
  const checkedOutToday = visitors.filter(
    (v) => v.status === "checked-out" && v.checkOutTime && isToday(v.checkOutTime)
  ).length;

  const cardStats = [
    {
      title: "Currently Inside",
      value: currentlyInside,
      description: "Visitors in the building",
      icon: LogIn,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-100",
    },
    {
      title: "Checked In Today",
      value: totalToday,
      description: "Total check-ins today",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-100",
    },
    {
      title: "Checked Out Today",
      value: checkedOutToday,
      description: "Visitors who departed today",
      icon: LogOut,
      color: "text-slate-650",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-200",
    },
    {
      title: "Total All Time",
      value: totalAllTime,
      description: "Lifetime registered visits",
      icon: Award,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardStats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${stat.borderColor} bg-white shadow-sm flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 block tracking-wider uppercase">
                {stat.title}
              </span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {stat.description}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.color} shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
