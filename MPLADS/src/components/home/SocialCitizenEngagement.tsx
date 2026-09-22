"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Search,
  Eye,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Globe2,
  Cpu,
  Users,
} from "lucide-react";

interface SocialCitizenEngagementProps {
  language: "en" | "hi";
}

export function SocialCitizenEngagement({ language }: SocialCitizenEngagementProps) {
  const whyReasons = [
    {
      id: "reason-1",
      number: "01",
      titleEn: "Eliminates Duplicate Billing & Reused Photos",
      titleHi: "दोहरे बिलों एवं पुरानी तस्वीरों के पुनः उपयोग की रोकथाम",
      problemEn: "Without automated image forensics, contractors can re-submit the same completed road or building photos to claim multiple installment releases across different schemes.",
      problemHi: "मैनुअल जांच में ठेकेदार विभिन्न योजनाओं में एक ही पूर्ण कार्य की तस्वीर दोबारा लगाकर अवैध भुगतान ले सकते हैं।",
      solutionEn: "NIDHI-RAKSHAK uses deep computer vision to cross-match every uploaded photo against historical national archives in <1s, instantly blocking duplicate claims.",
      solutionHi: "निधि-रक्षक का डीप कंप्यूटर विज़न 1 सेकंड से कम समय में सभी पुरानी तस्वीरों से मिलान कर फर्जी व डुप्लिकेट बिलों को स्वतः रोक देता है।",
      icon: Eye,
      accent: "from-amber-500 to-orange-500",
      borderAccent: "border-amber-500/40",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "reason-2",
      number: "02",
      titleEn: "Prevents Ghost Projects via Satellite Proof",
      titleHi: "उपग्रह साक्ष्य द्वारा भूतिया परियोजनाओं एवं कागजी दावों पर रोक",
      problemEn: "Physical inspection of thousands of dispersed rural assets across 543 Parliamentary constituencies is logistically difficult, leading to delayed verification and ghost assets.",
      problemHi: "543 संसदीय क्षेत्रों में फैले हजारों ग्रामीण कार्यों का शत-प्रतिशत स्थलीय निरीक्षण कठिन होता है, जिससे कार्य अधूरे रह जाते हैं।",
      solutionEn: "Integrates ISRO Bhuvan satellite GIS timeline tracking and mandatory 50m EXIF GPS radius bounding to independently verify ground construction before fund disbursement.",
      solutionHi: "इसरो भुवन सैटेलाइट जीआईएस और 50 मीटर जीपीएस त्रिज्या सत्यापन द्वारा स्वतंत्र उपग्रह साक्ष्य के बाद ही किस्त जारी की जाती है।",
      icon: Globe2,
      accent: "from-blue-500 to-indigo-500",
      borderAccent: "border-blue-500/40",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "reason-3",
      number: "03",
      titleEn: "Unifies Disconnected Systems (e-SAKSHI + PFMS)",
      titleHi: "विभागीय डेटा साइलो (ई-साक्षी + पीएफएमएस) का एकीकृत संगम",
      problemEn: "MP project recommendations (e-SAKSHI), bank installment releases (PFMS), and engineering measurement books operate in isolated silos without end-to-end correlation.",
      problemHi: "सांसद अनुशंसा (ई-साक्षी), बैंक भुगतान (पीएफएमएस) और माप पुस्तिकाएं अलग-अलग पोर्टलों पर बिखरी रहती हैं।",
      solutionEn: "Multi-Source Intelligence links sanctions, contractor vouchers, and field evidence into a single immutable timeline with automated milestone escrow releases.",
      solutionHi: "सभी स्वीकृतियों, बैंक वाउचरों और कार्यस्थल साक्ष्यों को एक ही अपरिवर्तनीय डिजिटल टाइमलाइन में जोड़कर पारदर्शी एस्क्रो भुगतान संभव बनाता है।",
      icon: Layers,
      accent: "from-emerald-500 to-teal-500",
      borderAccent: "border-emerald-500/40",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "reason-4",
      number: "04",
      titleEn: "Empowers 100% Direct Citizen Social Audit",
      titleHi: "100% प्रत्यक्ष नागरिक सोशल ऑडिट एवं पारदर्शिता का सशक्तिकरण",
      problemEn: "Citizens and local communities often lack visibility into what MPLADS developmental works were sanctioned in their locality, how much was spent, and who is accountable.",
      problemHi: "नागरिकों को अक्सर जानकारी नहीं होती कि उनके गांव/वार्ड में सांसद निधि से क्या कार्य स्वीकृत हुआ और कितना धन व्यय हुआ।",
      solutionEn: "Public transparency portal and conversational AI Copilot empower citizens to inspect verified geo-tagged photos, track spending, and submit instant ground evidence.",
      solutionHi: "सार्वजनिक पारदर्शिता पोर्टल और एआई कोपायलट के माध्यम से नागरिक अपने फोन से सीधे जियो-फ़ोटो देख सकते हैं और फीडबैक दर्ज कर सकते हैं।",
      icon: Users,
      accent: "from-purple-500 to-pink-500",
      borderAccent: "border-purple-500/40",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
  ];

  return (
    <section id="why-nidhirakshak" className="w-full bg-[#0B2545] text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-blue-900 select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/80 pb-5 sm:pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-950 text-amber-300 border border-blue-800 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "hi" ? "राष्ट्रीय आवश्यकता एवं औचित्य" : "National Imperative & Urgency"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {language === "hi"
                ? "निधि-रक्षक को लागू करने की आवश्यकता क्यों है?"
                : "Why NIDHI-RAKSHAK Needs to be Implemented"}
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === "hi"
                ? "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS) में ₹5,000+ करोड़ की वार्षिक निधि के 100% सदुपयोग, पारदर्शी क्रियान्वयन और शून्य रिसाव (Zero Leakage) को सुनिश्चित करने हेतु 4 मुख्य कारण:"
                : "Managing ₹5,000+ Crores of annual public funds across 543 Parliamentary constituencies requires modern automated safeguards. Here is how NIDHI-RAKSHAK transforms public governance:"}
            </p>
          </div>

          <Link
            href="/dashboard/ai-audit"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded shadow-md transition cursor-pointer shrink-0 w-full sm:w-auto text-center"
          >
            <span>{language === "hi" ? "एआई ऑडिट लाइव देखें" : "Explore Live AI Governance"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Cards Grid: The Why & The Solution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {whyReasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`bg-slate-900/90 border ${item.borderAccent} rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-xl hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  {/* Top Bar with Number and Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-600 font-mono group-hover:text-slate-400 transition">
                      {item.number}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {language === "hi" ? item.titleHi : item.titleEn}
                  </h3>

                  {/* The Problem */}
                  <div className="space-y-1 bg-red-950/40 border border-red-900/60 rounded-lg p-3 text-[11px] text-slate-300">
                    <span className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      {language === "hi" ? "पारंपरिक चुनौती (The Problem):" : "The Governance Gap:"}
                    </span>
                    <p className="leading-relaxed">
                      {language === "hi" ? item.problemHi : item.problemEn}
                    </p>
                  </div>

                  {/* The NIDHI-RAKSHAK Solution */}
                  <div className="space-y-1 bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-3 text-[11px] text-slate-200">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {language === "hi" ? "निधि-रक्षक समाधान (AI Solution):" : "NIDHI-RAKSHAK Fix:"}
                    </span>
                    <p className="leading-relaxed">
                      {language === "hi" ? item.solutionHi : item.solutionEn}
                    </p>
                  </div>
                </div>

                {/* Bottom Status Pill */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10.5px]">
                  <span className={`px-2 py-0.5 rounded-full border font-mono font-bold ${item.badgeColor}`}>
                    100% Automated
                  </span>
                  <Link
                    href="/dashboard/ai-audit"
                    className="text-slate-400 hover:text-white flex items-center gap-0.5 font-semibold transition"
                  >
                    <span>{language === "hi" ? "जांचें" : "Verify"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Stat Summary Strip */}
        <div className="bg-slate-900/80 border border-blue-800/80 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-[#133E87] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">
                {language === "hi"
                  ? "₹5,000+ करोड़ वार्षिक निधि • 543 संसदीय क्षेत्र • 100% शून्य-रिसाव अभिशासन"
                  : "₹5,000+ Cr Annual Public Fund • 543 Constituencies • 100% Zero-Leakage Governance"}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {language === "hi"
                  ? "स्मार्ट इंडिया हैकाथॉन 2026 (SIH 2026) के तहत विकसित राष्ट्रव्यापी सार्वजनिक निधि सुरक्षा कवच।"
                  : "Engineered under Smart India Hackathon 2026 as a national fiscal safeguard for the Ministry of Statistics (MoSPI)."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono px-3 py-1 rounded text-xs font-bold">
              AI Surveillance Active
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
