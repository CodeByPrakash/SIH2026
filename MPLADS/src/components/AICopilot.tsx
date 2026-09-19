"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { User, UserRole } from "../types";
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
  EN: { placeholder: "Ask about projects, funds, risks…", greeting: "Namaste! I'm your AI Copilot", subtitle: "Ask me anything about MPLADS projects, funds, risks, delays, or compliance — in any language.", suggestedLabel: "Suggested Questions", disclaimer: "AI responses are indicative. Verify critical data on official portals.", listening: "Listening… speak your query", onlineStatus: "Online · MPLADS Copilot", voiceQuery: "Show all critical risk projects", clearTitle: "Clear chat" },
  HI: { placeholder: "परियोजनाओं, निधियों, जोखिमों के बारे में पूछें…", greeting: "नमस्ते! मैं आपका AI सहायक हूँ", subtitle: "MPLADS परियोजनाओं, निधियों, जोखिमों, देरी या अनुपालन के बारे में कुछ भी पूछें।", suggestedLabel: "सुझाए गए प्रश्न", disclaimer: "AI उत्तर संकेतात्मक हैं। आधिकारिक पोर्टल पर महत्वपूर्ण डेटा सत्यापित करें।", listening: "सुन रहा हूँ… अपना प्रश्न बोलें", onlineStatus: "ऑनलाइन · MPLADS सहायक", voiceQuery: "सभी गंभीर जोखिम परियोजनाएं दिखाएं", clearTitle: "चैट साफ़ करें" },
  MR: { placeholder: "प्रकल्प, निधी, जोखीम विचारा…", greeting: "नमस्कार! मी तुमचा AI सहाय्यक आहे", subtitle: "MPLADS प्रकल्प, निधी, जोखीम, विलंब किंवा अनुपालनाबद्दल काहीही विचारा।", suggestedLabel: "सुचवलेले प्रश्न", disclaimer: "AI उत्तरे सूचक आहेत। अधिकृत पोर्टलवर महत्त्वाचा डेटा पडताळा.", listening: "ऐकत आहे… आपला प्रश्न बोला", onlineStatus: "ऑनलाइन · MPLADS सहाय्यक", voiceQuery: "सर्व गंभीर जोखीम प्रकल्प दाखवा", clearTitle: "चॅट साफ करा" },
  TA: { placeholder: "திட்டங்கள், நிதி, அபாயங்கள் கேளுங்கள்…", greeting: "வணக்கம்! நான் உங்கள் AI உதவியாளர்", subtitle: "MPLADS திட்டங்கள், நிதி, அபாயங்கள், தாமதங்கள் அல்லது இணக்கம் பற்றி எதையும் கேளுங்கள்.", suggestedLabel: "பரிந்துரைக்கப்பட்ட கேள்விகள்", disclaimer: "AI பதில்கள் குறிப்பீட்டு தன்மையானவை. அதிகாரப்பூர்வ தளங்களில் தரவை சரிபார்க்கவும்.", listening: "கேட்கிறேன்… உங்கள் கேள்வியை பேசுங்கள்", onlineStatus: "ஆன்லைன் · MPLADS உதவியாளர்", voiceQuery: "அனைத்து முக்கியமான ஆபத்து திட்டங்களை காட்டு", clearTitle: "அரட்டையை அழி" },
  BN: { placeholder: "প্রকল্প, তহবিল, ঝুঁকি সম্পর্কে জিজ্ঞাসা করুন…", greeting: "নমস্কার! আমি আপনার AI সহকারী", subtitle: "MPLADS প্রকল্প, তহবিল, ঝুঁকি, বিলম্ব বা সম্মতি সম্পর্কে যেকোনো প্রশ্ন করুন।", suggestedLabel: "প্রস্তাবিত প্রশ্নসমূহ", disclaimer: "AI উত্তরগুলি নির্দেশক। সরকারি পোর্টালে গুরুত্বপূর্ণ তথ্য যাচাই করুন।", listening: "শুনছি… আপনার প্রশ্ন বলুন", onlineStatus: "অনলাইন · MPLADS সহকারী", voiceQuery: "সমস্ত সঙ্কটজনক ঝুঁকি প্রকল্প দেখান", clearTitle: "চ্যাট পরিষ্কার করুন" },
  KA: { placeholder: "ಯೋಜನೆಗಳು, ನಿಧಿಗಳು, ಅಪಾಯಗಳ ಬಗ್ಗೆ ಕೇಳಿ…", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ", subtitle: "MPLADS ಯೋಜನೆಗಳು, ನಿಧಿ, ಅಪಾಯಗಳು, ವಿಳಂಬ ಅಥವಾ ಅನುಪಾಲನೆಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.", suggestedLabel: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು", disclaimer: "AI ಉತ್ತರಗಳು ಸೂಚಕ. ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ನಿರ್ಣಾಯಕ ಡೇಟಾವನ್ನು ಪರಿಶೀಲಿಸಿ.", listening: "ಆಲಿಸುತ್ತಿದೆ… ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಹೇಳಿ", onlineStatus: "ಆನ್‌ಲೈನ್ · MPLADS ಸಹಾಯಕ", voiceQuery: "ಎಲ್ಲಾ ಗಂಭೀರ ಅಪಾಯದ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ", clearTitle: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ" },
  TE: { placeholder: "ప్రాజెక్టులు, నిధులు, నష్టాల గురించి అడగండి…", greeting: "నమస్కారం! నేను మీ AI సహాయకుడు", subtitle: "MPLADS ప్రాజెక్టులు, నిధులు, నష్టాలు, జాప్యాలు లేదా సమ్మతి గురించి ఏదైనా అడగండి.", suggestedLabel: "సూచించిన ప్రశ్నలు", disclaimer: "AI స్పందనలు సూచికమైనవి. అధికారిక పోర్టల్‌లలో క్రిటికల్ డేటాను ధృవీకరించండి.", listening: "వింటున్నాను… మీ ప్రశ్న చెప్పండి", onlineStatus: "ఆన్‌లైన్ · MPLADS సహాయకుడు", voiceQuery: "అన్ని క్రిటికల్ రిస్క్ ప్రాజెక్టులు చూపించు", clearTitle: "చాట్ క్లియర్ చేయండి" },
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

// ── Role × Language suggested questions ──────────────────────────────────────

const ROLE_SUGGESTED: Record<UserRole, Record<Lang, string[]>> = {
  Citizen: {
    EN: ["Show MPLADS projects near my area","Status of road works in my district?","How much fund was utilized in my constituency?","Which projects are completed near me?","How do I file a grievance for a stalled project?","Show drinking water projects in my block"],
    HI: ["मेरे क्षेत्र के पास MPLADS परियोजनाएं दिखाएं","मेरे जिले में सड़क कार्यों की स्थिति?","मेरे निर्वाचन क्षेत्र में कितना फंड उपयोग हुआ?","मेरे पास कौन सी परियोजनाएं पूर्ण हुई हैं?","रुकी हुई परियोजना के लिए शिकायत कैसे करें?","मेरे ब्लॉक में पेयजल परियोजनाएं दिखाएं"],
    MR: ["माझ्या परिसराजवळील MPLADS प्रकल्प दाखवा","माझ्या जिल्ह्यातील रस्ते कार्यांची स्थिती?","माझ्या मतदारसंघात किती निधी वापरला?","माझ्याजवळ कोणते प्रकल्प पूर्ण झाले?","थांबलेल्या प्रकल्पासाठी तक्रार कशी करावी?","माझ्या ब्लॉकमधील पिण्याचे पाणी प्रकल्प दाखवा"],
    TA: ["என் பகுதி அருகில் MPLADS திட்டங்கள் காட்டு","என் மாவட்டத்தில் சாலை பணிகளின் நிலை?","என் தொகுதியில் எவ்வளவு நிதி பயன்படுத்தப்பட்டது?","என் அருகில் எந்த திட்டங்கள் நிறைவடைந்தன?","நிறுத்தப்பட்ட திட்டத்திற்கு புகார் எப்படி?","என் பகுதியில் குடிநீர் திட்டங்கள் காட்டு"],
    BN: ["আমার এলাকার কাছে MPLADS প্রকল্প দেখান","আমার জেলায় রাস্তার কাজের অবস্থা?","আমার নির্বাচনী এলাকায় কত তহবিল ব্যবহৃত?","আমার কাছে কোন প্রকল্পগুলো সম্পন্ন হয়েছে?","স্থগিত প্রকল্পে অভিযোগ কিভাবে করব?","আমার ব্লকে পানীয় জল প্রকল্প দেখান"],
    KA: ["ನನ್ನ ಪ್ರದೇಶದ ಬಳಿ MPLADS ಯೋಜನೆಗಳು ತೋರಿಸಿ","ನನ್ನ ಜಿಲ್ಲೆಯಲ್ಲಿ ರಸ್ತೆ ಕಾಮಗಾರಿ ಸ್ಥಿತಿ?","ನನ್ನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಷ್ಟು ನಿಧಿ ಬಳಸಲಾಗಿದೆ?","ನನ್ನ ಬಳಿ ಯಾವ ಯೋಜನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ?","ನಿಂತ ಯೋಜನೆಗೆ ದೂರು ಹೇಗೆ ನೀಡುವುದು?","ನನ್ನ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ಕುಡಿಯುವ ನೀರು ಯೋಜನೆಗಳು"],
    TE: ["నా ప్రాంతం దగ్గర MPLADS ప్రాజెక్టులు చూపించు","నా జిల్లాలో రోడ్డు పనుల స్థితి?","నా నియోజకవర్గంలో ఎంత నిధి వినియోగించారు?","నా దగ్గర ఏ ప్రాజెక్టులు పూర్తయ్యాయి?","ఆగిన ప్రాజెక్టుపై ఫిర్యాదు ఎలా చేయాలి?","నా బ్లాక్‌లో తాగునీటి ప్రాజెక్టులు చూపించు"],
  },
  MP: {
    EN: ["Show all projects in my constituency","How much of my MPLADS fund is still unspent?","Which of my works are delayed beyond deadline?","List projects pending Utilization Certificates","Show my constituency's high-risk projects","What is my fund utilization rate this year?"],
    HI: ["मेरे निर्वाचन क्षेत्र की सभी परियोजनाएं दिखाएं","मेरा कितना MPLADS फंड अभी बाकी है?","मेरे कौन से कार्य समयसीमा पार हो गए हैं?","उपयोगिता प्रमाणपत्र लंबित परियोजनाओं की सूची","मेरे क्षेत्र की उच्च जोखिम परियोजनाएं दिखाएं","इस वर्ष मेरी निधि उपयोग दर क्या है?"],
    MR: ["माझ्या मतदारसंघातील सर्व प्रकल्प दाखवा","माझा किती MPLADS निधी अजून बाकी आहे?","माझे कोणते कार्य मुदतीपलीकडे गेले आहे?","UC प्रलंबित प्रकल्पांची यादी","माझ्या क्षेत्रातील उच्च जोखीम प्रकल्प","या वर्षी माझा निधी वापर दर काय आहे?"],
    TA: ["என் தொகுதியின் அனைத்து திட்டங்களும் காட்டு","என் MPLADS நிதியில் எவ்வளவு செலவழிக்கப்படவில்லை?","என் எந்த பணிகள் காலக்கெடுவை தாண்டியுள்ளன?","UC நிலுவையில் உள்ள திட்டங்களின் பட்டியல்","என் தொகுதியின் உயர் ஆபத்து திட்டங்கள்","இந்த ஆண்டு என் நிதி பயன்பாட்டு விகிதம்?"],
    BN: ["আমার নির্বাচনী এলাকার সব প্রকল্প দেখান","আমার MPLADS তহবিলের কত এখনও অব্যয়িত?","আমার কোন কাজগুলো সময়সীমা পার করেছে?","UC বিচারাধীন প্রকল্পের তালিকা","আমার এলাকার উচ্চ ঝুঁকি প্রকল্প","এই বছর আমার তহবিল ব্যবহারের হার কত?"],
    KA: ["ನನ್ನ ಕ್ಷೇತ್ರದ ಎಲ್ಲ ಯೋಜನೆಗಳು ತೋರಿಸಿ","ನನ್ನ MPLADS ನಿಧಿಯಲ್ಲಿ ಎಷ್ಟು ಇನ್ನೂ ಬಾಕಿಯಿದೆ?","ನನ್ನ ಯಾವ ಕೆಲಸಗಳು ಗಡುವು ಮೀರಿವೆ?","UC ಬಾಕಿ ಯೋಜನೆಗಳ ಪಟ್ಟಿ","ನನ್ನ ಕ್ಷೇತ್ರದ ಹೆಚ್ಚಿನ ಅಪಾಯ ಯೋಜನೆಗಳು","ಈ ವರ್ಷ ನನ್ನ ನಿಧಿ ಬಳಕೆ ದರ ಎಷ್ಟು?"],
    TE: ["నా నియోజకవర్గంలోని అన్ని ప్రాజెక్టులు చూపించు","నా MPLADS నిధిలో ఎంత ఇంకా ఖర్చు కాలేదు?","నా ఏ పనులు గడువు మించాయి?","UC పెండింగ్ ప్రాజెక్టుల జాబితా","నా నియోజకవర్గంలో అధిక రిస్క్ ప్రాజెక్టులు","ఈ సంవత్సరం నా నిధి వినియోగ రేటు ఏమిటి?"],
  },
  District: {
    EN: ["Which works are due for field inspection this week?","Show projects with missing geo-tagged photos","List delayed works in my district","Projects with no inspection in 60+ days","Show compliance gaps in my district","Which contractors have flagged irregularities?"],
    HI: ["इस सप्ताह कौन से कार्यों का क्षेत्र निरीक्षण होना है?","गुम जियो-टैग फ़ोटो वाले प्रोजेक्ट दिखाएं","मेरे जिले में विलंबित कार्यों की सूची","60+ दिनों में निरीक्षण नहीं हुए प्रोजेक्ट","मेरे जिले में अनुपालन अंतराल दिखाएं","कौन से ठेकेदारों पर अनियमितताएं पाई गई हैं?"],
    MR: ["या आठवड्यात कोणत्या कामांचे क्षेत्र निरीक्षण आहे?","गहाळ जिओ-टॅग फोटो असलेले प्रकल्प","माझ्या जिल्ह्यातील विलंबित कामांची यादी","60+ दिवसांत तपासणी न झालेले प्रकल्प","माझ्या जिल्ह्यातील अनुपालन अंतर दाखवा","कोणत्या कंत्राटदारांवर अनियमितता आढळली?"],
    TA: ["இந்த வாரம் எந்த பணிகளுக்கு களப் ஆய்வு உள்ளது?","ஜியோ-டேக் புகைப்படங்கள் இல்லாத திட்டங்கள்","என் மாவட்டத்தில் தாமதமான பணிகளின் பட்டியல்","60+ நாட்களில் ஆய்வு இல்லாத திட்டங்கள்","என் மாவட்டத்தில் இணக்க இடைவெளிகள்","எந்த ஒப்பந்ததாரர்களுக்கு முறைகேடுகள் குறிக்கப்பட்டுள்ளன?"],
    BN: ["এই সপ্তাহে কোন কাজগুলোর মাঠ পরিদর্শন আছে?","জিও-ট্যাগ ছবি অনুপস্থিত প্রকল্প দেখান","আমার জেলায় বিলম্বিত কাজের তালিকা","৬০+ দিনে পরিদর্শন হয়নি এমন প্রকল্প","আমার জেলায় সম্মতির ফাঁক দেখান","কোন ঠিকাদারদের অনিয়ম চিহ্নিত হয়েছে?"],
    KA: ["ಈ ವಾರ ಯಾವ ಕೆಲಸಗಳಿಗೆ ಕ್ಷೇತ್ರ ತಪಾಸಣೆ ಇದೆ?","ಜಿಯೋ-ಟ್ಯಾಗ್ ಫೋಟೋ ಇಲ್ಲದ ಯೋಜನೆಗಳು","ನನ್ನ ಜಿಲ್ಲೆಯ ವಿಳಂಬಿತ ಕೆಲಸಗಳ ಪಟ್ಟಿ","60+ ದಿನ ತಪಾಸಣೆ ಆಗದ ಯೋಜನೆಗಳು","ನನ್ನ ಜಿಲ್ಲೆಯ ಅನುಪಾಲನ ಅಂತರ ತೋರಿಸಿ","ಯಾವ ಗುತ್ತಿಗೆದಾರರಿಗೆ ಅನಿಯಮಿತತೆ ಇದೆ?"],
    TE: ["ఈ వారం ఏ పనులకు ఫీల్డ్ తనిఖీ ఉంది?","జియో-టాగ్ ఫోటోలు లేని ప్రాజెక్టులు","నా జిల్లాలో జాప్యమైన పనుల జాబితా","60+ రోజులలో తనిఖీ లేని ప్రాజెక్టులు","నా జిల్లాలో సమ్మతి అంతరాలు చూపించు","ఏ కాంట్రాక్టర్లపై అక్రమాలు గుర్తించారు?"],
  },
  State: {
    EN: ["Which districts have lowest fund utilization?","Show all high-risk projects across the state","How many UCs are pending statewide?","List MPs with highest delayed project count","State-wise compliance status summary","Which districts need urgent intervention?"],
    HI: ["किन जिलों में सबसे कम निधि उपयोग है?","राज्य भर में सभी उच्च जोखिम परियोजनाएं दिखाएं","राज्यभर में कितने UC लंबित हैं?","सबसे अधिक विलंबित परियोजनाओं वाले सांसदों की सूची","राज्यवार अनुपालन स्थिति सारांश","किन जिलों को तत्काल हस्तक्षेप की जरूरत है?"],
    MR: ["कोणत्या जिल्ह्यांमध्ये सर्वात कमी निधी वापर आहे?","राज्यभर सर्व उच्च जोखीम प्रकल्प दाखवा","राज्यभर किती UC प्रलंबित आहेत?","सर्वाधिक विलंबित प्रकल्प असलेल्या खासदारांची यादी","राज्यनिहाय अनुपालन स्थिती सारांश","कोणत्या जिल्ह्यांना तातडीने हस्तक्षेप हवा?"],
    TA: ["எந்த மாவட்டங்களில் நிதி பயன்பாடு குறைவாக உள்ளது?","மாநிலம் முழுவதும் உயர் ஆபத்து திட்டங்கள்","மாநிலம் முழுவதும் எத்தனை UCகள் நிலுவையில்?","அதிக தாமதமான திட்டங்கள் கொண்ட MPகளின் பட்டியல்","மாவட்டவாரியான இணக்க நிலை சுருக்கம்","எந்த மாவட்டங்களுக்கு அவசர தலையீடு தேவை?"],
    BN: ["কোন জেলায় সবচেয়ে কম তহবিল ব্যবহার?","রাজ্যজুড়ে সব উচ্চ ঝুঁকি প্রকল্প দেখান","রাজ্যজুড়ে কতটি UC বিচারাধীন?","সর্বাধিক বিলম্বিত প্রকল্পের MPদের তালিকা","জেলাভিত্তিক সম্মতি অবস্থার সারসংক্ষেপ","কোন জেলায় জরুরি হস্তক্ষেপ প্রয়োজন?"],
    KA: ["ಯಾವ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ನಿಧಿ ಬಳಕೆ ಕಡಿಮೆ ಇದೆ?","ರಾಜ್ಯಾದ್ಯಂತ ಎಲ್ಲ ಹೆಚ್ಚಿನ ಅಪಾಯ ಯೋಜನೆಗಳು","ರಾಜ್ಯಾದ್ಯಂತ ಎಷ್ಟು UCಗಳು ಬಾಕಿಯಿದೆ?","ಅತಿ ಹೆಚ್ಚು ವಿಳಂಬಿತ ಯೋಜನೆ ಹೊಂದಿರುವ MPಗಳ ಪಟ್ಟಿ","ಜಿಲ್ಲಾವಾರು ಅನುಪಾಲನ ಸ್ಥಿತಿ ಸಾರಾಂಶ","ಯಾವ ಜಿಲ್ಲೆಗಳಿಗೆ ತಕ್ಷಣ ಮಧ್ಯಪ್ರವೇಶ ಬೇಕು?"],
    TE: ["ఏ జిల్లాలలో నిధి వినియోగం అత్యల్పంగా ఉంది?","రాష్ట్రమంతటా అన్ని అధిక రిస్క్ ప్రాజెక్టులు","రాష్ట్రమంతటా ఎన్ని UCలు పెండింగ్‌లో ఉన్నాయి?","అత్యధిక జాప్య ప్రాజెక్టులు కలిగిన MPల జాబితా","జిల్లావారీ సమ్మతి స్థితి సారాంశం","ఏ జిల్లాలకు అత్యవసర జోక్యం అవసరం?"],
  },
  Ministry: {
    EN: ["National fund utilization trend this quarter","Which states have critical risk concentration?","Show anomalies detected by AI this month","Top 5 states by delayed project count","National UC pendency report","Which works show contractor cost inflation?"],
    HI: ["इस तिमाही राष्ट्रीय निधि उपयोग प्रवृत्ति","किन राज्यों में गंभीर जोखिम केंद्रित है?","इस माह AI द्वारा पाई गई विसंगतियां दिखाएं","विलंबित परियोजना संख्या में शीर्ष 5 राज्य","राष्ट्रीय UC बकाया रिपोर्ट","किन कार्यों में ठेकेदार लागत मुद्रास्फीति है?"],
    MR: ["या तिमाहीत राष्ट्रीय निधी वापर प्रवृत्ती","कोणत्या राज्यांमध्ये गंभीर जोखीम एकवटले आहे?","या महिन्यात AI ने शोधलेल्या विसंगती","विलंबित प्रकल्प संख्येत शीर्ष 5 राज्ये","राष्ट्रीय UC थकबाकी अहवाल","कोणत्या कामांमध्ये कंत्राटदार खर्च महागाई आहे?"],
    TA: ["இந்த காலாண்டில் தேசிய நிதி பயன்பாட்டு போக்கு","எந்த மாநிலங்களில் முக்கியமான ஆபத்து குவிந்துள்ளது?","இந்த மாதம் AI கண்டறிந்த முறைகேடுகள்","தாமத திட்ட எண்ணிக்கையில் முதல் 5 மாநிலங்கள்","தேசிய UC நிலுவை அறிக்கை","எந்த பணிகளில் ஒப்பந்ததாரர் செலவு பெருக்கம்?"],
    BN: ["এই ত্রৈমাসিকে জাতীয় তহবিল ব্যবহারের প্রবণতা","কোন রাজ্যে সঙ্কটজনক ঝুঁকি কেন্দ্রীভূত?","এই মাসে AI শনাক্তকৃত অসঙ্গতি দেখান","বিলম্বিত প্রকল্পে শীর্ষ ৫ রাজ্য","জাতীয় UC বকেয়া প্রতিবেদন","কোন কাজে ঠিকাদার খরচ স্ফীতি আছে?"],
    KA: ["ಈ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ರಾಷ್ಟ್ರೀಯ ನಿಧಿ ಬಳಕೆ ಪ್ರವೃತ್ತಿ","ಯಾವ ರಾಜ್ಯಗಳಲ್ಲಿ ಗಂಭೀರ ಅಪಾಯ ಕೇಂದ್ರೀಕೃತ?","ಈ ತಿಂಗಳು AI ಪತ್ತೆ ಮಾಡಿದ ವಿಚಲನಗಳು","ವಿಳಂಬಿತ ಯೋಜನೆ ಸಂಖ್ಯೆಯಲ್ಲಿ ಶೀರ್ಷ 5 ರಾಜ್ಯಗಳು","ರಾಷ್ಟ್ರೀಯ UC ಬಾಕಿ ವರದಿ","ಯಾವ ಕೆಲಸಗಳಲ್ಲಿ ಗುತ್ತಿಗೆದಾರ ವೆಚ್ಚ ಏರಿಕೆ?"],
    TE: ["ఈ త్రైమాసికంలో జాతీయ నిధి వినియోగ ధోరణి","ఏ రాష్ట్రాలలో క్రిటికల్ రిస్క్ కేంద్రీకృతమైంది?","ఈ నెల AI గుర్తించిన అక్రమాలు చూపించు","జాప్య ప్రాజెక్టు సంఖ్యలో టాప్ 5 రాష్ట్రాలు","జాతీయ UC పెండెన్సీ నివేదిక","ఏ పనులలో కాంట్రాక్టర్ వ్యయ ద్రవ్యోల్బణం ఉంది?"],
  },
};

const FALLBACK_SUGGESTED: Record<Lang, string[]> = {
  EN: ["Show all critical risk projects","Which states have lowest fund utilization?","List delayed projects in Rajasthan","How many projects have pending UCs?","Show projects with cost overrun","What are today's top alerts?"],
  HI: ["सभी गंभीर जोखिम परियोजनाएं दिखाएं","सबसे कम निधि उपयोग वाले राज्य?","राजस्थान में विलंबित परियोजनाएं","कितने प्रोजेक्ट में UC लंबित है?","अतिरिक्त खर्च वाले प्रोजेक्ट दिखाएं","आज के शीर्ष अलर्ट क्या हैं?"],
  MR: ["सर्व गंभीर जोखीम प्रकल्प दाखवा","सर्वात कमी निधी वापर असलेले राज्य?","राजस्थानमधील विलंबित प्रकल्प","किती प्रकल्पांमध्ये UC प्रलंबित आहे?","अतिरिक्त खर्च असलेले प्रकल्प दाखवा","आजचे शीर्ष अलर्ट कोणते आहेत?"],
  TA: ["அனைத்து முக்கியமான ஆபத்து திட்டங்கள்","குறைந்த நிதி பயன்பாடு கொண்ட மாநிலங்கள்?","ராஜஸ்தானில் தாமதமான திட்டங்கள்","எத்தனை திட்டங்களில் UC நிலுவையில்?","மிகை செலவு திட்டங்கள் காட்டு","இன்றைய முக்கிய எச்சரிக்கைகள் என்ன?"],
  BN: ["সব সঙ্কটজনক ঝুঁকি প্রকল্প দেখান","সবচেয়ে কম তহবিল ব্যবহারের রাজ্য?","রাজস্থানে বিলম্বিত প্রকল্প","কতটি প্রকল্পে UC বিচারাধীন?","অতিরিক্ত ব্যয়ের প্রকল্প দেখান","আজকের শীর্ষ সতর্কতা কী?"],
  KA: ["ಎಲ್ಲ ಗಂಭೀರ ಅಪಾಯ ಯೋಜನೆಗಳು","ಕಡಿಮೆ ನಿಧಿ ಬಳಕೆ ಹೊಂದಿರುವ ರಾಜ್ಯಗಳು?","ರಾಜಸ್ಥಾನದ ವಿಳಂಬಿತ ಯೋಜನೆಗಳು","ಎಷ್ಟು ಯೋಜನೆಗಳಲ್ಲಿ UC ಬಾಕಿಯಿದೆ?","ಅಧಿಕ ವೆಚ್ಚ ಯೋಜನೆಗಳು ತೋರಿಸಿ","ಇಂದಿನ ಶೀರ್ಷ ಎಚ್ಚರಿಕೆಗಳು ಏನು?"],
  TE: ["అన్ని క్రిటికల్ రిస్క్ ప్రాజెక్టులు","అత్యల్ప నిధి వినియోగం ఉన్న రాష్ట్రాలు?","రాజస్థాన్‌లో జాప్యమైన ప్రాజెక్టులు","ఎన్ని ప్రాజెక్టులలో UC పెండింగ్‌లో ఉంది?","అదనపు వ్యయ ప్రాజెక్టులు చూపించు","ఈరోజు టాప్ హెచ్చరికలు ఏమిటి?"],
};

function getSuggested(role: UserRole | undefined, lang: Lang): string[] {
  if (role && ROLE_SUGGESTED[role]) return ROLE_SUGGESTED[role][lang] ?? ROLE_SUGGESTED[role].EN;
  return FALLBACK_SUGGESTED[lang] ?? FALLBACK_SUGGESTED.EN;
}

// ── Response engine ───────────────────────────────────────────────────────────

function generateResponse(query: string, lang: Lang): Omit<Message, "id" | "role" | "timestamp"> {
  const q = query.toLowerCase();
  const R = RESP[lang];
  const B = BTN[lang];
  const SL = STATE_LABELS[lang];

  const hasAny = (...terms: string[]) => terms.some(t => q.includes(t));

  if (hasAny("risk","critical","जोखिम","गंभीर","ஆபத்து","ঝুঁকি","ಅಪಾಯ","రిస్క్","జోఖీమ్","जोखीम")) {
    const crit = PROJECTS.filter(p => p.riskLevel === "Critical" || p.riskLevel === "High").sort((a, b) => b.riskScore - a.riskScore);
    return { text: R.risk(crit.length), cards: crit.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + (p.name.split(",")[0].length > 38 ? "…" : ""), value: `Risk Score: ${p.riskScore}/100`, sub: `${p.district}, ${p.state} · ${p.riskLevel}`, color: p.riskLevel === "Critical" ? "red" : "amber" as const })), actions: [{ label: B.viewRisk, type: "view", payload: "risk" }, { label: B.openRisk, type: "filter", payload: "risk" }] };
  }

  if (hasAny("delay","overdue","late","विलंब","தாமத","বিলম্ব","ವಿಳಂಬ","జాప్య","विलम")) {
    const delayed = PROJECTS.filter(p => p.status === "Delayed");
    const st = STATES_DATA.find(s => q.includes(s.state.toLowerCase()) || q.includes(s.state.toLowerCase().split(" ")[0]));
    const filtered = st ? delayed.filter(p => p.state === st.state) : delayed;
    const funds = filtered.reduce((s, p) => s + p.releasedAmount, 0).toFixed(1);
    return { text: R.delay(filtered.length, st?.state, funds), cards: filtered.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + (p.name.split(",")[0].length > 38 ? "…" : ""), value: `${p.progress}% complete`, sub: `Expected: ${p.expectedCompletion} · ₹${p.sanctionedAmount}L`, color: "red" as const })), actions: [{ label: B.viewDelayed, type: "view", payload: "projects" }, { label: B.applyDelay, type: "filter", payload: "projects?status=Delayed" }] };
  }

  if (hasAny("utilization","fund","lowest","निधि","निधी","நிதி","তহবিল","ನಿಧಿ","నిధి","उपयोग","वापर","ব্যবহার","ಬಳಕೆ","వినియోగ")) {
    const sorted = [...STATES_DATA].sort((a, b) => a.utilization - b.utilization);
    return { text: R.fund(NATIONAL_KPIs.utilizationRate, (NATIONAL_KPIs.utilized / 100).toFixed(0), (NATIONAL_KPIs.released / 100).toFixed(0)), cards: sorted.slice(0, 3).map(s => ({ label: s.state, value: `${s.utilization}% utilized`, sub: `₹${(s.utilizedFunds / 100).toFixed(0)}Cr of ₹${(s.totalFunds / 100).toFixed(0)}Cr · ${s.riskProjects} risk`, color: s.utilization < 70 ? "red" : "amber" as const })), actions: [{ label: B.viewReports, type: "view", payload: "reports" }, { label: B.gisMap, type: "view", payload: "gis" }] };
  }

  if (hasAny("uc","certificate","pending","प्रमाणपत्र","சான்று","শংসাপত্র","ಪ್ರಮಾಣ","ధృవీ","प्रलंबित","बाकी","নিলুவை","بکایا")) {
    const pendingUC = PROJECTS.filter(p => p.status === "Completed" && !p.ucSubmitted);
    return { text: R.uc(pendingUC.length), cards: pendingUC.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + (p.name.split(",")[0].length > 38 ? "…" : ""), value: `Completed: ${p.completionDate || p.expectedCompletion}`, sub: `${p.district}, ${p.state} · ₹${p.sanctionedAmount}L`, color: "amber" as const })), actions: [{ label: B.viewCompliance, type: "view", payload: "compliance" }, { label: B.downloadUC, type: "report", payload: "uc" }] };
  }

  if (hasAny("overrun","excess","inflation","अतिरिक्त","மிகை","অতিরিক্ত","ಅಧಿಕ","అదనపు","महागाई","महंगा")) {
    const overrun = PROJECTS.filter(p => p.expenditure > p.sanctionedAmount).sort((a, b) => (b.expenditure - b.sanctionedAmount) / b.sanctionedAmount - (a.expenditure - a.sanctionedAmount) / a.sanctionedAmount);
    const avg = (overrun.reduce((s, p) => s + (p.expenditure - p.sanctionedAmount) / p.sanctionedAmount, 0) / (overrun.length || 1) * 100).toFixed(1);
    return { text: R.overrun(overrun.length, avg), cards: overrun.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + (p.name.split(",")[0].length > 38 ? "…" : ""), value: `+${((p.expenditure - p.sanctionedAmount) / p.sanctionedAmount * 100).toFixed(1)}% overrun`, sub: `Sanctioned: ₹${p.sanctionedAmount}L · Spent: ₹${p.expenditure}L`, color: "red" as const })), actions: [{ label: B.viewRiskCenter, type: "view", payload: "risk" }, { label: B.filterOverrun, type: "filter", payload: "projects?risk=overrun" }] };
  }

  if (hasAny("alert","warning","today","अलर्ट","सूचना","எச்சரிக்கை","সতর্কতা","ಎಚ್ಚರಿಕೆ","హెచ్చరిక","आज","இன்று","আজ","ಇಂದು","ఈరోజు")) {
    const active = ALERTS.filter(a => a.status === "Active");
    const crit = active.filter(a => a.severity === "Critical");
    return { text: R.alerts(active.length, crit.length, active.filter(a => a.severity === "High").length), cards: active.slice(0, 3).map(a => ({ label: a.title.replace(/^(Critical|High|Medium|Low): /, "").substring(0, 42), value: a.severity, sub: a.actionRequired.substring(0, 60) + (a.actionRequired.length > 60 ? "…" : ""), color: a.severity === "Critical" ? "red" : a.severity === "High" ? "amber" : "blue" as const })), actions: [{ label: B.viewAlerts, type: "view", payload: "alerts" }, { label: B.critAlerts, type: "filter", payload: "alerts?severity=Critical" }] };
  }

  const matchedState = STATES_DATA.find(s => q.includes(s.state.toLowerCase()) || q.includes(s.state.toLowerCase().split(" ")[0]));
  if (matchedState) {
    return { text: R.state(matchedState.state, matchedState.totalProjects, matchedState.completedProjects, matchedState.delayedProjects, matchedState.utilization), cards: [{ label: SL[0], value: `${matchedState.utilization}%`, sub: `₹${(matchedState.utilizedFunds / 100).toFixed(0)}Cr utilized`, color: matchedState.utilization < 70 ? "red" : "green" as const }, { label: SL[1], value: String(matchedState.riskProjects), sub: `${((matchedState.riskProjects / matchedState.totalProjects) * 100).toFixed(1)}% of total`, color: "amber" as const }, { label: SL[2], value: String(matchedState.delayedProjects), sub: "Beyond expected date", color: "red" as const }], actions: [{ label: STATE_VIEW_BTN[lang](matchedState.state), type: "filter", payload: `projects?state=${matchedState.state}` }, { label: B.gisMap, type: "view", payload: "gis" }] };
  }

  if (hasAny("contractor","duplicate","anomal","irregular","ठेकेदार","कंत्राटदार","ஒப்பந்த","ঠিকাদার","ಗುತ್ತಿಗೆ","కాంట్రాక్టర్","महागाई")) {
    return { text: R.contractor(RISK_FLAGS.length), cards: RISK_FLAGS.slice(0, 3).map(r => ({ label: r.projectName.substring(0, 40) + (r.projectName.length > 40 ? "…" : ""), value: `Score: ${r.riskScore}/100 · ${r.severity}`, sub: r.type, color: r.severity === "Critical" ? "red" : r.severity === "High" ? "amber" : "violet" as const })), actions: [{ label: B.openInvestigation, type: "view", payload: "investigation" }, { label: B.riskCenter, type: "view", payload: "risk" }] };
  }

  if (hasAny("high-value","large","crore","biggest","सर्वाधिक","கோடி","সর্বোচ্চ","ಅತ್ಯಧಿಕ","అత్యధిక")) {
    const big = [...PROJECTS].sort((a, b) => b.sanctionedAmount - a.sanctionedAmount);
    return { text: R.bigvalue(), cards: big.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + "…", value: `₹${p.sanctionedAmount}L sanctioned`, sub: `${p.status} · ${p.progress}% complete · ${p.district}`, color: p.status === "Delayed" ? "red" : p.status === "Completed" ? "green" : "blue" as const })), actions: [{ label: B.sortAmount, type: "filter", payload: "projects?sort=amount" }, { label: B.financialReports, type: "view", payload: "reports" }] };
  }

  if (hasAny("complet","done","finish","पूर्ण","நிறைவு","সম্পন্ন","ಪೂರ್ಣ","పూర్తి","complete")) {
    const comp = PROJECTS.filter(p => p.status === "Completed");
    return { text: R.completed(comp.length, NATIONAL_KPIs.completionRate, NATIONAL_KPIs.totalProjects.toLocaleString(), NATIONAL_KPIs.completedProjects.toLocaleString()), cards: comp.slice(0, 3).map(p => ({ label: p.name.split(",")[0].substring(0, 38) + (p.name.length > 38 ? "…" : ""), value: `₹${p.sanctionedAmount}L`, sub: `${p.district}, ${p.state} · UC: ${p.ucSubmitted ? "✓" : "⚠ Pending"}`, color: p.ucSubmitted ? "green" : "amber" as const })), actions: [{ label: B.viewCompleted, type: "filter", payload: "projects?status=Completed" }, { label: B.ucCompliance, type: "view", payload: "compliance" }] };
  }

  return { text: R.help(), cards: [], actions: [{ label: B.viewDashboard, type: "view", payload: "dashboard" }, { label: B.aiRisk, type: "view", payload: "risk" }] };
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
    <span>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
          : part.split("\n").map((line, j) => <span key={`${i}-${j}`}>{j > 0 && <br />}{line}</span>)
      )}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AICopilotProps { onNavigate: (page: string) => void; user?: User | null; }

