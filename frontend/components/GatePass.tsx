"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, CheckCircle, Calendar, User, Phone, Briefcase } from "lucide-react";
import { Visitor } from "@/shared/types";

interface GatePassProps {
  visitor: Visitor;
}

export default function GatePass({ visitor }: GatePassProps) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    // Generate checkout QR code client-side
    const checkoutUrl = `${window.location.origin}/checkout?token=${visitor.visitorToken}`;
    QRCode.toDataURL(checkoutUrl, { margin: 1, width: 200 })
      .then((url) => setQrSrc(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [visitor.visitorToken]);

  const formattedDate = new Date(visitor.checkInTime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-xl text-slate-900">
      {/* Confirmation Banner */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600 mb-3 animate-pulse">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-emerald-600">Check-In Complete</h2>
        <p className="text-sm text-slate-500 mt-1">Welcome! Your visitor gate pass has been issued.</p>
      </div>

      {/* Gate Pass Card Visual */}
      <div className="w-full relative border border-slate-200 rounded-2xl bg-slate-50 shadow-inner overflow-hidden mb-6">
        {/* Pass Header */}
        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-black tracking-widest text-blue-600 uppercase">VISITOR PASS</span>
          <span className="text-[10px] text-slate-500 font-mono">ID: {visitor.visitorId.slice(0, 8)}</span>
        </div>

        {/* Inner Content */}
        <div className="p-5 flex flex-col items-center">
          {/* Photo & Token */}
          <div className="flex w-full items-start gap-4 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="w-24 h-24 rounded-lg object-cover bg-slate-200 border-2 border-slate-350"
            />
            <div className="flex flex-col justify-center flex-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VISITOR TOKEN</span>
              <span className="text-3xl font-extrabold tracking-wider text-blue-600">{visitor.visitorToken}</span>
              <p className="text-xs text-slate-500 mt-1">Keep this token or scan the QR code to check out.</p>
            </div>
          </div>

          {/* Details list */}
          <div className="w-full space-y-2.5 text-sm border-t border-b border-slate-200/80 py-3.5 my-3.5">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-slate-450 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Name</span>
                <span className="text-slate-800 font-medium">{visitor.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-450 shrink-0" />
              <div>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Phone</span>
                <span className="text-slate-800 font-medium">{visitor.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-slate-450 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Host Employee</span>
                <span className="text-slate-800 font-medium">{visitor.hostName} ({visitor.hostDepartment})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-450 shrink-0" />
              <div>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">Check-In Time</span>
                <span className="text-slate-800 font-medium">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qrSrc ? (
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm mt-1 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="Checkout QR Code" className="w-28 h-28" />
            </div>
          ) : (
            <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
              Generating QR...
            </div>
          )}
          
          <span className="text-[10px] text-slate-400 tracking-wide mt-2">
            Scan to check out at exit gate
          </span>
        </div>
      </div>

      {/* Download Action */}
      <a
        href={visitor.gatePassUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20"
      >
        <Download className="h-5 w-5" />
        Download PDF Gate Pass
      </a>
    </div>
  );
}
