"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EmblemOfIndia } from "./EmblemOfIndia";
import IndianLanguageTranslator from "@/components/IndianLanguageTranslator";
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
  Box,
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
      title: language === "hi" ? "एआई सर्विलांस सूट" : "AI Surveillance Suite",
      href: "/dashboard/ai-audit",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "निधि एआई ऑडिट इंजन" : "NIDHI AI Audit Engine",
          sub: language === "hi" ? "कैग मानकों पर आधारित 3-स्तरीय विसंगति विश्लेषण" : "ML-Powered CAG Anomaly & Discrepancy Audits",
          href: "/dashboard/ai-audit",
          icon: Bot,
          badge: "AI Core",
        },
        {
          label: language === "hi" ? "3डी डिजिटल ट्विन व लेआउट" : "3D Digital Twin Infrastructure",
          sub: language === "hi" ? "पुल, भवन, सड़क व बांध का 4-चरणीय 3डी मॉडल" : "Step-by-Step 3D Layouts (Bridge, Building, Street, Dam)",
          href: "/dashboard/3d-view",
          icon: Box,
          badge: "3D WebGL",
        },
        {
          label: language === "hi" ? "मल्टी-फैक्टर जोखिम केंद्र (0-100)" : "Multi-Factor Risk Center",
          sub: language === "hi" ? "रीयल-टाइम 0-100 विसंगति व ठेकेदार जोखिम स्कोरिंग" : "Real-Time 0-100 Anomaly & Contractor Scoring",
          href: "/dashboard/risk",
          icon: AlertTriangle,
          badge: "0-100 Risk",
        },
        {
          label: language === "hi" ? "फोटो जियो-क्रॉसचेक एआई" : "Photo Geo-CrossCheck AI",
          sub: language === "hi" ? "जियोफेंस दूरी मिलान एवं डुप्लिकेट फोटो पहचान" : "Geo-Distance & Reused Image Fraud Detection",
          href: "/dashboard/crosscheck",
          icon: Layers,
          badge: "Vision AI",
        },
        {
          label: language === "hi" ? "नागरिक साक्ष्य सत्यापन एआई" : "Citizen Evidence AI",
          sub: language === "hi" ? "जमीनी विसंगति जांच एवं जियो-टैग सत्यापन" : "Ground Discrepancy & Site Photo Verification",
          href: "/dashboard/evidence",
          icon: Scan,
          badge: "Ground AI",
        },
        {
          label: language === "hi" ? "इसरो भुवन उपग्रह जीआईएस एटलस" : "ISRO Satellite GIS Atlas",
          sub: language === "hi" ? "उपग्रह टाइमलाइन परिवर्तन एवं 50m जियोफेंस बफर" : "Temporal Change Detection & 50m Geofence Radius",
          href: "/dashboard/gis",
          icon: Compass,
          badge: "ISRO GIS",
        },
        {
          label: language === "hi" ? "एआई हस्तक्षेप एवं विलंब सिमुलेटर" : "AI Intervention Simulator",
          sub: language === "hi" ? "निधि रुकावट, रिलीज व ठेकेदार गति पूर्वानुमान" : "Fund Release/Hold & Contractor Velocity Modeling",
          href: "/dashboard/simulation",
          icon: Clock,
          badge: "Simulation",
        },
        {
          label: language === "hi" ? "कैग जांच केस व फोरेंसिक डोजियर" : "CAG Investigation Dossier",
          sub: language === "hi" ? "अपरिवर्तनीय डिजिटल साक्ष्य श्रृंखला व ऑडिट लॉग" : "Immutable Forensic Audit Trail & Statutory Dossiers",
          href: "/dashboard/investigation",
          icon: FileCheck2,
          badge: "Forensics",
        },
      ],
    },
    {
      title: language === "hi" ? "परियोजनाएं एवं विश्लेषण" : "Projects & Analytics",
      href: "/dashboard/projects",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "अखिल भारतीय परियोजना एक्सप्लोरर" : "All-India Projects Explorer",
          sub: language === "hi" ? "543 निर्वाचन क्षेत्रों में 15,000+ कार्यों की खोज" : "Search & Filter 15,000+ Works Across 543 Constituencies",
          href: "/dashboard/projects",
          icon: BarChart3,
          badge: "15k+ Works",
        },
        {
          label: language === "hi" ? "वित्तीय विश्लेषण एवं कैग रिपोर्ट" : "Financial Analytics & Reports",
          sub: language === "hi" ? "आवंटन, व्यय रुझान, यूसी व मासिक प्रगति रिपोर्ट" : "Fund Flow, Expenditure Trends, UC & MPR Dossiers",
          href: "/dashboard/reports",
          icon: FileText,
          badge: "PFMS Live",
        },
        {
          label: language === "hi" ? "प्राथमिकता कार्रवाई अलर्ट" : "Priority Action Alerts",
          sub: language === "hi" ? "लागत वृद्धि व समय-सीमा उल्लंघन वाले कार्य" : "Cost Overruns, Deadline Breaches & Urgent Flags",
          href: "/dashboard/alerts",
          icon: AlertTriangle,
          badge: "Alerts",
        },
        {
          label: language === "hi" ? "संशोधित नीति अनुपालन (2023)" : "Statutory Policy Compliance",
          sub: language === "hi" ? "GFR 2017 व संशोधित एमपीलैड्स दिशानिर्देशों का सत्यापन" : "Automated Check against GFR 2017 & MPLADS 2023",
          href: "/dashboard/compliance",
          icon: ShieldCheck,
          badge: "Statutory",
        },
        {
          label: language === "hi" ? "3डी निर्माण लेआउट व चरण" : "3D Construction Milestones",
          sub: language === "hi" ? "नींव से पूर्णता तक 4-चरणीय लेआउट का 3डी अवलोकन" : "4-Stage Construction Progression & Layout Audit",
          href: "/dashboard/3d-view",
          icon: Box,
          badge: "3D View",
        },
      ],
    },
    {
      title: language === "hi" ? "हितधारक पोर्टल" : "Stakeholder Portals",
      href: "/dashboard/mp",
      hasDropdown: true,
      subItems: [
        {
          label: language === "hi" ? "माननीय सांसद अनुशंसा डेस्क" : "Hon'ble MP Recommendation Desk",
          sub: language === "hi" ? "₹5.00 करोड़ वार्षिक आवंटन से ऑनलाइन कार्य अनुशंसा" : "Recommend Vital Constituency Works & Track Sanctions",
          href: "/dashboard/mp",
          icon: Landmark,
          badge: "MP Desk",
        },
        {
          label: language === "hi" ? "जिला मजिस्ट्रेट / नोडल डेस्क" : "District Magistrate / Collector Portal",
          sub: language === "hi" ? "प्रशासनिक स्वीकृति, वर्क ऑर्डर व एजेंसी प्रबंधन" : "Sanction Tracking, Work Orders & Inspection Approvals",
          href: "/dashboard/district",
          icon: Building,
          badge: "District",
        },
        {
          label: language === "hi" ? "राज्य नोडल निदेशालय" : "State Nodal Directorate",
          sub: language === "hi" ? "राज्य-स्तरीय निधि प्रवाह एवं अंतर-जिला समन्वय" : "State-Wide Progress & Inter-District Coordination",
          href: "/dashboard/state",
          icon: Landmark,
          badge: "State",
        },
        {
          label: language === "hi" ? "केंद्रीय मंत्रालय (MoSPI) डैशबोर्ड" : "Ministry (MoSPI) Central Monitoring",
          sub: language === "hi" ? "अखिल भारतीय डैशबोर्ड व संसद समीक्षा रिपोर्ट" : "National Overview, Union Insights & Parliament Reports",
          href: "/dashboard/ministry",
          icon: ShieldCheck,
          badge: "National",
        },
        {
          label: language === "hi" ? "भूमिका चयन एवं लॉगिन" : "Role-Based Portal Login",
          sub: language === "hi" ? "सांसद, डीएम, राज्य, मंत्रालय अथवा नागरिक के रूप में प्रवेश" : "Direct Switch & Login Across All 5 Stakeholder Roles",
          href: "/login",
          icon: LogIn,
          badge: "Access",
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
          sub: language === "hi" ? "स्थानीय कार्यों की स्थिति देखें व जियो-फोटो अपलोड करें" : "Crowdsourced Geo-Photo Verification On-Ground",
          href: "/dashboard/citizen",
          icon: Users,
          badge: "Public",
        },
        {
          label: language === "hi" ? "नागरिक शिकायत निवारण (CPGRAMS)" : "Public Grievance Redressal",
          sub: language === "hi" ? "कार्य में देरी अथवा गुणवत्ता संबंधी शिकायत 24x7 दर्ज करें" : "Lodge Quality & Delay Grievances with Strict 24x7 SLA",
          href: "/dashboard/grievance",
          icon: UserCheck,
          badge: "24x7 SLA",
        },
        {
          label: language === "hi" ? "जमीनी साक्ष्य एवं फोटोग्राफ जांच" : "Citizen Evidence Cross-Check",
          sub: language === "hi" ? "नागरिकों द्वारा अपलोड किए गए फोटो साक्ष्य का विश्लेषण" : "AI Verification of Citizen-Submitted Physical Evidence",
          href: "/dashboard/evidence",
          icon: Scan,
          badge: "Evidence",
        },
        {
          label: language === "hi" ? "नागरिक 3डी परियोजना दर्शन" : "3D Public Infrastructure View",
          sub: language === "hi" ? "नागरिकों हेतु पुल, सड़क, स्कूल व बांध का 3डी मॉडल" : "Publicly Inspect Infrastructure Digital Twins & Steps",
          href: "/dashboard/3d-view",
          icon: Box,
          badge: "3D Twin",
        },
      ],
    },
    {
      title: language === "hi" ? "मंत्रालय व योजना" : "Ministry & Scheme",
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
          label: language === "hi" ? "एआई वास्तुकला एवं मुख्य विशेषताएं" : "AI Architecture & Bento USPs",
          sub: language === "hi" ? "स्वायत्त उपग्रह एवं निधि निगरानी बेंटो ग्रिड" : "Autonomous Satellite & Fund Surveillance Bento Grid",
          href: "/#features-usp",
          icon: Sparkles,
          badge: "Bento USPs",
        },
        {
          label: language === "hi" ? "तकनीकी तुलना: पारंपरिक बनाम एआई" : "Architectural Benchmark Matrix",
          sub: language === "hi" ? "पारंपरिक व्यवस्था बनाम निधि-रक्षक एआई नवाचार" : "Existing Ecosystem vs. NIDHI-RAKSHAK Innovation",
          href: "/#feature-comparison",
          icon: Layers,
          badge: "Benchmark",
        },
        {
          label: language === "hi" ? "तकनीकी विनिर्देश एवं अनुसंधान संदर्भ" : "Technical Specs & Research Repo",
          sub: language === "hi" ? "विस्तृत तकनीकी वास्तुकला, प्रवाह व व्यवहार्यता शीट" : "In-Depth Architecture, Workflows & Feasibility Sheets",
          href: "/#features-research-tables",
          icon: FileText,
          badge: "Research",
        },
        {
          label: language === "hi" ? "MoSPI आधिकारिक वृत्तचित्र (4K Film)" : "MoSPI Official Documentary",
          sub: language === "hi" ? "4K वीडियो: एआई उपग्रह सर्विलांस व सुशासन" : "4K Documentary Film on Satellite Governance",
          href: "/#official-documentary",
          icon: Video,
          badge: "4K Film",
        },
        {
          label: language === "hi" ? "संपर्क एवं नोडल अधिकारी निर्देशिका" : "Contact & Nodal Directory",
          sub: language === "hi" ? "हेल्पलाइन 1800-11-8080 व नोडल सहायता" : "24x7 Helpline, RTI & District Officers",
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

            {/* 2. Indian Multilingual Translation */}
            <IndianLanguageTranslator variant="compact" />

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
                  <div className={`absolute ${idx >= navItems.length - 2 ? "right-0" : "left-0"} top-[38px] w-84 sm:w-92 bg-[#101E38] text-white shadow-2xl rounded-md py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-t-2 border-amber-400 border-x border-b border-slate-700`}>
                    <div className="px-3 py-1 mb-1 border-b border-slate-700/80 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <span>{item.title}</span>
                      <span>{item.subItems?.length} Features</span>
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

          {/* Quick Dashboard Action Buttons on far right using Shadcn Button */}
          <div className="hidden md:flex items-center gap-2 py-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-[#133E87]/30 text-[#133E87] hover:bg-blue-50 hover:text-[#0B2545] font-bold text-xs h-8 px-3 shadow-2xs transition-all flex items-center gap-1.5 rounded-md cursor-pointer"
              onClick={() => router.push("/dashboard/projects")}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#133E87]" />
              <span>{language === "hi" ? "परियोजनाएं" : "Projects Explorer"}</span>
            </Button>
            <Button
              size="sm"
              className="bg-[#0B2545] hover:bg-[#133E87] text-white font-bold text-xs h-8 px-3.5 shadow-2xs transition-all flex items-center gap-1.5 rounded-md cursor-pointer"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === "hi" ? "लॉगिन पोर्टल" : "Portal Login"}</span>
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

            {/* Direct Mobile Dashboard Buttons using Shadcn Button */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full border-[#133E87]/40 text-[#133E87] hover:bg-blue-50 font-bold py-2.5 text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/dashboard/projects");
                }}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "अखिल भारतीय परियोजनाएं" : "Projects Explorer"}</span>
              </Button>
              <Button
                variant="default"
                className="w-full bg-[#0B2545] hover:bg-[#133E87] text-white font-bold py-2.5 text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/login");
                }}
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === "hi" ? "हितधारक लॉगिन पोर्टल" : "Stakeholder Portal Login"}</span>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
