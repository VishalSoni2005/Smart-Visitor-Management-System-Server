"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Camera,
  ClipboardList,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Visitor } from "@/shared/types";
import WebcamCapture from "@/components/WebcamCapture";
import GatePass from "@/components/GatePass";

export default function CheckInPage() {
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<Visitor["purpose"]>("Meeting");
  const [hostName, setHostName] = useState("");
  const [hostDepartment, setHostDepartment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // Status States
  const [loading, setLoading] = useState(false);
  const [issuedVisitor, setIssuedVisitor] = useState<Visitor | null>(null);

  // Validate and submit check-in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Please enter your full name.");
    }
    if (!phone.trim()) {
      return toast.error("Please enter your phone number.");
    }
    if (!hostName.trim()) {
      return toast.error("Please enter the host employee's name.");
    }
    if (!hostDepartment.trim()) {
      return toast.error("Please enter the host's department.");
    }
    if (!photo) {
      return toast.error("Webcam photo capture is required to check in.");
    }

    setLoading(true);
    const toastId = toast.loading(
      "Processing your check-in, generating gate pass...",
    );

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      if (email.trim()) {
        formData.append("email", email.trim());
      }
      formData.append("purpose", purpose);
      formData.append("hostName", hostName.trim());
      formData.append("hostDepartment", hostDepartment.trim());

      // Convert webcam base64 capture to a binary blob
      const res = await fetch(photo);
      const blob = await res.blob();
      const mimeType = photo.split(";")[0].split(":")[1] || "image/jpeg";
      const ext = mimeType.split("/")[1] || "jpeg";
      formData.append("photo", blob, `photo.${ext}`);

      console.log(
        "formData",
        Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value,
        })),
      );

      const response = await api.post<Visitor>("/visitors", formData);

      console.log("response", response);

      if (response.success && response.data) {
        toast.success("Checked in successfully!", { id: toastId });
        setIssuedVisitor(response.data);
      } else {
        toast.error(response.error || "Failed to process check-in.", {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPurpose("Meeting");
    setHostName("");
    setHostDepartment("");
    setPhoto(null);
    setIssuedVisitor(null);
  };

  if (issuedVisitor) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <GatePass visitor={issuedVisitor} />

          <button
            type="button"
            onClick={resetForm}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl transition duration-150 shadow-sm"
          >
            Check In Another Visitor
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-slate-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white border border-slate-250/60 rounded-3xl p-6 sm:p-10 shadow-xl">
        {/* Title Section */}
        <div className="text-center sm:text-left border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              Visitor Check-In
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Please fill in your details and capture a photo to receive your
              visitor pass.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <ShieldAlert className="h-4 w-4" />
            Security Log Active
          </div>
        </div>

        {/* Form Grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Webcam Section (5 columns on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
            <label className="text-sm font-bold text-slate-700 block mb-3 text-center uppercase tracking-wider">
              Security Capture <span className="text-rose-500">*</span>
            </label>
            <WebcamCapture
              onCapture={(base64) => setPhoto(base64)}
              onClear={() => setPhoto(null)}
            />
            {photo && (
              <span className="text-[10px] text-center font-bold tracking-wide text-emerald-600 block mt-2 uppercase">
                ✓ Photo captured successfully
              </span>
            )}
          </div>

          {/* Input Fields Section (7 columns on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="col-span-1 sm:col-span-2">
                <label
                  htmlFor="name"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Email Address{" "}
                  <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                />
              </div>

              {/* Purpose */}
              <div className="col-span-1 sm:col-span-2">
                <label
                  htmlFor="purpose"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Purpose of Visit <span className="text-rose-500">*</span>
                </label>
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) =>
                    setPurpose(e.target.value as Visitor["purpose"])
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                >
                  <option value="Meeting">Meeting / Discussion</option>
                  <option value="Interview">Job Interview</option>
                  <option value="Delivery">Courier / Delivery</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>

              {/* Host Name */}
              <div>
                <label
                  htmlFor="hostName"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Host Employee Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="hostName"
                  required
                  placeholder="Jane Smith"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                />
              </div>

              {/* Host Department */}
              <div>
                <label
                  htmlFor="hostDept"
                  className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5"
                >
                  Host Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="hostDept"
                  required
                  placeholder="Engineering / Sales"
                  value={hostDepartment}
                  onChange={(e) => setHostDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-150"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Check-In...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
