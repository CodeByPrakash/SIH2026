"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  IconLanguage,
  IconCheck,
  IconSearch,
  IconX,
  IconChevronDown,
  IconWorld,
  IconRefresh,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  script: string;
  popular?: boolean;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  { code: "en", name: "English", nativeName: "English", region: "All-India / Official", script: "Latin", popular: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "National / Central & Northern India", script: "Devanagari", popular: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "West Bengal, Tripura, Assam", script: "Bengali", popular: true },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "Andhra Pradesh, Telangana", script: "Telugu", popular: true },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "Maharashtra, Goa", script: "Devanagari", popular: true },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "Tamil Nadu, Puducherry", script: "Tamil", popular: true },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "Gujarat, Daman & Diu", script: "Gujarati", popular: true },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "Karnataka", script: "Kannada", popular: true },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "Kerala, Lakshadweep", script: "Malayalam", popular: true },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "Punjab, Delhi, Haryana", script: "Gurmukhi", popular: true },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "Odisha", script: "Odia", popular: true },
  { code: "as", name: "Assamese", nativeName: "অसमীয়া", region: "Assam, North-East", script: "Bengali-Assamese", popular: true },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "Jammu & Kashmir, Telangana, UP", script: "Perso-Arabic", popular: true },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", region: "Classical / Pan-India", script: "Devanagari" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", region: "Bihar, Jharkhand", script: "Devanagari" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", region: "Jammu & Kashmir", script: "Devanagari" },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी", region: "Bihar, Eastern UP", script: "Devanagari" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", region: "Sikkim, West Bengal", script: "Devanagari" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", region: "Goa, Coastal Karnataka", script: "Devanagari" },
  { code: "mni-Mtei", name: "Meitei (Manipuri)", nativeName: "মৈতৈলোন্", region: "Manipur", script: "Meitei Mayek" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", region: "Gujarat, Rajasthan, Maharashtra", script: "Arabic" },
  { code: "lus", name: "Mizo", nativeName: "Mizo ṭawng", region: "Mizoram", script: "Latin" },
];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
            layout?: number;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

interface IndianLanguageTranslatorProps {
  variant?: "pill" | "button" | "compact";
  className?: string;
}

export default function IndianLanguageTranslator({
  variant = "pill",
  className = "",
}: IndianLanguageTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper to set googtrans cookies across paths and domains
  const setGoogleTranslateCookie = (langCode: string) => {
    const hostname = window.location.hostname;
    const cookie1 = `/en/${langCode}`;
    const cookie2 = `/auto/${langCode}`;

    const domains = ["", `domain=${hostname};`];
    if (hostname.includes(".")) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        const rootDomain = "." + parts.slice(-2).join(".");
        domains.push(`domain=${rootDomain};`);
      }
    }

    domains.forEach((dom) => {
      document.cookie = `googtrans=${cookie1}; path=/; ${dom}`;
      document.cookie = `googtrans=${cookie2}; path=/; ${dom}`;
    });
  };

  const clearGoogleTranslateCookie = () => {
    const hostname = window.location.hostname;
    const domains = ["", `domain=${hostname};`];
    if (hostname.includes(".")) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        const rootDomain = "." + parts.slice(-2).join(".");
        domains.push(`domain=${rootDomain};`);
      }
    }

    domains.forEach((dom) => {
      document.cookie = `googtrans=/en/en; path=/; ${dom}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${dom}`;
    });
  };

  const triggerTranslateCombo = (langCode: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
      return true;
    }
    return false;
  };

  // Check saved language on mount and apply if needed
  useEffect(() => {
    const saved = localStorage.getItem("preferred_indian_lang") || "en";
    setCurrentLang(saved);

    if (saved && saved !== "en") {
      setGoogleTranslateCookie(saved);
      // Attempt triggering combo if already loaded
      setTimeout(() => {
        triggerTranslateCombo(saved);
      }, 500);
      setTimeout(() => {
        triggerTranslateCombo(saved);
      }, 1500);
    }
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeLanguageObj =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  const handleSelectLanguage = (langCode: string) => {
    setIsTranslating(true);
    setCurrentLang(langCode);
    localStorage.setItem("preferred_indian_lang", langCode);
    setIsOpen(false);

    if (langCode === "en") {
      clearGoogleTranslateCookie();
    } else {
      setGoogleTranslateCookie(langCode);
    }

    // Try triggering in-memory Google Translate combo if available
    triggerTranslateCombo(langCode);

    // Refresh page with active googtrans cookie for comprehensive full-page translation
    setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  const handleResetEnglish = () => {
    handleSelectLanguage("en");
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative inline-block ${className}`} ref={modalRef}>
      {/* ── Trigger Button ── */}
      {variant === "compact" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer select-none"
          title="Translate to Indian Languages"
          aria-label="Translate to Indian Languages"
        >
          <IconLanguage className="size-3.5 text-primary" />
          <span className="font-semibold text-[11px]">{activeLanguageObj.nativeName}</span>
          <span className="text-[10px]">🇮🇳</span>
          <IconChevronDown className="size-3 text-muted-foreground" />
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all cursor-pointer select-none"
          title="India Multilingual Translation"
        >
          <IconLanguage className="size-4" />
          <span className="truncate">{activeLanguageObj.nativeName}</span>
          <span className="text-xs">🇮🇳</span>
          <IconChevronDown className="size-3.5 opacity-70" />
        </button>
      ) : (
        /* Default Pill Variant (Top Navbar / Header) */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer select-none ${currentLang !== "en"
            ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold shadow-2xs"
            : "border-border bg-card hover:bg-muted text-foreground"
            }`}
          title="Bhasha Translation — Official Indian Languages"
        >
          <IconLanguage className="size-3.5 text-primary shrink-0" />
          <span className="font-semibold text-[11px] tracking-tight truncate max-w-[85px] sm:max-w-none">
            {activeLanguageObj.nativeName}
          </span>
          <span className="text-[10px] shrink-0">🇮🇳</span>
          <IconChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
        </button>
      )}

      {/* ── Dropdown / Modal Selector ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-border/70 bg-muted/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <IconWorld className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-foreground">Select Indian Language</h3>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                      🇮🇳 INDIA
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Full-page dynamic multilingual translation (Schedule VIII)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <IconX className="size-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Indian language or state..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Popular Picks */}
          {!search && (
            <div className="p-3 border-b border-border/50 bg-muted/15">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Top Regional Bhashas</span>
                {currentLang !== "en" && (
                  <button
                    type="button"
                    onClick={handleResetEnglish}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <IconRefresh className="size-2.5" />
                    Reset to English
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {INDIAN_LANGUAGES.filter((l) => l.popular).slice(0, 6).map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`px-2 py-1.5 rounded-lg text-left transition-all border text-xs cursor-pointer ${isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-background border-border/60 hover:bg-muted text-foreground"
                        }`}
                    >
                      <div className="text-[11px] font-semibold truncate leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className={`text-[9px] truncate ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {lang.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Indian Languages Scrollable List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-border/40 p-1">
            {filteredLanguages.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No Indian language matches &quot;{search}&quot;.
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer group ${isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`size-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}>
                        {lang.nativeName.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold leading-tight truncate">
                            {lang.nativeName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ({lang.name})
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {lang.region}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <IconCheck className="size-3" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {lang.code.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-muted/40 border-t border-border/70 flex items-center justify-between text-[10px] text-muted-foreground px-3">
            <span>Official Bhasha of Republic of India</span>
            {isTranslating && (
              <span className="text-primary font-medium animate-pulse flex items-center gap-1">
                Translating page...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
