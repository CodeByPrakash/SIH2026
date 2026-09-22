"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  IndianRupee,
  Layers,
  Activity,
  AlertTriangle,
  Clock,
  Network,
  CopyX,
  Compass,
  Lightbulb,
  Target,
  FileCheck2,
  GitMerge,
  Users,
  Bot,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  XCircle,
  Search,
} from "lucide-react";

interface InfographicsHighlightsProps {
  language: "en" | "hi";
}

export function InfographicsHighlights({ language }: InfographicsHighlightsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stats = [
    {
      value: "543",
      label: language === "hi" ? "संसदीय निर्वाचन क्षेत्र" : "Parliamentary Constituencies",
      sub: language === "hi" ? "अखिल भारतीय स्तर पर संतृप्ति" : "All-India Grassroots Coverage",
      icon: Layers,
    },
    {
      value: "₹5.00 Cr",
      label: language === "hi" ? "वार्षिक आवंटन प्रति सांसद" : "Annual Allocation Per MP",
      sub: language === "hi" ? "सीधे स्थानीय आवश्यकताओं हेतु" : "Dedicated Local Asset Creation",
      icon: IndianRupee,
    },
    {
      value: "1.42 Lakh+",
      label: language === "hi" ? "जियो-टैग्ड पूर्ण कार्य" : "Geo-Tagged Completed Assets",
      sub: language === "hi" ? "100% सार्वजनिक सत्यापन" : "100% Publicly Auditable",
      icon: CheckCircle2,
    },
    {
      value: "99.8%",
      label: language === "hi" ? "डिजिटल स्वीकृति अनुपालन" : "Digital Sanction Compliance",
      sub: language === "hi" ? "निधि-रक्षक एआई निगरानी" : "Under NIDHI-RAKSHAK AI Engine",
      icon: ShieldCheck,
    },
  ];

  const comparisonData = [
    {
      id: "monitoring",
      aspect: language === "hi" ? "परियोजना निगरानी" : "Monitoring",
      category: "core",
      icon: Activity,
      existing: language === "hi"
        ? "📋 केवल स्थिति दर्ज करता है (Tracks project status reactively)"
        : "Tracks project status reactively after manual data entry",
      existingSub: language === "hi"
        ? "घटना घटित होने के बाद मैन्युअल डेटा एंट्री पर निर्भर।"
        : "Relies on retrospective manual updates; zero forward visibility.",
      nidhi: language === "hi"
        ? "📊 उभरते जोखिमों का पूर्वानुमान लगाता है (Predicts emerging project risks)"
        : "Predicts emerging project risks proactively using ML & pace analytics",
      nidhiSub: language === "hi"
        ? "कार्य निष्पादन दर एवं ऐतिहासिक बाधाओं के आधार पर अग्रिम चेतावनी।"
        : "Forward-looking models flag potential bottlenecks 45 days in advance.",
      link: "/dashboard/projects",
      linkText: language === "hi" ? "प्रोजेक्ट डायरेक्टरी देखें" : "Explore Projects",
      badge: "AI Predictive",
    },
    {
      id: "risk",
      aspect: language === "hi" ? "जोखिम पहचान" : "Risk Detection",
      category: "core",
      icon: AlertTriangle,
      existing: language === "hi"
        ? "📑 आवधिक नियम जांच एवं नमूना परीक्षण (Monitoring + validation)"
        : "Periodic manual rule checks & limited sample-based validation",
      existingSub: language === "hi"
        ? "मानव क्षमता तक सीमित, सूक्ष्म अनियमितताएं छूट जाती हैं।"
        : "High human workload; subtle financial anomalies go unnoticed.",
      nidhi: language === "hi"
        ? "👁️🤖 एआई विसंगति पहचान + 0-100 जोखिम स्कोरिंग (AI anomaly + risk scoring)"
        : "AI anomaly detection + continuous multi-factor risk scoring (0-100)",
      nidhiSub: language === "hi"
        ? "वित्तीय, भौगोलिक, ठेकेदार एवं समयबद्धता का 5-आयामी स्वचालित स्कोर।"
        : "Composite scoring across 5 dimensions: Financial, Vendor, Geo & Velocity.",
      link: "/dashboard/risk",
      linkText: language === "hi" ? "जोखिम मैट्रिक्स खोलें" : "View Risk Matrix",
      badge: "Real-Time 0-100",
    },
    {
      id: "delay",
      aspect: language === "hi" ? "विलंब प्रबंधन" : "Delay Management",
      category: "core",
      icon: Clock,
      existing: language === "hi"
        ? "⏳ समयसीमा बीतने के बाद लंबित कार्यों की पहचान (Identifies delayed works)"
        : "Identifies pending/delayed works only after milestone deadlines lapse",
      existingSub: language === "hi"
        ? "अंतिम तिथि पार होने पर केवल चेतावनी दिखाता है।"
        : "Post-facto reporting; project already stalled before intervention.",
      nidhi: language === "hi"
        ? "🚨 संकट बढ़ने से पहले विलंब जोखिम का पूर्वानुमान (Predicts delay before escalation)"
        : "Predicts delay risk before escalation using contractor velocity models",
      nidhiSub: language === "hi"
        ? "मौसम, एजेंसी लोड व भुगतान प्रवाह का विश्लेषण कर समय पूर्व अलर्ट।"
        : "Simulates seasonal, agency workload & disbursement bottlenecks in advance.",
      link: "/dashboard/simulation",
      linkText: language === "hi" ? "विलंब सिमुलेशन इंजन" : "Simulation Engine",
      badge: "45-Day Horizon",
    },
    {
      id: "signals",
      aspect: language === "hi" ? "सिग्नल विश्लेषण" : "Signal Analysis",
      category: "forensics",
      icon: Network,
      existing: language === "hi"
        ? "📋 अलग-थलग प्रोजेक्ट, फंड एवं कार्य सूचना (Isolated project & fund info)"
        : "Isolated silos of project status, fund sanction & work information",
      existingSub: language === "hi"
        ? "e-SAKSHI और PFMS अलग-अलग डेटाबेस में बंधे रहते हैं।"
        : "e-SAKSHI and PFMS operate disconnectedly without unified correlation.",
      nidhi: language === "hi"
        ? "🌐 फंड + प्रोजेक्ट + भू-स्थानिक + फील्ड सिग्नल्स का एकीकरण (Correlates multi-signals)"
        : "Correlates fund flow (PFMS) + sanctions (e-SAKSHI) + geo + field signals",
      nidhiSub: language === "hi"
        ? "संबद्ध फंड ट्रांसफर, ठेकेदार प्रोफाइल और फील्ड जीपीएस का स्वतः मिलान।"
        : "Cross-references bank ledger disbursements with actual physical field progress.",
      link: "/dashboard/crosscheck",
      linkText: language === "hi" ? "सिग्नल क्रॉस-चेक" : "Cross-Signal Audit",
      badge: "360° Fusion",
    },
    {
      id: "duplicates",
      aspect: language === "hi" ? "डुप्लिकेट कार्य पहचान" : "Duplicate Detection",
      category: "forensics",
      icon: CopyX,
      existing: language === "hi"
        ? "📄 मैन्युअल रिकॉर्ड एवं दस्तावेज़ जांच (Work records & documents)"
        : "Manual scrutiny of paper work records, bills, and document registers",
      existingSub: language === "hi"
        ? "समान स्थान पर दोहरी स्वीकृतियों की पहचान करना अत्यंत कठिन।"
        : "Near impossible to spot overlapping works across different funding heads.",
      nidhi: language === "hi"
        ? "⚡ कंप्यूटर विज़न द्वारा डुप्लिकेट कार्य व फोटो पहचान (Detect duplicate works & evidence)"
        : "Deep computer vision & perceptual hashing detect duplicate works in <1s",
      nidhiSub: language === "hi"
        ? "पुराने फोटो या अन्य योजनाओं के कार्यों को दोबारा प्रस्तुत करने पर रोक।"
        : "Identifies reused site photographs and identical GPS coordinate clusters instantly.",
      link: "/dashboard/evidence",
      linkText: language === "hi" ? "विजुअल फोरेंसिक लैब" : "Visual Forensics",
      badge: "Sub-Second CV",
    },
    {
      id: "evidence",
      aspect: language === "hi" ? "साक्ष्य सत्यापन" : "Evidence Verification",
      category: "forensics",
      icon: Compass,
      existing: language === "hi"
        ? "📸 सामान्य फोटो एवं प्रोजेक्ट दस्तावेज (Photos & project documents)"
        : "Standard uploaded site photos without spatial proof or metadata validation",
      existingSub: language === "hi"
        ? "बिना जीपीएस सत्यता के फोटो अपलोड होने की संभावना।"
        : "Susceptible to staged or fabricated photos taken off-site.",
      nidhi: language === "hi"
        ? "🔎 एआई-सहायता प्राप्त साक्ष्य + उपग्रह सत्यापन (AI-assisted evidence verification)"
        : "AI-assisted EXIF GPS radius verification + ISRO Bhuvan satellite validation",
      nidhiSub: language === "hi"
        ? "कैमरा मेटाडेटा, जियोफेंसिंग (50m दायरा) और सैटेलाइट टाइम-सीरीज मिलान।"
        : "Validates device hardware signatures, 50m geofence radius, and temporal changes.",
      link: "/dashboard/gis",
      linkText: language === "hi" ? "जीआईएस व सैटेलाइट मैप" : "GIS & Satellite Map",
      badge: "EXIF + Satellite",
    },
    {
      id: "explainability",
      aspect: language === "hi" ? "एआई पारदर्शिता" : "Explainability",
      category: "governance",
      icon: Lightbulb,
      existing: language === "hi"
        ? "🔄 केवल स्थिति/वर्कफ़्लो जानकारी (Status/workflow information)"
        : "Opaque status flags & raw database tables with no reasoning provided",
      existingSub: language === "hi"
        ? "अधिकारी को स्वयं खोजना पड़ता है कि समस्या कहाँ है।"
        : "Officers must manually hunt through hundreds of rows to diagnose bottlenecks.",
      nidhi: language === "hi"
        ? "💡 स्पष्ट कारण बताता है कि परियोजना उच्च जोखिम में क्यों है (Explains high-risk factors)"
        : "Generates natural language explainability citing MPLADS Guidelines & SoR clauses",
      nidhiSub: language === "hi"
        ? "प्रत्येक जोखिम स्कोर के पीछे का विधिक व वित्तीय तर्क स्पष्ट रूप से प्रदर्शित।"
        : "Directly cites clause numbers (e.g., Para 3.12 cost variation limit) in plain text.",
      link: "/dashboard/ai-audit",
      linkText: language === "hi" ? "निधि कोपायलट से पूछें" : "Query AI Copilot",
      badge: "XAI Transparent",
    },
    {
      id: "prioritization",
      aspect: language === "hi" ? "प्राथमिकता निर्धारण" : "Prioritization",
      category: "governance",
      icon: Target,
      existing: language === "hi"
        ? "📊 सामान्य डैशबोर्ड व मॉनिटरिंग (Dashboards & monitoring)"
        : "Unranked tabular dashboards requiring manual sorting and visual skimming",
      existingSub: language === "hi"
        ? "हजारों कार्यों में से संवेदनशील कार्य ढूंढना समयसाध्य।"
        : "High administrative fatigue; critical delayed schools or hospitals get lost in queues.",
      nidhi: language === "hi"
        ? "🎯 त्वरित प्रशासनिक ध्यान हेतु कार्यों की रैंकिंग (Ranks projects needing attention)"
        : "Dynamically ranks high-risk projects needing urgent administrative intervention",
      nidhiSub: language === "hi"
        ? "जिला मजिस्ट्रेट और नोडल अधिकारियों के लिए प्राथमिकता आधारित एक्शन लिस्ट।"
        : "Actionable priority queue for District Magistrates to inspect highest-risk assets first.",
      link: "/dashboard/alerts",
      linkText: language === "hi" ? "प्राथमिकता अलर्ट देखें" : "Priority Action Queue",
      badge: "Priority Matrix",
    },
    {
      id: "audit",
      aspect: language === "hi" ? "ऑडिट सहायता" : "Audit Support",
      category: "governance",
      icon: FileCheck2,
      existing: language === "hi"
        ? "📁 डिजिटल रिकॉर्ड व पीडीएफ फाइलें (Digital records & documents)"
        : "Scattered digital records, PDFs, and disconnected district audit files",
      existingSub: language === "hi"
        ? "कैग (CAG) ऑडिट के समय महीनों तक फाइलें जुटाने की मशक्कत।"
        : "Months spent compiling manual audit documentation during CAG scrutinies.",
      nidhi: language === "hi"
        ? "🔍 विसंगति + साक्ष्य ट्रेल जांच हेतु (Anomaly + evidence trail for investigation)"
        : "Cryptographic, tamper-evident audit trail + automated 1-click CAG dossiers",
      nidhiSub: language === "hi"
        ? "प्रत्येक बदलाव, स्वीकृति व भुगतान का अपरिवर्तनीय डिजिटल लॉग।"
        : "End-to-end provenance with sha256 checksums ready for official vigilance scrutiny.",
      link: "/dashboard/investigation",
      linkText: language === "hi" ? "जांच केस बिल्डर" : "Investigation Hub",
      badge: "CAG Compliant",
    },
    {
      id: "cross_scheme",
      aspect: language === "hi" ? "योजना-पार दोहराव जांच" : "Cross-Scheme Deduplication",
      category: "forensics",
      icon: GitMerge,
      existing: language === "hi"
        ? "🚫 अन्य केंद्रीय/राज्य योजनाओं से कोई मिलान नहीं (Isolated from other schemes)"
        : "Zero automated cross-matching with PMGSY, AMRUT, Smart Cities, or State Funds",
      existingSub: language === "hi"
        ? "एक ही सड़क या भवन पर दो अलग-अलग योजनाओं से बिलिंग की संभावना।"
        : "Vulnerable to duplicate claiming across distinct departmental budget heads.",
      nidhi: language === "hi"
        ? "🛡️ मल्टी-स्कीम फंड क्रॉस-चेकिंग (Cross-verifies all public infrastructure funds)"
        : "Automated cross-reference engine detecting overlap across Central & State schemes",
      nidhiSub: language === "hi"
        ? "सार्वजनिक धन के दोहरे व्यय पर पूर्ण विराम।"
        : "Guarantees taxpayer funds are never double-billed for identical geo-coordinates.",
      link: "/dashboard/crosscheck",
      linkText: language === "hi" ? "क्रॉस-स्कीम स्कैनर" : "Cross-Scheme Scanner",
      badge: "Multi-Fund Shield",
    },
    {
      id: "citizen_audit",
      aspect: language === "hi" ? "नागरिक सहभागिता" : "Citizen Social Audit",
      category: "citizen",
      icon: Users,
      existing: language === "hi"
        ? "👁️ केवल देखने योग्य पोर्टल (Read-only dashboards with no active feedback)"
        : "Static read-only portals with no structured channel for public photo verification",
      existingSub: language === "hi"
        ? "स्थानीय जनता की जमीनी प्रतिक्रिया प्राप्त करने का अभाव।"
        : "Citizens cannot directly report whether a sanctioned borewell or road exists physically.",
      nidhi: language === "hi"
        ? "📲 मोबाइल जियो-फोटो सत्यापन व सीधी शिकायत (Crowdsourced geotagged audit)"
        : "Mobile participatory social audit, instant geotagged feedback & SLA grievance tracking",
      nidhiSub: language === "hi"
        ? "नागरिक सीधे ऐप से जियो-फोटो अपलोड कर कार्य की पुष्टि कर सकते हैं।"
        : "Empowers 1.4B citizens to act as grassroots auditors with real-time grievance escalation.",
      link: "/dashboard/citizen",
      linkText: language === "hi" ? "नागरिक पोर्टल पर जाएं" : "Open Citizen Portal",
      badge: "Grassroots Trust",
    },
    {
      id: "copilot",
      aspect: language === "hi" ? "एआई संवाद सहायक" : "AI Copilot & Interaction",
      category: "citizen",
      icon: Bot,
      existing: language === "hi"
        ? "🖱️ जटिल टेबल फिल्टर व मेन्यू (Complex filters & static forms)"
        : "Complex nested dropdowns, manual SQL-style filters, and rigid reporting forms",
      existingSub: language === "hi"
        ? "तकनीकी ज्ञान के बिना डेटा खोजना अत्यधिक कठिन।"
        : "Requires training and steep learning curves for non-technical ground personnel.",
      nidhi: language === "hi"
        ? "💬 हिंदी/अंग्रेजी में बोलकर/लिखकर प्रश्न पूछें (Bilingual Natural Language Copilot)"
        : "Conversational bilingual AI Copilot answering complex fund questions in English & Hindi",
      nidhiSub: language === "hi"
        ? "'वाराणसी में लंबित जल परियोजनाओं की सूची दो' जैसे प्रश्नों का तत्काल उत्तर।"
        : "Ask 'Show delayed healthcare projects in Gorakhpur over ₹25 Lakhs' and get instant results.",
      link: "/dashboard/ai-audit",
      linkText: language === "hi" ? "एआई कोपायलट लॉन्च करें" : "Launch AI Copilot",
      badge: "Bilingual NLP",
    },
  ];

  const filteredData = comparisonData.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.aspect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.existing.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nidhi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="feature-comparison" className="w-full bg-slate-50 py-10 sm:py-14 px-4 sm:px-8 border-b border-slate-200 select-none">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b-2 border-blue-900 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-[#133E87] text-white text-[9.5px] sm:text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {language === "hi" ? "एस.आई.एच. 2026 तकनीकी बेंचमार्क" : "SIH 2026 Architectural Benchmark"}
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
                {language === "hi" ? "MoSPI व कैग ऑडिट मानकों पर आधारित" : "Aligned with MoSPI & CAG Guidelines 2023"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
              {language === "hi"
                ? "फीचर तुलना: पारंपरिक व्यवस्था बनाम निधि-रक्षक एआई नवाचार"
                : "Feature Comparison: Existing MPLADS Ecosystem vs. NIDHI-RAKSHAK"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {language === "hi"
                ? "पारंपरिक मैन्युअल मॉनिटरिंग से एआई-संचालित प्रेडिक्टिव गवर्नेंस, स्वचालित फोरेंसिक जांच और रियल-टाइम रिस्क स्कोरिंग का संपूर्ण तुलनात्मक विश्लेषण।"
                : "A technical evaluation showing how NIDHI-RAKSHAK transforms traditional reactive administration into a proactive, transparent, and multi-signal predictive governance framework."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/ai-audit"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0B6623] hover:bg-[#094e1b] text-white text-xs font-bold rounded-md shadow-xs transition w-full sm:w-auto text-center"
            >
              <Bot className="w-4 h-4" />
              <span>{language === "hi" ? "लाइव एआई परीक्षण करें" : "Test Live AI Engine"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards (Retained and Elevated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0B2545] tracking-tight">
                    {st.value}
                  </span>
                  <div className="p-2.5 rounded-lg bg-blue-50 text-[#133E87]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-800 leading-snug">
                  {st.label}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {st.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Comparison Section Wrapper */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Controls Bar: Category Filters & Search */}
          <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                {language === "hi" ? "श्रेणी:" : "Filter:"}
              </span>
              {[
                { id: "all", label: language === "hi" ? "सभी पहलू (All 12)" : "All Aspects (12)" },
                { id: "core", label: language === "hi" ? "निगरानी व जोखिम" : "Core & Risk" },
                { id: "forensics", label: language === "hi" ? "फोरेंसिक व साक्ष्य" : "Forensics & Evidence" },
                { id: "governance", label: language === "hi" ? "शासन व ऑडिट" : "Governance & Audit" },
                { id: "citizen", label: language === "hi" ? "नागरिक व एआई" : "Citizen & Copilot" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    activeCategory === cat.id
                      ? "bg-[#0B2545] text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "hi" ? "पहलू या फीचर खोजें..." : "Search comparison aspects..."}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Desktop & Tablet Comparison Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="w-[20%] p-4 bg-slate-100 text-slate-800 text-xs font-extrabold uppercase tracking-wider border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-700" />
                      <span>{language === "hi" ? "आयाम / पहलू (ASPECT)" : "GOVERNANCE ASPECT"}</span>
                    </div>
                  </th>
                  <th className="w-[38%] p-4 bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                      <span>{language === "hi" ? "पारंपरिक MPLADS व्यवस्था" : "Existing MPLADS Ecosystem"}</span>
                    </div>
                  </th>
                  <th className="w-[42%] p-4 bg-emerald-50 text-emerald-950 text-xs font-black uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                        <span className="text-emerald-900 font-extrabold">
                          {language === "hi" ? "निधि-रक्षक (NIDHI-RAKSHAK) — एआई नवाचार" : "NIDHI-RAKSHAK — AI Advantage"}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                        Next-Gen
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      {/* Aspect Name Column */}
                      <td className="p-4 align-top border-r border-slate-200">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-md bg-blue-50 text-[#133E87] shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-[#0B2545] block">
                              {row.aspect}
                            </span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {row.badge}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Existing System Column */}
                      <td className="p-4 align-top border-r border-slate-200 bg-slate-50/30">
                        <div className="space-y-1">
                          <div className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                            <span className="text-slate-400 font-bold shrink-0 mt-0.5">✕</span>
                            <span>{row.existing}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pl-4 leading-relaxed">
                            {row.existingSub}
                          </p>
                        </div>
                      </td>

                      {/* NIDHI-RAKSHAK Column */}
                      <td className="p-4 align-top bg-emerald-50/20">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-xs font-bold text-emerald-950">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{row.nidhi}</span>
                          </div>
                          <p className="text-[11px] text-emerald-900/80 pl-6 leading-relaxed">
                            {row.nidhiSub}
                          </p>
                          <div className="pl-6 pt-1">
                            <Link
                              href={row.link}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#133E87] hover:text-blue-900 hover:underline"
                            >
                              <span>{row.linkText}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card Layout */}
          <div className="block lg:hidden divide-y divide-slate-200">
            {filteredData.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-blue-50 text-[#133E87]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-[#0B2545]">
                        {row.aspect}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {row.badge}
                    </span>
                  </div>

                  {/* Existing System Card Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      {language === "hi" ? "पारंपरिक व्यवस्था" : "Existing System"}
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {row.existing}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {row.existingSub}
                    </p>
                  </div>

                  {/* NIDHI-RAKSHAK Card Box */}
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide">
                        {language === "hi" ? "निधि-रक्षक एआई लाभ" : "NIDHI-RAKSHAK AI Advantage"}
                      </span>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <p className="text-xs font-bold text-emerald-950">
                      {row.nidhi}
                    </p>
                    <p className="text-[11px] text-emerald-900/80">
                      {row.nidhiSub}
                    </p>
                    <div className="pt-1 text-right">
                      <Link
                        href={row.link}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#133E87] hover:underline"
                      >
                        <span>{row.linkText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer of Table */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>
              {language === "hi"
                ? "कुल 12 मुख्य प्रशासनिक एवं तकनीकी पहलुओं की तुलना प्रदर्शित।"
                : "Displaying 12 core administrative, forensic & technological comparison vectors."}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {language === "hi" ? "पारंपरिक: प्रतिक्रियात्मक (Reactive)" : "Existing: Reactive & Manual"}
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                {language === "hi" ? "निधि-रक्षक: पूर्वानुमानिक (Predictive)" : "NIDHI-RAKSHAK: Predictive AI"}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Quick Highlight Cards Below Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-lg p-4 flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                {language === "hi" ? "राष्ट्रीय विज़न" : "NATIONAL VISION"}
              </span>
              <h4 className="text-sm font-bold mt-2 leading-tight">
                Viksit Bharat @2047: Empowering Every Village
              </h4>
              <p className="text-[11px] text-orange-100 mt-1 leading-relaxed">
                Prioritizing clean drinking water, modern school labs, and primary health wellness infrastructure with zero fund leakage.
              </p>
            </div>
            <div className="pt-3 border-t border-white/20 mt-3 text-right">
              <Link
                href="/dashboard/projects"
                className="text-[11px] font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                <span>{language === "hi" ? "निर्वाचन क्षेत्र मानचित्र" : "Explore Constituency Map"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-4 flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                {language === "hi" ? "डिजिटल सुशासन" : "DIGITAL GOVERNANCE"}
              </span>
              <h4 className="text-sm font-bold mt-2 leading-tight">
                NIDHI-RAKSHAK: AI-Powered Multi-Signal Verification
              </h4>
              <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                Zero work duplication, EXIF GPS coordinate validation, and satellite temporal progress tracking.
              </p>
            </div>
            <div className="pt-3 border-t border-white/20 mt-3 text-right">
              <Link
                href="/dashboard/ai-audit"
                className="text-[11px] font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                <span>{language === "hi" ? "एआई कोपायलट प्रारंभ करें" : "Launch AI Copilot"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-linear-to-r from-emerald-800 to-teal-800 text-white rounded-lg p-4 flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                {language === "hi" ? "नागरिक पारदर्शिता" : "CITIZEN TRANSPARENCY"}
              </span>
              <h4 className="text-sm font-bold mt-2 leading-tight">
                Track Local Works & Submit Geotagged Audits
              </h4>
              <p className="text-[11px] text-emerald-100 mt-1 leading-relaxed">
                Empowering citizens to verify physical assets on-ground, upload geo-tagged photos, and lodge grievances directly.
              </p>
            </div>
            <div className="pt-3 border-t border-white/20 mt-3 text-right">
              <Link
                href="/dashboard/citizen"
                className="text-[11px] font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                <span>{language === "hi" ? "नागरिक पोर्टल" : "Citizen Social Portal"}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