export default function AICopilot({ onNavigate, user }: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ui = UI[lang];
  const suggested = getSuggested(user?.role, lang);

  useEffect(() => { const t = setInterval(() => {}, 3000); return () => clearInterval(t); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowSuggested(false);
    const capturedLang = lang;
    setTimeout(() => {
      const response = generateResponse(text, capturedLang);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", timestamp: new Date(), ...response }]);
      setLoading(false);
    }, 900 + Math.random() * 600);
  }, [loading, lang]);

  const handleVoice = () => { setListening(true); setTimeout(() => { setListening(false); sendMessage(ui.voiceQuery); }, 2200); };
  const handleAction = (action: ActionButton) => { onNavigate(action.payload?.split("?")[0] ?? "dashboard"); setOpen(false); };
  const clearChat = () => { setMessages([]); setShowSuggested(true); };
  const timeStr = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {open && (
        <div className="fixed z-50 flex flex-col shadow-2xl animate-slide-in" style={{ bottom: 88, right: 24, width: 380, height: 560, borderRadius: 20, background: "#FFFFFF", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #1a3a6b 100%)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-display font-bold text-sm leading-tight">NIDHI-RAKSHAK AI</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-blue-200 text-[10px]">{ui.onlineStatus}</span>
              </div>
            </div>
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(m => !m)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-blue-200 hover:bg-white/10 transition-colors border border-white/15">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                {LANGS.find(l => l.id === lang)?.native}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-10 min-w-[130px]">
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
              <button onClick={clearChat} className="text-blue-300 hover:text-white transition-colors px-1.5 py-1 rounded hover:bg-white/10" title={ui.clearTitle}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-blue-300 hover:text-white transition-colors ml-0.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-slate-50/60">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #0D1B3E, #1a3a6b)" }}>
                  <svg viewBox="0 0 24 24" fill="#F59E0B" className="w-7 h-7"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/></svg>
                </div>
                <p className="text-slate-700 text-sm font-semibold font-display">{ui.greeting}</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-[260px] mx-auto">{ui.subtitle}</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b, #2563EB)" }}>{msg.text}</div>
                ) : (
                  <div className="max-w-full space-y-2">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                      <p className="text-sm text-slate-700 leading-relaxed"><RenderText text={msg.text}/></p>
                    </div>
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="space-y-1.5">
                        {msg.cards.map((card, i) => {
                          const c = CARD_COLORS[card.color];
                          return (
                            <div key={i} className={`${c.bg} ${c.border} border rounded-xl px-3 py-2.5 flex items-start gap-2.5`}>
                              <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0 mt-1.5`}/>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-700 leading-snug">{card.label}</div>
                                <div className={`text-xs font-bold ${c.val} mt-0.5`}>{card.value}</div>
                                {card.sub && <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{card.sub}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.actions.map((action, i) => (
                          <button key={i} onClick={() => handleAction(action)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:shadow-sm active:scale-95 ${action.type === "view" ? "bg-[#0D1B3E] text-white hover:bg-blue-900" : action.type === "filter" ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" : action.type === "alert" ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"}`}>
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

          {/* Suggested */}
          {showSuggested && messages.length === 0 && (
            <div className="px-3 pb-2 flex-shrink-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5 px-1">{ui.suggestedLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {suggested.slice(0, 6).map(q => (
                  <button key={q} onClick={() => sendMessage(q)} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Listening */}
          {listening && (
            <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-0.5">
                {[1,3,5,3,1].map((h, i) => <div key={i} className="w-1 rounded-full bg-red-500" style={{ height: h * 4, animation: `bounce 0.6s ease-in-out ${i * 0.1}s infinite alternate` }}/>)}
              </div>
              <span className="text-xs text-red-600 font-medium">{ui.listening}</span>
              <button onClick={() => setListening(false)} className="ml-auto text-red-400 hover:text-red-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)} placeholder={ui.placeholder} className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none min-w-0"/>
              <button onClick={handleVoice} disabled={loading || listening} className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${listening ? "bg-red-500 text-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`} title="Voice input">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
              </button>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #0D1B3E, #2563EB)" : undefined }}>
                <svg viewBox="0 0 24 24" fill={input.trim() && !loading ? "white" : "#94A3B8"} className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">{ui.disclaimer}</p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)} className="fixed z-50 flex items-center justify-center rounded-full shadow-2xl transition-all duration-200 active:scale-95 hover:scale-105" style={{ bottom: 24, right: 24, width: 56, height: 56, background: open ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #0D1B3E 0%, #1a3a6b 60%, #F59E0B 200%)", boxShadow: open ? "0 8px 32px rgba(239,68,68,0.45)" : "0 8px 32px rgba(13,27,62,0.55)" }} title="NIDHI-RAKSHAK AI Copilot" aria-label="Open AI Copilot">
        {open
          ? <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0A2.5 2.5 0 0 0 14 15.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/></svg>
        }
        {!open && <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#F59E0B" }}/>}
        {!open && ALERTS.filter(a => a.status === "Active").length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
            {ALERTS.filter(a => a.status === "Active").length}
          </span>
        )}
      </button>

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </>
  );
}
