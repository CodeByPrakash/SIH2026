"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { User, UserRole } from "../types";
import { useAuth } from "@/context/AuthContext";
import { PROJECTS, ALERTS, RISK_FLAGS, STATES_DATA, NATIONAL_KPIs } from "../data/mpladsData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = "EN" | "HI" | "MR" | "TA" | "BN" | "KA" | "TE";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
  cards?: ResponseCard[];
  actions?: ActionButton[];
}

interface ResponseCard {
  label: string;
  value: string;
  sub?: string;
  color: "red" | "amber" | "green" | "blue" | "violet";
}

interface ActionButton {
  label: string;
  type: "view" | "filter" | "alert" | "report";
  payload?: string;
}

// ── Language metadata ─────────────────────────────────────────────────────────

const LANGS: { id: Lang; label: string; native: string }[] = [
  { id: "EN", label: "English",  native: "EN" },
  { id: "HI", label: "Hindi",    native: "हि" },
  { id: "MR", label: "Marathi",  native: "म"  },
  { id: "TA", label: "Tamil",    native: "த"  },
  { id: "BN", label: "Bengali",  native: "বা" },
  { id: "KA", label: "Kannada",  native: "ಕ"  },
  { id: "TE", label: "Telugu",   native: "తె" },
];

// ── Static UI strings per language ───────────────────────────────────────────

