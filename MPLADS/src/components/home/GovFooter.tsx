"use client";

import React from "react";
import Link from "next/link";
import { EmblemOfIndia } from "./EmblemOfIndia";
import { ExternalLink, Phone, Mail, MapPin, Shield, CheckCircle, Info } from "lucide-react";

interface GovFooterProps {
  language: "en" | "hi";
}

export function GovFooter({ language }: GovFooterProps) {
  return (
    <footer id="footer-contact" className="w-full bg-[#081C33] text-slate-300 text-xs border-t-2 border-amber-500">
      {/* Top Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Ministry & Scheme Ownership */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <EmblemOfIndia size={36} className="text-amber-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {language === "hi"
                    ? "निधि-रक्षक , TEAM- CODE_WARRIORS"
                    : "NIDHI-RAKSHAK , TEAM- CODE_WARRIORS"}
                </h4>
                <p className="text-[10px] font-semibold text-amber-400 mt-0.5">
                  {language === "hi"
                    ? "SIH 2026 - समस्या विवरण: SIH26102"
                    : "SIH 2026 - Problem Statement: SIH26102"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === "hi" ? "भारत सरकार" : "Government of India"}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === "hi"
                ? "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS) प्रभाग, सरदार पटेल भवन, संसद मार्ग, नई दिल्ली-110001"
                : "MPLADS Division, Khurshid Lal Bhawan / Sardar Patel Bhawan, Sansad Marg, New Delhi - 110001."}
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Toll-Free Helpdesk: 1800-11-8080</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support-mplads@gov.in</span>
              </p>
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
              {language === "hi" ? "उपयोगी लिंक्स" : "Useful Links"}
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="#about-scheme" className="hover:text-amber-400 transition">
                  {language === "hi" ? "योजना अवलोकन एवं इतिहास" : "Scheme History & Overview"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/projects" className="hover:text-amber-400 transition">
                  {language === "hi" ? "सार्वजनिक कार्य डैशबोर्ड" : "Public Works Registry"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "संशोधित दिशानिर्देश 2023" : "Revised Guidelines 2023"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/gis" className="hover:text-amber-400 transition">
                  {language === "hi" ? "जियो-स्पेशियल एटलस" : "Geospatial GIS Atlas"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/ai-audit" className="hover:text-amber-400 transition">
                  {language === "hi" ? "निधि-रक्षक एआई सर्विलांस" : "NIDHI AI Surveillance"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/grievance" className="hover:text-amber-400 transition">
                  {language === "hi" ? "नागरिक शिकायत दर्ज करें" : "Public Grievance Portal"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Website Policies (DBIM Mandatory) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
              {language === "hi" ? "वेबसाइट नीतियां (Web Policies)" : "Website Policies"}
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "हाइपरलिंक नीति" : "Hyperlinking Policy"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "कॉपीराइट नीति" : "Copyright Policy"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "नियम एवं शर्तें" : "Terms & Conditions"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "अभिगम्यता वक्तव्य (GIGW 3.0)" : "Accessibility Statement (GIGW 3.0)"}
                </Link>
              </li>
              <li>
                <Link href="#documents" className="hover:text-amber-400 transition">
                  {language === "hi" ? "अस्वीकरण (Disclaimer)" : "Disclaimer"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Verification & Security Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
              {language === "hi" ? "वेब सूचना प्रबंधक" : "Web Information Manager"}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === "hi"
                ? "उप महानिदेशक (MPLADS), सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय, नई दिल्ली।"
                : "Deputy Director General (MPLADS), Ministry of Statistics & Programme Implementation, New Delhi."}
            </p>
            <div className="bg-slate-900/90 border border-slate-700 rounded p-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>STQC Certified & GIGW Compliant</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Conforms to Guidelines for Indian Government Websites (GIGW 3.0).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="bg-[#051324] border-t border-slate-800 py-4 px-4 sm:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            <p>
              {language === "hi"
                ? "यह वेबसाइट सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय, भारत सरकार की आधिकारिक वेबसाइट है।"
                : "This website belongs to Ministry of Statistics and Programme Implementation, Government of India."}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Designed, Developed and Hosted by National Informatics Centre (NIC) / NIDHI-RAKSHAK Portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
            <span>Last Updated: 21 Sep 2026</span>
            <span>|</span>
            <span>Total Visitors: 4,892,104</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
