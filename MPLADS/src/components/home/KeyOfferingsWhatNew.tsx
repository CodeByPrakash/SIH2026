"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  Tv,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

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

  return (
    <section id="official-documentary" className="w-full h-[60vh] sm:h-[72vh] min-h-[420px] max-h-[640px] relative bg-black select-none overflow-hidden">
      {/* Full-width and Optimized Height Video Player */}
      <div className="w-full h-full relative">
        {isPlaying ? (
          <div className="w-full h-full relative bg-black">
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
              title="NIDHI-RAKSHAK Official Documentary"
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Top Bar with Reset Button overlay */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-6 z-20 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="bg-black/80 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "hi" ? "बंद करें" : "Close Player"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full relative cursor-pointer group flex flex-col justify-between p-4 sm:p-8 md:p-12"
            onClick={() => setIsPlaying(true)}
          >
            {/* Background High-Definition Poster */}
            <Image
              src="/home/nidhirakshak_ai_card.jpg"
              alt="NIDHI-RAKSHAK: AI Satellite Surveillance & Public Fund Governance"
              fill
              className="object-cover opacity-75"
              priority
            />

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />

            {/* Top Header Information */}
            <div className="relative z-10 flex flex-wrap items-center justify-between w-full max-w-7xl mx-auto gap-2">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <div className="w-5 h-5 rounded-xs bg-red-600 flex items-center justify-center text-white shadow-xs">
                  <YouTubeIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                  {language === "hi"
                    ? "MoSPI आधिकारिक वृत्तचित्र (Official Film)"
                    : "MoSPI Official Documentary"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="bg-[#0B2545]/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/40 flex items-center gap-1 shadow-xs">
                  <Tv className="w-3 h-3 text-amber-400" />
                  {language === "hi" ? "राष्ट्रीय वृत्तचित्र" : "Documentary"}
                </span>
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                  4K HD
                </span>
              </div>
            </div>

            {/* Centered Large Glowing YouTube Play Button */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-red-600/30 animate-ping" />
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 fill-white text-white ml-1 sm:ml-1.5" />
                </div>
              </div>
            </div>

            {/* Bottom Section with Title and CTA */}
            <div className="relative z-10 w-full max-w-7xl mx-auto space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#0B6623]/90 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-xs border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {language === "hi"
                    ? "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS)"
                    : "MPLADS Scheme AI Governance"}
                </span>
              </div>

              <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg max-w-4xl">
                {language === "hi"
                  ? "निधि-रक्षक: एआई उपग्रह सर्विलांस एवं पारदर्शी सार्वजनिक निधि अभिशासन"
                  : "NIDHI-RAKSHAK: AI Satellite Surveillance & Public Fund Governance"}
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed drop-shadow-md hidden sm:block">
                {language === "hi"
                  ? "देखें कि कैसे अत्याधुनिक कम्प्यूटर विज़न और इसरो भुवन जीआईएस मैपिंग भारत के सभी 543 संसदीय क्षेत्रों में 100% पारदर्शी विकास कार्यों को सशक्त बना रही है।"
                  : "Watch how cutting-edge computer vision algorithms and ISRO Bhuvan GIS satellite mapping empower 100% transparent and accountable public development across all 543 Parliamentary constituencies."}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-amber-300 font-bold text-xs">
                <span className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded font-extrabold flex items-center gap-1.5 shadow-md">
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{language === "hi" ? "वीडियो देखें (4K HD)" : "Watch Video (4K HD)"}</span>
                </span>
                <span className="text-slate-300 font-normal text-[11px] sm:text-xs">
                  {language === "hi" ? "अवधि: 04:15" : "Duration: 04:15"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
