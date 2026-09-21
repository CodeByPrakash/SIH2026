"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface HeroBannerCarouselProps {
  language: "en" | "hi";
}

export function HeroBannerCarousel({ language }: HeroBannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      category: language === "hi" ? "नागरिक सशक्तिकरण" : "BENEFITS FOR CITIZENS",
      tagline: language === "hi" ? "पारदर्शिता एवं जन-भागीदारी" : "Citizen Centric Public Governance",
      title:
        language === "hi"
          ? "नागरिकों के लिए प्रत्यक्ष लाभ: अपने क्षेत्र के विकास कार्यों को लाइव ट्रैक करें"
          : "Direct Benefits for Citizens: Real-Time Tracking & Asset Verification",
      subtitle:
        language === "hi"
          ? "पेयजल, स्कूल, स्वास्थ्य केंद्र और सड़कों की भौतिक प्रगति देखें। जियो-टैग फोटो प्रमाण की जांच करें एवं फीडबैक/शिकायत दर्ज करें।"
          : "Track sanctioned community works in your constituency, verify geo-tagged photo proofs on ground, and lodge feedback directly with district authorities.",
      badgeText: language === "hi" ? "जन-भागीदारी | 100% सार्वजनिक निगरानी" : "Citizen First | 100% Public Transparency",
      imageSrc: "/home/banner_citizen.jpg",
      imageAlt: "Citizens benefiting from completed community infrastructure",
      primaryCta: {
        label: language === "hi" ? "अपने क्षेत्र के कार्य खोजें" : "Track Works",
        href: "/dashboard/citizen",
      },
      secondaryCta: {
        label: language === "hi" ? "जियो-फोटो साक्ष्य देखें" : "View Photos",
        href: "/dashboard/evidence",
      },
      highlights: [
        language === "hi" ? "सार्वजनिक परिसंपत्ति खोज" : "Constituency Asset Search",
        language === "hi" ? "जियो-टैग्ड साक्ष्य जांच" : "Geo-Tagged Photo Audit",
        language === "hi" ? "त्वरित नागरिक शिकायत" : "Direct Grievance Redressal",
      ],
    },
    {
      id: 2,
      category: language === "hi" ? "संसद सदस्य सेवाएं" : "BENEFITS FOR HON'BLE MPs",
      tagline: language === "hi" ? "त्वरित डिजिटल स्वीकृति एवं निगरानी" : "Empowering Parliamentarians",
      title:
        language === "hi"
          ? "माननीय सांसदों के लिए लाभ: कार्यों की ऑनलाइन अनुशंसा एवं वास्तविक समय निधि ट्रैकिंग"
          : "Empowering Hon'ble MPs: Paperless Project Recommendation & Fund Control",
      subtitle:
        language === "hi"
          ? "वार्षिक ₹5.00 करोड़ की निधि से स्थानीय आवश्यकताओं की त्वरित डिजिटल संस्तुति। जिला प्रशासनिक स्वीकृति और अप्रयुक्त शेष राशि का लाइव विवरण।"
          : "Seamlessly recommend vital local projects online with ₹5.00 Cr annual entitlement, monitor administrative approvals across district nodal offices, and eliminate delays.",
      badgeText: language === "hi" ? "संसदीय पोर्टल | डिजिटल ई-साक्षी 2026" : "Parliamentary Portal | e-Sakshi & Web-MPLADS",
      imageSrc: "/home/banner_mp.jpg",
      imageAlt: "Hon'ble Member of Parliament reviewing constituency projects",
      primaryCta: {
        label: language === "hi" ? "कार्य अनुशंसा पोर्टल" : "Recommend Works",
        href: "/dashboard/mp",
      },
      secondaryCta: {
        label: language === "hi" ? "स्वीकृति एवं आवंटन स्थिति" : "Fund Overview",
        href: "/dashboard/projects",
      },
      highlights: [
        language === "hi" ? "डिजिटल कार्य अनुशंसा" : "One-Click Work Recommendation",
        language === "hi" ? "निधि उपयोगिता ट्रैकर" : "Unspent Balance Dashboard",
        language === "hi" ? "जिला प्रगति हीटमैप" : "Constituency Progress Heatmaps",
      ],
    },
    {
      id: 3,
      category: language === "hi" ? "सरकारी एवं जिला प्रशासन" : "BENEFITS FOR GOVERNMENT & NODAL OFFICES",
      tagline: language === "hi" ? "एआई निगरानी एवं शून्य वित्तीय दोहराव" : "AI Governance & Surveillance",
      title:
        language === "hi"
          ? "सरकार एवं जिला अधिकारियों हेतु: एआई-संचालित उपग्रह जांच व पूर्ण वित्तीय पारदर्शिता"
          : "Benefits for Government Authorities: AI Surveillance & Zero Fiscal Leakage",
      subtitle:
        language === "hi"
          ? "निधि-रक्षक एआई इंजन द्वारा फर्जी/दोहरे बिलों की रोकथाम, सैटेलाइट और ईएक्सआईएफ जिओ-कोऑर्डिनेट्स सत्यापन एवं त्वरित उपयोगिता प्रमाणपत्र।"
          : "NIDHI-RAKSHAK AI Engine enables automated duplicate claim detection, EXIF coordinate cross-validation, and instant reconciliation of utilization certificates.",
      badgeText: language === "hi" ? "राष्ट्रीय एआई निगरानी | MoSPI सुशासन" : "National AI Surveillance | MoSPI Good Governance",
      imageSrc: "/home/banner_govt.jpg",
      imageAlt: "Government officials in central monitoring room using AI satellite analytics",
      primaryCta: {
        label: language === "hi" ? "एआई ऑडिट इंजन लॉन्च करें" : "Launch AI Engine",
        href: "/dashboard/ai-audit",
      },
      secondaryCta: {
        label: language === "hi" ? "जिला नोडल डैशबोर्ड" : "District Portal",
        href: "/dashboard/district",
      },
      highlights: [
        language === "hi" ? "एआई डुप्लीकेट पहचान" : "AI Duplicate Claim Detection",
        language === "hi" ? "सैटेलाइट जीआईएस सत्यापन" : "Satellite GIS Cross-Check",
        language === "hi" ? "स्वचालित यूसी मिलान" : "Automated UC & MPR",
      ],
    },
    {
      id: 4,
      category: language === "hi" ? "विकसित भारत @2047" : "NATIONAL DEVELOPMENT MISSION",
      tagline: language === "hi" ? "संशोधित सांसद निधि योजना दिशानिर्देश 2023" : "Revised MPLADS Guidelines 2023",
      title:
        language === "hi"
          ? "सांसद स्थानीय क्षेत्र विकास योजना: 543 संसदीय क्षेत्रों में टिकाऊ सामुदायिक परिसंपत्तियों का निर्माण"
          : "MPLADS National Mission: Creating Durable Community Assets Across 543 Constituencies",
      subtitle:
        language === "hi"
          ? "शुद्ध पेयजल, स्मार्ट क्लासरूम, प्राथमिक स्वास्थ्य केंद्र, सौर ऊर्जा और ग्रामीण संपर्क—प्रत्येक नागरिक की बुनियादी आवश्यकताओं की शत-प्रतिशत संतृप्ति।"
          : "Prioritizing clean tap water, digital classrooms, primary wellness clinics, all-weather roads, and clean renewable energy to saturate grassroots development nationwide.",
      badgeText: language === "hi" ? "नई दिल्ली | MoSPI भारत सरकार" : "New Delhi | MoSPI Government of India",
      imageSrc: "/home/banner_home.jpg",
      imageAlt: "Panoramic celebration of Indian grassroots infrastructure development",
      primaryCta: {
        label: language === "hi" ? "संशोधित दिशानिर्देश (PDF)" : "Revised Guidelines",
        href: "#features-research-tables",
      },
      secondaryCta: {
        label: language === "hi" ? "सार्वजनिक डैशबोर्ड" : "Public Dashboard",
        href: "/dashboard/projects",
      },
      highlights: [
        language === "hi" ? "₹5.00 करोड़ वार्षिक आवंटन" : "₹5.00 Cr Annual Entitlement/MP",
        language === "hi" ? "100% जियो-टैग्ड सत्यापन" : "100% Geo-Tagged Public Assets",
        language === "hi" ? "टिकाऊ बुनियादी ढांचा" : "Durable Infrastructure",
      ],
    },
  ];

  // Automatic slide rotation
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const current = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden select-none border-b-2 border-slate-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Banner Carousel"
    >
      {/* 1. FULL-WIDTH BACKGROUND IMAGE */}
      <div className="w-full min-h-[460px] sm:min-h-[480px] lg:min-h-[530px] relative flex items-center">
        {/* Full Bleed Image Layer */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            key={current.imageSrc}
            src={current.imageSrc}
            alt={current.imageAlt}
            fill
            className="object-cover object-center sm:object-right transition-opacity duration-700"
            priority
          />

          {/* Multi-stage High-Contrast Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 md:via-slate-950/75 lg:via-slate-950/65 to-slate-950/30 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

          {/* Indian Tricolor Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-500 z-20" />
        </div>

        {/* 2. MAIN CONTENT LAYER */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-20">
          <div className="max-w-2xl lg:max-w-3xl space-y-2.5 sm:space-y-4 text-left">
            {/* Category Tag Header */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/30 px-2 sm:px-2.5 py-0.5 rounded uppercase">
                {current.category}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-slate-200 drop-shadow-sm">
                • {current.tagline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
              {current.title}
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal drop-shadow-sm max-w-2xl line-clamp-3 sm:line-clamp-none">
              {current.subtitle}
            </p>

            {/* Highlight Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {current.highlights.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1 text-[9.5px] sm:text-[11px] bg-slate-950/80 backdrop-blur-xs text-slate-100 border border-slate-700/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded shadow-sm font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Action Buttons & Pill Badge */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
              {/* Event/Location Pill Badge */}
              <div className="inline-flex items-center gap-1 bg-pink-600/90 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md border border-pink-400/40">
                <span>{current.badgeText}</span>
              </div>

              {/* Primary Action Button */}
              <Link
                href={current.primaryCta.href}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 sm:px-4 py-1.5 rounded text-xs inline-flex items-center gap-1.5 shadow-md transition"
              >
                <span>{current.primaryCta.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Secondary Action Button */}
              <Link
                href={current.secondaryCta.href}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white font-semibold px-3.5 sm:px-4 py-1.5 rounded text-xs border border-white/40 shadow-sm transition"
              >
                <span>{current.secondaryCta.label}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. LEFT / RIGHT NAVIGATION BUTTONS (Hidden on narrow mobile to prevent covering text, visible sm+) */}
        <button
          type="button"
          onClick={goToPrev}
          className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-9 sm:h-12 bg-black/70 hover:bg-black text-white items-center justify-center rounded-sm z-30 transition cursor-pointer border border-white/20 shadow-lg"
          title="Previous Slide"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-10 sm:w-9 sm:h-12 bg-black/70 hover:bg-black text-white items-center justify-center rounded-sm z-30 transition cursor-pointer border border-white/20 shadow-lg"
          title="Next Slide"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 4. BOTTOM SLIDE INDICATOR DOTS */}
        <div className="absolute bottom-3 left-4 sm:left-auto sm:right-6 z-30 flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-xs px-2.5 sm:px-3 py-1 rounded-full border border-white/15 shadow-md">
          <div className="flex items-center space-x-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx
                    ? "w-5 sm:w-6 h-1.5 sm:h-2 bg-emerald-400 shadow-xs"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-slate-400 hover:bg-slate-300"
                }`}
                title={`Go to slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
