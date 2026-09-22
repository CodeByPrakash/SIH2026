"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  IconLanguage,
  IconCheck,
  IconSearch,
  IconX,
  IconChevronDown,
  IconWorld,
  IconRefresh,
  IconLoader2,
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
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "Assam, North-East", script: "Bengali-Assamese", popular: true },
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

// Global translation cache shared across components in the current tab session
const clientTranslationDictionary: Record<string, Record<string, string>> = {};

// Track original text on DOM nodes using a WeakMap to avoid DOM leaks
const originalNodeTextMap = new WeakMap<Node, string>();

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
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load cached translations from sessionStorage on mount
  useEffect(() => {
    try {
      INDIAN_LANGUAGES.forEach((lang) => {
        if (lang.code !== "en") {
          const cached = sessionStorage.getItem(`bhasha_cache_${lang.code}`);
          if (cached) {
            clientTranslationDictionary[lang.code] = {
              ...(clientTranslationDictionary[lang.code] || {}),
              ...JSON.parse(cached),
            };
          }
        }
      });
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Check if a DOM node should be translated
  const shouldTranslateNode = (node: Node): boolean => {
    const parent = node.parentElement;
    if (!parent) return false;

    const tag = parent.tagName.toLowerCase();
    if (
      tag === "script" ||
      tag === "style" ||
      tag === "noscript" ||
      tag === "svg" ||
      tag === "code" ||
      tag === "pre" ||
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      tag === "option"
    ) {
      return false;
    }

    if (
      parent.closest(".notranslate") ||
      parent.closest("[data-no-translate]") ||
      parent.closest("button[data-language-picker]")
    ) {
      return false;
    }

    const text = node.nodeValue?.trim();
    if (!text || text.length <= 1) return false;

    // Skip pure numbers, currency values, dates, percentages, IDs
    if (/^[0-9₹$€,.\-/:%#+()|•\s]+$/.test(text)) return false;
    if (text.startsWith("PROJ-") || text.startsWith("MPLADS/")) return false;

    return true;
  };

  // Core DOM translation function
  const translateDOM = useCallback(async (targetLang: string) => {
    if (typeof document === "undefined") return;

    // Reset to English immediately
    if (targetLang === "en") {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node) {
        if (originalNodeTextMap.has(node)) {
          const original = originalNodeTextMap.get(node);
          if (original && node.nodeValue !== original) {
            node.nodeValue = original;
          }
        }
        node = walker.nextNode();
      }
      return;
    }

    const dict = clientTranslationDictionary[targetLang] || {};
    const textNodesToTranslate: { node: Node; original: string }[] = [];
    const uncachedTextsSet = new Set<string>();

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let currentNode: Node | null = walker.nextNode();

    while (currentNode) {
      if (shouldTranslateNode(currentNode)) {
        // Record original English text
        let original = originalNodeTextMap.get(currentNode);
        if (!original) {
          original = currentNode.nodeValue || "";
          originalNodeTextMap.set(currentNode, original);
        }

        const trimmedOriginal = original.trim();
        if (trimmedOriginal) {
          textNodesToTranslate.push({ node: currentNode, original: trimmedOriginal });

          if (!dict[trimmedOriginal]) {
            uncachedTextsSet.add(trimmedOriginal);
          }
        }
      }
      currentNode = walker.nextNode();
    }

    // Apply any translations already available in dictionary immediately (0ms)
    textNodesToTranslate.forEach(({ node, original }) => {
      if (dict[original] && node.nodeValue !== dict[original]) {
        // Preserve surrounding whitespace
        const fullOriginal = originalNodeTextMap.get(node) || "";
        const leading = fullOriginal.match(/^\s*/)?.[0] || "";
        const trailing = fullOriginal.match(/\s*$/)?.[0] || "";
        node.nodeValue = leading + dict[original] + trailing;
      }
    });

    const uncachedArray = Array.from(uncachedTextsSet);

    // If all text is already cached, we're done!
    if (uncachedArray.length === 0) {
      setIsTranslating(false);
      return;
    }

    // Otherwise, fetch translations in optimized chunks
    setIsTranslating(true);
    const chunkSize = 35;

    for (let i = 0; i < uncachedArray.length; i += chunkSize) {
      const batch = uncachedArray.slice(i, i + chunkSize);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: batch, targetLang }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translations && typeof data.translations === "object") {
            Object.assign(dict, data.translations);
            clientTranslationDictionary[targetLang] = dict;

            // Save to sessionStorage
            try {
              sessionStorage.setItem(`bhasha_cache_${targetLang}`, JSON.stringify(dict));
            } catch {
              // quota exceeded or private mode
            }

            // Update DOM with new translations
            textNodesToTranslate.forEach(({ node, original }) => {
              if (dict[original] && node.nodeValue !== dict[original]) {
                const fullOriginal = originalNodeTextMap.get(node) || "";
                const leading = fullOriginal.match(/^\s*/)?.[0] || "";
                const trailing = fullOriginal.match(/\s*$/)?.[0] || "";
                node.nodeValue = leading + dict[original] + trailing;
              }
            });
          }
        }
      } catch (err) {
        console.warn("DOM translation fetch batch error:", err);
      }
    }

    setIsTranslating(false);
  }, []);

  // Language selection handler
  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("preferred_indian_lang", langCode);
    setIsOpen(false);

    // Notify other components
    window.dispatchEvent(
      new CustomEvent("indian-language-change", { detail: { langCode } })
    );

    // Perform seamless in-place DOM translation without reloading page
    translateDOM(langCode);
  };

  const handleResetEnglish = () => {
    handleSelectLanguage("en");
  };

  // Sync with global language changes & handle initial preferred language
  useEffect(() => {
    const saved = localStorage.getItem("preferred_indian_lang") || "en";
    setCurrentLang(saved);

    if (saved !== "en") {
      // Delay slightly for initial React render tree to mount
      const timer = setTimeout(() => {
        translateDOM(saved);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [translateDOM]);

  // Listen for language change events from other translator instances
  useEffect(() => {
    const handleGlobalLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ langCode: string }>;
      if (customEvent.detail?.langCode) {
        setCurrentLang(customEvent.detail.langCode);
      }
    };

    window.addEventListener("indian-language-change", handleGlobalLangChange);
    return () => {
      window.removeEventListener("indian-language-change", handleGlobalLangChange);
    };
  }, []);

  // MutationObserver: translate dynamically loaded projects or new content automatically
  useEffect(() => {
    if (currentLang === "en") return;

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }

    mutationObserverRef.current = new MutationObserver(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        translateDOM(currentLang);
      }, 300);
    });

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });

    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentLang, translateDOM]);

  // Close dropdown on outside click
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

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative inline-block notranslate ${className}`} ref={modalRef} data-no-translate="true">
      {/* ── Trigger Button ── */}
      {variant === "compact" ? (
        <button
          type="button"
          data-language-picker="true"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer select-none"
          title="Translate to Indian Languages"
          aria-label="Translate to Indian Languages"
        >
          {isTranslating ? (
            <IconLoader2 className="size-3.5 text-primary animate-spin" />
          ) : (
            <IconLanguage className="size-3.5 text-primary" />
          )}
          <span className="font-semibold text-[11px]">{activeLanguageObj.nativeName}</span>
          <span className="text-[10px]">🇮🇳</span>
          <IconChevronDown className="size-3 text-muted-foreground" />
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          data-language-picker="true"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all cursor-pointer select-none"
          title="India Multilingual Translation"
        >
          {isTranslating ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconLanguage className="size-4" />
          )}
          <span className="truncate">{activeLanguageObj.nativeName}</span>
          <span className="text-xs">🇮🇳</span>
          <IconChevronDown className="size-3.5 opacity-70" />
        </button>
      ) : (
        /* Default Pill Variant (Top Navbar / Header) */
        <button
          type="button"
          data-language-picker="true"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
            currentLang !== "en"
              ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold shadow-2xs"
              : "border-border bg-card hover:bg-muted text-foreground"
          }`}
          title="Bhasha Translation — Official Indian Languages"
        >
          {isTranslating ? (
            <IconLoader2 className="size-3.5 text-primary animate-spin shrink-0" />
          ) : (
            <IconLanguage className="size-3.5 text-primary shrink-0" />
          )}
          <span className="font-semibold text-[11px] tracking-tight truncate max-w-[85px] sm:max-w-none">
            {activeLanguageObj.nativeName}
          </span>
          <span className="text-[10px] shrink-0">🇮🇳</span>
          <IconChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
        </button>
      )}

      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Dropdown / Modal Selector ── */}
      {isOpen && (
        <div className="fixed inset-x-2.5 top-16 max-h-[85vh] sm:max-h-[520px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] w-auto rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="shrink-0 p-3.5 border-b border-border/70 bg-muted/40">
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
                className="size-7 rounded-lg hover:bg-muted active:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <IconX className="size-4" />
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
                className="w-full pl-8 pr-7 py-2 sm:py-1.5 rounded-lg border border-input bg-background text-sm sm:text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Popular Picks */}
          {!search && (
            <div className="shrink-0 p-3 border-b border-border/50 bg-muted/15">
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
                      className={`px-2 py-2 sm:py-1.5 rounded-lg text-left transition-all border text-xs cursor-pointer active:scale-98 ${
                        isSelected
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
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-border/40 p-1">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer group active:bg-muted/80 ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
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
                        <span className="text-[10px] text-muted-foreground font-mono opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
          <div className="shrink-0 p-2.5 bg-muted/40 border-t border-border/70 flex items-center justify-between text-[10px] text-muted-foreground px-3">
            <span>Official Bhasha of Republic of India</span>
            {isTranslating ? (
              <span className="text-primary font-medium flex items-center gap-1">
                <IconLoader2 className="size-3 animate-spin" />
                Translating...
              </span>
            ) : currentLang !== "en" ? (
              <button
                type="button"
                onClick={handleResetEnglish}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Reset English
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
