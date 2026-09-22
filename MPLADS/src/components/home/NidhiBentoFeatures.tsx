"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  GitFork,
  Scan,
  Zap,
} from "lucide-react";

interface NidhiBentoFeaturesProps {
  language: "en" | "hi";
}

export function NidhiBentoFeatures({ language }: NidhiBentoFeaturesProps) {
  const [activeSurveillance, setActiveSurveillance] = useState(true);

  return (
    <section id="features-usp" className="w-full bg-white py-12 sm:py-20 px-4 sm:px-8 border-b border-slate-200 text-slate-900 select-none relative overflow-hidden">
      {/* Ambient light gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[700px] h-[300px] sm:h-[450px] bg-blue-100/40 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="space-y-2.5 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#133E87] px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E65100]" />
            <span>{language === "hi" ? "एआई वास्तुकला एवं मुख्य विशेषताएं" : "NIDHI-RAKSHAK AI Architecture & USPs"}</span>
          </div>
          
          <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {language === "hi"
              ? "सार्वजनिक निधि अभिशासन हेतु आपका एआई साथी"
              : "Your AI Public Fund Surveillance Companion"}
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {language === "hi"
              ? "स्मार्ट इंडिया हैकाथॉन (SIH 2026) के तहत विकसित: 543 संसदीय क्षेत्रों में दोहरे दावों की पहचान, उपग्रह सत्यापन और पारदर्शी निधि प्रवाह।"
              : "Autonomous real-time surveillance across 543 Parliamentary constituencies combining neural computer vision, ISRO satellite GIS, and non-invasive legacy integration."}
          </p>
        </div>

        {/* ========================================================= */}
        {/* BENTO GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: 3 STACKED CARDS (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4 sm:gap-5">
            
            {/* Card 1: Autonomous Fund Governance */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#133E87]/40 hover:shadow-md transition duration-300">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#133E87] to-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight tracking-tight">
                  {language === "hi" ? "सहज निधि अभिशासन" : "Effortless Fund Governance"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {language === "hi"
                    ? "परियोजना अनुशंसा से लेकर पूर्णता साक्ष्य तक पूर्णतः पारदर्शी निगरानी।"
                    : "Zero manual bottlenecks. Real-time anomaly detection and fraud triage before disbursement."}
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span className="text-[#133E87] font-bold">543 Constituencies</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  Active
                </span>
              </div>
            </div>

            {/* Card 2: 543 Parliamentary Constituencies KPI */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#133E87]/40 hover:shadow-md transition duration-300">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
                  543
                </span>
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  {language === "hi" ? "संसदीय क्षेत्र लाइव मॉनिटरिंग" : "Constituencies Monitored"}
                </p>
              </div>

              {/* Mini Stakeholder Stack */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                    MP
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#133E87] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                    DM
                  </div>
                  <div className="w-7 h-7 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                    CIT
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-medium">
                  {language === "hi" ? "हितधारक नोड्स" : "Stakeholder Roles"}
                </span>
              </div>
            </div>

            {/* Card 3: Interactive Launch Button */}
            <Link
              href="/dashboard/ai-audit"
              className="bg-[#0B2545] hover:bg-[#133E87] text-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition transform hover:scale-[1.01] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{language === "hi" ? "एआई ऑडिट डैशबोर्ड खोलें" : "Launch AI Copilot"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: HERO LOGO BADGE & DUAL CONNECTED CARDS (lg:col-span-6) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4 sm:gap-5">
            
            {/* Main Centerpiece Card */}
            <div className="bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-white border-2 border-blue-100/90 rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-between shadow-xs hover:shadow-md transition duration-300 relative overflow-hidden group">
              
              {/* Top Branding */}
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Sparkles className="w-4 h-4 text-[#E65100]" />
                <span className="text-[11px] sm:text-xs font-mono font-extrabold tracking-widest text-[#133E87] uppercase">
                  NIDHI-RAKSHAK AI
                </span>
              </div>

              {/* Card Headline */}
              <h3 className="text-xl sm:text-3xl font-black text-center text-slate-950 leading-tight max-w-md">
                {language === "hi"
                  ? "एआई-संचालित निगरानी एवं उपग्रह सत्यापन"
                  : "Autonomous Satellite & Fund Surveillance"}
              </h3>

              {/* Centerpiece Logo Shield (Responsive size from 140px on mobile to 240px on desktop) */}
              <div className="relative w-40 h-40 xs:w-48 xs:h-48 sm:w-60 sm:h-60 my-3 sm:my-4 flex items-center justify-center">
                {/* Soft Radial Ambient Aura */}
                <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl" />
                
                {/* Spinning Telemetry Orbit Ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 200 200">
                    <path
                      id="circlePathLight"
                      d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                      fill="none"
                    />
                    <text fill="#133E87" opacity="0.35" fontSize="7" fontFamily="monospace">
                      <textPath href="#circlePathLight">
                        00110101 100011 10010110 010001 10010101 11010101 010011
                      </textPath>
                    </text>
                  </svg>
                </div>

                {/* Logo Frame */}
                <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-blue-200/90 bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-500">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="NIDHI-RAKSHAK Badge"
                      fill
                      className="object-contain drop-shadow-md"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Card Branch Connectors */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                
                {/* Sub-Card 1: Duplicate Claim Detection */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 hover:border-amber-400 hover:shadow-xs transition duration-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E65100] shrink-0">
                      <GitFork className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 leading-tight">
                      {language === "hi" ? "दोहराव पहचान" : "Duplicate Claim Triage"}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-600 leading-normal">
                    {language === "hi"
                      ? "डीप कंप्यूटर विज़न ऐतिहासिक तस्वीरों का मिलान कर फर्जी दावों को रोकता है।"
                      : "Cross-matches historical site photographs in <1s to prevent duplicate billing."}
                  </p>
                </div>

                {/* Sub-Card 2: ISRO Satellite GIS */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 hover:border-[#133E87] hover:shadow-xs transition duration-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#133E87] shrink-0">
                      <Scan className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 leading-tight">
                      {language === "hi" ? "इसरो उपग्रह जीआईएस" : "ISRO Satellite GIS"}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-600 leading-normal">
                    {language === "hi"
                      ? "100% जियो-टैग्ड ईएक्सआईएफ व उपग्रह टाइमलाइन साक्ष्य सत्यापन।"
                      : "100% EXIF GPS coordinate validation and satellite timeline tracking."}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 3 STACKED CARDS (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4 sm:gap-5">
            
            {/* Card 1: 24x7 Live Surveillance Toggle */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:border-[#133E87]/40 hover:shadow-md transition duration-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-950 block">
                    {language === "hi" ? "24x7 लाइव सर्विलांस" : "Live Surveillance"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeSurveillance ? "Status: ACTIVE" : "Status: PAUSED"}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setActiveSurveillance(!activeSurveillance)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer flex items-center shrink-0 ${
                  activeSurveillance ? "bg-gradient-to-r from-[#133E87] to-blue-600" : "bg-slate-300"
                }`}
                aria-label="Toggle live surveillance status"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    activeSurveillance ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#133E87]" />
                </div>
              </button>
            </div>

            {/* Card 2: ₹5,000 Cr+ Fund Governance KPI */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#133E87]/40 hover:shadow-md transition duration-300">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
                  ₹5,000 Cr+
                </span>
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  {language === "hi" ? "वार्षिक सांसद निधि निगरानी" : "Annual Public Fund"}
                </p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-200">
                <span className="text-[10.5px] sm:text-[11px] font-mono text-[#133E87] bg-blue-50 border border-blue-200 font-bold px-2 py-0.5 rounded-md inline-block">
                  [ 1.4 Lakh+ Assets ]
                </span>
              </div>
            </div>

            {/* Card 3: Unified Interoperability & Formats */}
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#133E87]/40 hover:shadow-md transition duration-300">
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  {language === "hi" ? "सहज एकीकरण" : "Unified Interoperability"}
                </h4>
                <p className="text-[11px] sm:text-[11.5px] text-slate-600 leading-snug">
                  {language === "hi"
                    ? "ई-साक्षी, पीएफएमएस और भुवन जीआईएस के साथ 100% अनुकूल।"
                    : "Native adapters for legacy national public fund platforms."}
                </p>
              </div>

              {/* Floating Pill Badges */}
              <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-200">
                <span className="text-[9.5px] sm:text-[10px] font-mono bg-blue-50 text-[#133E87] border border-blue-200 font-bold px-2 py-0.5 rounded-full">
                  ⚡ PFMS
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-mono bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-2 py-0.5 rounded-full">
                  🛰️ Bhuvan GIS
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  🏛️ eSAKSHI
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
