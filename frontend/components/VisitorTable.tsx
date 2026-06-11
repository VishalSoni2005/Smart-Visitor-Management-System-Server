"use client";

import React, { useState, useMemo } from "react";
import { Search, Calendar, FileText, ChevronRight, X, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { Visitor } from "@/shared/types";

interface VisitorTableProps {
  visitors: Visitor[];
}

type DateFilterType = "today" | "week" | "all";

export default function VisitorTable({ visitors }: VisitorTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  // Filter visitors by search query and date
  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      // 1. Text Search Filter (name, hostName, phone)
      const text = searchQuery.toLowerCase().trim();
      const matchesText =
        !text ||
        visitor.name.toLowerCase().includes(text) ||
        visitor.hostName.toLowerCase().includes(text) ||
        visitor.phone.includes(text);

      // 2. Date Filter
      if (!matchesText) return false;

      if (dateFilter === "all") return true;

      const checkInDate = new Date(visitor.checkInTime);
      const now = new Date();

      if (dateFilter === "today") {
        return checkInDate.toDateString() === now.toDateString();
      }

      if (dateFilter === "week") {
        // Within last 7 days
        const diffTime = Math.abs(now.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      return true;
    });
  }, [visitors, searchQuery, dateFilter]);

  // Export current filtered list as CSV
  const exportToCSV = () => {
    if (filteredVisitors.length === 0) return;

    const headers = [
      "Visitor ID",
      "Name",
      "Phone",
      "Email",
      "Purpose",
      "Host Employee",
      "Host Department",
      "Status",
      "Check-In Time",
      "Check-Out Time",
      "Token",
    ];

    const rows = filteredVisitors.map((v) => [
      v.visitorId,
      `"${v.name.replace(/"/g, '""')}"`,
      `"${v.phone}"`,
      v.email ? `"${v.email}"` : "",
      v.purpose,
      `"${v.hostName.replace(/"/g, '""')}"`,
      `"${v.hostDepartment.replace(/"/g, '""')}"`,
      v.status,
      v.checkInTime,
      v.checkOutTime || "",
      v.visitorToken,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `visitor_log_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDurationText = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Active Session";
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-250/60 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all duration-150"
          />
        </div>

        {/* Date Filter & Export */}
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400 ml-1.5" />
            {(["all", "today", "week"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  dateFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:text-slate-900 text-slate-500"
                }`}
              >
                {filter === "all" ? "All" : filter === "week" ? "Week" : "Today"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={filteredVisitors.length === 0}
            className="flex items-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold rounded-xl text-slate-700 transition duration-150 shadow-sm"
          >
            <FileText className="h-4 w-4" />
            CSV Export
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-250/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="py-4 px-5">Photo</th>
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Phone</th>
                <th className="py-4 px-5">Purpose</th>
                <th className="py-4 px-5">Host Employee</th>
                <th className="py-4 px-5">Check-In</th>
                <th className="py-4 px-5">Check-Out</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No visitor logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.visitorId}
                    onClick={() => setSelectedVisitor(visitor)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={visitor.photoUrl}
                        alt={visitor.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 group-hover:border-slate-350 transition-colors"
                      />
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900 truncate max-w-[150px]">
                      {visitor.name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-655 font-mono text-xs">
                      {visitor.phone}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {visitor.purpose}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-[160px] truncate">
                      <div className="font-semibold text-slate-800">{visitor.hostName}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{visitor.hostDepartment}</div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-550">
                      {new Date(visitor.checkInTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(visitor.checkInTime).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-550">
                      {visitor.checkOutTime ? (
                        <>
                          {new Date(visitor.checkOutTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(visitor.checkOutTime).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {visitor.status === "checked-in" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Inside
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-105 text-slate-500 border border-slate-200">
                          Checked Out
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedVisitor(visitor)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors duration-150 p-1 px-2.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/30 rounded-lg"
                      >
                        Details
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side-Drawer / Modal Overlay */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedVisitor(null)}
          ></div>

          {/* Drawer Container */}
          <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10 text-slate-800 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Visitor Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo & Token */}
              <div className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedVisitor.photoUrl}
                  alt={selectedVisitor.name}
                  className="w-32 h-32 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-md mb-3"
                />
                <h4 className="text-xl font-bold text-slate-900">{selectedVisitor.name}</h4>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Token:</span>
                  <span className="text-sm font-bold text-blue-600 font-mono tracking-wider">
                    {selectedVisitor.visitorToken}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                {selectedVisitor.status === "checked-in" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Currently Inside
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    Checked Out
                  </span>
                )}
              </div>

              {/* Data Items */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 divide-y divide-slate-200/80 text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Phone Number</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedVisitor.phone}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Email Address</span>
                  <span className="text-slate-800 font-bold truncate max-w-[200px]">
                    {selectedVisitor.email || <span className="text-slate-450 font-normal italic">None provided</span>}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Purpose of Visit</span>
                  <span className="text-slate-800 font-bold">{selectedVisitor.purpose}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Host Employee</span>
                  <span className="text-slate-800 font-bold">{selectedVisitor.hostName}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Host Department</span>
                  <span className="text-slate-800 font-bold">{selectedVisitor.hostDepartment}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Check-In Time</span>
                  <span className="text-slate-800 font-bold text-right">
                    {new Date(selectedVisitor.checkInTime).toLocaleString()}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Check-Out Time</span>
                  <span className="text-slate-800 font-bold text-right">
                    {selectedVisitor.checkOutTime ? (
                      new Date(selectedVisitor.checkOutTime).toLocaleString()
                    ) : (
                      <span className="text-slate-450 font-normal italic">Active session</span>
                    )}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500 font-semibold">Visit Duration</span>
                  <span className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {getDurationText(selectedVisitor.checkInTime, selectedVisitor.checkOutTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50">
              <a
                href={selectedVisitor.gatePassUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-150 shadow-sm"
              >
                View PDF Gate Pass
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
