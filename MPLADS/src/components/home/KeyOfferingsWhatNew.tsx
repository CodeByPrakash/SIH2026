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

// Floating infrastructure stickers arranged in an alternating staggered rhythm
const FLOATING_STICKERS = [
  // LEFT SIDE: (Staggered with generous spacing, utilizing the outer left area)
  // 1st: Infrastructure Project Site - Outward track (top-left outer space, above the train)
  {
    src: "/home/overlayVideo/Pi7_cropper (5).png",
    alt: "Infrastructure Development Project",
    className:
      "top-[-32px] lg:top-[-38px] right-[calc(100%+145px)] sm:right-[calc(100%+170px)] lg:right-[calc(100%+198px)] xl:right-[calc(100%+224px)] w-26 sm:w-30 lg:w-36 xl:w-40 rotate-4 animate-float-alt",
  },
  // 2nd: Parliament - Inward track (top, near monitor)
  {
    src: "/home/overlayVideo/Pi7_cropper (1).png",
    alt: "Parliament of India",
    className:
      "top-[-30px] lg:top-[-35px] right-[calc(100%+10px)] sm:right-[calc(100%+16px)] lg:right-[calc(100%+22px)] xl:right-[calc(100%+28px)] w-28 sm:w-32 lg:w-38 xl:w-42 -rotate-6 animate-float-slow",
  },
  // 2nd: Vande Bharat Express - Shifted further left into the open space and down away from Parliament
  {
    src: "/home/overlayVideo/Pi7_cropper (6).png",
    alt: "Vande Bharat Express",
    className:
      "top-[17%] lg:top-[19%] right-[calc(100%+65px)] sm:right-[calc(100%+90px)] lg:right-[calc(100%+118px)] xl:right-[calc(100%+142px)] w-30 sm:w-34 lg:w-40 xl:w-44 rotate-3 animate-float-alt",
  },
  // 3rd: Sea Link Cable Bridge - Inward track (filling the mid space between train and presenter)
  {
    src: "/home/overlayVideo/Pi7_cropper (4).png",
    alt: "Sea Link Cable Bridge",
    className:
      "top-[44%] lg:top-[46%] right-[calc(100%+12px)] sm:right-[calc(100%+18px)] lg:right-[calc(100%+26px)] xl:right-[calc(100%+34px)] w-28 sm:w-32 lg:w-38 xl:w-42 -rotate-3 animate-float-slow",
  },

  // RIGHT SIDE: (Staggered with generous spacing, alternating inward and outward)
  // 1st: Supreme Court - Inward track (top, near monitor)
  {
    src: "/home/overlayVideo/Pi7_cropper.png",
    alt: "Supreme Court of India",
    className:
      "top-[-26px] lg:top-[-30px] left-[calc(100%+10px)] sm:left-[calc(100%+16px)] lg:left-[calc(100%+22px)] xl:left-[calc(100%+28px)] w-28 sm:w-32 lg:w-38 xl:w-42 rotate-6 animate-float-slow",
  },
  // 2nd: Smart City Metro Skyline - Outward track (shifted outward to the right into open space)
  {
    src: "/home/overlayVideo/Pi7_cropper (2).png",
    alt: "Smart City Metro Skyline",
    className:
      "top-[26%] lg:top-[28%] left-[calc(100%+60px)] sm:left-[calc(100%+82px)] lg:left-[calc(100%+106px)] xl:left-[calc(100%+128px)] w-26 sm:w-30 lg:w-36 xl:w-40 -rotate-3 animate-float-alt",
  },
  // 3rd: Hydroelectric Dam - Inward track (pulled back inward, separated vertically from skyline)
  {
    src: "/home/overlayVideo/Pi7_cropper (8).png",
    alt: "Hydroelectric Dam",
    className:
      "top-[55%] lg:top-[57%] left-[calc(100%+10px)] sm:left-[calc(100%+16px)] lg:left-[calc(100%+22px)] xl:left-[calc(100%+28px)] w-28 sm:w-32 lg:w-38 xl:w-42 rotate-4 animate-float-slow",
  },
  // 4th: Expressway Flyover - Outward track (shifted outward to the right, below dam)
  {
    src: "/home/overlayVideo/Pi7_cropper (3).png",
    alt: "Expressway Flyover",
    className:
      "top-[80%] lg:top-[82%] left-[calc(100%+55px)] sm:left-[calc(100%+76px)] lg:left-[calc(100%+98px)] xl:left-[calc(100%+118px)] w-28 sm:w-32 lg:w-38 xl:w-42 -rotate-4 animate-float-alt",
  },
];

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

  // 4px thick solid white die-cut border filter on the transparent PNG contour + soft drop shadow
  const stickerFilterStyle = {
    filter: `
      drop-shadow(3.5px 0px 0px #ffffff)
      drop-shadow(-3.5px 0px 0px #ffffff)
      drop-shadow(0px 3.5px 0px #ffffff)
      drop-shadow(0px -3.5px 0px #ffffff)
      drop-shadow(2.5px 2.5px 0px #ffffff)
      drop-shadow(-2.5px -2.5px 0px #ffffff)
      drop-shadow(2.5px -2.5px 0px #ffffff)
      drop-shadow(-2.5px 2.5px 0px #ffffff)
      drop-shadow(0px 10px 18px rgba(15, 23, 42, 0.16))
    `,
  };

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
        {/* Dynamic Keyframe Animations for Floating Stickers */}
        <style jsx>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(2deg);
          }
        }
        @keyframes floatAlt {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(12px) rotate(-2deg);
          }
        }
        .animate-float-slow {
          animation: floatSlow 5.5s ease-in-out infinite;
        }
        .animate-float-alt {
          animation: floatAlt 6.2s ease-in-out infinite;
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

        {/* 3. Main Centered Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 md:px-12 pb-12 sm:pb-14 md:pb-16 flex flex-col items-center">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-slate-300/80 text-[11px] font-semibold text-slate-800 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#133E87] font-bold">NIDHIRAKSHAK</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-600 font-bold">TEAM- CODE_WARRIORS</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-600 hidden sm:inline">SIH 2026 (SIH26102)</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {language === "hi"
                ? "सिस्टम आर्किटेक्चर एवं लाइव वॉकथ्रू वृत्तचित्र"
                : "Platform Demonstration & System Architecture Walkthrough"}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {language === "hi"
                ? "देखें कि कैसे एआई सैटेलाइट सर्विलांस, कैग-अनुपालन विसंगति पहचान और पीएफएमएस रियल-टाइम ऑडिट देश के सभी 543 संसदीय क्षेत्रों में पारदर्शिता सुनिश्चित करता है।"
                : "Watch how cutting-edge computer vision, ISRO Bhuvan GIS satellite mapping, and PFMS real-time audits ensure complete transparency across all 543 Parliamentary constituencies."}
            </p>

            {/* Device Mockup Toggle Switch - Icons only (First Laptop, then Monitor) */}
            <div className="pt-2 flex items-center justify-center">
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
            </div>
          </div>

          {/* 4. White Desktop / Laptop Workstation with Scattered Floating Stickers */}
          <div className="w-full max-w-4xl mx-auto relative">
            {/* FLOATING STICKERS: Scattered near the YouTube video (Hidden on viewports < 960px) */}
            <div className="hidden min-[960px]:block absolute inset-0 pointer-events-none z-20 overflow-visible">
              {FLOATING_STICKERS.map((sticker, idx) => (
                <div
                  key={`float-sticker-${idx}`}
                  className={`absolute pointer-events-auto transition-transform hover:scale-115 duration-300 cursor-pointer ${sticker.className}`}
                >
                  <Image
                    src={sticker.src}
                    alt={sticker.alt}
                    width={240}
                    height={180}
                    style={stickerFilterStyle}
                    className="w-full h-auto object-contain select-none transition-all duration-300 hover:brightness-105"
                    priority={idx < 3}
                  />
                </div>
              ))}
            </div>

            {/* Outer GRAY Monitor Frame Chassis */}
            <div
              className={`transition-all duration-300 relative ${deviceType === "desktop"
                ? "bg-slate-200 border-[5px] sm:border-[6px] border-slate-300/90 rounded-t-2xl sm:rounded-t-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.16)] p-2 sm:p-3 pb-0"
                : "bg-slate-200 border-[5px] sm:border-[6px] border-slate-300/90 rounded-t-2xl sm:rounded-t-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.16)] p-2 sm:p-2.5 pb-0"
                }`}
            >
              {/* Top Bezel Webcam Notch / Sensor Dot (Gray Desktop) */}
              <div className="flex items-center justify-center pb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-300/80 border border-slate-400/60 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ring-1 ring-slate-500/50 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest hidden sm:inline">
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

              {/* Bottom Monitor Chin Bar (Gray Desktop) */}
              <div className="h-7 sm:h-8 bg-slate-200 border-t border-slate-300/90 flex items-center justify-between px-3 text-[10px] text-slate-700 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] sm:text-[10px] text-slate-600 hidden sm:inline font-semibold">
                    SIH2026 - SIH26102
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#133E87]">
                  NIDHI-RAKSHAK SYSTEM
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-600 hidden sm:inline font-semibold">
                  TEAM - CODE_WARRIORS
                </span>
              </div>
            </div>

            {/* Device Base: Gray Metallic Desktop Stand OR Gray Laptop Deck */}
            {deviceType === "desktop" ? (
              /* Gray Desktop Metallic Stand */
              <div className="w-full flex flex-col items-center">
                {/* Stand Neck */}
                <div className="w-20 sm:w-28 h-6 sm:h-8 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-xs border-x border-slate-400/80" />

                {/* Stand Base Plate */}
                <div className="w-44 sm:w-64 h-3 sm:h-4 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-full shadow-md border-t border-slate-200 border-b border-slate-400/80" />

                {/* Ambient Desk Contact Shadow */}
                <div className="w-60 sm:w-80 h-3 bg-slate-500/25 blur-md rounded-full -mt-1 pointer-events-none" />
              </div>
            ) : (
              /* Gray Laptop Bottom Deck & Keyboard Base */
              <div className="w-full flex flex-col items-center">
                {/* Laptop Unibody Gray Base Deck */}
                <div className="w-[104%] -mx-[2%] h-4 sm:h-5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-b-xl border-t border-slate-300 border-b border-slate-400/80 shadow-lg flex items-center justify-center relative">
                  {/* Thumb Groove / Notch for opening lid */}
                  <div className="w-16 sm:w-20 h-1.5 bg-slate-400/80 rounded-b-md shadow-inner" />
                </div>

                {/* Ambient Contact Shadow */}
                <div className="w-[108%] h-4 bg-slate-500/25 blur-md rounded-full -mt-1 pointer-events-none" />
              </div>
            )}
          </div>

        </div>

        {/* 6. Presenter Mascot Image (represnting.png) - Hidden on viewports < 1469px */}
        <div className="hidden min-[1469px]:block absolute inset-x-0 bottom-0 max-w-4xl mx-auto pointer-events-none z-30">
          <div className="relative w-full h-0">
            <div className="absolute bottom-0 -left-[385px] 2xl:-left-[420px] w-[440px] 2xl:w-[480px]">
              <Image
                src="/home/represnting.png"
                alt="NIDHI-RAKSHAK Presenter"
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