const UI: Record<Lang, {
  placeholder: string; greeting: string; subtitle: string;
  suggestedLabel: string; disclaimer: string; listening: string;
  onlineStatus: string; voiceQuery: string; clearTitle: string;
}> = {
  EN: { placeholder: "Ask about projects, funds, risks…", greeting: "Namaste! I'm your AI Copilot", subtitle: "Ask me anything about NIDHI-SATHI projects, funds, risks, delays, or compliance — in any language.", suggestedLabel: "Suggested Questions", disclaimer: "AI responses are indicative. Verify critical data on official portals.", listening: "Listening… speak your query", onlineStatus: "Online · NIDHI-SATHI Copilot", voiceQuery: "Show all critical risk projects", clearTitle: "Clear chat" },
  HI: { placeholder: "परियोजनाओं, निधियों, जोखिमों के बारे में पूछें…", greeting: "नमस्ते! मैं आपका AI सहायक हूँ", subtitle: "NIDHI-SATHI परियोजनाओं, निधियों, जोखिमों, देरी या अनुपालन के बारे में कुछ भी पूछें।", suggestedLabel: "सुझाए गए प्रश्न", disclaimer: "AI उत्तर संकेतात्मक हैं। आधिकारिक पोर्टल पर महत्वपूर्ण डेटा सत्यापित करें।", listening: "सुन रहा हूँ… अपना प्रश्न बोलें", onlineStatus: "ऑनलाइन · NIDHI-SATHI सहायक", voiceQuery: "सभी गंभीर जोखिम परियोजनाएं दिखाएं", clearTitle: "चैट साफ़ करें" },
  MR: { placeholder: "प्रकल्प, निधी, जोखीम विचारा…", greeting: "नमस्कार! मी तुमचा AI सहाय्यक आहे", subtitle: "NIDHI-SATHI प्रकल्प, निधी, जोखीम, विलंब किंवा अनुपालनाबद्दल काहीही विचारा।", suggestedLabel: "सुचवलेले प्रश्न", disclaimer: "AI उत्तरे सूचक आहेत। अधिकृत पोर्टलवर महत्त्वाचा डेटा पडताळा.", listening: "ऐकत आहे… आपला प्रश्न बोला", onlineStatus: "ऑनलाइन · NIDHI-SATHI सहाय्यक", voiceQuery: "सर्व गंभीर जोखीम प्रकल्प दाखवा", clearTitle: "चॅट साफ करा" },
  TA: { placeholder: "திட்டங்கள், நிதி, அபாயங்கள் கேளுங்கள்…", greeting: "வணக்கம்! நான் உங்கள் AI உதவியாளர்", subtitle: "NIDHI-SATHI திட்டங்கள், நிதி, அபாயங்கள், தாமதங்கள் அல்லது இணக்கம் பற்றி எதையும் கேளுங்கள்.", suggestedLabel: "பரிந்துரைக்கப்பட்ட கேள்விகள்", disclaimer: "AI பதில்கள் குறிப்பீட்டு தன்மையானவை. அதிகாரப்பூர்வ தளங்களில் தரவை சரிபார்க்கவும்.", listening: "கேட்கிறேன்… உங்கள் கேள்வியை பேசுங்கள்", onlineStatus: "ஆன்லைன் · NIDHI-SATHI உதவியாளர்", voiceQuery: "அனைத்து முக்கியமான ஆபத்து திட்டங்களை காட்டு", clearTitle: "அரட்டையை அழி" },
  BN: { placeholder: "প্রকল্প, তহবিল, ঝুঁকি সম্পর্কে জিজ্ঞাসা করুন…", greeting: "নমস্কার! আমি আপনার AI সহকারী", subtitle: "NIDHI-SATHI প্রকল্প, তহবিল, ঝুঁকি, বিলম্ব বা সম্মতি সম্পর্কে যেকোনো প্রশ্ন করুন।", suggestedLabel: "প্রস্তাবিত প্রশ্নসমূহ", disclaimer: "AI উত্তরগুলি নির্দেশক। সরকারি পোর্টালে গুরুত্বপূর্ণ তথ্য যাচাই করুন।", listening: "শুনছি… আপনার প্রশ্ন বলুন", onlineStatus: "অনলাইন · NIDHI-SATHI সহকারী", voiceQuery: "সমস্ত সঙ্কটজনক ঝুঁকি প্রকল্প দেখান", clearTitle: "চ্যাট পরিষ্কার করুন" },
  KA: { placeholder: "ಯೋಜನೆಗಳು, ನಿಧಿಗಳು, ಅಪಾಯಗಳ ಬಗ್ಗೆ ಕೇಳಿ…", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ", subtitle: "NIDHI-SATHI ಯೋಜನೆಗಳು, ನಿಧಿ, ಅಪಾಯಗಳು, ವಿಳಂಬ ಅಥವಾ ಅನುಪಾಲನೆಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.", suggestedLabel: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು", disclaimer: "AI ಉತ್ತರಗಳು ಸೂಚಕ. ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ನಿರ್ಣಾಯಕ ಡೇಟಾವನ್ನು ಪರಿಶೀಲಿಸಿ.", listening: "ಆಲಿಸುತ್ತಿದೆ… ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಹೇಳಿ", onlineStatus: "ಆನ್‌ಲೈನ್ · NIDHI-SATHI ಸಹಾಯಕ", voiceQuery: "ಎಲ್ಲಾ ಗಂಭೀರ ಅಪಾಯದ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ", clearTitle: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ" },
  TE: { placeholder: "ప్రాజెక్టులు, నిధులు, నష్టాల గురించి అడగండి…", greeting: "నమస్కారం! నేను మీ AI సహాయకుడు", subtitle: "NIDHI-SATHI ప్రాజెక్టులు, నిధులు, నష్టాలు, జాప్యాలు లేదా సమ్మతి గురించి ఏదైనా అడగండి.", suggestedLabel: "సూచించిన ప్రశ్నలు", disclaimer: "AI స్పందనలు సూచికమైనవి. అధికారిక పోర్టల్‌లలో క్రిటికల్ డేటాను ధృవీకరించండి.", listening: "వింటున్నాను… మీ ప్రశ్న చెప్పండి", onlineStatus: "ఆన్‌లైన్ · NIDHI-SATHI సహాయకుడు", voiceQuery: "అన్ని క్రిటికల్ రిస్క్ ప్రాజెక్టులు చూపించు", clearTitle: "చాట్ క్లియర్ చేయండి" },
};

// ── Action button labels ──────────────────────────────────────────────────────

const BTN: Record<Lang, Record<string, string>> = {
  EN: { viewRisk:"View All Risk Projects", openRisk:"Open Risk Center", viewDelayed:"View Delayed Projects", applyDelay:"Apply Delay Filter", viewReports:"View State Reports", gisMap:"Open GIS Map", viewCompliance:"View Compliance Center", downloadUC:"Download UC Report", viewRiskCenter:"View Risk Center", filterOverrun:"Filter by Overrun", viewAlerts:"View All Alerts", critAlerts:"Critical Alerts Only", openInvestigation:"Open Investigation", riskCenter:"Risk Center", sortAmount:"Sort by Amount", financialReports:"Financial Reports", viewCompleted:"View Completed Projects", ucCompliance:"UC Compliance", viewDashboard:"View Dashboard", aiRisk:"AI Risk Center" },
  HI: { viewRisk:"सभी जोखिम परियोजनाएं देखें", openRisk:"जोखिम केंद्र खोलें", viewDelayed:"विलंबित परियोजनाएं देखें", applyDelay:"विलंब फ़िल्टर लागू करें", viewReports:"राज्य रिपोर्ट देखें", gisMap:"GIS मानचित्र खोलें", viewCompliance:"अनुपालन केंद्र देखें", downloadUC:"UC रिपोर्ट डाउनलोड करें", viewRiskCenter:"जोखिम केंद्र देखें", filterOverrun:"अतिरिक्त खर्च फ़िल्टर", viewAlerts:"सभी अलर्ट देखें", critAlerts:"केवल गंभीर अलर्ट", openInvestigation:"जांच खोलें", riskCenter:"जोखिम केंद्र", sortAmount:"राशि से क्रमबद्ध", financialReports:"वित्तीय रिपोर्ट", viewCompleted:"पूर्ण परियोजनाएं देखें", ucCompliance:"UC अनुपालन", viewDashboard:"डैशबोर्ड देखें", aiRisk:"AI जोखिम केंद्र" },
  MR: { viewRisk:"सर्व जोखीम प्रकल्प पहा", openRisk:"जोखीम केंद्र उघडा", viewDelayed:"विलंबित प्रकल्प पहा", applyDelay:"विलंब फिल्टर लावा", viewReports:"राज्य अहवाल पहा", gisMap:"GIS नकाशा उघडा", viewCompliance:"अनुपालन केंद्र पहा", downloadUC:"UC अहवाल डाउनलोड करा", viewRiskCenter:"जोखीम केंद्र पहा", filterOverrun:"अतिरिक्त खर्च फिल्टर", viewAlerts:"सर्व सूचना पहा", critAlerts:"केवल गंभीर सूचना", openInvestigation:"तपासणी उघडा", riskCenter:"जोखीम केंद्र", sortAmount:"रकमेनुसार क्रम", financialReports:"आर्थिक अहवाल", viewCompleted:"पूर्ण प्रकल्प पहा", ucCompliance:"UC अनुपालन", viewDashboard:"डॅशबोर्ड पहा", aiRisk:"AI जोखीम केंद्र" },
  TA: { viewRisk:"அனைத்து ஆபத்து திட்டங்கள்", openRisk:"ஆபத்து மையம் திற", viewDelayed:"தாமதமான திட்டங்கள்", applyDelay:"தாமத வடிகட்டி", viewReports:"மாநில அறிக்கைகள்", gisMap:"GIS வரைபடம் திற", viewCompliance:"இணக்க மையம்", downloadUC:"UC அறிக்கை பதிவிறக்கம்", viewRiskCenter:"ஆபத்து மையம்", filterOverrun:"மிகை வடிகட்டி", viewAlerts:"அனைத்து எச்சரிக்கைகள்", critAlerts:"முக்கிய எச்சரிக்கைகள் மட்டும்", openInvestigation:"விசாரணை திற", riskCenter:"ஆபத்து மையம்", sortAmount:"தொகை வரிசை", financialReports:"நிதி அறிக்கைகள்", viewCompleted:"நிறைவான திட்டங்கள்", ucCompliance:"UC இணக்கம்", viewDashboard:"டாஷ்போர்டு", aiRisk:"AI ஆபத்து மையம்" },
  BN: { viewRisk:"সব ঝুঁকি প্রকল্প দেখুন", openRisk:"ঝুঁকি কেন্দ্র খুলুন", viewDelayed:"বিলম্বিত প্রকল্প দেখুন", applyDelay:"বিলম্ব ফিল্টার", viewReports:"রাজ্য প্রতিবেদন", gisMap:"GIS মানচিত্র খুলুন", viewCompliance:"সম্মতি কেন্দ্র", downloadUC:"UC প্রতিবেদন ডাউনলোড", viewRiskCenter:"ঝুঁকি কেন্দ্র", filterOverrun:"অতিরিক্ত ব্যয় ফিল্টার", viewAlerts:"সব সতর্কতা দেখুন", critAlerts:"শুধু সঙ্কটজনক সতর্কতা", openInvestigation:"তদন্ত খুলুন", riskCenter:"ঝুঁকি কেন্দ্র", sortAmount:"পরিমাণ অনুযায়ী সাজান", financialReports:"আর্থিক প্রতিবেদন", viewCompleted:"সম্পন্ন প্রকল্প দেখুন", ucCompliance:"UC সম্মতি", viewDashboard:"ড্যাশবোর্ড", aiRisk:"AI ঝুঁকি কেন্দ্র" },
  KA: { viewRisk:"ಎಲ್ಲ ಅಪಾಯ ಯೋಜನೆಗಳು", openRisk:"ಅಪಾಯ ಕೇಂದ್ರ ತೆರೆ", viewDelayed:"ವಿಳಂಬಿತ ಯೋಜನೆಗಳು", applyDelay:"ವಿಳಂಬ ಫಿಲ್ಟರ್", viewReports:"ರಾಜ್ಯ ವರದಿಗಳು", gisMap:"GIS ನಕ್ಷೆ ತೆರೆ", viewCompliance:"ಅನುಪಾಲನ ಕೇಂದ್ರ", downloadUC:"UC ವರದಿ ಡೌನ್‌ಲೋಡ್", viewRiskCenter:"ಅಪಾಯ ಕೇಂದ್ರ", filterOverrun:"ಅಧಿಕ ವೆಚ್ಚ ಫಿಲ್ಟರ್", viewAlerts:"ಎಲ್ಲ ಎಚ್ಚರಿಕೆಗಳು", critAlerts:"ಗಂಭೀರ ಎಚ್ಚರಿಕೆಗಳು ಮಾತ್ರ", openInvestigation:"ತನಿಖೆ ತೆರೆ", riskCenter:"ಅಪಾಯ ಕೇಂದ್ರ", sortAmount:"ಮೊತ್ತ ವಿಂಗಡಣೆ", financialReports:"ಹಣಕಾಸು ವರದಿಗಳು", viewCompleted:"ಪೂರ್ಣ ಯೋಜನೆಗಳು", ucCompliance:"UC ಅನುಪಾಲನ", viewDashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", aiRisk:"AI ಅಪಾಯ ಕೇಂದ್ರ" },
  TE: { viewRisk:"అన్ని రిస్క్ ప్రాజెక్టులు", openRisk:"రిస్క్ సెంటర్ తెరవండి", viewDelayed:"జాప్యమైన ప్రాజెక్టులు", applyDelay:"జాప్య ఫిల్టర్", viewReports:"రాష్ట్ర నివేదికలు", gisMap:"GIS మ్యాప్ తెరవండి", viewCompliance:"సమ్మతి కేంద్రం", downloadUC:"UC నివేదిక డౌన్‌లోడ్", viewRiskCenter:"రిస్క్ సెంటర్", filterOverrun:"అదనపు వ్యయ ఫిల్టర్", viewAlerts:"అన్ని హెచ్చరికలు", critAlerts:"క్రిటికల్ హెచ్చరికలు మాత్రమే", openInvestigation:"దర్యాప్తు తెరవండి", riskCenter:"రిస్క్ సెంటర్", sortAmount:"మొత్తం వరుసలో", financialReports:"ఆర్థిక నివేదికలు", viewCompleted:"పూర్తైన ప్రాజెక్టులు", ucCompliance:"UC సమ్మతి", viewDashboard:"డాష్‌బోర్డ్", aiRisk:"AI రిస్క్ సెంటర్" },
};

// ── State card labels ─────────────────────────────────────────────────────────

const STATE_LABELS: Record<Lang, [string, string, string]> = {
  EN: ["Fund Utilization", "Risk Projects", "Delayed Works"],
  HI: ["निधि उपयोग", "जोखिम परियोजनाएं", "विलंबित कार्य"],
  MR: ["निधी वापर", "जोखीम प्रकल्प", "विलंबित कामे"],
  TA: ["நிதி பயன்பாடு", "ஆபத்து திட்டங்கள்", "தாமதமான பணிகள்"],
  BN: ["তহবিল ব্যবহার", "ঝুঁকি প্রকল্প", "বিলম্বিত কাজ"],
  KA: ["ನಿಧಿ ಬಳಕೆ", "ಅಪಾಯ ಯೋಜನೆಗಳು", "ವಿಳಂಬಿತ ಕೆಲಸಗಳು"],
  TE: ["నిధి వినియోగం", "రిస్క్ ప్రాజెక్టులు", "జాప్యమైన పనులు"],
};

const STATE_VIEW_BTN: Record<Lang, (s: string) => string> = {
  EN: (s) => `View ${s} Projects`,
  HI: (s) => `${s} के प्रकल्प देखें`,
  MR: (s) => `${s} चे प्रकल्प पहा`,
  TA: (s) => `${s} திட்டங்கள்`,
  BN: (s) => `${s}-এর প্রকল্প দেখুন`,
  KA: (s) => `${s} ಯೋಜನೆಗಳು`,
  TE: (s) => `${s} ప్రాజెక్టులు`,
};

// ── Response text templates ───────────────────────────────────────────────────

const RESP: Record<Lang, {
  risk: (n: number) => string;
  delay: (n: number, state?: string, funds?: string) => string;
  fund: (rate: number, utilized: string, released: string) => string;
  uc: (n: number) => string;
  overrun: (n: number, avg: string) => string;
  alerts: (active: number, crit: number, high: number) => string;
  state: (name: string, total: number, comp: number, del: number, util: number) => string;
  contractor: (n: number) => string;
  bigvalue: () => string;
  completed: (n: number, rate: number, total: string, comp: string) => string;
  help: () => string;
}> = {
  EN: {
    risk:       (n) => `I found **${n} high/critical risk projects** across India. Here are the top concerns:`,
    delay:      (n, s, f) => `**${n} delayed projects** ${s ? `in ${s}` : "nationwide"}. Total at-risk funds: ₹${f}L.`,
    fund:       (r, u, rel) => `National fund utilization stands at **${r}%** (₹${u}Cr of ₹${rel}Cr released). States with lowest utilization:`,
    uc:         (n) => `**${n} projects** have Utilization Certificates (UC) pending beyond the 3-month deadline. Nationwide, 12,480 UCs are overdue totalling ₹1,240 Cr.`,
    overrun:    (n, avg) => `**${n} projects** have exceeded their sanctioned amount. Average overrun: ${avg}%.`,
    alerts:     (a, c, h) => `There are **${a} active alerts** today — ${c} critical, ${h} high priority. Immediate action required on:`,
    state:      (name, total, comp, del, util) => `**${name}** summary: ${total} total projects, ${comp} completed, ${del} delayed. Fund utilization at ${util}%.`,
    contractor: (n) => `AI has detected **${n} risk flags** including contractor anomalies and duplicate work clusters. Key findings:`,
    bigvalue:   () => `Here are the **highest-value MPLADS projects** currently tracked:`,
    completed:  (n, rate, total, comp) => `**${n} projects completed** in the dataset. National completion rate: ${rate}% (${comp} of ${total} projects).`,
    help:       () => "I can help you explore MPLADS data. Try asking about:\n\n• **Risk & anomalies** — flagged projects, contractor issues\n• **Delays** — overdue works, fund lapse risk\n• **Fund utilization** — state-wise breakdown\n• **Compliance** — pending UCs, inspection gaps\n• **Specific states** — Rajasthan, UP, West Bengal…",
  },
  HI: {
    risk:       (n) => `भारत में **${n} उच्च/गंभीर जोखिम परियोजनाएं** मिलीं। शीर्ष चिंताएं:`,
    delay:      (n, s, f) => `**${n} विलंबित परियोजनाएं** ${s ? `${s} में` : "राष्ट्रीय स्तर पर"}। जोखिम में कुल निधि: ₹${f}L.`,
    fund:       (r, u, rel) => `राष्ट्रीय निधि उपयोग **${r}%** है (₹${rel}Cr में से ₹${u}Cr उपयोग)। सबसे कम उपयोग वाले राज्य:`,
    uc:         (n) => `**${n} परियोजनाओं** के UC 3 माह की समयसीमा से अधिक लंबित हैं। राष्ट्रीय स्तर पर 12,480 UC बकाया हैं जो ₹1,240 करोड़ के हैं।`,
    overrun:    (n, avg) => `**${n} परियोजनाएं** अनुमोदित राशि से अधिक खर्च हो चुकी हैं। औसत अतिरिक्त खर्च: ${avg}%.`,
    alerts:     (a, c, h) => `आज **${a} सक्रिय अलर्ट** हैं — ${c} गंभीर, ${h} उच्च प्राथमिकता। तत्काल कार्रवाई आवश्यक:`,
    state:      (name, total, comp, del, util) => `**${name}** सारांश: ${total} कुल परियोजनाएं, ${comp} पूर्ण, ${del} विलंबित। निधि उपयोग ${util}%.`,
    contractor: (n) => `AI ने **${n} जोखिम चिह्न** पाए — ठेकेदार अनियमितताएं और डुप्लिकेट कार्य समूह। मुख्य निष्कर्ष:`,
    bigvalue:   () => `वर्तमान में ट्रैक की जा रही **सर्वाधिक मूल्य की MPLADS परियोजनाएं**:`,
    completed:  (n, rate, total, comp) => `डेटासेट में **${n} परियोजनाएं पूर्ण** हुईं। राष्ट्रीय पूर्णता दर: ${rate}% (${total} में से ${comp}).`,
    help:       () => "मैं MPLADS डेटा खोजने में सहायता कर सकता हूँ। इन विषयों पर पूछें:\n\n• **जोखिम और विसंगतियाँ** — चिह्नित परियोजनाएं\n• **विलंब** — अतिदेय कार्य, निधि चूक का खतरा\n• **निधि उपयोग** — राज्यवार विवरण\n• **अनुपालन** — लंबित UC, निरीक्षण अंतराल\n• **विशिष्ट राज्य** — राजस्थान, UP, पश्चिम बंगाल…",
  },
  MR: {
    risk:       (n) => `भारतभर **${n} उच्च/गंभीर जोखीम प्रकल्प** आढळले. मुख्य समस्या:`,
    delay:      (n, s, f) => `**${n} विलंबित प्रकल्प** ${s ? `${s} मध्ये` : "देशभर"}. जोखमीत एकूण निधी: ₹${f}L.`,
    fund:       (r, u, rel) => `राष्ट्रीय निधी वापर **${r}%** (₹${rel}Cr पैकी ₹${u}Cr वापर). सर्वात कमी वापर असलेले राज्य:`,
    uc:         (n) => `**${n} प्रकल्पांचे** UC 3 महिन्यांच्या मुदतीपलीकडे प्रलंबित आहेत. देशभर 12,480 UC थकीत असून ₹1,240 कोटी आहेत.`,
    overrun:    (n, avg) => `**${n} प्रकल्प** मंजूर रकमेपेक्षा जास्त खर्च झाले आहेत. सरासरी अतिरिक्त खर्च: ${avg}%.`,
    alerts:     (a, c, h) => `आज **${a} सक्रिय सूचना** आहेत — ${c} गंभीर, ${h} उच्च प्राधान्य. तात्काळ कारवाई आवश्यक:`,
    state:      (name, total, comp, del, util) => `**${name}** सारांश: ${total} एकूण प्रकल्प, ${comp} पूर्ण, ${del} विलंबित. निधी वापर ${util}%.`,
    contractor: (n) => `AI ने **${n} जोखीम चिन्हे** आढळली — कंत्राटदार अनियमितता आणि डुप्लिकेट कार्य समूह. मुख्य निष्कर्ष:`,
    bigvalue:   () => `सध्या ट्रॅक केले जाणारे **सर्वाधिक मूल्याचे MPLADS प्रकल्प**:`,
    completed:  (n, rate, total, comp) => `डेटासेटमध्ये **${n} प्रकल्प पूर्ण** झाले. राष्ट्रीय पूर्णता दर: ${rate}% (${total} पैकी ${comp}).`,
    help:       () => "मी MPLADS डेटा शोधण्यात मदत करू शकतो. या विषयांवर विचारा:\n\n• **जोखीम आणि विसंगती** — चिन्हांकित प्रकल्प\n• **विलंब** — थकीत कामे, निधी नुकसानीचा धोका\n• **निधी वापर** — राज्यनिहाय माहिती\n• **अनुपालन** — प्रलंबित UC, तपासणी अंतर\n• **विशिष्ट राज्ये** — राजस्थान, UP, पश्चिम बंगाल…",
  },
  TA: {
    risk:       (n) => `இந்தியாவில் **${n} உயர்/முக்கியமான ஆபத்து திட்டங்கள்** கண்டறியப்பட்டன. முக்கிய கவலைகள்:`,
    delay:      (n, s, f) => `**${n} தாமதமான திட்டங்கள்** ${s ? `${s} மாநிலத்தில்` : "நாடு முழுவதும்"}. ஆபத்தில் மொத்த நிதி: ₹${f}L.`,
    fund:       (r, u, rel) => `தேசிய நிதி பயன்பாடு **${r}%** (₹${rel}கோடியில் ₹${u}கோடி பயன்படுத்தப்பட்டது). குறைந்த பயன்பாடு கொண்ட மாநிலங்கள்:`,
    uc:         (n) => `**${n} திட்டங்களின்** UC 3 மாத காலக்கெடுவை தாண்டி நிலுவையில் உள்ளது. நாடு முழுவதும் 12,480 UCகள் ₹1,240 கோடி மதிப்பில் நிலுவையில் உள்ளன.`,
    overrun:    (n, avg) => `**${n} திட்டங்கள்** அங்கீகரிக்கப்பட்ட தொகையை மீறியுள்ளன. சராசரி மிகை செலவு: ${avg}%.`,
    alerts:     (a, c, h) => `இன்று **${a} செயலில் உள்ள எச்சரிக்கைகள்** — ${c} முக்கியமானவை, ${h} உயர் முன்னுரிமை. உடனடி நடவடிக்கை தேவை:`,
    state:      (name, total, comp, del, util) => `**${name}** சுருக்கம்: ${total} மொத்த திட்டங்கள், ${comp} நிறைவடைந்தவை, ${del} தாமதமானவை. நிதி பயன்பாடு ${util}%.`,
    contractor: (n) => `AI **${n} ஆபத்து குறிகள்** கண்டறிந்துள்ளது — ஒப்பந்ததாரர் முறைகேடுகள் மற்றும் நகல் பணிகள். முக்கிய கண்டுபிடிப்புகள்:`,
    bigvalue:   () => `தற்போது கண்காணிக்கப்படும் **அதிக மதிப்புள்ள MPLADS திட்டங்கள்**:`,
    completed:  (n, rate, total, comp) => `**${n} திட்டங்கள் நிறைவடைந்துள்ளன**. தேசிய நிறைவு விகிதம்: ${rate}% (${total}ல் ${comp}).`,
    help:       () => "MPLADS தரவை ஆராய உதவுகிறேன். இவற்றில் கேளுங்கள்:\n\n• **ஆபத்து மற்றும் முறைகேடுகள்** — குறிக்கப்பட்ட திட்டங்கள்\n• **தாமதங்கள்** — நிலுவை பணிகள், நிதி இழப்பு\n• **நிதி பயன்பாடு** — மாநிலவாரியாக\n• **இணக்கம்** — நிலுவை UCகள், ஆய்வு இடைவெளி\n• **மாநிலங்கள்** — ராஜஸ்தான், UP, மேற்கு வங்காளம்…",
  },
  BN: {
    risk:       (n) => `ভারতে **${n}টি উচ্চ/সঙ্কটজনক ঝুঁকি প্রকল্প** পাওয়া গেছে। শীর্ষ উদ্বেগ:`,
    delay:      (n, s, f) => `**${n}টি বিলম্বিত প্রকল্প** ${s ? `${s}-এ` : "সারাদেশে"}। ঝুঁকিতে মোট তহবিল: ₹${f}L.`,
    fund:       (r, u, rel) => `জাতীয় তহবিল ব্যবহার **${r}%** (₹${rel}কোটির মধ্যে ₹${u}কোটি ব্যবহৃত)। সবচেয়ে কম ব্যবহারের রাজ্য:`,
    uc:         (n) => `**${n}টি প্রকল্পের** UC ৩ মাসের সময়সীমার বাইরে বিচারাধীন। সারাদেশে ১২,৪৮০টি UC মোট ₹১,২৪০ কোটি বকেয়া।`,
    overrun:    (n, avg) => `**${n}টি প্রকল্প** অনুমোদিত পরিমাণ ছাড়িয়ে গেছে। গড় অতিরিক্ত ব্যয়: ${avg}%.`,
    alerts:     (a, c, h) => `আজ **${a}টি সক্রিয় সতর্কতা** — ${c}টি সঙ্কটজনক, ${h}টি উচ্চ অগ্রাধিকার। তাৎক্ষণিক ব্যবস্থা প্রয়োজন:`,
    state:      (name, total, comp, del, util) => `**${name}** সারসংক্ষেপ: ${total}টি মোট প্রকল্প, ${comp}টি সম্পন্ন, ${del}টি বিলম্বিত। তহবিল ব্যবহার ${util}%.`,
    contractor: (n) => `AI **${n}টি ঝুঁকি চিহ্ন** শনাক্ত করেছে — ঠিকাদার অনিয়ম ও নকল কাজের গুচ্ছ সহ। মূল ফলাফল:`,
    bigvalue:   () => `বর্তমানে ট্র্যাক করা **সর্বোচ্চ মূল্যের MPLADS প্রকল্প**:`,
    completed:  (n, rate, total, comp) => `**${n}টি প্রকল্প সম্পন্ন**। জাতীয় সমাপ্তি হার: ${rate}% (${total}-এর মধ্যে ${comp}টি).`,
    help:       () => "আমি MPLADS ডেটা অন্বেষণে সাহায্য করতে পারি। এই বিষয়ে জিজ্ঞাসা করুন:\n\n• **ঝুঁকি ও অসঙ্গতি** — চিহ্নিত প্রকল্প\n• **বিলম্ব** — অতিদেয় কাজ, তহবিল ক্ষতির ঝুঁকি\n• **তহবিল ব্যবহার** — রাজ্যভিত্তিক বিশ্লেষণ\n• **সম্মতি** — বিচারাধীন UC, পরিদর্শন ব্যবধান\n• **রাজ্য** — রাজস্থান, UP, পশ্চিমবঙ্গ…",
  },
  KA: {
    risk:       (n) => `ಭಾರತದಾದ್ಯಂತ **${n} ಹೆಚ್ಚಿನ/ಗಂಭೀರ ಅಪಾಯದ ಯೋಜನೆಗಳು** ಕಂಡುಬಂದಿವೆ. ಪ್ರಮುಖ ಕಾಳಜಿಗಳು:`,
    delay:      (n, s, f) => `**${n} ವಿಳಂಬಿತ ಯೋಜನೆಗಳು** ${s ? `${s}ದಲ್ಲಿ` : "ರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದಲ್ಲಿ"}. ಅಪಾಯದಲ್ಲಿರುವ ಒಟ್ಟು ನಿಧಿ: ₹${f}L.`,
    fund:       (r, u, rel) => `ರಾಷ್ಟ್ರೀಯ ನಿಧಿ ಬಳಕೆ **${r}%** (₹${rel}ಕೋಟಿಯಲ್ಲಿ ₹${u}ಕೋಟಿ ಬಳಸಲಾಗಿದೆ). ಕಡಿಮೆ ಬಳಕೆ ಹೊಂದಿರುವ ರಾಜ್ಯಗಳು:`,
    uc:         (n) => `**${n} ಯೋಜನೆಗಳ** UC 3 ತಿಂಗಳ ಗಡುವನ್ನು ಮೀರಿ ಬಾಕಿಯಿದೆ. ರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದಲ್ಲಿ 12,480 UCಗಳು ₹1,240 ಕೋಟಿ ಬಾಕಿಯಿದೆ.`,
    overrun:    (n, avg) => `**${n} ಯೋಜನೆಗಳು** ಅನುಮೋದಿತ ಮೊತ್ತವನ್ನು ಮೀರಿವೆ. ಸರಾಸರಿ ಹೆಚ್ಚುವರಿ ವೆಚ್ಚ: ${avg}%.`,
    alerts:     (a, c, h) => `ಇಂದು **${a} ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು** — ${c} ಗಂಭೀರ, ${h} ಹೆಚ್ಚಿನ ಆದ್ಯತೆ. ತಕ್ಷಣ ಕ್ರಮ ಅಗತ್ಯ:`,
    state:      (name, total, comp, del, util) => `**${name}** ಸಾರಾಂಶ: ${total} ಒಟ್ಟು ಯೋಜನೆಗಳು, ${comp} ಪೂರ್ಣ, ${del} ವಿಳಂಬಿತ. ನಿಧಿ ಬಳಕೆ ${util}%.`,
    contractor: (n) => `AI **${n} ಅಪಾಯ ಚಿಹ್ನೆಗಳನ್ನು** ಪತ್ತೆ ಮಾಡಿದೆ — ಗುತ್ತಿಗೆದಾರ ಅನಿಯಮಿತತೆಗಳು ಸೇರಿದಂತೆ. ಪ್ರಮುಖ ಸಂಶೋಧನೆಗಳು:`,
    bigvalue:   () => `ಪ್ರಸ್ತುತ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿರುವ **ಅತ್ಯಧಿಕ ಮೌಲ್ಯದ MPLADS ಯೋಜನೆಗಳು**:`,
    completed:  (n, rate, total, comp) => `**${n} ಯೋಜನೆಗಳು ಪೂರ್ಣ** ಆಗಿವೆ. ರಾಷ್ಟ್ರೀಯ ಪೂರ್ಣ ದರ: ${rate}% (${total}ದಲ್ಲಿ ${comp}).`,
    help:       () => "ನಾನು MPLADS ಡೇಟಾ ಅನ್ವೇಷಿಸಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇವುಗಳ ಬಗ್ಗೆ ಕೇಳಿ:\n\n• **ಅಪಾಯ ಮತ್ತು ವಿಚಲನಗಳು** — ಗುರುತಿಸಲಾದ ಯೋಜನೆಗಳು\n• **ವಿಳಂಬ** — ಬಾಕಿ ಕೆಲಸಗಳು, ನಿಧಿ ನಷ್ಟ\n• **ನಿಧಿ ಬಳಕೆ** — ರಾಜ್ಯವಾರು ವಿಶ್ಲೇಷಣೆ\n• **ಅನುಪಾಲನೆ** — ಬಾಕಿ UCಗಳು, ತಪಾಸಣೆ ಅಂತರ\n• **ರಾಜ್ಯಗಳು** — ರಾಜಸ್ಥಾನ, UP, ಪಶ್ಚಿಮ ಬಂಗಾಳ…",
  },
  TE: {
    risk:       (n) => `భారతదేశంలో **${n} అధిక/క్రిటికల్ రిస్క్ ప్రాజెక్టులు** కనుగొనబడ్డాయి. ప్రధాన సమస్యలు:`,
    delay:      (n, s, f) => `**${n} జాప్యమైన ప్రాజెక్టులు** ${s ? `${s}లో` : "దేశవ్యాప్తంగా"}. ప్రమాదంలో ఉన్న మొత్తం నిధులు: ₹${f}L.`,
    fund:       (r, u, rel) => `జాతీయ నిధి వినియోగం **${r}%** (₹${rel}కోట్లలో ₹${u}కోట్లు వినియోగించబడ్డాయి). అత్యల్ప వినియోగం ఉన్న రాష్ట్రాలు:`,
    uc:         (n) => `**${n} ప్రాజెక్టుల** UC 3 నెలల గడువు మించి పెండింగ్‌లో ఉన్నాయి. దేశవ్యాప్తంగా 12,480 UCలు ₹1,240 కోట్ల విలువలో బకాయిలున్నాయి.`,
    overrun:    (n, avg) => `**${n} ప్రాజెక్టులు** అనుమతించిన మొత్తాన్ని మించిపోయాయి. సగటు అదనపు వ్యయం: ${avg}%.`,
    alerts:     (a, c, h) => `ఈరోజు **${a} చురుకైన హెచ్చరికలు** — ${c} క్రిటికల్, ${h} అధిక ప్రాధాన్యత. తక్షణ చర్య అవసరం:`,
    state:      (name, total, comp, del, util) => `**${name}** సారాంశం: ${total} మొత్తం ప్రాజెక్టులు, ${comp} పూర్తయినవి, ${del} జాప్యమైనవి. నిధి వినియోగం ${util}%.`,
    contractor: (n) => `AI **${n} రిస్క్ ఫ్లాగ్‌లు** గుర్తించింది — కాంట్రాక్టర్ అక్రమాలు మరియు నకిలీ పనులతో సహా. ముఖ్య ఫలితాలు:`,
    bigvalue:   () => `ప్రస్తుతం ట్రాక్ చేయబడుతున్న **అత్యధిక విలువైన MPLADS ప్రాజెక్టులు**:`,
    completed:  (n, rate, total, comp) => `**${n} ప్రాజెక్టులు పూర్తయ్యాయి**. జాతీయ పూర్తి రేటు: ${rate}% (${total}లో ${comp}).`,
    help:       () => "నేను MPLADS డేటాను అన్వేషించడంలో సహాయపడగలను. ఇవి అడగండి:\n\n• **రిస్క్ మరియు అక్రమాలు** — ఫ్లాగ్ చేయబడిన ప్రాజెక్టులు\n• **జాప్యాలు** — గడువు మించిన పనులు, నిధి వ్యర్థం\n• **నిధి వినియోగం** — రాష్ట్రవారీ వివరాలు\n• **సమ్మతి** — పెండింగ్ UCలు, తనిఖీ అంతరాలు\n• **రాష్ట్రాలు** — రాజస్థాన్, UP, పశ్చిమ బెంగాల్…",
  },
};

// ── Quick Questions & Actions per Role & Language ─────────────────────────────

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  query: string;
}

const ROLE_QUICK_ACTIONS: Record<UserRole, Record<Lang, QuickAction[]>> = {
  Citizen: {
    EN: [
      { id: "area_status", icon: "📍", label: "My Area Work Status", query: "Show my area work status" },
      { id: "area_risk", icon: "⚠️", label: "Area Risks & Flags", query: "Show my area project risks and alerts" },
      { id: "area_funds", icon: "💰", label: "Area Fund Utilization", query: "How much fund was utilized in my area?" },
      { id: "completed_works", icon: "✅", label: "Completed Community Works", query: "Which projects are completed near my area?" },
      { id: "file_grievance", icon: "📝", label: "File a Grievance", query: "How do I file a grievance for a stalled project?" },
    ],
    HI: [
      { id: "area_status", icon: "📍", label: "मेरे क्षेत्र के कार्य", query: "मेरे क्षेत्र में कार्यों की स्थिति दिखाएं" },
      { id: "area_risk", icon: "⚠️", label: "क्षेत्रीय जोखिम व अलर्ट", query: "मेरे क्षेत्र के प्रोजेक्ट जोखिम और अलर्ट दिखाएं" },
      { id: "area_funds", icon: "💰", label: "फंड उपयोग", query: "मेरे क्षेत्र में कितना फंड उपयोग हुआ?" },
      { id: "completed_works", icon: "✅", label: "पूर्ण सामुदायिक कार्य", query: "मेरे क्षेत्र में कौन से कार्य पूर्ण हुए हैं?" },
      { id: "file_grievance", icon: "📝", label: "शिकायत दर्ज करें", query: "रुके हुए कार्य के लिए शिकायत कैसे दर्ज करें?" },
    ],
    MR: [
      { id: "area_status", icon: "📍", label: "माझ्या परिसराची स्थिती", query: "माझ्या परिसरातील कामांची स्थिती दाखवा" },
      { id: "area_risk", icon: "⚠️", label: "परिसरातील जोखीम व अलर्ट", query: "माझ्या भागातील प्रकल्प जोखीम आणि अलर्ट दाखवा" },
      { id: "area_funds", icon: "💰", label: "निधी वापर", query: "माझ्या मतदारसंघात किती निधी वापरला?" },
      { id: "completed_works", icon: "✅", label: "पूर्ण झालेली कामे", query: "माझ्याजवळ कोणते प्रकल्प पूर्ण झाले?" },
      { id: "file_grievance", icon: "📝", label: "तक्रार नोंदवा", query: "थांबलेल्या प्रकल्पासाठी तक्रार कशी करावी?" },
    ],
    TA: [
      { id: "area_status", icon: "📍", label: "என் பகுதி பணிகள்", query: "என் பகுதியில் பணிகளின் நிலை காட்டு" },
      { id: "area_risk", icon: "⚠️", label: "பகுதி ஆபத்து & எச்சரிக்கை", query: "என் பகுதி திட்ட ஆபத்துகள் மற்றும் எச்சரிக்கைகள் காட்டு" },
      { id: "area_funds", icon: "💰", label: "நிதி பயன்பாடு", query: "என் தொகுதியில் எவ்வளவு நிதி பயன்படுத்தப்பட்டது?" },
      { id: "completed_works", icon: "✅", label: "நிறைவடைந்த பணிகள்", query: "என் அருகில் எந்த திட்டங்கள் நிறைவடைந்தன?" },
      { id: "file_grievance", icon: "📝", label: "புகார் பதிவு செய்க", query: "நிறுத்தப்பட்ட திட்டத்திற்கு புகார் எப்படி?" },
    ],
    BN: [
      { id: "area_status", icon: "📍", label: "আমার এলাকার কাজের অবস্থা", query: "আমার এলাকার কাজের অবস্থা দেখান" },
      { id: "area_risk", icon: "⚠️", label: "এলাকার ঝুঁকি ও সতর্কতা", query: "আমার এলাকার প্রকল্পের ঝুঁকি এবং সতর্কতা দেখান" },
      { id: "area_funds", icon: "💰", label: "তহবিল ব্যবহার", query: "আমার নির্বাচনী এলাকায় কত তহবিল ব্যবহৃত?" },
      { id: "completed_works", icon: "✅", label: "সম্পন্ন প্রকল্পসমূহ", query: "আমার কাছে কোন প্রকল্পগুলো সম্পন্ন হয়েছে?" },
      { id: "file_grievance", icon: "📝", label: "অভিযোগ দায়ের করুন", query: "স্থগিত প্রকল্পে অভিযোগ কিভাবে করব?" },
    ],
    KA: [
      { id: "area_status", icon: "📍", label: "ನನ್ನ ಪ್ರದೇಶದ ಕಾಮಗಾರಿ", query: "ನನ್ನ ಪ್ರದೇಶದ ಕಾಮಗಾರಿಗಳ ಸ್ಥಿತಿ ತೋರಿಸಿ" },
      { id: "area_risk", icon: "⚠️", label: "ಪ್ರದೇಶದ ಅಪಾಯ & ಎಚ್ಚರಿಕೆ", query: "ನನ್ನ ಪ್ರದೇಶದ ಯೋಜನೆಗಳ ಅಪಾಯ ಮತ್ತು ಎಚ್ಚರಿಕೆ ತೋರಿಸಿ" },
      { id: "area_funds", icon: "💰", label: "ನಿಧಿ ಬಳಕೆ", query: "ನನ್ನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಷ್ಟು ನಿಧಿ ಬಳಸಲಾಗಿದೆ?" },
      { id: "completed_works", icon: "✅", label: "ಪೂರ್ಣಗೊಂಡ ಕಾಮಗಾರಿಗಳು", query: "ನನ್ನ ಬಳಿ ಯಾವ ಯೋಜನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ?" },
      { id: "file_grievance", icon: "📝", label: "ದೂರು ದಾಖಲಿಸಿ", query: "ನಿಂತ ಯೋಜನೆಗೆ ದೂರು ಹೇಗೆ ನೀಡುವುದು?" },
    ],
    TE: [
      { id: "area_status", icon: "📍", label: "నా ప్రాంతం పనుల స్థితి", query: "నా ప్రాంతంలో పనుల స్థితి చూపించు" },
      { id: "area_risk", icon: "⚠️", label: "ప్రాంత రిస్క్ & హెచ్చరికలు", query: "నా ప్రాంత ప్రాజెక్టుల రిస్క్ మరియు హెచ్చరికలు చూపించు" },
      { id: "area_funds", icon: "💰", label: "నిధి వినియోగం", query: "నా నియోజకవర్గంలో ఎంత నిధి వినియోగించారు?" },
      { id: "completed_works", icon: "✅", label: "పూర్తయిన పనులు", query: "నా దగ్గర ఏ ప్రాజెక్టులు పూర్తయ్యాయి?" },
      { id: "file_grievance", icon: "📝", label: "ఫిర్యాదు చేయండి", query: "ఆగిన ప్రాజెక్టుపై ఫిర్యాదు ఎలా చేయాలి?" },
    ],
  },
  MP: {
    EN: [
      { id: "area_status", icon: "🏛️", label: "Constituency Work Status", query: "Show all projects and work status in my constituency" },
      { id: "area_risk", icon: "⚠️", label: "Constituency High-Risk Works", query: "Show high-risk projects in my constituency" },
      { id: "area_funds", icon: "💰", label: "Unspent MPLADS Funds", query: "How much of my MPLADS fund is still unspent?" },
      { id: "delayed_works", icon: "⏳", label: "Delayed Works & Bottlenecks", query: "Which works in my constituency are delayed beyond deadline?" },
      { id: "pending_uc", icon: "📄", label: "Pending UCs", query: "List projects pending Utilization Certificates in my constituency" },
    ],
    HI: [
      { id: "area_status", icon: "🏛️", label: "निर्वाचन क्षेत्र कार्य स्थिति", query: "मेरे निर्वाचन क्षेत्र के सभी कार्यों की स्थिति दिखाएं" },
      { id: "area_risk", icon: "⚠️", label: "उच्च जोखिम परियोजनाएं", query: "मेरे निर्वाचन क्षेत्र की उच्च जोखिम परियोजनाएं दिखाएं" },
      { id: "area_funds", icon: "💰", label: "अव्ययित MPLADS फंड", query: "मेरा कितना MPLADS फंड अभी बाकी है?" },
      { id: "delayed_works", icon: "⏳", label: "समयसीमा पार कार्य", query: "मेरे कौन से कार्य समयसीमा पार हो गए हैं?" },
      { id: "pending_uc", icon: "📄", label: "लंबित UC सूची", query: "उपयोगिता प्रमाणपत्र लंबित परियोजनाओं की सूची" },
    ],
    MR: [
      { id: "area_status", icon: "🏛️", label: "मतदारसंघ कार्य स्थिती", query: "माझ्या मतदारसंघातील सर्व कामांची स्थिती दाखवा" },
      { id: "area_risk", icon: "⚠️", label: "उच्च जोखीम प्रकल्प", query: "माझ्या क्षेत्रातील उच्च जोखीम प्रकल्प दाखवा" },
      { id: "area_funds", icon: "💰", label: "शिल्लक MPLADS निधी", query: "माझा किती MPLADS निधी अजून बाकी आहे?" },
      { id: "delayed_works", icon: "⏳", label: "विलंबित कार्ये", query: "माझे कोणते कार्य मुदतीपलीकडे गेले आहे?" },
      { id: "pending_uc", icon: "📄", label: "प्रलंबित UC यादी", query: "UC प्रलंबित प्रकल्पांची यादी" },
    ],
    TA: [
      { id: "area_status", icon: "🏛️", label: "தொகுதி பணிகள் நிலை", query: "என் தொகுதியின் அனைத்து திட்டங்கள் மற்றும் பணிகள் நிலை காட்டு" },
      { id: "area_risk", icon: "⚠️", label: "தொகுதி உயர் ஆபத்து திட்டங்கள்", query: "என் தொகுதியின் உயர் ஆபத்து திட்டங்கள் காட்டு" },
      { id: "area_funds", icon: "💰", label: "செலவிடப்படாத நிதி", query: "என் MPLADS நிதியில் எவ்வளவு செலவழிக்கப்படவில்லை?" },
      { id: "delayed_works", icon: "⏳", label: "தாமதமான பணிகள்", query: "என் எந்த பணிகள் காலக்கெடுவை தாண்டியுள்ளன?" },
      { id: "pending_uc", icon: "📄", label: "நிலுவை UC பட்டியல்", query: "UC நிலுவையில் உள்ள திட்டங்களின் பட்டியல்" },
    ],
    BN: [
      { id: "area_status", icon: "🏛️", label: "নির্বাচনী এলাকা কাজের অবস্থা", query: "আমার নির্বাচনী এলাকার সব প্রকল্পের অবস্থা দেখান" },
      { id: "area_risk", icon: "⚠️", label: "উচ্চ ঝুঁকি প্রকল্প", query: "আমার এলাকার উচ্চ ঝুঁকি প্রকল্প দেখান" },
      { id: "area_funds", icon: "💰", label: "অব্যয়িত MPLADS তহবিল", query: "আমার MPLADS তহবিলের কত এখনও অব্যয়িত?" },
      { id: "delayed_works", icon: "⏳", label: "বিলম্বিত কাজ", query: "আমার কোন কাজগুলো সময়সীমা পার করেছে?" },
      { id: "pending_uc", icon: "📄", label: "বিচারাধীন UC তালিকা", query: "UC বিচারাধীন প্রকল্পের তালিকা" },
    ],
    KA: [
      { id: "area_status", icon: "🏛️", label: "ಕ್ಷೇತ್ರದ ಕಾಮಗಾರಿ ಸ್ಥಿತಿ", query: "ನನ್ನ ಕ್ಷೇತ್ರದ ಎಲ್ಲ ಕಾಮಗಾರಿಗಳ ಸ್ಥಿತಿ ತೋರಿಸಿ" },
      { id: "area_risk", icon: "⚠️", label: "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಕಾಮಗಾರಿ", query: "ನನ್ನ ಕ್ಷೇತ್ರದ ಹೆಚ್ಚಿನ ಅಪಾಯ ಯೋಜನೆಗಳು ತೋರಿಸಿ" },
      { id: "area_funds", icon: "💰", label: "ಬಳಕೆಯಾಗದ ನಿಧಿ", query: "ನನ್ನ MPLADS ನಿಧಿಯಲ್ಲಿ ಎಷ್ಟು ಇನ್ನೂ ಬಾಕಿಯಿದೆ?" },
      { id: "delayed_works", icon: "⏳", label: "ವಿಳಂಬಿತ ಕೆಲಸಗಳು", query: "ನನ್ನ ಯಾವ ಕೆಲಸಗಳು ಗಡುವು ಮೀರಿವೆ?" },
      { id: "pending_uc", icon: "📄", label: "ಬಾಕಿ UC ಪಟ್ಟಿ", query: "UC ಬಾಕಿ ಯೋಜನೆಗಳ ಪಟ್ಟಿ" },
    ],
    TE: [
      { id: "area_status", icon: "🏛️", label: "నియోజకవర్గ పనుల స్థితి", query: "నా నియోజకవర్గంలోని అన్ని పనుల స్థితి చూపించు" },
      { id: "area_risk", icon: "⚠️", label: "అధిక రిస్క్ ప్రాజెక్టులు", query: "నా నియోజకవర్గంలో అధిక రిస్క్ ప్రాజెక్టులు చూపించు" },
      { id: "area_funds", icon: "💰", label: "మిగిలిన నిధులు", query: "నా MPLADS నిధిలో ఎంత ఇంకా ఖర్చు కాలేదు?" },
      { id: "delayed_works", icon: "⏳", label: "జాప్యమైన పనులు", query: "నా ఏ పనులు గడువు మించాయి?" },
      { id: "pending_uc", icon: "📄", label: "పెండింగ్ UC జాబితా", query: "UC పెండింగ్ ప్రాజెక్టుల జాబితా" },
    ],
  },
  District: {
    EN: [
      { id: "area_status", icon: "📋", label: "District Works Status", query: "Show district works status and progress" },
      { id: "area_risk", icon: "⚠️", label: "High-Risk & Delayed Works", query: "Show high-risk and delayed works in my district" },
      { id: "pending_inspections", icon: "🔍", label: "Pending Field Inspections", query: "Which works are overdue for 60-day field inspection?" },
      { id: "pending_uc", icon: "📄", label: "Overdue UCs & Compliance", query: "Show overdue UCs and compliance gaps in my district" },
      { id: "contractors", icon: "🚜", label: "Flagged Contractors", query: "Which contractors have flagged irregularities or delays?" },
    ],
    HI: [
      { id: "area_status", icon: "📋", label: "जिला कार्य प्रगति", query: "जिले के कार्यों की स्थिति और प्रगति दिखाएं" },
      { id: "area_risk", icon: "⚠️", label: "जोखिम व विलंबित कार्य", query: "जिले के उच्च जोखिम और विलंबित कार्य दिखाएं" },
      { id: "pending_inspections", icon: "🔍", label: "लंबित क्षेत्र निरीक्षण", query: "60+ दिनों से निरीक्षण न हुए कार्य कौन से हैं?" },
      { id: "pending_uc", icon: "📄", label: "बकाया UC व अनुपालन", query: "जिले में बकाया UC और अनुपालन अंतराल दिखाएं" },
      { id: "contractors", icon: "🚜", label: "फ्लैग ठेकेदार", query: "किन ठेकेदारों पर अनियमितताएं या देरी पाई गई है?" },
    ],
    MR: [
      { id: "area_status", icon: "📋", label: "जिल्हा कार्य प्रगती", query: "जिल्ह्यातील कामांची स्थिती आणि प्रगती दाखवा" },
      { id: "area_risk", icon: "⚠️", label: "जोखीम व विलंबित कामे", query: "जिल्ह्यातील उच्च जोखीम आणि विलंबित कामे दाखवा" },
      { id: "pending_inspections", icon: "🔍", label: "प्रलंबित तपासणी", query: "60+ दिवसांत तपासणी न झालेले प्रकल्प" },
      { id: "pending_uc", icon: "📄", label: "थकबाकी UC व अनुपालन", query: "माझ्या जिल्ह्यातील अनुपालन अंतर दाखवा" },
      { id: "contractors", icon: "🚜", label: "फ्लॅग कंत्राटदार", query: "कोणत्या कंत्राटदारांवर अनियमितता आढळली?" },
    ],
    TA: [
      { id: "area_status", icon: "📋", label: "மாவட்ட பணிகள் முன்னேற்றம்", query: "மாவட்ட பணிகள் நிலை மற்றும் முன்னேற்றம் காட்டு" },
      { id: "area_risk", icon: "⚠️", label: "ஆபத்து & தாமதமானவை", query: "என் மாவட்டத்தில் தாமதமான மற்றும் ஆபத்து பணிகள்" },
      { id: "pending_inspections", icon: "🔍", label: "நிலுவை கள ஆய்வுகள்", query: "60+ நாட்களில் ஆய்வு இல்லாத திட்டங்கள்" },
      { id: "pending_uc", icon: "📄", label: "நிலுவை UC இணக்கம்", query: "என் மாவட்டத்தில் இணக்க இடைவெளிகள்" },
      { id: "contractors", icon: "🚜", label: "முறைகேடு ஒப்பந்ததாரர்கள்", query: "எந்த ஒப்பந்ததாரர்களுக்கு முறைகேடுகள் குறிக்கப்பட்டுள்ளன?" },
    ],
    BN: [
      { id: "area_status", icon: "📋", label: "জেলা কাজের অগ্রগতি", query: "জেলার কাজের অবস্থা এবং অগ্রগতি দেখান" },
      { id: "area_risk", icon: "⚠️", label: "ঝুঁকি ও বিলম্বিত কাজ", query: "জেলার উচ্চ ঝুঁকি এবং বিলম্বিত কাজ দেখান" },
      { id: "pending_inspections", icon: "🔍", label: "বিচারাধীন মাঠ পরিদর্শন", query: "৬০+ দিনে পরিদর্শন হয়নি এমন প্রকল্প" },
      { id: "pending_uc", icon: "📄", label: "বকেয়া UC ও সম্মতি", query: "আমার জেলায় সম্মতির ফাঁক দেখান" },
      { id: "contractors", icon: "🚜", label: "চিহ্নিত ঠিকাদার", query: "কোন ঠিকাদারদের অনিয়ম চিহ্নিত হয়েছে?" },
    ],
    KA: [
      { id: "area_status", icon: "📋", label: "ಜಿಲ್ಲಾ ಕಾಮಗಾರಿ ಪ್ರಗತಿ", query: "ಜಿಲ್ಲೆಯ ಕಾಮಗಾರಿಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಪ್ರಗತಿ ತೋರಿಸಿ" },
      { id: "area_risk", icon: "⚠️", label: "ಅಪಾಯ & ವಿಳಂಬಿತ ಕೆಲಸ", query: "ಜಿಲ್ಲೆಯ ಹೆಚ್ಚಿನ ಅಪಾಯ ಮತ್ತು ವಿಳಂಬಿತ ಕೆಲಸಗಳು" },
      { id: "pending_inspections", icon: "🔍", label: "ಬಾಕಿ ಕ್ಷೇತ್ರ ತಪಾಸಣೆ", query: "60+ ದಿನ ತಪಾಸಣೆ ಆಗದ ಯೋಜನೆಗಳು" },
      { id: "pending_uc", icon: "📄", label: "ಬಾಕಿ UC ಅನುಪಾಲನೆ", query: "ನನ್ನ ಜಿಲ್ಲೆಯ ಅನುಪಾಲನ ಅಂತರ ತೋರಿಸಿ" },
      { id: "contractors", icon: "🚜", label: "ಅನರ್ಹ ಗುತ್ತಿಗೆದಾರರು", query: "ಯಾವ ಗುತ್ತಿಗೆದಾರರಿಗೆ ಅನಿಯಮಿತತೆ ಇದೆ?" },
    ],
    TE: [
      { id: "area_status", icon: "📋", label: "జిల్లా పనుల పురోగతి", query: "జిల్లా పనుల స్థితి మరియు పురోగతి చూపించు" },
      { id: "area_risk", icon: "⚠️", label: "రిస్క్ & జాప్య పనులు", query: "జిల్లాలో అధిక రిస్క్ మరియు జాప్య పనులు చూపించు" },
      { id: "pending_inspections", icon: "🔍", label: "పెండింగ్ ఫీల్డ్ తనిఖీలు", query: "60+ రోజులలో తనిఖీ లేని ప్రాజెక్టులు" },
      { id: "pending_uc", icon: "📄", label: "బకాయి UC & సమ్మతి", query: "నా జిల్లాలో సమ్మతి అంతరాలు చూపించు" },
      { id: "contractors", icon: "🚜", label: "ఫ్లాగ్డ్ కాంట్రాక్టర్లు", query: "ఏ కాంట్రాక్టర్లపై అక్రమాలు గుర్తించారు?" },
    ],
  },
  State: {
    EN: [
      { id: "area_status", icon: "🗺️", label: "Statewide Work Status", query: "Show statewide works summary and status" },
      { id: "area_risk", icon: "⚠️", label: "State High-Risk Projects", query: "Show all high-risk projects across the state" },
      { id: "lowest_utilization", icon: "📉", label: "Lowest Utilization Districts", query: "Which districts have lowest fund utilization?" },
      { id: "pending_uc", icon: "📄", label: "Pending Statewide UCs", query: "How many UCs are pending statewide?" },
      { id: "district_ranking", icon: "📊", label: "District Performance Ranking", query: "Rank districts by completion rate and compliance" },
    ],
    HI: [
      { id: "area_status", icon: "🗺️", label: "राज्यव्यापी कार्य स्थिति", query: "राज्य भर के कार्यों की स्थिति और सारांश दिखाएं" },
      { id: "area_risk", icon: "⚠️", label: "राज्य उच्च जोखिम कार्य", query: "राज्य भर में सभी उच्च जोखिम परियोजनाएं दिखाएं" },
      { id: "lowest_utilization", icon: "📉", label: "कम उपयोग वाले जिले", query: "किन जिलों में सबसे कम निधि उपयोग है?" },
      { id: "pending_uc", icon: "📄", label: "राज्य में लंबित UC", query: "राज्यभर में कितने UC लंबित हैं?" },
      { id: "district_ranking", icon: "📊", label: "जिला रैंकिंग", query: "पूर्णता दर और अनुपालन अनुसार जिला रैंकिंग" },
    ],
    MR: [
      { id: "area_status", icon: "🗺️", label: "राज्यव्यापी कार्य स्थिती", query: "राज्यभर कामांची स्थिती आणि सारांश दाखवा" },
      { id: "area_risk", icon: "⚠️", label: "राज्य उच्च जोखीम कामे", query: "राज्यभर सर्व उच्च जोखीम प्रकल्प दाखवा" },
      { id: "lowest_utilization", icon: "📉", label: "कमी वापर असलेले जिल्हे", query: "कोणत्या जिल्ह्यांमध्ये सर्वात कमी निधी वापर आहे?" },
      { id: "pending_uc", icon: "📄", label: "राज्यात प्रलंबित UC", query: "राज्यभर किती UC प्रलंबित आहेत?" },
      { id: "district_ranking", icon: "📊", label: "जिल्हा क्रमवारी", query: "जिल्ह्यांची प्रगती क्रमवारी दाखवा" },
    ],
    TA: [
      { id: "area_status", icon: "🗺️", label: "மாநில அளவிலான பணிகள்", query: "மாநில அளவிலான பணிகள் சுருக்கம் மற்றும் நிலை" },
      { id: "area_risk", icon: "⚠️", label: "மாநில உயர் ஆபத்து திட்டங்கள்", query: "மாநிலம் முழுவதும் உயர் ஆபத்து திட்டங்கள்" },
      { id: "lowest_utilization", icon: "📉", label: "குறைந்த பயன்பாட்டு மாவட்டங்கள்", query: "எந்த மாவட்டங்களில் நிதி பயன்பாடு குறைவாக உள்ளது?" },
      { id: "pending_uc", icon: "📄", label: "மாநில நிலுவை UCகள்", query: "மாநிலம் முழுவதும் எத்தனை UCகள் நிலுவையில்?" },
      { id: "district_ranking", icon: "📊", label: "மாவட்ட தரவரிசை", query: "மாவட்டங்களின் செயல்திறன் தரவரிசை" },
    ],
    BN: [
      { id: "area_status", icon: "🗺️", label: "রাজ্যব্যাপী কাজের অবস্থা", query: "রাজ্যব্যাপী কাজের সারসংক্ষেপ ও অবস্থা দেখান" },
      { id: "area_risk", icon: "⚠️", label: "রাজ্যের উচ্চ ঝুঁকি প্রকল্প", query: "রাজ্যজুড়ে সব উচ্চ ঝুঁকি প্রকল্প দেখান" },
      { id: "lowest_utilization", icon: "📉", label: "কম ব্যবহারের জেলাসমূহ", query: "কোন জেলায় সবচেয়ে কম তহবিল ব্যবহার?" },
      { id: "pending_uc", icon: "📄", label: "রাজ্যে বিচারাধীন UC", query: "রাজ্যজুড়ে কতটি UC বিচারাধীন?" },
      { id: "district_ranking", icon: "📊", label: "জেলা র‍্যাঙ্কিং", query: "জেলার কর্মক্ষমতা র‍্যাঙ্কিং দেখান" },
    ],
    KA: [
      { id: "area_status", icon: "🗺️", label: "ರಾಜ್ಯಾದ್ಯಂತ ಕಾಮಗಾರಿ", query: "ರಾಜ್ಯಾದ್ಯಂತ ಕಾಮಗಾರಿಗಳ ಸಾರಾಂಶ ಮತ್ತು ಸ್ಥಿತಿ" },
      { id: "area_risk", icon: "⚠️", label: "ರಾಜ್ಯದ ಅಪಾಯ ಯೋಜನೆಗಳು", query: "ರಾಜ್ಯಾದ್ಯಂತ ಎಲ್ಲ ಹೆಚ್ಚಿನ ಅಪಾಯ ಯೋಜನೆಗಳು" },
      { id: "lowest_utilization", icon: "📉", label: "ಕಡಿಮೆ ಬಳಕೆಯ ಜಿಲ್ಲೆಗಳು", query: "ಯಾವ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ನಿಧಿ ಬಳಕೆ ಕಡಿಮೆ ಇದೆ?" },
      { id: "pending_uc", icon: "📄", label: "ರಾಜ್ಯದಲ್ಲಿ ಬಾಕಿ UC", query: "ರಾಜ್ಯಾದ್ಯಂತ ಎಷ್ಟು UCಗಳು ಬಾಕಿಯಿದೆ?" },
      { id: "district_ranking", icon: "📊", label: "ಜಿಲ್ಲಾ ಶ್ರೇಯಾಂಕ", query: "ಜಿಲ್ಲಾ ಕಾರ್ಯಕ್ಷಮತೆ ಶ್ರೇಯಾಂಕ" },
    ],
    TE: [
      { id: "area_status", icon: "🗺️", label: "రాష్ట్రవ్యాప్త పనుల స్థితి", query: "రాష్ట్రవ్యాప్త పనుల సారాంశం మరియు స్థితి" },
      { id: "area_risk", icon: "⚠️", label: "రాష్ట్రంలో అధిక రిస్క్ పనులు", query: "రాష్ట్రమంతటా అన్ని అధిక రిస్క్ ప్రాజెక్టులు" },
      { id: "lowest_utilization", icon: "📉", label: "తక్కువ వినియోగ జిల్లాలు", query: "ఏ జిల్లాలలో నిధి వినియోగం అత్యల్పంగా ఉంది?" },
      { id: "pending_uc", icon: "📄", label: "రాష్ట్రంలో పెండింగ్ UCలు", query: "రాష్ట్రమంతటా ఎన్ని UCలు పెండింగ్‌లో ఉన్నాయి?" },
      { id: "district_ranking", icon: "📊", label: "జిల్లాల ర్యాంకింగ్", query: "జిల్లాల పనితీరు ర్యాంకింగ్ చూపించు" },
    ],
  },
  Ministry: {
    EN: [
      { id: "area_status", icon: "🇮🇳", label: "National Work Status & KPIs", query: "Show national work status and key performance indicators" },
      { id: "area_risk", icon: "🚨", label: "Critical National Risk Alerts", query: "Show critical risk concentration and alerts nationwide" },
      { id: "area_funds", icon: "📊", label: "State-wise Fund Utilization", query: "Show state-wise fund utilization rankings" },
      { id: "delayed_works", icon: "⏳", label: "Top Delayed Works Nationwide", query: "Top states and works with highest delays" },
      { id: "vigilance", icon: "🔍", label: "Vigilance & Cost Anomalies", query: "Show contractor cost inflation and duplication anomalies" },
    ],
    HI: [
      { id: "area_status", icon: "🇮🇳", label: "राष्ट्रीय कार्य स्थिति व KPI", query: "राष्ट्रीय कार्य स्थिति और मुख्य प्रदर्शन संकेतक दिखाएं" },
      { id: "area_risk", icon: "🚨", label: "राष्ट्रीय गंभीर अलर्ट", query: "देशभर में गंभीर जोखिम और अलर्ट दिखाएं" },
      { id: "area_funds", icon: "📊", label: "राज्यवार निधि उपयोग", query: "राज्यवार निधि उपयोग रैंकिंग दिखाएं" },
      { id: "delayed_works", icon: "⏳", label: "देश में शीर्ष विलंबित कार्य", query: "देश में सबसे अधिक विलंबित कार्य और राज्य" },
      { id: "vigilance", icon: "🔍", label: "सतर्कता व लागत विसंगतियां", query: "लागत वृद्धि और दोहराव विसंगतियां दिखाएं" },
    ],
    MR: [
      { id: "area_status", icon: "🇮🇳", label: "राष्ट्रीय कार्य स्थिती व KPI", query: "राष्ट्रीय कार्य स्थिती आणि मुख्य कामगिरी निर्देशक" },
      { id: "area_risk", icon: "🚨", label: "राष्ट्रीय गंभीर सूचना", query: "देशभरात गंभीर जोखीम आणि सूचना दाखवा" },
      { id: "area_funds", icon: "📊", label: "राज्यनिहाय निधी वापर", query: "राज्यनिहाय निधी वापर क्रमवारी दाखवा" },
      { id: "delayed_works", icon: "⏳", label: "देशातील विलंबित कामे", query: "देशात सर्वाधिक विलंबित कामे आणि राज्ये" },
      { id: "vigilance", icon: "🔍", label: "दक्षता व विसंगती", query: "खर्च वाढ आणि पुनरावृत्ती विसंगती दाखवा" },
    ],
    TA: [
      { id: "area_status", icon: "🇮🇳", label: "தேசிய பணிகள் & KPI", query: "தேசிய பணிகள் நிலை மற்றும் முக்கிய செயல்திறன் குறிகாட்டிகள்" },
      { id: "area_risk", icon: "🚨", label: "தேசிய முக்கிய எச்சரிக்கைகள்", query: "நாடு தழுவிய முக்கியமான ஆபத்து எச்சரிக்கைகள்" },
      { id: "area_funds", icon: "📊", label: "மாநிலவாரியான நிதி பயன்பாடு", query: "மாநிலவாரியான நிதி பயன்பாட்டு தரவரிசை" },
      { id: "delayed_works", icon: "⏳", label: "அதிக தாமதமான பணிகள்", query: "அதிக தாமதங்கள் கொண்ட மாநிலங்கள் மற்றும் பணிகள்" },
      { id: "vigilance", icon: "🔍", label: "கண்காணிப்பு முறைகேடுகள்", query: "செலவு பெருக்கம் மற்றும் போலி பணிகள் விसंगதிகள்" },
    ],
    BN: [
      { id: "area_status", icon: "🇮🇳", label: "জাতীয় কাজের অবস্থা ও KPI", query: "জাতীয় কাজের অবস্থা এবং মূল কর্মক্ষমতা সূচক" },
      { id: "area_risk", icon: "🚨", label: "জাতীয় সঙ্কটজনক সতর্কতা", query: "দেশব্যাপী সঙ্কটজনক ঝুঁকি এবং সতর্কতা দেখান" },
      { id: "area_funds", icon: "📊", label: "রাজ্যভিত্তিক তহবিল ব্যবহার", query: "রাজ্যভিত্তিক তহবিল ব্যবহারের র‍্যাঙ্কিং" },
      { id: "delayed_works", icon: "⏳", label: "শীর্ষ বিলম্বিত কাজ", query: "সর্বাধিক বিলম্বিত কাজ ও রাজ্যসমূহ" },
      { id: "vigilance", icon: "🔍", label: "তদারকি ও অসঙ্গতি", query: "খরচ স্ফীতি এবং কাজের অনিয়ম অসঙ্গতি" },
    ],
    KA: [
      { id: "area_status", icon: "🇮🇳", label: "ರಾಷ್ಟ್ರೀಯ ಕಾಮಗಾರಿ & KPI", query: "ರಾಷ್ಟ್ರೀಯ ಕಾಮಗಾರಿ ಸ್ಥಿತಿ ಮತ್ತು ಪ್ರಮುಖ ಸಾಧನೆ ಸೂಚಕಗಳು" },
      { id: "area_risk", icon: "🚨", label: "ರಾಷ್ಟ್ರೀಯ ಗಂಭೀರ ಎಚ್ಚರಿಕೆ", query: "ದೇಶಾದ್ಯಂತ ಗಂಭೀರ ಅಪಾಯ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು" },
      { id: "area_funds", icon: "📊", label: "ರಾಜ್ಯವಾರು ನಿಧಿ ಬಳಕೆ", query: "ರಾಜ್ಯವಾರು ನಿಧಿ ಬಳಕೆಯ ಶ್ರೇಯಾಂಕ" },
      { id: "delayed_works", icon: "⏳", label: "ದೇಶದ ವಿಳಂಬಿತ ಕೆಲಸಗಳು", query: "ಅತಿ ಹೆಚ್ಚು ವಿಳಂಬಿತ ಕಾಮಗಾರಿಗಳು ಮತ್ತು ರಾಜ್ಯಗಳು" },
      { id: "vigilance", icon: "🔍", label: "ಜಾಗರೂಕತೆ & ವಿಚಲನಗಳು", query: "ವೆಚ್ಚ ಏರಿಕೆ ಮತ್ತು ನಕಲಿ ಕಾಮಗಾರಿ ವಿಚಲನಗಳು" },
    ],
    TE: [
      { id: "area_status", icon: "🇮🇳", label: "జాతీయ పనుల స్థితి & KPI", query: "జాతీయ పనుల స్థితి మరియు కీలక పనితీరు సూచికలు" },
      { id: "area_risk", icon: "🚨", label: "జాతీయ క్రిటికల్ హెచ్చరికలు", query: "దేశవ్యాప్తంగా క్రిటికల్ రిస్క్ మరియు హెచ్చరికలు" },
      { id: "area_funds", icon: "📊", label: "రాష్ట్రాలవారీ నిధి వినియోగం", query: "రాష్ట్రాలవారీ నిధి వినియోగ ర్యాంకింగ్స్" },
      { id: "delayed_works", icon: "⏳", label: "దేశంలో జాప్యమైన పనులు", query: "అత్యధిక జాప్యాలు కలిగిన రాష్ట్రాలు మరియు పనులు" },
      { id: "vigilance", icon: "🔍", label: "విజిలెన్స్ & వ్యయ అక్రమాలు", query: "కాంట్రాక్టర్ వ్యయ ద్రవ్యోల్బణం మరియు నకిలీ పనుల అక్రమాలు" },
    ],
  },
};

export function getQuickActions(role: UserRole | undefined, lang: Lang): QuickAction[] {
  const activeRole: UserRole = role && ROLE_QUICK_ACTIONS[role] ? role : "Citizen";
  return ROLE_QUICK_ACTIONS[activeRole][lang] ?? ROLE_QUICK_ACTIONS[activeRole].EN;
}

export function getSuggested(role: UserRole | undefined, lang: Lang): string[] {
  const actions = getQuickActions(role, lang);
  return actions.map((a) => a.query);
}

// ── Role-Scoped Intelligent Response Generator ────────────────────────────────

export function generateRoleWiseResponse(
  query: string,
  user: User | null | undefined,
  lang: Lang,
  isFallback: boolean = false
): Omit<Message, "id" | "role" | "timestamp"> | null {
  const q = query.toLowerCase().trim();
  const B = BTN[lang] || BTN.EN;

  const role: UserRole = user?.role || "Citizen";
  const userName = user?.name || (role === "MP" ? "Hon'ble MP" : role === "Citizen" ? "Citizen" : "Officer");
  const userDistrict = user?.district || "Lucknow";
  const userState = user?.state || "Uttar Pradesh";
  const userConstituency = user?.constituency || userDistrict;

  // Determine user-scoped area and projects
  let scopedProjects = PROJECTS;
  let areaName = "";
  let areaFilterPayload = "projects";

  if (role === "Citizen") {
    areaName = `${userDistrict}, ${userState}`;
    areaFilterPayload = `projects?district=${encodeURIComponent(userDistrict)}`;
    const filtered = PROJECTS.filter(
      (p) =>
        p.district?.toLowerCase() === userDistrict.toLowerCase() ||
        p.state?.toLowerCase() === userState.toLowerCase()
    );
    if (filtered.length > 0) scopedProjects = filtered;
  } else if (role === "MP") {
    areaName = `${userConstituency} Constituency`;
    areaFilterPayload = `projects?constituency=${encodeURIComponent(userConstituency)}`;
    const filtered = PROJECTS.filter(
      (p) =>
        p.constituency?.toLowerCase() === userConstituency.toLowerCase() ||
        p.district?.toLowerCase() === userConstituency.toLowerCase() ||
        p.state?.toLowerCase() === userState.toLowerCase()
    );
    if (filtered.length > 0) scopedProjects = filtered;
  } else if (role === "District") {
    areaName = `${userDistrict} District`;
    areaFilterPayload = `projects?district=${encodeURIComponent(userDistrict)}`;
    const filtered = PROJECTS.filter(
      (p) =>
        p.district?.toLowerCase() === userDistrict.toLowerCase() ||
        p.state?.toLowerCase() === userState.toLowerCase()
    );
    if (filtered.length > 0) scopedProjects = filtered;
  } else if (role === "State") {
    areaName = `${userState}`;
    areaFilterPayload = `projects?state=${encodeURIComponent(userState)}`;
    const filtered = PROJECTS.filter((p) => p.state?.toLowerCase() === userState.toLowerCase());
    if (filtered.length > 0) scopedProjects = filtered;
  } else {
    areaName = "National (All-India)";
    areaFilterPayload = "projects";
    scopedProjects = PROJECTS;
  }

  // Pre-calculate live metrics
  const total = scopedProjects.length;
  const completed = scopedProjects.filter((p) => p.status === "Completed");
  const inProgress = scopedProjects.filter((p) => p.status === "In Progress");
  const delayed = scopedProjects.filter((p) => p.status === "Delayed");
  const critOrHigh = scopedProjects
    .filter((p) => p.riskLevel === "Critical" || p.riskLevel === "High")
    .sort((a, b) => b.riskScore - a.riskScore);
  const totalSanctioned = scopedProjects.reduce((s, p) => s + p.sanctionedAmount, 0).toFixed(1);
  const totalSpent = scopedProjects.reduce((s, p) => s + p.expenditure, 0).toFixed(1);
  const pendingUC = completed.filter((p) => !p.ucSubmitted);
  const inspectionPending = scopedProjects.filter((p) => (p.inspections || 0) < 2 || p.status === "Delayed");

  // Helper for term matching
  const hasAny = (...terms: string[]) => terms.some((t) => q.includes(t.toLowerCase()));

  // 1. Area Work Status Intent
  const isStatusQuery = hasAny(
    "status", "work status", "works status", "my area", "area work", "constituency", "district work",
    "statewide", "national work", "स्थिति", "प्रगति", "कार्य", "काम", "நிலை", "কাজ", "ಕಾಮಗಾರಿ", "పనుల"
  );

  if (isStatusQuery || (isFallback && hasAny("project", "work", "list"))) {
    let text = "";
    let cards: ResponseCard[] = [];
    let actions: ActionButton[] = [];

    if (role === "Citizen") {
      text =
        lang === "HI"
          ? `📍 **${areaName} — विकास कार्य स्थिति**\n\n` +
            `नमस्ते **${userName}** जी! आपके क्षेत्र के विकास कार्यों की वर्तमान प्रगति इस प्रकार है:\n\n` +
            `• **कुल ट्रैक किए गए कार्य**: ${total} परियोजनाएं\n` +
            `• **पूर्ण व जनहित में समर्पित**: ${completed.length} कार्य\n` +
            `• **प्रगतिरत कार्य**: ${inProgress.length} कार्य\n` +
            `• **विलंबित कार्य**: ${delayed.length} कार्य\n` +
            `• **स्वीकृत वित्तीय बजट**: ₹${totalSanctioned} लाख (व्यय: ₹${totalSpent} लाख)\n\n` +
            `क्षेत्र में मुख्य रूप से संपर्क मार्ग, पेयजल, विद्यालय विकास व सामुदायिक सुविधाएं संचालित हैं।`
          : `📍 **${areaName} — Community Work Status**\n\n` +
            `Namaste **${userName}**! Here is the progress report for public developmental works in your area:\n\n` +
            `• **Total Works Tracked**: ${total} initiatives\n` +
            `• **Completed & In Public Use**: ${completed.length} works\n` +
            `• **Ongoing Construction**: ${inProgress.length} works\n` +
            `• **Delayed Beyond Scheduled Deadline**: ${delayed.length} works\n` +
            `• **Sanctioned Outlay**: ₹${totalSanctioned} Lakhs (₹${totalSpent}L utilized)\n\n` +
            `Key local sectors include road connectivity, community water points, healthcare, and solar lighting.`;

      // Up to 3 real local cards
      const sample = [
        ...completed.slice(0, 1),
        ...inProgress.slice(0, 1),
        ...delayed.slice(0, 1),
      ].slice(0, 3);

      cards = sample.map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + (p.name.split(",")[0].length > 36 ? "…" : ""),
        value: `${p.status} · ${p.progress}%`,
        sub: `₹${p.sanctionedAmount}L · ${p.district || userDistrict} · ${p.category}`,
        color: p.status === "Completed" ? "green" : p.status === "Delayed" ? "red" : "blue",
      }));

      actions = [
        { label: `View ${userDistrict} Projects`, type: "filter", payload: areaFilterPayload },
        { label: "Report Local Issue", type: "view", payload: "grievance" },
        { label: "Open GIS Map", type: "view", payload: "gis" },
      ];
    } else if (role === "MP") {
      text =
        lang === "HI"
          ? `🏛️ **${areaName} — कार्य स्थिति व फंड समीक्षा**\n\n` +
            `माननीय सांसद **${userName}** जी, आपके संसदीय क्षेत्र की कार्य समीक्षा:\n\n` +
            `• **स्वीकृत परियोजनाएं**: ${total} कार्य (कुल ₹${totalSanctioned} लाख)\n` +
            `• **पूर्ण कार्य**: ${completed.length} | **प्रगतिरत कार्य**: ${inProgress.length}\n` +
            `• **समयसीमा पार विलंबित कार्य**: ${delayed.length} कार्य\n` +
            `• **फंड उपयोग**: ₹${totalSpent} लाख व्यय (${Math.min(100, Math.round((Number(totalSpent) / (Number(totalSanctioned) || 1)) * 100))}%)\n` +
            `• **लंबित उपयोगिता प्रमाणपत्र (UC)**: ${pendingUC.length} कार्य\n\n` +
            `कार्यदायी संस्थाओं को विलंबित परियोजनाओं की त्वरित समीक्षा हेतु निर्देशित किया गया है।`
          : `🏛️ **${areaName} — Parliamentary Constituency Status**\n\n` +
            `Hon'ble MP **${userName}**, here is your parliamentary constituency execution summary:\n\n` +
            `• **Sanctioned Works**: ${total} projects (Total Outlay: ₹${totalSanctioned} Lakhs)\n` +
            `• **Completed & Handed Over**: ${completed.length} works\n` +
            `• **In Progress / Execution**: ${inProgress.length} works\n` +
            `• **Delayed Beyond Scheduled Target**: ${delayed.length} works\n` +
            `• **Expenditure Incurred**: ₹${totalSpent}L (${Math.min(100, Math.round((Number(totalSpent) / (Number(totalSanctioned) || 1)) * 100))}% utilized)\n` +
            `• **Pending UCs**: ${pendingUC.length} works awaiting compliance\n\n` +
            `District executing agencies have been alerted for priority completion of delayed works.`;

      cards = scopedProjects.slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `${p.progress}% complete · ₹${p.sanctionedAmount}L`,
        sub: `${p.status} · Expected: ${p.expectedCompletion || "On schedule"}`,
        color: p.status === "Delayed" ? "red" : p.status === "Completed" ? "green" : "blue",
      }));

      actions = [
        { label: "View Constituency Projects", type: "filter", payload: areaFilterPayload },
        { label: "High-Risk Center", type: "view", payload: "risk" },
        { label: "Pending UCs Dossier", type: "view", payload: "compliance" },
      ];
    } else if (role === "District") {
      text =
        lang === "HI"
          ? `📋 **${areaName} — प्रशासनिक समीक्षा**\n\n` +
            `जिला मजिस्ट्रेट / कलेक्टर कार्यकारी सारांश:\n\n` +
            `• **कुल स्वीकृत कार्य**: ${total} (लागत: ₹${totalSanctioned} लाख)\n` +
            `• **पूर्ण**: ${completed.length} | **प्रगतिरत**: ${inProgress.length}\n` +
            `• **विलंबित कार्य**: ${delayed.length} (ठेकेदार नोटिस आवश्यक)\n` +
            `• **60+ दिन से लंबित क्षेत्र निरीक्षण**: ${inspectionPending.length} कार्य\n` +
            `• **बकाया UC**: ${pendingUC.length} कार्य\n\n` +
            `कृपया फील्ड इंजीनियरों को स्थल सत्यापन एवं जियो-टैग फोटो अपलोड का निर्देश दें।`
          : `📋 **${areaName} — District Administration Overview**\n\n` +
            `District Collector / Authority Executive Briefing:\n\n` +
            `• **Total Sanctioned Works**: ${total} (Outlay: ₹${totalSanctioned} Lakhs)\n` +
            `• **Completed Works**: ${completed.length} | **Ongoing Works**: ${inProgress.length}\n` +
            `• **Delayed Works**: ${delayed.length} (Requires contractor review)\n` +
            `• **Mandatory 60-Day Field Inspections Overdue**: ${inspectionPending.length} projects\n` +
            `• **Overdue Utilization Certificates**: ${pendingUC.length} works\n\n` +
            `Please issue directives for field inspection uploads and geo-tagged photographic verification.`;

      cards = (delayed.length > 0 ? delayed : scopedProjects).slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `${p.status} · ${p.progress}%`,
        sub: `Contractor: ${p.contractor || "N/A"} · Inspections: ${p.inspections ?? 0}`,
        color: p.status === "Delayed" ? "red" : "amber",
      }));

      actions = [
        { label: `Inspect ${userDistrict} Works`, type: "filter", payload: areaFilterPayload },
        { label: "Field Verification Schedule", type: "view", payload: "compliance" },
        { label: "Flagged Contractors", type: "view", payload: "risk" },
      ];
    } else if (role === "State") {
      const stData = STATES_DATA.find((s) => s.state.toLowerCase() === userState.toLowerCase()) || STATES_DATA[0];
      text =
        lang === "HI"
          ? `🗺️ **${userState} राज्य — नोडल समीक्षा रिपोर्ट**\n\n` +
            `राज्य निदेशालय कार्यकारी सारांश:\n\n` +
            `• **राज्य में कुल MPLADS कार्य**: ${stData.totalProjects.toLocaleString()} कार्य\n` +
            `• **राज्यव्यापी पूर्ण कार्य**: ${stData.completedProjects.toLocaleString()} (${stData.utilization}% उपयोग)\n` +
            `• **विलंबित कार्य**: ${stData.delayedProjects} कार्य\n` +
            `• **कुल वित्तीय आबंटन**: ₹${(stData.totalFunds / 100).toFixed(0)} करोड़ (व्यय: ₹${(stData.utilizedFunds / 100).toFixed(0)} करोड़)\n` +
            `• **उच्च जोखिम परियोजनाएं**: ${stData.riskProjects} कार्य\n\n` +
            `जिलों में वित्तीय उपयोगिता एवं लंबित UC की प्रगति की नियमित निगरानी की जा रही है।`
          : `🗺️ **${userState} State — Comprehensive Work Status**\n\n` +
            `State Nodal Directorate Executive Briefing:\n\n` +
            `• **Total State MPLADS Works**: ${stData.totalProjects.toLocaleString()} projects\n` +
            `• **Statewide Completed**: ${stData.completedProjects.toLocaleString()} (${stData.utilization}% fund utilization)\n` +
            `• **Delayed Works Across Districts**: ${stData.delayedProjects} projects\n` +
            `• **State Financial Outlay**: ₹${(stData.totalFunds / 100).toFixed(0)}Cr sanctioned · ₹${(stData.utilizedFunds / 100).toFixed(0)}Cr utilized\n` +
            `• **High-Risk Projects**: ${stData.riskProjects} works flagged\n\n` +
            `Review inter-district utilization pace and monitor lagging district authorities.`;

      cards = [
        { label: "State Fund Utilization", value: `${stData.utilization}%`, sub: `₹${(stData.utilizedFunds / 100).toFixed(0)}Cr of ₹${(stData.totalFunds / 100).toFixed(0)}Cr`, color: "green" },
        { label: "Delayed Projects", value: `${stData.delayedProjects} Works`, sub: "Overdue completion dates", color: "red" },
        { label: "Risk Flagged Projects", value: `${stData.riskProjects} Works`, sub: "Requires nodal intervention", color: "amber" },
      ];

      actions = [
        { label: `${userState} Projects`, type: "filter", payload: areaFilterPayload },
        { label: "State Performance Rankings", type: "view", payload: "state-performance" },
        { label: "Open GIS Map", type: "view", payload: "gis" },
      ];
    } else {
      // Ministry
      text =
        `🇮🇳 **MoSPI Central Oversight — National Work Status**\n\n` +
        `All-India MPLADS Executive Oversight Dashboard:\n\n` +
        `• **Total Projects Tracked**: ${NATIONAL_KPIs.totalProjects.toLocaleString()} across 28 States & 8 UTs\n` +
        `• **National Completion Rate**: ${NATIONAL_KPIs.completionRate}% (${NATIONAL_KPIs.completedProjects.toLocaleString()} completed)\n` +
        `• **National Utilization Rate**: ${NATIONAL_KPIs.utilizationRate}% (₹${(NATIONAL_KPIs.utilized / 100).toFixed(0)}Cr of ₹${(NATIONAL_KPIs.released / 100).toFixed(0)}Cr)\n` +
        `• **Nationwide Delayed Works**: ${NATIONAL_KPIs.delayed.toLocaleString()} projects\n` +
        `• **Overdue UCs**: 12,480 certificates (₹1,240 Cr backlog)\n\n` +
        `Central vigilance algorithms are actively tracking contractor anomalies and cost spikes.`;

      cards = PROJECTS.filter((p) => p.sanctionedAmount >= 40).slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `₹${p.sanctionedAmount}L · ${p.progress}%`,
        sub: `${p.district}, ${p.state} · ${p.status}`,
        color: p.status === "Delayed" ? "red" : p.status === "Completed" ? "green" : "blue",
      }));

      actions = [
        { label: "National Risk Center", type: "view", payload: "risk" },
        { label: "State Performance Rankings", type: "view", payload: "state-performance" },
        { label: "All National Alerts", type: "view", payload: "alerts" },
      ];
    }

    return { text, cards, actions };
  }

  // 2. Area Risk & Alerts Intent
  const isRiskQuery = hasAny(
    "risk", "risks", "critical", "high-risk", "threat", "anomaly", "anomalies", "alert", "alerts",
    "जोखिम", "अलर्ट", "खतरा", "आफत", "ஆபத்து", "எச்சரிக்கை", "ঝুঁকি", "সতর্কতা", "ಅಪಾಯ", "ಎಚ್ಚರಿಕೆ", "రిస్క్", "హెచ్చరిక"
  );

  if (isRiskQuery) {
    let text = "";
    let cards: ResponseCard[] = [];
    let actions: ActionButton[] = [];

    if (role === "Citizen") {
      text =
        lang === "HI"
          ? `⚠️ **${areaName} — क्षेत्रीय प्रोजेक्ट जोखिम व सतर्कता रिपोर्ट**\n\n` +
            `नमस्ते **${userName}** जी! आपके क्षेत्र में **${critOrHigh.length} परियोजनाओं** में सक्रिय जोखिम फ्लैग या देरी पाई गई है:\n\n` +
            `• **कार्यान्वयन में देरी**: ${delayed.length} कार्य निर्धारित समयसीमा से पीछे चल रहे हैं\n` +
            `• **भौतिक साक्ष्य सत्यापन**: स्थल फ़ोटो की कमी या विसंगतियां AI द्वारा चिन्हित हैं\n` +
            `• **सामुदायिक प्रभाव**: सड़क, जल या प्रकाश सुविधाओं में अस्थायी रुकावट\n\n` +
            `यदि आप जमीनी स्तर पर अधूरा या घटिया कार्य देखते हैं, तो आप सीधे आधिकारिक नागरिक शिकायत दर्ज कर सकते हैं।`
          : `⚠️ **${areaName} — Area Project Risk & Vigilance Digest**\n\n` +
            `Namaste **${userName}**! In your area, **${critOrHigh.length} projects** currently have active risk flags or execution delays:\n\n` +
            `• **Execution Delays**: ${delayed.length} works running behind scheduled completion dates\n` +
            `• **Physical Evidence Verification**: Missing geo-tagged site photos or unverified citizen reports\n` +
            `• **Community Impact**: Temporary delay in planned community road or water amenities\n\n` +
            `If you observe abandoned, substandard, or halted construction on the ground, you can lodge an official citizen grievance directly.`;

      const riskSample = (critOrHigh.length > 0 ? critOrHigh : delayed).slice(0, 3);
      cards = riskSample.map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `Risk Score: ${p.riskScore}/100 (${p.riskLevel})`,
        sub: `${p.district || userDistrict} · ${p.riskFlags?.[0] || p.status}`,
        color: p.riskLevel === "Critical" ? "red" : "amber",
      }));

      actions = [
        { label: `View ${userDistrict} Risks`, type: "view", payload: "risk" },
        { label: "Lodge a Grievance", type: "view", payload: "grievance" },
        { label: "Upload Citizen Evidence", type: "view", payload: "evidence" },
      ];
    } else if (role === "MP") {
      text =
        lang === "HI"
          ? `⚠️ **${areaName} — उच्च जोखिम परियोजनाएं व अलर्ट**\n\n` +
            `माननीय सांसद **${userName}** जी, AI जोखिम इंजन ने आपके निर्वाचन क्षेत्र में **${critOrHigh.length} उच्च/गंभीर जोखिम परियोजनाओं** की पहचान की है:\n\n` +
            `• **समयसीमा उल्लंघन**: ${delayed.length} कार्य 30+ दिनों से विलंबित हैं\n` +
            `• **लागत वृद्धि**: स्वीकृत सीमा से अधिक व्यय वाले कार्य\n` +
            `• **लंबित अनुपालन**: ${pendingUC.length} कार्य उपयोगिता प्रमाणपत्र (UC) के अभाव में\n\n` +
            `अनुशंसित कार्रवाई: कार्यदायी संस्थाओं की समीक्षा हेतु जिला मजिस्ट्रेट को निर्देशित करें।`
          : `⚠️ **${areaName} — High-Risk Projects & Alerts**\n\n` +
            `Hon'ble MP **${userName}**, the AI risk engine identified **${critOrHigh.length} high/critical risk projects** in your constituency:\n\n` +
            `• **Schedule Breaches**: ${delayed.length} works delayed beyond 30+ days\n` +
            `• **Cost Overruns**: Budget estimates exceeding sanctioned outlay\n` +
            `• **Pending Compliance**: ${pendingUC.length} works awaiting statutory Utilization Certificates\n\n` +
            `Recommended Action: Issue directives to the District Authority for priority review meetings.`;

      cards = (critOrHigh.length > 0 ? critOrHigh : scopedProjects).slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `Risk: ${p.riskScore}/100 · ${p.riskLevel}`,
        sub: `${p.riskFlags?.[0] || "Schedule slippage"} · ₹${p.sanctionedAmount}L`,
        color: p.riskLevel === "Critical" ? "red" : "amber",
      }));

      actions = [
        { label: "Open Risk Center", type: "view", payload: "risk" },
        { label: "View Active Alerts", type: "view", payload: "alerts" },
        { label: "Check Compliance Gaps", type: "view", payload: "compliance" },
      ];
    } else if (role === "District") {
      text =
        lang === "HI"
          ? `⚠️ **${areaName} — प्रशासनिक जोखिम व अनुपालन अलर्ट**\n\n` +
            `जिला मजिस्ट्रेट / प्राधिकरण जोखिम सारांश:\n\n` +
            `• **गंभीर / उच्च जोखिम कार्य**: ${critOrHigh.length} परियोजनाएं (तत्काल स्थल सत्यापन आवश्यक)\n` +
            `• **ठेकेदार देरी**: ${delayed.length} कार्यों में माइलस्टोन विलंब\n` +
            `• **फोटो विसंगतियां**: गायब EXIF डेटा या GPS स्थान विसंगति (>500m)\n` +
            `• **निरीक्षण बकाया**: ${inspectionPending.length} कार्य 60+ दिनों से स्थल निरीक्षण के बिना\n\n` +
            `अनिवार्य कार्रवाई: डिफ़ॉल्ट ठेकेदारों को कारण बताओ नोटिस जारी करें और फील्ड इंजीनियर तैनात करें।`
          : `⚠️ **${areaName} — Administrative Risk & Compliance Flags**\n\n` +
            `District Magistrate / Authority Risk Digest:\n\n` +
            `• **Critical / High Risk Works**: ${critOrHigh.length} projects requiring immediate site verification\n` +
            `• **Contractor Delays**: ${delayed.length} projects with milestone slippages\n` +
            `• **Photo Discrepancies**: Missing EXIF data or GPS location mismatches (>500m)\n` +
            `• **Statutory Inspection Overdue**: ${inspectionPending.length} projects without site visits in 60+ days\n\n` +
            `Mandatory Action: Issue show-cause notices to defaulting contractors and depute field engineers.`;

      cards = (critOrHigh.length > 0 ? critOrHigh : delayed).slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `Risk: ${p.riskScore}/100 · ${p.riskLevel}`,
        sub: `Contractor: ${p.contractor || "N/A"} · ${p.status}`,
        color: p.riskLevel === "Critical" ? "red" : "amber",
      }));

      actions = [
        { label: "District Risk Dossiers", type: "view", payload: "risk" },
        { label: "Field Verification Schedule", type: "view", payload: "compliance" },
        { label: "Crosscheck Photo Evidence", type: "view", payload: "crosscheck" },
      ];
    } else if (role === "State") {
      text =
        `⚠️ **${userState} State — Statewide High-Risk Clusters & Alerts**\n\n` +
        `State Department Vigilance Digest:\n\n` +
        `• **Statewide Risk Projects**: ${critOrHigh.length} high/critical risk projects\n` +
        `• **Delayed Works**: ${delayed.length} projects across districts\n` +
        `• **Persistent Non-Compliance**: Backlog in UC submissions and contractor concentration\n\n` +
        `Action: Issue compliance directives to lowest-performing district authorities.`;

      cards = (critOrHigh.length > 0 ? critOrHigh : PROJECTS).slice(0, 3).map((p) => ({
        label: p.name.split(",")[0].substring(0, 36) + "…",
        value: `Risk: ${p.riskScore}/100 · ${p.district}`,
        sub: `${p.riskFlags?.[0] || "Milestone delay"}`,
        color: p.riskLevel === "Critical" ? "red" : "amber",
      }));

      actions = [
        { label: "State Risk Center", type: "view", payload: "risk" },
        { label: "State Compliance Hub", type: "view", payload: "compliance" },
        { label: "View State Alerts", type: "view", payload: "alerts" },
      ];
    } else {
      // Ministry
      text =
        `🚨 **National Central Vigilance & Critical Anomaly Digest**\n\n` +
        `MoSPI Central Vigilance Overview:\n\n` +
        `• **Critical Risk Projects**: ${PROJECTS.filter((p) => p.riskLevel === "Critical").length} nationwide\n` +
        `• **High Risk Projects**: ${PROJECTS.filter((p) => p.riskLevel === "High").length} nationwide\n` +
        `• **Contractor Irregularity Flags**: ${RISK_FLAGS.length} flagged vendors\n` +
        `• **Active Central Alerts**: ${ALERTS.filter((a) => a.status === "Active").length} alerts (${ALERTS.filter((a) => a.severity === "Critical").length} Critical)\n\n` +
        `Automated AI models are monitoring fund siphoning, duplicate invoicing, and delayed work clusters.`;

      cards = RISK_FLAGS.slice(0, 3).map((r) => ({
        label: r.projectName.substring(0, 38) + "…",
        value: `Risk Score: ${r.riskScore}/100 · ${r.severity}`,
        sub: r.type,
        color: r.severity === "Critical" ? "red" : "amber",
      }));

      actions = [
        { label: "Central Risk Center", type: "view", payload: "risk" },
        { label: "Active Alerts", type: "view", payload: "alerts" },
        { label: "Anomaly Investigation", type: "view", payload: "investigation" },
      ];
    }

    return { text, cards, actions };
  }

  // 3. Fund Utilization Intent
  const isFundQuery = hasAny(
    "fund", "funds", "utilization", "unspent", "spent", "budget", "cost", "crore", "lakh", "निधि", "पैसा", "खर्च", "बजट", "நிதி", "তহবিল", "ನಿಧಿ", "వినియోగం"
  );

  if (isFundQuery) {
    const utilPercent = totalSanctioned !== "0.0" ? Math.min(100, Math.round((Number(totalSpent) / Number(totalSanctioned)) * 100)) : 75;
    const text =
      `💰 **${areaName} — Fund Utilization & Budget Breakdown**\n\n` +
      `Financial Execution Summary:\n\n` +
      `• **Total Sanctioned Outlay**: ₹${totalSanctioned} Lakhs\n` +
      `• **Actual Expenditure Incurred**: ₹${totalSpent} Lakhs\n` +
      `• **Utilization Rate**: **${utilPercent}%**\n` +
      `• **Estimated Unspent / Available Balance**: ₹${Math.max(0, Number(totalSanctioned) - Number(totalSpent)).toFixed(1)} Lakhs\n` +
      `• **Works with UC Submitted**: ${completed.length - pendingUC.length} of ${completed.length} completed works\n\n` +
      `Fund releases are tied directly to geo-tagged verification and statutory UC submission.`;

    const cards: ResponseCard[] = [
      { label: "Sanctioned Amount", value: `₹${totalSanctioned}L`, sub: `${total} Projects Sanctioned`, color: "blue" },
      { label: "Actual Expenditure", value: `₹${totalSpent}L`, sub: `${utilPercent}% Fund Utilized`, color: utilPercent < 70 ? "amber" : "green" },
      { label: "Pending UCs", value: `${pendingUC.length} Works`, sub: "Awaiting utilization certs", color: pendingUC.length > 0 ? "amber" : "green" },
    ];

    const actions: ActionButton[] = [
      { label: "Financial Reports", type: "view", payload: "reports" },
      { label: "Open GIS Map", type: "view", payload: "gis" },
    ];

    return { text, cards, actions };
  }

  // 4. Completed Works Intent
  const isCompletedQuery = hasAny("complet", "done", "finish", "closed", "पूर्ण", "समाप्त", "நிறைவு", "সম্পন্ন", "ಪೂರ್ಣ", "పూర్తి");

  if (isCompletedQuery) {
    const text =
      `✅ **${areaName} — Completed Community Works**\n\n` +
      `**${completed.length} developmental projects** have reached 100% completion in this area:\n\n` +
      `• **Total Sanctioned Value**: ₹${completed.reduce((s, p) => s + p.sanctionedAmount, 0).toFixed(1)} Lakhs\n` +
      `• **UC Submitted**: ${completed.filter((p) => p.ucSubmitted).length} works\n` +
      `• **Awaiting UC Submission**: ${pendingUC.length} works\n\n` +
      `Citizens can inspect completed works and provide ground quality ratings.`;

    const cards: ResponseCard[] = completed.slice(0, 3).map((p) => ({
      label: p.name.split(",")[0].substring(0, 38) + "…",
      value: `Completed · ₹${p.sanctionedAmount}L`,
      sub: `${p.district || userDistrict} · UC: ${p.ucSubmitted ? "Verified ✓" : "Pending ⚠"}`,
      color: p.ucSubmitted ? "green" : "amber",
    }));

    const actions: ActionButton[] = [
      { label: "View Completed Projects", type: "filter", payload: "projects?status=Completed" },
      { label: role === "Citizen" ? "Give Feedback" : "UC Compliance Hub", type: "view", payload: role === "Citizen" ? "citizen-feedback" : "compliance" },
    ];

    return { text, cards, actions };
  }

  // 5. Grievance Intent
  const isGrievanceQuery = hasAny("grievance", "complaint", "feedback", "issue", "शिकायत", "तक्रार", "புகார்", "অভিযোগ", "ದೂರು", "ఫిర్యాదు");

  if (isGrievanceQuery) {
    const text =
      `📝 **NIDHI-SATHI Citizen Grievance Redressal Mechanism**\n\n` +
      `Any citizen can raise a formal grievance regarding stalled, delayed, or substandard MPLADS works in **${areaName}**:\n\n` +
      `1. **Select Work ID**: Choose the project from the list or map.\n` +
      `2. **Attach Evidence**: Upload on-ground photos with GPS geo-location.\n` +
      `3. **Automated Escalation**: The District Collector and Hon'ble MP are notified automatically.\n` +
      `4. **Statutory Timeline**: Mandated resolution and response within 15 working days.`;

    const cards: ResponseCard[] = [
      { label: "Citizen Grievance Portal", value: "Active", sub: "100% Transparent Tracking", color: "green" },
      { label: "Target Resolution Time", value: "15 Days", sub: "Escalated to District Collector", color: "blue" },
    ];

    const actions: ActionButton[] = [
      { label: "Lodge New Grievance", type: "view", payload: "grievance" },
      { label: "Track Existing Grievance", type: "view", payload: "track-grievance" },
      { label: "Upload Photo Evidence", type: "view", payload: "evidence" },
    ];

    return { text, cards, actions };
  }

  // 6. Inspections / UC Compliance Intent
  const isInspectionQuery = hasAny("inspection", "inspections", "uc", "certificate", "compliance", "निरीक्षण", "प्रमाणपत्र", "जांच", "தணிக்கை");

  if (isInspectionQuery) {
    const text =
      `🔍 **${areaName} — Inspection & UC Compliance Dossier**\n\n` +
      `Statutory compliance requirements:\n\n` +
      `• **Projects Pending Physical Inspection**: ${inspectionPending.length} works\n` +
      `• **Mandatory 60-Day Inspection Rule**: District authorities must physically verify progress and upload EXIF-tagged photos.\n` +
      `• **Overdue Utilization Certificates (UC)**: ${pendingUC.length} completed works have pending certificates\n\n` +
      `Funds for subsequent installments are released only after UC submission and geo-tagged verification.`;

    const cards: ResponseCard[] = [
      { label: "Pending Site Inspections", value: `${inspectionPending.length} Works`, sub: "Exceeds 60 days interval", color: "red" },
      { label: "Pending UCs", value: `${pendingUC.length} Works`, sub: "Required for next installment", color: "amber" },
    ];

    const actions: ActionButton[] = [
      { label: "Field Verification Hub", type: "view", payload: "compliance" },
      { label: "Audit Reports", type: "view", payload: "reports" },
    ];

    return { text, cards, actions };
  }

  // Fallback help
  if (isFallback) {
    const R = RESP[lang] || RESP.EN;
    return {
      text: R.help(),
      cards: [],
      actions: [
        { label: B.viewDashboard, type: "view", payload: "dashboard" },
        { label: B.aiRisk, type: "view", payload: "risk" },
      ],
    };
  }

  return null;
}

