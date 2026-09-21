"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from "lucide-react";

interface MinistryLeadershipSectionProps {
  language: "en" | "hi";
}

export function MinistryLeadershipSection({ language }: MinistryLeadershipSectionProps) {
  return (
    <section
      id="about-scheme"
      className="w-full bg-white py-10 px-4 sm:px-8 border-b border-slate-200 select-none"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* ========================================================= */}
          {/* LEFT COLUMN: ABOUT NIDHI-RAKSHAK (100% Fully Available for Reading - ZERO Scrolling) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-4">
              {/* Green Main Heading */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0B6623]" />
                  {language === "hi"
                    ? "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)"
                    : "Ministry of Statistics & Programme Implementation (MoSPI)"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B6623] tracking-tight">
                  {language === "hi" ? "निधि-रक्षक के बारे में" : "What is NIDHI-RAKSHAK"}
                </h2>
              </div>

              {/* Bold Sub-headline */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {language === "hi"
                  ? "संसद सदस्य स्थानीय क्षेत्र विकास योजना (MPLADS) हेतु एआई-संचालित सार्वजनिक निधि निगरानी एवं परिसंपत्ति सर्विलांस प्रणाली"
                  : "AI-Powered Public Fund Surveillance, Satellite Verification & Asset Governance for MPLADS"}
              </h3>

              {/* Complete, Unrestricted Text Content (Never scrollable, fully laid out) */}
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p>
                  {language === "hi"
                    ? "निधि-रक्षक (NIDHI-RAKSHAK) भारत सरकार के सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) द्वारा संसद सदस्य स्थानीय क्षेत्र विकास योजना (MPLADS) के तहत विकसित एक अग्रणी सार्वजनिक निधि अभिशासन एवं डिजिटल निगरानी मंच है। इसका मुख्य उद्देश्य देशभर के सभी 543 संसदीय क्षेत्रों में विकासात्मक परियोजनाओं के 100% पारदर्शी, समयबद्ध और कुशल क्रियान्वयन को सुनिश्चित करना है।"
                    : "The NIDHI-RAKSHAK platform is a pioneering national public fund governance initiative developed under the Ministry of Statistics and Programme Implementation (MoSPI), Government of India, for the Member of Parliament Local Area Development Scheme (MPLADS). It guarantees absolute fiscal integrity, end-to-end transparency, and real-time execution across all 543 Parliamentary constituencies."}
                </p>

                <p>
                  {language === "hi"
                    ? "यह प्रणाली अत्याधुनिक कृत्रिम बुद्धिमत्ता (AI) एल्गोरिदम, न्यूरल कंप्यूटर विज़न और इसरो भुवन उपग्रह जीआईएस मैपिंग का उपयोग करके निर्माण कार्यों के दोहरे दावों को रोकती है, कार्य स्थल की वास्तविक भौतिक प्रगति की पुष्टि करती है और माननीय सांसदों, जिला नोडल अधिकारियों तथा नागरिकों के बीच अनुमोदन व निगरानी प्रक्रिया को सुव्यवस्थित करती है।"
                    : "By combining state-of-the-art computer vision models, satellite GIS timeline verification via ISRO Bhuvan, and immutable audit logs, NIDHI-RAKSHAK systematically eliminates duplicate invoice claims, verifies authentic physical progress on ground prior to fund disbursement, and connects Hon'ble MPs, District Magistrates, and Citizens on a single trusted platform."}
                </p>

                {/* Key Impact Pillars */}
                <div className="pt-2 space-y-2.5 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === "hi"
                      ? "निधि-रक्षक प्रणाली के प्रमुख परिणाम एवं लाभ:-"
                      : "Key Highlights & Strategic Impact of NIDHI-RAKSHAK:-"}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B6623] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {language === "hi"
                            ? "एआई दोहराव पहचान (AI Duplicate Detection): "
                            : "AI Duplicate Claim Detection & Image Forensics: "}
                        </span>
                        <span className="text-slate-600 text-xs sm:text-sm">
                          {language === "hi"
                            ? "कंप्यूटर विज़न मॉडल अपलोड की गई तस्वीरों का राष्ट्रीय रिपॉजिटरी से मिलान कर फर्जी व डुप्लिकेट बिलों को स्वतः चिह्नित करते हैं।"
                            : "Deep learning models cross-match site photos against historical repositories to detect reused images and fraud."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B6623] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {language === "hi"
                            ? "100% जियो-टैग्ड उपग्रह साक्ष्य सत्यापन: "
                            : "100% Geo-Tagged Satellite Verification: "}
                        </span>
                        <span className="text-slate-600 text-xs sm:text-sm">
                          {language === "hi"
                            ? "ईएक्सआईएफ जीपीएस निर्देशांक व सैटेलाइट मैपिंग द्वारा भौतिक निर्माण की पुष्टि के बाद ही निधि विमुक्त की जाती है।"
                            : "Mandatory GPS coordinate validation and satellite timeline tracking confirm durable assets before installment release."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B6623] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {language === "hi"
                            ? "नागरिक भागीदारी एवं पारदर्शी ऑडिट: "
                            : "Citizen Participation & Real-Time Social Audit: "}
                        </span>
                        <span className="text-slate-600 text-xs sm:text-sm">
                          {language === "hi"
                            ? "सार्वजनिक पोर्टल के माध्यम से नागरिक अपने क्षेत्र के कार्यों को लाइव देख सकते हैं और सीधे फीडबैक व शिकायत दर्ज कर सकते हैं।"
                            : "Citizens can inspect ongoing constituency projects, view verified photo evidence, and register instant feedback."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Action Links */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/ai-audit"
                className="bg-[#0B6623] hover:bg-[#084d1a] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-sm shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{language === "hi" ? "एआई ऑडिट इंजन देखें" : "Explore NIDHI AI Audit Engine"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/grievance"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-sm border border-slate-300 transition inline-flex items-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-[#0B2545]" />
                <span>{language === "hi" ? "नागरिक सत्यापन पोर्टल" : "Citizen Evidence Verification"}</span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: NIDHI-RAKSHAK AI CARD (Matches Exact Height of Left Column) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="w-full h-full bg-[#FFFDF5] border-2 border-[#F6E3B4] rounded-lg p-5 sm:p-6 text-center shadow-xs flex flex-col justify-between items-center">
              {/* Top Section with Expanding Responsive Image Frame */}
              <div className="w-full flex-1 flex flex-col items-center min-h-[220px]">
                <div className="relative w-full h-full min-h-[220px] rounded-sm overflow-hidden border border-[#E9CE88] shadow-xs mb-3">
                  <Image
                    src="/home/nidhirakshak_ai_card.jpg"
                    alt="NidhiRakshak AI Generated Community & Project Verification"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Center Details */}
              <div className="w-full pt-1 pb-2 flex flex-col items-center">
                {/* Subheading above logo */}
                <p className="text-xs sm:text-[13px] font-semibold text-slate-700 mb-1 leading-snug">
                  {language === "hi"
                    ? "मंत्रालय के साथ अपने सुझाव और विचार साझा करें"
                    : "Share your ideas & Suggestions with Ministry for"}
                </p>

                {/* Stylized NidhiRakshak AI Branding */}
                <div className="my-1.5 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#E65100] tracking-tight">
                      Nidhi<span className="text-[#0B2545]">Rakshak</span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold bg-[#E65100] text-white px-2 py-0.5 rounded ml-1 tracking-wider uppercase flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-white" />
                      AI
                    </span>
                  </div>
                </div>

                {/* Date / Surveillance Status Pill */}
                <div className="mt-1 mb-2">
                  <span className="inline-block bg-[#0B2545] text-white text-[11px] sm:text-xs font-bold px-4 py-1 rounded-full shadow-2xs">
                    {language === "hi"
                      ? "27 सितंबर 2026 को लाइव सत्र"
                      : "on 27th September, 2026"}
                  </span>
                </div>
              </div>

              {/* Bottom CTA & Helpline */}
              <div className="w-full border-t border-[#F6E3B4] pt-3 space-y-1.5">
                <Link
                  href="/dashboard/grievance"
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0B6623] hover:underline block cursor-pointer"
                >
                  {language === "hi" ? "यहाँ क्लिक करें अथवा" : "Click Here or"}
                </Link>

                <p className="text-sm sm:text-base font-extrabold text-slate-950 flex items-center justify-center gap-1.5 text-center">
                  <Phone className="w-4 h-4 text-[#0B6623] shrink-0" />
                  <span>Dial 1800 11 8080 (Toll-Free)</span>
                </p>

                <p className="text-[10.5px] sm:text-xs text-slate-600 leading-tight max-w-xs mx-auto">
                  {language === "hi"
                    ? "नागरिक सत्यापन और तकनीकी सहायता हेतु हेल्पलाइन 24x7 खुली रहेगी।"
                    : "The phone lines shall remain open 24x7 for citizen verification & feedback."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

