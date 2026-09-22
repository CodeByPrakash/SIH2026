"use client";

import  { useState } from "react";
import { GovHeader } from "@/components/home/GovHeader";
import { HeroBannerCarousel } from "@/components/home/HeroBannerCarousel";
import { AnnouncementsTicker } from "@/components/home/AnnouncementsTicker";
import { MinistryLeadershipSection } from "@/components/home/MinistryLeadershipSection";
import { KeyOfferingsWhatNew } from "@/components/home/KeyOfferingsWhatNew";
import { NidhiBentoFeatures } from "@/components/home/NidhiBentoFeatures";
import { DocumentsPersonasLinks } from "@/components/home/DocumentsPersonasLinks";
import { SocialCitizenEngagement } from "@/components/home/SocialCitizenEngagement";
import { InfographicsHighlights } from "@/components/home/InfographicsHighlights";
import { GovFooter } from "@/components/home/GovFooter";

export default function HomePage() {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const handleFontSizeChange = (action: number | "reset") => {
    if (action === "reset") {
      setFontSizeLevel(0);
    } else {
      setFontSizeLevel((prev) => Math.max(-1, Math.min(1, prev + action)));
    }
  };

  const handleToggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  // Font size scale class applied to main container
  const fontSizeClass =
    fontSizeLevel === 1
      ? "text-[110%]"
      : fontSizeLevel === -1
      ? "text-[92%]"
      : "text-[100%]";

  const contrastClass = highContrast
    ? "contrast-125 saturate-150 bg-black text-white"
    : "bg-white text-slate-900";

  return (
    <div
      id="main-wrapper"
      className={`min-h-screen flex flex-col font-sans transition-all duration-200 ${fontSizeClass} ${contrastClass}`}
    >
      {/* 1. Government DBIM Header */}
      <GovHeader
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={handleFontSizeChange}
        highContrast={highContrast}
        onToggleHighContrast={handleToggleHighContrast}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* 2. Top Banner Carousel (Hero Section with Banner Placeholders) */}
        <HeroBannerCarousel language={language} />

        {/* 3. Announcements Ticker */}
        <AnnouncementsTicker language={language} />
    
        {/* 5. Ministry & Leadership Section */}
        <MinistryLeadershipSection language={language} />

        {/* 6. Official Video Section */}
        <KeyOfferingsWhatNew language={language} />

        {/* 6.5 NIDHI-RAKSHAK Features & USPs Bento Grid */}
        <NidhiBentoFeatures language={language} />

        {/* 7. Recent Documents, User Personas & Important Links */}
        <DocumentsPersonasLinks language={language} />

        {/* 8. Citizen Engagement / Social Media Section */}
        <SocialCitizenEngagement language={language} />

        {/* 9. Infographics & Key Statistics Section */}
        <InfographicsHighlights language={language} />

        {/* 10. Partner Logos Carousel */}
      </main>

      {/* 11. Official Government Footer */}
      <GovFooter language={language} />
    </div>
  );
}
