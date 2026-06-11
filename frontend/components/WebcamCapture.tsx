"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RotateCcw, AlertTriangle } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (base64Data: string) => void;
  onClear: () => void;
}

const videoConstraints = {
  width: 480,
  height: 480,
  facingMode: "user",
};

export default function WebcamCapture({ onCapture, onClear }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({ width: 480, height: 480 });
      if (imageSrc) {
        setImgSrc(imageSrc);
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  const retake = useCallback(() => {
    setImgSrc(null);
    onClear();
  }, [onClear]);

  const handleUserMediaError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-2xl bg-white shadow-sm w-full max-w-sm mx-auto">
      <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
        {hasError ? (
          <div className="text-center p-4 flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-slate-800">Webcam Permission Denied</p>
            <p className="text-xs text-slate-500 mt-1">Please enable camera access in your browser settings to continue.</p>
          </div>
        ) : imgSrc ? (
          // Preview state
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt="Visitor preview"
            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out opacity-100"
          />
        ) : (
          // Live Webcam
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {!hasError && (
        <div className="w-full flex justify-center">
          {imgSrc ? (
            <button
              type="button"
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Photo
            </button>
          ) : (
            <button
              type="button"
              onClick={capture}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Camera className="h-4 w-4" />
              Capture Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