// ── Card colors ───────────────────────────────────────────────────────────────

const CARD_COLORS: Record<ResponseCard["color"], { bg: string; border: string; dot: string; val: string }> = {
  red:    { bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400",    val: "text-red-700" },
  amber:  { bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-400",  val: "text-amber-700" },
  green:  { bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-400",val: "text-emerald-700" },
  blue:   { bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-400",   val: "text-blue-700" },
  violet: { bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-400", val: "text-violet-700" },
};

function RenderText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="break-words [overflow-wrap:anywhere]">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-semibold text-slate-800 break-words [overflow-wrap:anywhere]">{part.slice(2, -2)}</strong>
          : part.split("\n").map((line, j) => <span key={`${i}-${j}`} className="break-words [overflow-wrap:anywhere]">{j > 0 && <br />}{line}</span>)
      )}
    </span>
  );
}

function getLocalizedGreeting(lang: Lang, name: string): string {
  switch (lang) {
    case "HI": return `नमस्ते, ${name} जी! मैं आपका AI सहायक हूँ`;
    case "MR": return `नमस्कार, ${name}! मी तुमचा AI सहाय्यक आहे`;
    case "TA": return `வணக்கம், ${name}! நான் உங்கள் AI உதவியாளர்`;
    case "BN": return `নমস্কার, ${name}! আমি আপনার AI সহকারী`;
    case "KA": return `ನಮಸ್ಕಾರ, ${name}! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ`;
    case "TE": return `నమస్కారం, ${name}! నేను మీ AI సహాయకుడు`;
    default: return `Namaste, ${name}! I'm your AI Copilot`;
  }
}

function getLocalizedWelcome(lang: Lang, name: string, role: string, loc: string): string {
  switch (lang) {
    case "HI":
      return `नमस्ते, **${name}** जी! 🙏\n\nमैं आपका **NIDHI-SATHI AI सहायक** हूँ, जो आपके **${role}** खाते (${loc}) से जुड़ा है।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ? आप निधि उपयोग, विलंबित परियोजनाओं, या जोखिम विश्लेषण के बारे में पूछ सकते हैं।`;
    case "MR":
      return `नमस्कार, **${name}**! 🙏\n\nमी तुमचा **NIDHI-SATHI AI सहाय्यक** आहे, जो तुमच्या **${role}** खात्याशी (${loc}) जोडलेला आहे।\n\nआज मी तुम्हाला कशी मदत करू शकतो? आपण निधी वापर, विलंबित प्रकल्प किंवा जोखीम विश्लेषणाबद्दल विचारू शकता.`;
    case "TA":
      return `வணக்கம், **${name}**! 🙏\n\nநான் உங்கள் **NIDHI-SATHI AI உதவியாளர்**, உங்கள் **${role}** கணக்குடன் (${loc}) இணைக்கப்பட்டுள்ளது.\n\nஇன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? நிதி பயன்பாடு, தாமதமான திட்டங்கள் அல்லது ஆபத்து பகுப்பாய்வு பற்றி நீங்கள் கேட்கலாம்.`;
    case "BN":
      return `নমস্কার, **${name}**! 🙏\n\nআমি আপনার **NIDHI-SATHI AI সহকারী**, যা আপনার **${role}** অ্যাকাউন্টের (${loc}) জন্য ব্যক্তিগতকৃত।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনি তহবিল ব্যবহার, বিলম্বিত প্রকল্প বা ঝুঁকি বিশ্লেষণ সম্পর্কে জিজ্ঞাসা করতে পারেন।`;
    case "KA":
      return `ನಮಸ್ಕಾರ, **${name}**! 🙏\n\nನಾನು ನಿಮ್ಮ **NIDHI-SATHI AI ಸಹಾಯಕ**, ನಿಮ್ಮ **${role}** ಖಾತೆಗೆ (${loc}) ವೈಯಕ್ತಿಕಗೊಳಿಸಲಾಗಿದೆ.\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ನಿಧಿ ಬಳಕೆ, ವಿಳಂಬಿತ ಯೋಜನೆಗಳು ಅಥವಾ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆಯ ಬಗ್ಗೆ ಕೇಳಬಹುದು.`;
    case "TE":
      return `నమస్కారం, **${name}**! 🙏\n\nనేను మీ **NIDHI-SATHI AI సహాయకుడు**, మీ **${role}** ఖాతా (${loc}) కోసం వ్యక్తిగతీకరించబడింది.\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను? నిధి వినియోగం, జాప్యమైన ప్రాజెక్టులు లేదా రిస్క్ విశ్లేషణ గురించి అడగవచ్చు.`;
    default:
      return `Namaste, **${name}**! 🙏\n\nI am your **NIDHI-SATHI AI Copilot**, personalized for your **${role}** account (${loc}).\n\nHow may I assist you today? You can ask me about fund utilization, delayed projects, pending UCs, statutory risk flags, or specific works in your jurisdiction.`;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AICopilotProps { onNavigate: (page: string) => void; user?: User | null; }

export default function AICopilot({ onNavigate, user }: AICopilotProps) {
  const { user: authUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);

  // Micro-interaction states for floating popup & button click animation
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronously fetch and track user account from prop, state, or localStorage
  const [accountUser, setAccountUser] = useState<User | null>(() => {
    if (user) return user;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mplads_user");
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Re-sync account when user prop changes or storage updates
  useEffect(() => {
    if (user) {
      setAccountUser(user);
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mplads_user");
        if (saved) setAccountUser(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Derived user details for addressing
  const userName = accountUser?.name || "Hon'ble Member";
  const userRole = accountUser?.role || "MP";
  const userLocation = accountUser?.constituency
    ? `${accountUser.constituency} (${accountUser.state || ""})`
    : accountUser?.district
    ? `${accountUser.district} (${accountUser.state || ""})`
    : accountUser?.state || "National Oversight";

  const ui = UI[lang];
  const suggested = getSuggested(accountUser?.role, lang);
  const quickActions = getQuickActions(accountUser?.role, lang);

  // Cache storage key for conversation persistence per user
  const chatCacheKey = `nidhi_sathi_chat_v2_${accountUser?.mpId || userName.replace(/\s+/g, "_")}`;

  // Initial load from cache or seed with personal greeting
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedChat = localStorage.getItem(chatCacheKey);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          setShowSuggested(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default: initialize with personalized welcome message addressing the user by name
    const initialWelcome: Message = {
      id: "welcome-init",
      role: "ai",
      text: getLocalizedWelcome(lang, userName, userRole, userLocation),
      timestamp: new Date(),
    };
    setMessages([initialWelcome]);
    setShowSuggested(true);
  }, [chatCacheKey, userName, userRole, userLocation, lang]);

  // Persist conversation to cache whenever messages update
  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(chatCacheKey, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, chatCacheKey]);

  useEffect(() => { const t = setInterval(() => {}, 3000); return () => clearInterval(t); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  // Toggle open and refresh user from account storage immediately
  const handleToggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("mplads_user");
          if (saved) {
            setAccountUser(JSON.parse(saved));
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowSuggested(false);

    // 1. Instant high-fidelity role-wise response (with colored metric cards & actionable buttons)
    const instant = generateRoleWiseResponse(trimmed, accountUser, lang, false);
    if (instant) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: instant.text,
            cards: instant.cards,
            actions: instant.actions,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 200);
      return;
    }

    // 2. Fallback to /api/chat for free-form queries
    try {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
      const currentUser = user || authUser || accountUser;
      const userPayload = {
        name: currentUser?.name || userName,
        role: currentUser?.role || userRole,
        constituency: currentUser?.constituency || accountUser?.constituency,
        district: currentUser?.district || accountUser?.district,
        state: currentUser?.state || accountUser?.state,
      };

      // Pass previous turns for conversational continuity
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          currentRoute: currentPath,
          user: userPayload,
          history: historyPayload,
        }),
      });

      const data = await res.json().catch(() => null);
      const botText = data?.reply || data?.data?.reply || data?.data?.message;

      if (res.ok && data?.success && botText) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: botText,
            timestamp: new Date(),
          },
        ]);
      } else {
        console.error("[AICopilot Error]", data);
        const fallback = generateRoleWiseResponse(trimmed, accountUser, lang, true);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: fallback?.text || "I am your NIDHI-SATHI AI Copilot. Please ask about area works, risks, or funds.",
            cards: fallback?.cards,
            actions: fallback?.actions,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      const fallback = generateRoleWiseResponse(trimmed, accountUser, lang, true);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: fallback?.text || "Sorry, I couldn't connect to the network right now. Please try again.",
          cards: fallback?.cards,
          actions: fallback?.actions,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, user, authUser, userName, userRole, accountUser, messages, lang]);


  const handleVoice = () => { setListening(true); setTimeout(() => { setListening(false); sendMessage(ui.voiceQuery); }, 2200); };
  const handleAction = (action: ActionButton) => { onNavigate(action.payload?.split("?")[0] ?? "dashboard"); setOpen(false); };
  const clearChat = () => {
    const freshWelcome: Message = {
      id: Date.now().toString(),
      role: "ai",
      text: getLocalizedWelcome(lang, userName, userRole, userLocation),
      timestamp: new Date(),
    };
    setMessages([freshWelcome]);
    setShowSuggested(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(chatCacheKey);
      } catch {
        // ignore
      }
    }
  };
  const timeStr = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Mouse hover handlers for speech-style tooltip popup
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  // FAB button click handler with micro-interaction animation
  const handleFabClick = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);

    if (open) {
      setOpen(false);
      return;
    }

    // Trigger click scale & ripple
    setIsClicked(true);
    setShowRipple(true);

    setTimeout(() => {
      setIsClicked(false);
    }, 350);

    setTimeout(() => {
      setShowRipple(false);
    }, 550);

    // Smoothly open chatbot window
    setTimeout(() => {
      handleToggleOpen();
    }, 180);
  };

  return (
    <>
      {open && (
        <div className="fixed z-50 flex flex-col shadow-2xl animate-nidhi-chat-in inset-0 sm:inset-auto sm:bottom-[88px] sm:right-6 w-full max-w-full sm:w-[380px] sm:max-w-[380px] h-[100dvh] sm:h-[560px] rounded-none sm:rounded-2xl bg-white border-0 sm:border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 shrink-0" style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #1a3a6b 100%)" }}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-display font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                <span>NIDHI-SATHI AI</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-medium">Copilot</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"/>
                <span className="text-blue-100 text-[10px] sm:text-[10.5px] font-medium truncate max-w-[130px]" title={`Account: ${userName}`}>
                  {userName}
                </span>
                <span className="text-blue-300/60 text-[9px]">·</span>
                <span className="text-amber-300 text-[10px] font-semibold">{userRole}</span>
              </div>
            </div>
            {/* Language selector */}
            <div className="relative shrink-0">
              <button onClick={() => setShowLangMenu(m => !m)} aria-label="Select Language" className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-blue-200 hover:bg-white/10 transition-colors border border-white/15 min-h-[36px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                {LANGS.find(l => l.id === lang)?.native}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 min-w-[130px]">
                  {LANGS.map(l => (
                    <button key={l.id} onClick={() => { setLang(l.id); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left ${lang === l.id ? "text-blue-600 font-semibold" : "text-slate-700"}`}>
                      <span className="w-5 text-center font-bold">{l.native}</span>
                      <span>{l.label}</span>
                      {lang === l.id && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} aria-label={ui.clearTitle} className="text-blue-300 hover:text-white transition-colors p-2 rounded hover:bg-white/10 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center" title={ui.clearTitle}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            )}
            <button onClick={() => setOpen(false)} aria-label="Close NIDHI-SATHI AI" className="text-blue-300 hover:text-white transition-colors p-2 rounded hover:bg-white/10 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 space-y-3 sm:space-y-4 bg-slate-50/60">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white shadow-sm break-words [overflow-wrap:anywhere]" style={{ background: "linear-gradient(135deg, #1a3a6b, #2563EB)" }}>{msg.text}</div>
                ) : (
                  <div className="w-full max-w-[92%] sm:max-w-[88%] space-y-2">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm break-words [overflow-wrap:anywhere]">
                      <p className="text-sm text-slate-700 leading-relaxed break-words [overflow-wrap:anywhere]"><RenderText text={msg.text}/></p>
                    </div>

                    {/* Quick Actions Card popup rendered strictly AFTER the first greeting message */}
                    {index === 0 && (msg.id === "welcome-init" || messages.length === 1) && (
                      <div className="mt-2 text-left bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <span>⚡ Quick Actions</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[9px]">{userRole}</span>
                          </span>
                          <span className="text-[9.5px] text-blue-600 font-medium">1-click insight</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {quickActions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => sendMessage(action.query)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50/90 border border-slate-200/70 hover:border-blue-400 hover:bg-blue-50/70 hover:shadow-xs transition-all text-left group cursor-pointer active:scale-[0.99]"
                            >
                              <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{action.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">{action.label}</div>
                                <div className="text-[10px] text-slate-400 truncate group-hover:text-blue-500/80">{action.query}</div>
                              </div>
                              <span className="text-slate-400 group-hover:text-blue-600 text-xs font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="space-y-1.5 w-full">
                        {msg.cards.map((card, i) => {
                          const c = CARD_COLORS[card.color];
                          return (
                            <div key={i} className={`${c.bg} ${c.border} border rounded-xl px-3 py-2.5 flex items-start gap-2.5 w-full overflow-hidden`}>
                              <div className={`w-2 h-2 rounded-full ${c.dot} shrink-0 mt-1.5`}/>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-700 leading-snug break-words">{card.label}</div>
                                <div className={`text-xs font-bold ${c.val} mt-0.5 break-words`}>{card.value}</div>
                                {card.sub && <div className="text-[10px] text-slate-400 mt-0.5 leading-snug break-words">{card.sub}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-w-full">
                        {msg.actions.map((action, i) => (
                          <button key={i} onClick={() => handleAction(action)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:shadow-sm active:scale-95 break-words max-w-full text-left ${action.type === "view" ? "bg-[#0D1B3E] text-white hover:bg-blue-900" : action.type === "filter" ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" : action.type === "alert" ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"}`}>
                            {action.label} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-slate-400 mt-1 px-1">{timeStr(msg.timestamp)}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-400" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}/>)}
                </div>
              </div>
            )}
          </div>


          {/* Listening */}
          {listening && (
            <div className="mx-3 sm:mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl shrink-0">
              <div className="flex items-center gap-0.5">
                {[1,3,5,3,1].map((h, i) => <div key={i} className="w-1 rounded-full bg-red-500" style={{ height: h * 4, animation: `bounce 0.6s ease-in-out ${i * 0.1}s infinite alternate` }}/>)}
              </div>
              <span className="text-xs text-red-600 font-medium truncate">{ui.listening}</span>
              <button onClick={() => setListening(false)} aria-label="Stop listening" className="ml-auto text-red-400 hover:text-red-600 shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          )}

          {/* Persistent Quick Actions Bar */}
          <div className="px-2.5 py-1.5 bg-slate-100/90 border-t border-slate-200/70 flex items-center gap-1.5 overflow-x-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">⚡ Quick:</span>
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => sendMessage(action.query)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-medium shrink-0 whitespace-nowrap shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="text-xs">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pt-2 pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus-within:border-blue-400 focus-within:bg-white transition-all w-full min-w-0">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)} placeholder={ui.placeholder} className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none min-w-0 w-full" aria-label="Type message"/>
              <button onClick={handleVoice} disabled={loading || listening} aria-label="Voice input" className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all min-w-[32px] min-h-[32px] ${listening ? "bg-red-500 text-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`} title="Voice input">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
              </button>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} aria-label="Send message" className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 min-w-[32px] min-h-[32px]" style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #0D1B3E, #2563EB)" : undefined }}>
                <svg viewBox="0 0 24 24" fill={input.trim() && !loading ? "white" : "#94A3B8"} className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">{ui.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Speech-Style Tooltip Popup before chat opens */}
      {!open && (isHovered || isClicked) && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed z-50 bottom-[78px] right-4 sm:bottom-[92px] sm:right-6 pointer-events-auto transition-all duration-300 ease-out animate-nidhi-popup-in"
        >
          <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/15 rounded-2xl px-3.5 py-2.5 max-w-[210px] sm:max-w-[230px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-display">
              <span className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-600 bg-clip-text text-transparent">
                NIDHI-SATHI AI
              </span>
              <span className="text-amber-500 text-xs">✨</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">
              Your MPLADS Copilot
            </p>
            {/* Pointer / Tail pointing towards FAB button */}
            <div
              className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-slate-200/90 rotate-45"
            />
          </div>
        </div>
      )}

      {/* Floating Chatbot FAB */}
      <div
        className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center pointer-events-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ripple effect on click */}
        {showRipple && (
          <>
            <span className="absolute w-14 h-14 rounded-full bg-blue-500/40 animate-nidhi-ripple pointer-events-none" />
            <span className="absolute w-14 h-14 rounded-full bg-amber-400/40 animate-nidhi-ripple-delayed pointer-events-none" />
          </>
        )}

        <button
          onClick={handleFabClick}
          className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-200 w-14 h-14 ${
            isClicked ? "scale-95 rotate-[-6deg]" : "hover:scale-105 active:scale-95"
          }`}
          style={{
            background: open
              ? "linear-gradient(135deg, #EF4444, #DC2626)"
              : "linear-gradient(135deg, #0D1B3E 0%, #1a3a6b 60%, #F59E0B 200%)",
            boxShadow: open
              ? "0 8px 32px rgba(239,68,68,0.45)"
              : "0 8px 32px rgba(13,27,62,0.55)",
          }}
          title="NIDHI-SATHI AI Copilot"
          aria-label={open ? "Close NIDHI-SATHI AI" : "Open NIDHI-SATHI AI"}
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" className={`w-6 h-6 transition-transform duration-200 ${isClicked ? "scale-110" : ""}`}>
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z" />
            </svg>
          )}
          {!open && <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#F59E0B" }}/>}
          {!open && ALERTS.filter(a => a.status === "Active").length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white z-10">
              {ALERTS.filter(a => a.status === "Active").length}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes nidhi-popup-in {
          0% { opacity: 0; transform: translateY(6px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes nidhi-chat-in {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes nidhi-ripple {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes nidhi-ripple-delayed {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .animate-nidhi-popup-in {
          animation: nidhi-popup-in 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-nidhi-chat-in {
          animation: nidhi-chat-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-nidhi-ripple {
          animation: nidhi-ripple 450ms cubic-bezier(0, 0.2, 0.8, 1) forwards;
        }

        .animate-nidhi-ripple-delayed {
          animation: nidhi-ripple-delayed 350ms cubic-bezier(0, 0.2, 0.8, 1) 80ms forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-nidhi-popup-in,
          .animate-nidhi-chat-in,
          .animate-nidhi-ripple,
          .animate-nidhi-ripple-delayed {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
