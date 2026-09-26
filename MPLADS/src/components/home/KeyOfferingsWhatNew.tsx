"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Tv,
  Monitor,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import ClickSpark from "../ui/ClickSpark";

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface KeyOfferingsWhatNewProps {
  language: "en" | "hi";
}



export function KeyOfferingsWhatNew({ language }: KeyOfferingsWhatNewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<"desktop" | "laptop">("desktop");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const screenContainerRef = useRef<HTMLDivElement>(null);

  // Sync fullscreen change state with document
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Request or exit native browser fullscreen
  const toggleFullscreen = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      if (!document.fullscreenElement) {
        if (screenContainerRef.current?.requestFullscreen) {
          await screenContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  };

  const handlePlayAndFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    setTimeout(() => {
      toggleFullscreen();
    }, 150);
  };

  // Keyframe animation for dashed traveling strokes
  return (
    <section
      id="official-documentary"
      className="w-full relative pt-16 sm:pt-20 md:pt-24 pb-0 bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#F1F5F9] border-y border-slate-200/90 select-none overflow-hidden"
    >
      <ClickSpark
        sparkColor="#ff6600ff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <style jsx>{`
        @keyframes dashTravel {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash-travel {
          animation: dashTravel 1.4s linear infinite;
        }
      `}</style>

        {/* 1. Subtle Engineering Blueprint Grid Canvas (White Mode) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)
          `,
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)",
          }}
        />

        {/* 2. Soft Ambient Aura Glow (White Mode) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] bg-blue-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[240px] bg-amber-400/8 rounded-full blur-[110px] pointer-events-none" />

        {/* 3. Giant NIDHI-RAKSHAK Logo Blended in the Section Background (Bigger & Better) */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] sm:w-[920px] lg:w-[1100px] xl:w-[1260px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="NIDHI-RAKSHAK Emblem Watermark"
            width={1260}
            height={1260}
            className="w-full h-full object-contain opacity-[0.14] sm:opacity-[0.17] filter drop-shadow-[0_20px_60px_rgba(19,62,135,0.18)]"
            priority
          />
        </div>

        {/* 4. Main Centered Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 md:px-12 pb-12 sm:pb-14 md:pb-16 flex flex-col items-center">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 flex flex-col items-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-slate-300/80 text-[11px] font-semibold text-slate-800 shadow-xs backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#133E87] font-bold">NIDHIRAKSHAK</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-600 font-bold">TEAM- CODE_WARRIORS</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-600 hidden sm:inline">SIH 2026 (SIH26102)</span>
            </div>

            {/* Canvas Heading Card */}
            <div className="relative inline-block mx-auto mb-4">
              {/* Corner Crosshairs (+) */}
              <span className="absolute -top-2.5 -left-2.5 w-4 h-4 flex items-center justify-center text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+</span>
              <span className="absolute -top-2.5 -right-2.5 w-4 h-4 flex items-center justify-center text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+</span>
              <span className="absolute -bottom-2.5 -left-2.5 w-4 h-4 flex items-center justify-center text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+</span>
              <span className="absolute -bottom-2.5 -right-2.5 w-4 h-4 flex items-center justify-center text-xs font-mono font-bold text-slate-400 select-none pointer-events-none">+</span>

              {/* Canvas Card */}
              <div className="px-8 sm:px-14 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/95 border-2 border-dashed border-[#133E87]/40 hover:border-[#133E87]/80 transition-colors shadow-[0_8px_25px_-5px_rgba(19,62,135,0.08)] backdrop-blur-xs text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {language === "hi" ? (
                    "सिस्टम आर्किटेक्चर एवं लाइव वॉकथ्रू वृत्तचित्र"
                  ) : (
                    <span className="bg-gradient-to-r from-slate-950 via-[#133E87] to-slate-900 bg-clip-text text-transparent font-black tracking-wider uppercase">
                      DEMO VIDEO
                    </span>
                  )}
                </h2>

                <div className="mt-1 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono text-slate-500">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>4K SYSTEM ARCHITECTURE</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="hidden sm:inline">OFFICIAL DOCUMENTARY</span>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-400" />
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
              {language === "hi"
                ? "देखें कि कैसे एआई सैटेलाइट सर्विलांस, कैग-अनुपालन विसंगति पहचान और पीएफएमएस रियल-टाइम ऑडिट देश के सभी 543 संसदीय क्षेत्रों में पारदर्शिता सुनिश्चित करता है।"
                : "Explore how NIDHI-RAKSHAK combines financial, project, GIS and field evidence to detect risks and support transparent decision-making"}
            </p>

            {/* Device Mockup Toggle Switch with Dashed Arrows pointing towards video */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
              {/* Left Dashed Arrow pointing to video */}
              <div className="hidden sm:flex items-center gap-2 pointer-events-none select-none">
                <span className="font-mono text-[10px] text-slate-500 font-semibold bg-white/90 border border-dashed border-slate-300 px-2 py-0.5 rounded shadow-2xs rotate-[-3deg]">
                  Live Walkthrough
                </span>
                <svg width="42" height="30" viewBox="0 0 42 30" fill="none" className="text-[#133E87] animate-dash-travel">
                  <path d="M4 6 C 18 6, 28 14, 36 24" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 3" strokeLinecap="round" />
                  <polygon points="36,24 29,19 37,17" fill="currentColor" />
                </svg>
              </div>

              {/* Laptop / Desktop Switcher */}
              <div className="inline-flex items-center p-1 rounded-lg bg-slate-100/90 border border-slate-300/80 shadow-inner gap-1">
                <button
                  type="button"
                  onClick={() => setDeviceType("laptop")}
                  title={language === "hi" ? "लैपटॉप व्यू" : "Laptop View"}
                  className={`p-2 rounded-md transition cursor-pointer flex items-center justify-center ${deviceType === "laptop"
                    ? "bg-[#133E87] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                >
                  <Laptop className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType("desktop")}
                  title={language === "hi" ? "डेस्कटॉप व्यू" : "Desktop View"}
                  className={`p-2 rounded-md transition cursor-pointer flex items-center justify-center ${deviceType === "desktop"
                    ? "bg-[#133E87] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              {/* Right Dashed Arrow pointing to video */}
              <div className="hidden sm:flex items-center gap-2 pointer-events-none select-none">
                <svg width="42" height="30" viewBox="0 0 42 30" fill="none" className="text-amber-600 animate-dash-travel">
                  <path d="M38 6 C 24 6, 14 14, 6 24" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 3" strokeLinecap="round" />
                  <polygon points="6,24 13,19 5,17" fill="currentColor" />
                </svg>
                <span className="font-mono text-[10px] text-slate-500 font-semibold bg-white/90 border border-dashed border-slate-300 px-2 py-0.5 rounded shadow-2xs rotate-[3deg]">
                  Interactive Demo
                </span>
              </div>
            </div>
          </div>

          {/* 5. Desktop / Laptop Workstation */}
          <div className="w-full max-w-4xl mx-auto relative">

            {/* Outer DARK Monitor Frame Chassis */}
            <div
              className={`transition-all duration-300 relative ${deviceType === "desktop"
                ? "bg-slate-950 border-[5px] sm:border-[6px] border-slate-800/90 rounded-t-2xl sm:rounded-t-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.28)] p-2 sm:p-3 pb-0"
                : "bg-slate-950 border-[5px] sm:border-[6px] border-slate-800/90 rounded-t-2xl sm:rounded-t-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.28)] p-2 sm:p-2.5 pb-0"
                }`}
            >
              {/* Top Bezel Webcam Notch / Sensor Dot (Dark Bezel) */}
              <div className="flex items-center justify-center pb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">
                    FHD Sensor
                  </span>
                </div>
              </div>

              {/* Inner Monitor Display Screen (16:9 Aspect Ratio) */}
              <div
                ref={screenContainerRef}
                className={`w-full aspect-video bg-black relative rounded-lg sm:rounded-xl overflow-hidden shadow-inner group ${isFullscreen ? "fixed inset-0 z-50 rounded-none aspect-auto w-screen h-screen" : ""
                  }`}
              >
                {isPlaying ? (
                  /* YouTube Video Player Iframe */
                  <div className="w-full h-full relative bg-black">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/Y-EFpaPHh4k?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"
                      title="NIDHI-RAKSHAK Official Documentary"
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    />

                    {/* Floating Action Controls Overlay */}
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-2 opacity-90 hover:opacity-100 transition">
                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        className="bg-black/80 hover:bg-black text-white text-xs font-semibold px-2.5 py-1.5 rounded-md border border-white/20 backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg transition"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="hidden sm:inline">
                          {isFullscreen
                            ? language === "hi"
                              ? "छोटा करें"
                              : "Exit Fullscreen"
                            : language === "hi"
                              ? "फुल स्क्रीन"
                              : "Fullscreen"}
                        </span>
                      </button>

                      {/* Close / Return to Poster */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying(false)}
                        title="Close Player"
                        className="bg-black/80 hover:bg-black text-white text-xs font-semibold px-2.5 py-1.5 rounded-md border border-white/20 backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                        <span className="hidden sm:inline">
                          {language === "hi" ? "बंद करें" : "Close"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Poster View with Click-to-Play */
                  <div
                    className="w-full h-full relative cursor-pointer flex flex-col justify-between p-4 sm:p-6 md:p-8"
                    onClick={() => setIsPlaying(true)}
                  >
                    {/* Poster Thumbnail Image */}
                    <Image
                      src="/home/nidhirakshak_ai_card.jpg"
                      alt="NIDHI-RAKSHAK: Platform Live Demo & Architecture Walkthrough"
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500 opacity-80"
                      priority
                    />

                    {/* Cinematic Dark Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/75 pointer-events-none" />

                    {/* Top Bar Inside Screen */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                        <div className="w-4 h-4 rounded-xs bg-red-600 flex items-center justify-center text-white shadow-xs">
                          <YouTubeIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
                          {language === "hi" ? "आधिकारिक वृत्तचित्र" : "Official Walkthrough Film"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                          4K HD
                        </span>
                        <span className="bg-blue-600/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border border-blue-400/30 shadow-xs hidden xs:inline-flex items-center gap-1">
                          <Tv className="w-3 h-3 text-amber-300" />
                          04:15
                        </span>
                      </div>
                    </div>

                    {/* Centered Large Glowing YouTube Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.7)] transform group-hover:scale-110 transition-all duration-300">
                          <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Information & Quick Action Buttons */}
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div className="space-y-1 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>MPLADS AI Fiscal Governance</span>
                        </div>
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white drop-shadow-md leading-tight">
                          {language === "hi"
                            ? "निधि-रक्षक: पारदर्शी सार्वजनिक निधि अभिशासन एवं एआई ऑडिट"
                            : "NIDHI-RAKSHAK: Public Fund Governance & AI Audit"}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 sm:line-clamp-2">
                          {language === "hi"
                            ? "क्लिक करके वीडियो चलाएं और फुल स्क्रीन में विस्तृत तकनीकी वास्तुकला देखें।"
                            : "Click anywhere on the screen to play video or launch in full screen."}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPlaying(true);
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{language === "hi" ? "चलाएं" : "Play Video"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePlayAndFullscreen}
                          title="Play in Fullscreen"
                          className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md backdrop-blur-md border border-white/25 shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden xs:inline">
                            {language === "hi" ? "फुल स्क्रीन" : "Fullscreen"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Monitor Chin Bar (Dark Bezel) */}
              <div className="h-7 sm:h-8 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between px-3 text-[10px] text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                    SIH2026 - SIH26102
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-400">
                  NIDHI-RAKSHAK SYSTEM
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:inline font-semibold">
                  TEAM - CODE_WARRIORS
                </span>
              </div>
            </div>

            {/* Device Base: Dark Metallic Desktop Stand OR Dark Laptop Deck */}
            {deviceType === "desktop" ? (
              /* Dark Metallic Desktop Stand */
              <div className="w-full flex flex-col items-center">
                {/* Stand Neck */}
                <div className="w-20 sm:w-28 h-6 sm:h-8 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-xs border-x border-slate-700/80" />

                {/* Stand Base Plate */}
                <div className="w-44 sm:w-64 h-3 sm:h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-md border-t border-slate-600 border-b border-slate-900" />

                {/* Ambient Desk Contact Shadow */}
                <div className="w-60 sm:w-80 h-3 bg-slate-950/30 blur-md rounded-full -mt-1 pointer-events-none" />
              </div>
            ) : (
              /* Dark Laptop Bottom Deck & Keyboard Base */
              <div className="w-full flex flex-col items-center">
                {/* Laptop Unibody Dark Base Deck */}
                <div className="w-[104%] -mx-[2%] h-4 sm:h-5 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 rounded-b-xl border-t border-slate-700 border-b border-slate-950 shadow-lg flex items-center justify-center relative">
                  {/* Thumb Groove / Notch for opening lid */}
                  <div className="w-16 sm:w-20 h-1.5 bg-slate-700/80 rounded-b-md shadow-inner" />
                </div>

                {/* Ambient Contact Shadow */}
                <div className="w-[108%] h-4 bg-slate-950/30 blur-md rounded-full -mt-1 pointer-events-none" />
              </div>
            )}
          </div>

        </div>

        {/* 6. Grounded Mascot & Saluting Citizens Images - Hidden on viewports < 1469px */}
        <div className="hidden min-[1469px]:block absolute inset-x-0 bottom-0 max-w-4xl mx-auto pointer-events-none z-30">
          <div className="relative w-full h-0">
            {/* Left Presenter Mascot */}
            <div className="absolute bottom-0 -left-[265px] 2xl:-left-[290px] w-[295px] 2xl:w-[325px]">
              <Image
                src="/home/left_side_demo.png"
                alt="NIDHI-RAKSHAK Presenter"
                width={1199}
                height={1312}
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.22)]"
                priority
              />
            </div>

            {/* Right Saluting Citizens with National Flag */}
            <div className="absolute bottom-0 -right-[270px] 2xl:-right-[300px] w-[350px] 2xl:w-[390px]">
              <Image
                src="/home/right_side_demo.png"
                alt="NIDHI-RAKSHAK Citizens Saluting National Flag"
                width={1152}
                height={768}
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.22)]"
                priority
              />
            </div>
          </div>
        </div>
      </ClickSpark>
    </section>
  );
}
