"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";

interface AnnouncementsTickerProps {
  language: "en" | "hi";
}

export function AnnouncementsTicker({ language }: AnnouncementsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  const announcements = [
    {
      id: 1,
      title:
        language === "hi"
          ? "वित्तीय वर्ष 2026-27 के लिए सांसद निधि मासिक प्रगति रिपोर्ट (MPR) ऑनलाइन पोर्टल पर अपलोड करने की अंतिम तिथि जारी (विवरण के लिए यहां क्लिक करें)"
          : "Submission of Annual Financial Statements & MPRs for FY 2026-27 now live on portal (Click here for details)",
      href: "#documents",
    },
    {
      id: 2,
      title:
        language === "hi"
          ? "3डी डिजिटल ट्विन लेआउट लाइव: पुल, भवन, सड़क व चेक-डैम की 4-चरणीय निर्माण प्रगति का 3डी त्रि-आयामी अवलोकन उपलब्ध"
          : "3D Digital Twin Layouts Live: Step-by-Step 3D Inspection for Bridges, Buildings, Paver Streets & Dams now accessible - 22.09.2026",
      href: "/dashboard/3d-view",
    },
    {
      id: 3,
      title:
        language === "hi"
          ? "निधि-रक्षक मोबाइल ऐप v3.2 जारी: जिला नोडल अभियंताओं के लिए ऑफलाइन जियो-टैगिंग एवं एआई साक्ष्य सत्यापन सक्षम - 21.09.2026"
          : "NIDHI-RAKSHAK Mobile App v3.2 Released with Offline Geotagging & AI Duplicate Detection for District Engineers - 21.09.2026",
      href: "/dashboard/ai-audit",
    },
    {
      id: 4,
      title:
        language === "hi"
          ? "माननीय मंत्री महोदय की अध्यक्षता में सांसद स्थानीय क्षेत्र विकास योजना राष्ट्रीय समीक्षा बैठक की कार्यवाही रिपोर्ट उपलब्ध - 18.09.2026"
          : "Proceedings of National Review Meeting on MPLADS Implementation by Hon'ble Minister published - 18.09.2026",
      href: "#documents",
    },
    {
      id: 5,
      title:
        language === "hi"
          ? "संशोधित दिशानिर्देश 2023 के तहत आकांक्षी जिलों में सौर ऊर्जा व शुद्ध पेयजल परियोजनाओं को प्राथमिकता आवंटन - 15.09.2026"
          : "Tender & Priority Allocation Notice for Solar Energy & Drinking Water in Aspirational Districts - 15.09.2026",
      href: "/dashboard/projects",
    },
  ];

  // Combined ticker string separated by dots
  const fullText = announcements
    .map((a) => a.title)
    .join(" . ");

  return (
    <div className="w-full bg-[#c8c8c8] text-slate-800 text-[12px] sm:text-[13px] py-1.5 px-4 sm:px-8 border-b border-slate-300 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left: Announcements label + Loudspeaker icon matching reference image */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 sm:pr-4 font-bold text-[#133E87] border-r border-slate-400/80">
          <span>{language === "hi" ? "महत्वपूर्ण सूचनाएं" : "Announcements"}</span>
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 text-[#133E87]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="none" />
            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 2.77L5 10H1v4h4l5 4V6z" />
          </svg>
        </div>

        {/* Right: Scrolling Marquee ticker */}
        <div
          className="flex-1 overflow-hidden relative ml-3 sm:ml-4 whitespace-nowrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`inline-block whitespace-nowrap text-slate-900 font-medium text-xs sm:text-[12.5px] transition-transform duration-300 ${
              isPaused ? "animate-none" : "animate-marquee"
            }`}
            style={{
              animation: isPaused ? "none" : "marquee 32s linear infinite",
            }}
          >
            {announcements.map((item, idx) => (
              <span key={idx} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className="hover:text-[#133E87] hover:underline transition-colors"
                >
                  {item.title}
                </Link>
                {idx < announcements.length - 1 && (
                  <span className="mx-3 text-slate-600 font-bold">.</span>
                )}
              </span>
            ))}
            <span className="mx-3 text-slate-600 font-bold">.</span>
            {/* Duplicated for continuous smooth loop */}
            {announcements.map((item, idx) => (
              <span key={`dup-${idx}`} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className="hover:text-[#133E87] hover:underline transition-colors"
                >
                  {item.title}
                </Link>
                {idx < announcements.length - 1 && (
                  <span className="mx-3 text-slate-600 font-bold">.</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Keyframes */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
