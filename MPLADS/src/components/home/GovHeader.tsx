"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EmblemOfIndia } from "./EmblemOfIndia";
import { Button } from "@/components/ui/button";
import {
  Search,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Eye,
  ExternalLink,
  ChevronRight,
  Bot,
  AlertTriangle,
  Layers,
  Scan,
  Compass,
  Clock,
  FileCheck2,
  Building,
  Users,
  UserCheck,
  ShieldCheck,
  BarChart3,
  Landmark,
  FileText,
  Video,
  Sparkles,
  GitBranch,
} from "lucide-react";

interface GovHeaderProps {
  fontSizeLevel: number;
  onFontSizeChange: (delta: number | "reset") => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  language: "en" | "hi";
  onToggleLanguage: () => void;
}

export function GovHeader({
  fontSizeLevel,
  onFontSizeChange,
  highContrast,
  onToggleHighContrast,
  language,
  onToggleLanguage,
}: GovHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard/projects?search=${encodeURIComponent(searchQuery)}`);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setAccessMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      title: language === "hi" ? "मुख्य पृष्ठ" : "Home",
      href: "/",
      isActive: true,
      hasDropdown: false,
    },
    {
      title: language === "hi" ? "एआई सर्विलांस एवं फोरेंसिक्स" : "AI Surveillance",
      href: "/dashboard/ai-audit",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "निधि कोपायलट एवं एआई ऑडिट" : "NIDHI Copilot & AI Audit",
          sub: language === "hi" ? "संवादात्मक एआई सहायक एवं नीति जांच" : "Conversational Assistant & Guideline Audits",
          href: "/dashboard/ai-audit",
          icon: Bot,
          badge: "AI Core",
        },
        {
          label: language === "hi" ? "रियल-टाइम जोखिम मैट्रिक्स (0-100)" : "Multi-Factor Risk Matrix",
          sub: language === "hi" ? "5-आयामी स्वचालित विसंगति स्कोरिंग" : "Real-Time 0-100 Anomaly Scoring",
          href: "/dashboard/risk",
          icon: AlertTriangle,
          badge: "Real-Time",
        },
        {
          label: language === "hi" ? "सिग्नल सहसंबंध एवं क्रॉस-स्कीम" : "Multi-Signal & Cross-Scheme",
          sub: language === "hi" ? "e-SAKSHI, PFMS व अन्य योजनाओं का एकीकरण" : "e-SAKSHI + PFMS + PMGSY Multi-Fund Link",
          href: "/dashboard/crosscheck",
          icon: Layers,
          badge: "Fusion",
        },
        {
          label: language === "hi" ? "विजुअल फोरेंसिक्स व फोटो जांच" : "Visual Forensics & Duplicates",
          sub: language === "hi" ? "कंप्यूटर विज़न द्वारा डुप्लिकेट फोटो पहचान" : "Computer Vision Reused Photo Detection",
          href: "/dashboard/evidence",
          icon: Scan,
          badge: "CV <1s",
        },
        {
          label: language === "hi" ? "इसरो भुवन उपग्रह जीआईएस एटलस" : "ISRO Satellite GIS Atlas",
          sub: language === "hi" ? "उपग्रह टाइमलाइन परिवर्तन एवं 50m जियोफेंस" : "Temporal Change Detection & 50m Radius",
          href: "/dashboard/gis",
          icon: Compass,
          badge: "Satellite",
        },
        {
          label: language === "hi" ? "विलंब सिमुलेशन एवं निधि पूर्वानुमान" : "Delay Simulation & Forecasting",
          sub: language === "hi" ? "ठेकेदार गति व निधि रुकावट सिमुलेटर" : "Contractor Velocity & Fund Lapse Modeling",
          href: "/dashboard/simulation",
          icon: Clock,
          badge: "Predictive",
        },
        {
          label: language === "hi" ? "जांच केस बिल्डर व फोरेंसिक लॉग" : "Investigation Dossier Builder",
          sub: language === "hi" ? "कैग-अनुरूप अपरिवर्तनीय साक्ष्य श्रृंखला" : "Immutable Audit Trail & CAG Case Files",
          href: "/dashboard/investigation",
          icon: FileCheck2,
          badge: "Forensics",
        },
      ],
    },
    {
      title: language === "hi" ? "परियोजनाएं एवं अनुपालन" : "Projects & Compliance",
      href: "/dashboard/projects",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "अखिल भारतीय परियोजना डायरेक्टरी" : "All-India Project Registry",
          sub: language === "hi" ? "543 संसदीय क्षेत्रों के लाइव कार्य" : "Search & Filter Works Across 543 Constituencies",
          href: "/dashboard/projects",
          icon: BarChart3,
          badge: "Live DB",
        },
        {
          label: language === "hi" ? "प्राथमिकता कार्रवाई अलर्ट" : "Priority Action Center",
          sub: language === "hi" ? "जिलाधिकारियों हेतु त्वरित एक्शन लिस्ट" : "High-Risk Ranked Queues for DMs",
          href: "/dashboard/alerts",
          icon: AlertTriangle,
          badge: "Priority",
        },
        {
          label: language === "hi" ? "संशोधित दिशानिर्देश 2023 अनुपालन" : "Statutory Policy Compliance",
          sub: language === "hi" ? "GFR 2017 व सांसद निधि नियमों की जांच" : "Automated Validation of GFR 2017 & MPLADS Norms",
          href: "/dashboard/compliance",
          icon: ShieldCheck,
          badge: "Statutory",
        },
        {
          label: language === "hi" ? "कैग / MoSPI ऑडिट रिपोर्ट" : "Audit Compliance Reports",
          sub: language === "hi" ? "एक-क्लिक यूसी, एमपीआर व ऑडिट डोजियर" : "One-Click MPR, UC & Analytical Dossiers",
          href: "/dashboard/reports",
          icon: FileText,
          badge: "Reports",
        },
        {
          label: language === "hi" ? "पारंपरिक बनाम एआई फीचर तुलना" : "Feature Comparison Matrix",
          sub: language === "hi" ? "पारंपरिक व्यवस्था बनाम निधि-रक्षक" : "Benchmark: Existing Ecosystem vs AI",
          href: "/#feature-comparison",
          icon: GitBranch,
          badge: "Benchmark",
        },
      ],
    },
    {
      title: language === "hi" ? "हितधारक पोर्टल" : "Stakeholder Desks",
      href: "/dashboard/mp",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "माननीय सांसद अनुशंसा डेस्क" : "Hon'ble MP Recommendation Portal",
          sub: language === "hi" ? "₹5.00 Cr वार्षिक आवंटन एवं कार्य अनुशंसा" : "One-Click Project Recommendations & Balance",
          href: "/dashboard/mp",
          icon: Landmark,
          badge: "MP Portal",
        },
        {
          label: language === "hi" ? "जिला मजिस्ट्रेट / नोडल डेस्क" : "District Magistrate / Nodal Desk",
          sub: language === "hi" ? "प्रशासनिक स्वीकृति व एजेंसी प्रबंधन" : "Sanction Tracking, Agency Tenders & Milestone Approval",
          href: "/dashboard/district",
          icon: Building,
          badge: "District",
        },
        {
          label: language === "hi" ? "राज्य नोडल निदेशालय" : "State Nodal Directorate",
          sub: language === "hi" ? "राज्य-स्तरीय निधि प्रवाह एवं समन्वय" : "State-Wide Progress & Inter-District Coordination",
          href: "/dashboard/state",
          icon: Landmark,
          badge: "State",
        },
        {
          label: language === "hi" ? "केंद्रीय मंत्रालय (MoSPI) डैशबोर्ड" : "Ministry (MoSPI) Central Monitoring",
          sub: language === "hi" ? "राष्ट्रीय निगरानी एवं संसद डैशबोर्ड" : "National Overview & Union Executive Insights",
          href: "/dashboard/ministry",
          icon: ShieldCheck,
          badge: "National",
        },
      ],
    },
    {
      title: language === "hi" ? "नागरिक एवं शिकायत" : "Citizen & Grievances",
      href: "/dashboard/citizen",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "नागरिक सोशल ऑडिट पोर्टल" : "Public Social Audit Portal",
          sub: language === "hi" ? "स्थानीय कार्यों की पुष्टि व जियो-फोटो अपलोड" : "Crowdsourced Geo-Photo Verification On-Ground",
          href: "/dashboard/citizen",
          icon: Users,
          badge: "Public",
        },
        {
          label: language === "hi" ? "नागरिक शिकायत निवारण (CPGRAMS)" : "Grievance Redressal (CPGRAMS)",
          sub: language === "hi" ? "एसएलए ट्रैकिंग व त्वरित निस्तारण" : "Lodge Grievance with Strict SLA Tracking",
          href: "/dashboard/grievance",
          icon: UserCheck,
          badge: "24x7 SLA",
        },
        {
          label: language === "hi" ? "आधिकारिक वृत्तचित्र (4K Film)" : "Official Documentary Film",
          sub: language === "hi" ? "निधि-रक्षक एआई सर्विलांस वीडियो" : "Watch 4K HD Video Overview of Platform",
          href: "/#official-documentary",
          icon: Video,
          badge: "4K HD",
        },
        {
          label: language === "hi" ? "तकनीकी विनिर्देश व अनुसंधान" : "Technical Specs & Research",
          sub: language === "hi" ? "यूएसपी, आर्किटेक्चर एवं विधिक संदर्भ" : "Explore Technical Sheets & Statutory References",
          href: "/#features-research-tables",
          icon: Sparkles,
          badge: "SIH 2026",
        },
      ],
    },
    {
      title: language === "hi" ? "मंत्रालय" : "Ministry",
      href: "/#about-scheme",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "निधि-रक्षक एवं योजना परिचय" : "About NIDHI-RAKSHAK & MPLADS",
          sub: language === "hi" ? "MoSPI विज़न व विकसित भारत @2047" : "National Public Fund Governance Vision",
          href: "/#about-scheme",
          icon: ShieldCheck,
          badge: "MoSPI",
        },
        {
          label: language === "hi" ? "निधि-रक्षक क्यों आवश्यक है?" : "Why Implement NIDHI-RAKSHAK",
          sub: language === "hi" ? "शून्य-रिसाव हेतु 4 मुख्य प्रशासनिक कारण" : "4 Critical Governance Imperatives & Solutions",
          href: "/#why-nidhirakshak",
          icon: AlertTriangle,
          badge: "Imperative",
        },
        {
          label: language === "hi" ? "संपर्क एवं नोडल अधिकारी निर्देशिका" : "Contact & Nodal Directory",
          sub: language === "hi" ? "हेल्पलाइन 1800-11-8080 व ईमेल" : "24x7 Helpline, RTI & District Officers",
          href: "/#footer-contact",
          icon: Building,
          badge: "Support",
        },
      ],
    },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs select-none">
      {/* 1. TOP BRANDING ROW */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Emblem + Logo + Ministry Typography */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" aria-label="Go to Home">
            {/* National Emblem of India */}
            <div className="w-6 sm:w-8 flex items-center justify-center shrink-0">
              <EmblemOfIndia size={32} className="text-slate-800 scale-90 sm:scale-100" />
            </div>

            {/* NIDHI-RAKSHAK Logo */}
            <div className="flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="NIDHI-RAKSHAK Logo"
                width={42}
                height={46}
                className="h-8 sm:h-11 w-auto object-contain drop-shadow-xs"
                priority
              />
            </div>

            {/* Ministry Text */}
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[9px] sm:text-xs text-slate-500 font-medium leading-tight truncate">
                {language === "hi" ? "भारत सरकार" : "Government of India"}
              </span>
              <span className="text-[10.5px] sm:text-[13.5px] font-bold text-slate-900 tracking-tight leading-tight line-clamp-1 sm:line-clamp-none">
                {language === "hi"
                  ? "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय"
                  : "Ministry of Statistics & Programme Implementation"}
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold text-[#133E87] leading-none mt-0.5 truncate">
                {language === "hi"
                  ? "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS)"
                  : "Members of Parliament Local Area Development Scheme"}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Input Bar (Hidden on Mobile, Visible lg+) */}
        <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm mx-2">
          <form onSubmit={handleSearch} className="w-full relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "खोजें (Search)..." : "Search projects, guidelines, funds..."}
              className="w-full bg-white border border-slate-300 rounded-md py-1.5 pl-3 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition shadow-2xs"
              aria-label="Search"
            />
            <button
              type="submit"
              className="absolute right-2 text-slate-500 hover:text-[#133E87] transition p-0.5 cursor-pointer"
              aria-label="Submit Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: National Logos & User Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Swachh Bharat Logo */}
          <div className="hidden xl:flex items-center">
            <Image
              src="/home/sb.png"
              alt="Swachh Bharat"
              width={85}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>

          {/* Digital India Logo */}
          <div className="hidden xl:flex items-center">
            <Image
              src="/home/di.png"
              alt="Digital India"
              width={75}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* User Controls Group: [Sign in ⇲] | [अ/A] | [Accessibility 🚹] */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 1. Official Login Icon Button */}
            <Link
              href="/login"
              className="p-1.5 rounded text-slate-700 hover:text-[#133E87] hover:bg-slate-100 border border-slate-200 transition"
              title="Official Login"
              aria-label="Login to Portal"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* 2. Language Switcher [अ | A] */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold text-slate-700 hover:text-[#133E87] hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Toggle English / Hindi"
              aria-label="Language Toggle"
            >
              <span className="font-serif">अ</span>
              <span className="text-slate-400 text-[9px]">|</span>
              <span>A</span>
            </button>

            {/* 3. Accessibility Controls */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccessMenuOpen(!accessMenuOpen)}
                className={`p-1.5 rounded border transition flex items-center justify-center cursor-pointer ${
                  accessMenuOpen
                    ? "bg-[#133E87] text-white border-[#133E87]"
                    : "text-slate-700 hover:text-[#133E87] hover:bg-slate-100 border-slate-200"
                }`}
                title="Accessibility Options"
                aria-label="Accessibility Menu"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4.5" r="2.5" />
                  <path d="M5 8.5h14" />
                  <path d="M12 9v11" />
                  <path d="M9 20l3-5 3 5" />
                </svg>
              </button>

              {/* Accessibility Popover Modal */}
              {accessMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-white border border-slate-200 rounded-md shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 text-slate-800 text-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                    <span>Accessibility Options</span>
                    <button
                      type="button"
                      onClick={() => setAccessMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Font Size Adjust */}
                  <div className="mb-2.5">
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">Text Size:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onFontSizeChange(-1)}
                        className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer ${fontSizeLevel === -1 ? "bg-[#133E87] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                      >
                        A-
                      </button>
                      <button
                        type="button"
                        onClick={() => onFontSizeChange("reset")}
                        className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer ${fontSizeLevel === 0 ? "bg-[#133E87] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => onFontSizeChange(1)}
                        className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer ${fontSizeLevel === 1 ? "bg-[#133E87] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* Contrast Mode */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">Contrast Mode:</span>
                    <button
                      type="button"
                      onClick={onToggleHighContrast}
                      className={`w-full py-1 text-xs font-bold rounded border flex items-center justify-center gap-1.5 cursor-pointer ${
                        highContrast
                          ? "bg-amber-400 text-slate-950 border-amber-500"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{highContrast ? "High Contrast" : "Standard"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL NAVIGATION MENU & SHADCN BUTTON CTA */}
      <nav ref={dropdownRef} className="w-full bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[13px] font-semibold text-slate-800">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className="relative py-2"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.title)}
                onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xs transition-colors ${
                    item.isActive
                      ? "text-[#133E87] font-bold relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[3px] after:bg-[#133E87]"
                      : "text-slate-700 hover:text-[#133E87]"
                  }`}
                >
                  <span>{item.title}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3 h-3 text-slate-500 opacity-70" />
                  )}
                </Link>

                {/* Dropdown Menu (Wide, High-Contrast with Subtitles and Badges mapped to actual pages) */}
                {item.hasDropdown && activeDropdown === item.title && (
                  <div className="absolute left-0 top-[38px] w-80 bg-[#101E38] text-white shadow-2xl rounded-md py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-t-2 border-amber-400 border-x border-b border-slate-700">
                    <div className="px-3 py-1 mb-1 border-b border-slate-700/80 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <span>{item.title}</span>
                      <span>{item.subItems?.length} Pages</span>
                    </div>

                    <div className="space-y-0.5">
                      {item.subItems?.map((sub, sIdx) => {
                        const Icon = sub.icon;
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-2.5 px-3 py-2 text-xs text-slate-100 hover:bg-[#1C325B] hover:text-amber-300 transition duration-150 group rounded-xs mx-1"
                          >
                            <div className="p-1.5 rounded bg-slate-800/90 text-amber-400 group-hover:bg-[#133E87] group-hover:text-white transition shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-[12.5px] leading-tight text-white group-hover:text-amber-300">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50 shrink-0">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-slate-300 group-hover:text-slate-200 line-clamp-1 mt-0.5">
                                {sub.sub}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Dashboard Action on far right using Shadcn Button */}
          <div className="hidden md:flex items-center py-1.5">
            <Button
              variant="outline"
              size="sm"
              className="border-[#133E87]/30 text-[#133E87] hover:bg-blue-50 hover:text-[#0B2545] font-bold text-xs h-8 px-3.5 shadow-2xs transition-all flex items-center gap-1.5 rounded-md cursor-pointer"
              onClick={() => router.push("/dashboard/projects")}
            >
              <span>{language === "hi" ? "सार्वजनिक पोर्टल" : "Public Transparency Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#133E87]" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 text-xs max-h-[75vh] overflow-y-auto animate-in slide-in-from-top duration-200 shadow-xl">
            {/* Mobile Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "hi" ? "परियोजना या दिशानिर्देश खोजें..." : "Search projects, guidelines, funds..."}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-900"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-500">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Nav Links */}
            <div className="divide-y divide-slate-100 pt-1">
              {navItems.map((item, idx) => (
                <div key={idx} className="py-2.5">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between font-bold py-1 ${item.isActive ? "text-[#133E87]" : "text-slate-800"}`}
                  >
                    <span>{item.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  {item.subItems && (
                    <div className="pl-2 space-y-1.5 mt-2 border-l-2 border-slate-200">
                      {item.subItems.map((sub, sIdx) => {
                        const Icon = sub.icon;
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-[11.5px] text-slate-700 hover:text-[#133E87] py-1 px-1.5 rounded hover:bg-slate-50"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#133E87] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold block truncate">{sub.label}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{sub.sub}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direct Mobile Dashboard Button using Shadcn Button */}
            <div className="pt-2 border-t border-slate-200">
              <Button
                variant="default"
                className="w-full bg-[#0B2545] hover:bg-[#133E87] text-white font-bold py-2.5 text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/dashboard/projects");
                }}
              >
                <span>{language === "hi" ? "सार्वजनिक पोर्टल खोलें" : "Open Public Transparency Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
