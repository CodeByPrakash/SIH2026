"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle,
  Link2,
  X,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Search,
  Eye,
  ArrowUpRight,
  Database,
  GitBranch,
  Workflow,
  Radio,
  FileCheck2,
  Lock,
  Scale,
  Activity,
  Award,
  Box,
  BrainCircuit,
} from "lucide-react";

interface DocumentsPersonasLinksProps {
  language: "en" | "hi";
}

interface FeatureItem {
  id: string;
  nameEn: string;
  nameHi: string;
  category: "AI Core" | "USP / Edge" | "Governance" | "Research & Feasibility";
  tagEn: string;
  tagHi: string;
  briefEn: string;
  briefHi: string;
  mechanismEn: string;
  mechanismHi: string;
  impactEn: string;
  impactHi: string;
  architectureEn: string[];
  architectureHi: string[];
  challengeEn: string;
  challengeHi: string;
  strategyEn: string;
  strategyHi: string;
  stakeholdersEn: string;
  stakeholdersHi: string;
  demoUrl: string;
  demoLabelEn: string;
  demoLabelHi: string;
}

const ALL_FEATURES_USPS: FeatureItem[] = [
  {
    id: "feat-1",
    nameEn: "Multi-Source Intelligence & Single Timeline",
    nameHi: "बहु-स्रोत अभिसूचना एवं एकीकृत परियोजना टाइमलाइन",
    category: "AI Core",
    tagEn: "Data Aggregation",
    tagHi: "डेटा एकीकरण",
    briefEn: "Combines project sanction records (e-SAKSHI), fund-release data (PFMS), and on-ground evidence into a unified real-time lifecycle timeline.",
    briefHi: "ई-साक्षी, पीएफएमएस फंड फ्लो और कार्यस्थल के फोटो साक्ष्य को एक ही एकीकृत डिजिटल टाइमलाइन पर संयोजित करता है।",
    mechanismEn: "Automated ETL Pipelines, PFMS API Webhooks & eSAKSHI Scrapers",
    mechanismHi: "स्वचालित ईटीएल पाइपलाइन, पीएफएमएस वेबहुक एवं ई-साक्षी एकीकरण",
    impactEn: "Eliminates departmental data silos; enables end-to-end tracking across 543 constituencies.",
    impactHi: "विभागीय डेटा पृथक्करण को समाप्त कर 543 संसदीय क्षेत्रों में पूर्ण पारदर्शिता प्रदान करता है।",
    architectureEn: [
      "1. Ingest sanction data from e-SAKSHI portal with MP allocation records.",
      "2. Stream installment disbursement milestones from PFMS bank gateways.",
      "3. Correlate with contractor invoices, measurement books, and GPS site photos.",
      "4. Generate unified immutable project record for instant cross-verification."
    ],
    architectureHi: [
      "1. सांसद आवंटन रिकॉर्ड के साथ ई-साक्षी पोर्टल से स्वीकृति डेटा प्राप्त करना।",
      "2. पीएफएमएस बैंक गेटवे से किस्त विमुक्ति मील के पत्थरों को ट्रैक करना।",
      "3. ठेकेदार बिलों, माप पुस्तिकाओं और जीपीएस तस्वीरों के साथ मिलान करना।",
      "4. तत्काल सत्यापन हेतु एकीकृत परियोजना रिकॉर्ड तैयार करना।"
    ],
    challengeEn: "Data Quality — Missing, inconsistent, or differently formatted legacy records.",
    challengeHi: "डेटा गुणवत्ता — पुराने अभिलेखों में अपूर्ण, असंगत या भिन्न प्रारूप।",
    strategyEn: "Data Normalization — Standardize schemas, names, locations, and financial fields before analysis.",
    strategyHi: "डेटा सामान्यीकरण — विश्लेषण से पूर्व सभी वित्तीय व भौगोलिक प्रविष्टियों का मानकीकरण।",
    stakeholdersEn: "MPs view sanction timelines; District Collectors track financial progress; Citizens see live status.",
    stakeholdersHi: "सांसद स्वीकृति टाइमलाइन देखते हैं; जिला मजिस्ट्रेट वित्तीय प्रगति जांचते हैं; नागरिक लाइव स्थिति देखते हैं।",
    demoUrl: "/dashboard/projects",
    demoLabelEn: "Explore Project Timelines",
    demoLabelHi: "परियोजना टाइमलाइन देखें",
  },
  {
    id: "feat-2",
    nameEn: "AI Risk Detection & SoR Deviation Analysis",
    nameHi: "एआई जोखिम पहचान एवं एसओआर दर विचलन विश्लेषण",
    category: "AI Core",
    tagEn: "Fraud Prevention",
    tagHi: "धोखाधड़ी रोकथाम",
    briefEn: "Detects unusual project costs, duplicate sanctions, Schedule of Rates (SoR) deviations, and unapproved delays before installment releases.",
    briefHi: "असामान्य निर्माण लागत, दोहरी स्वीकृतियां, सरकारी दर सूची (SoR) विचलन और अनुचित देरी की स्वतः पहचान करता है।",
    mechanismEn: "Unsupervised Isolation Forests + NLP Rate Parsers + Heuristic Rule Engine",
    mechanismHi: "अनसुपरवाइज्ड आइसोलेशन फॉरेस्ट + एनएलपी दर विश्लेषक + हाइब्रिड नियम",
    impactEn: "Saves estimated 12-18% in public fund leakage and inflated contractor estimates.",
    impactHi: "सार्वजनिक निधि में 12-18% की संभावित बर्बादी और अत्यधिक प्राक्कलन को रोकता है।",
    architectureEn: [
      "1. Parse contractor Detailed Project Reports (DPR) and bill of quantities.",
      "2. Cross-check material rates against District Schedule of Rates (DSR / SoR).",
      "3. Run anomaly scoring algorithms against historical constituency benchmarks.",
      "4. Flag statistical outliers with granular cost deviation breakdowns."
    ],
    architectureHi: [
      "1. ठेकेदार डीपीआर और मात्रा विवरण (BoQ) का विश्लेषण करना।",
      "2. जिला दर अनुसूची (DSR/SoR) के अनुसार सामग्री दरों का मिलान करना।",
      "3. ऐतिहासिक निर्वाचन क्षेत्र मानकों के विरुद्ध विसंगति स्कोर की गणना।",
      "4. विचलन विवरण के साथ उच्च जोखिम वाली परियोजनाओं को चिह्नित करना।"
    ],
    challengeEn: "Limited Fraud Labels — Few verified fraud cases available for supervised training.",
    challengeHi: "सीमित धोखाधड़ी डेटा — पर्यवेक्षित प्रशिक्षण हेतु प्रमाणित धोखाधड़ी मामलों की कमी।",
    strategyEn: "Hybrid AI — Combine unsupervised statistical clustering + deterministic policy rules + NLP.",
    strategyHi: "हाइब्रिड एआई — अनसुपरवाइज्ड क्लस्टरिंग + नीति नियम + एनएलपी का संयोजन।",
    stakeholdersEn: "District Technical Engineers inspect deviations; MoSPI audit officers monitor national flags.",
    stakeholdersHi: "जिला तकनीकी अभियंता विचलन की जांच करते हैं; मंत्रालय के ऑडिट अधिकारी समीक्षा करते हैं।",
    demoUrl: "/dashboard/ai-audit",
    demoLabelEn: "Run AI Risk Audit",
    demoLabelHi: "एआई जोखिम ऑडिट चलाएं",
  },
  {
    id: "feat-3",
    nameEn: "Field Evidence Verification & Duplicate Image Detection",
    nameHi: "कार्यस्थल साक्ष्य सत्यापन एवं डुप्लिकेट फ़ोटो पहचान",
    category: "USP / Edge",
    tagEn: "Deep Vision",
    tagHi: "कंप्यूटर विज़न",
    briefEn: "Cross-matches site photos against historical archives using computer vision vector embeddings to catch reused images, fake claims, and location fraud.",
    briefHi: "कंप्यूटर विज़न का उपयोग कर पुरानी तस्वीरों से मिलान करता है ताकि दोबारा उपयोग की गई तस्वीरों और फर्जी बिलों को तुरंत पकड़ा जा सके।",
    mechanismEn: "ResNet-50 / CLIP Deep Feature Extraction + Cosine Vector Matching + EXIF Forensics",
    mechanismHi: "डीप फीचर एक्सट्रैक्शन + कोसाइन वेक्टर सर्च + ईएक्सआईएफ फॉरेंसिक्स",
    impactEn: "Guarantees that every disbursement corresponds to genuine, physical construction.",
    impactHi: "यह सुनिश्चित करता है कि प्रत्येक भुगतान केवल वास्तविक, भौतिक निर्माण के पश्चात ही हो।",
    architectureEn: [
      "1. Extract high-dimensional feature embeddings from uploaded site inspection photos.",
      "2. Query against vector database of all past 543 constituency project photos.",
      "3. Validate GPS EXIF metadata within 50-meter project boundary radius.",
      "4. Flag reused, edited, or off-site images with exact similarity percentage."
    ],
    architectureHi: [
      "1. अपलोड की गई कार्यस्थल तस्वीरों से उच्च-आयामी फीचर वेक्टर निकालना।",
      "2. राष्ट्रीय रिपॉजिटरी में पूर्व की सभी तस्वीरों से समानता का मिलान करना।",
      "3. 50 मीटर कार्यस्थल त्रिज्या के भीतर जीपीएस निर्देशांक का सत्यापन।",
      "4. समानता प्रतिशत के साथ दोबारा इस्तेमाल की गई तस्वीरों को चिह्नित करना।"
    ],
    challengeEn: "False Positives — Similar structural designs may look identical across nearby sites.",
    challengeHi: "फॉल्स पॉजिटिव्स — समान संरचनात्मक डिजाइन एक जैसी लग सकती हैं।",
    strategyEn: "Multi-Modal Evidence Triangulation — Require matching GPS radius + temporal EXIF timestamps + satellite overlay.",
    strategyHi: "बहु-आयामी साक्ष्य सत्यापन — जीपीएस निर्देशांक + टाइमस्टैम्प + उपग्रह मैपिंग का एक साथ मिलान।",
    stakeholdersEn: "Citizens verify community assets; District Collectors ensure proof before issuing completion certificates.",
    stakeholdersHi: "नागरिक सामुदायिक परिसंपत्तियों का सत्यापन करते हैं; जिला कलेक्टर पूर्णता प्रमाण पत्र जारी करते हैं।",
    demoUrl: "/dashboard/ai-audit",
    demoLabelEn: "Inspect Photo Forensics",
    demoLabelHi: "फ़ोटो फॉरेंसिक्स जांचें",
  },
  {
    id: "feat-4",
    nameEn: "ISRO Bhuvan Satellite Timeline Tracking",
    nameHi: "इसरो भुवन उपग्रह टाइमलाइन ट्रैकिंग एवं जीआईएस सत्यापन",
    category: "USP / Edge",
    tagEn: "Satellite GIS",
    tagHi: "उपग्रह जीआईएस",
    briefEn: "Leverages ISRO Bhuvan satellite optical overlays to monitor vegetation clearing, foundation laying, and physical roof completion remotely over time.",
    briefHi: "इसरो भुवन उपग्रह इमेजरी का उपयोग कर दूरस्थ रूप से निर्माण स्थल की नींव, ढांचा और छत की प्रगति की पुष्टि करता है।",
    mechanismEn: "ISRO Bhuvan Geo-Portal WMS/WFS APIs + Multi-Temporal Optical Change Detection",
    mechanismHi: "इसरो भुवन जियो-पोर्टल एपीआई + उपग्रह समय-श्रृंखला परिवर्तन पहचान",
    impactEn: "Enables independent non-tamperable physical verification without relying solely on manual field visits.",
    impactHi: "बिना किसी मानवीय पक्षपात के उपग्रह द्वारा स्वतंत्र व विश्वसनीय भौतिक सत्यापन संभव बनाता है।",
    architectureEn: [
      "1. Map project geo-coordinates to high-resolution satellite imagery tiles.",
      "2. Compare pre-construction baseline imagery with quarterly satellite updates.",
      "3. Run automated NDVI & structural edge detection to confirm ground activity.",
      "4. Generate GIS audit certificates attached to installment release vouchers."
    ],
    architectureHi: [
      "1. परियोजना जीपीएस निर्देशांकों को उच्च-रिज़ॉल्यूशन उपग्रह इमेजरी पर मैप करना।",
      "2. निर्माण-पूर्व बेसलाइन तस्वीरों का त्रैमासिक उपग्रह अपडेट से तुलना करना।",
      "3. निर्माण गतिविधि की पुष्टि हेतु स्ट्रक्चरल एज डिटेक्शन एल्गोरिदम।",
      "4. भुगतान वाउचर के साथ संलग्न करने हेतु जीआईएस ऑडिट प्रमाण पत्र तैयार करना।"
    ],
    challengeEn: "Data Access & Resolution — Cloud cover and satellite revisit schedules.",
    challengeHi: "डेटा पहुंच एवं रिज़ॉल्यूशन — बादलों का प्रभाव और उपग्रह पुनरावृत्ति अंतराल।",
    strategyEn: "Synthetic Aperture Radar (SAR) + High-Frequency Micro-Satellites + Geo-Tagged Mobile Evidence.",
    strategyHi: "सिंथेटिक एपर्चर रडार (SAR) + जियो-टैग्ड मोबाइल साक्ष्य का सम्मिश्रण।",
    stakeholdersEn: "MoSPI Central Monitoring Units & State Nodal Departments.",
    stakeholdersHi: "सांख्यिकी मंत्रालय की केंद्रीय निगरानी इकाइयां और राज्य नोडल विभाग।",
    demoUrl: "/dashboard/projects",
    demoLabelEn: "Open GIS Satellite Map",
    demoLabelHi: "जीआईएस उपग्रह मानचित्र खोलें",
  },
  {
    id: "feat-5",
    nameEn: "Explainable Risk Scoring & Audit Justification",
    nameHi: "व्याख्यात्मक जोखिम स्कोरिंग एवं ऑडिट औचित्य",
    category: "AI Core",
    tagEn: "Explainable AI",
    tagHi: "पारदर्शी एआई",
    briefEn: "Scores each risk alert with clear contributing factors and applicable statutory norms so authorities can review and justify administrative decisions.",
    briefHi: "प्रत्येक जोखिम अलर्ट को स्पष्ट कारणों और लागू सरकारी नियमों के साथ प्रस्तुत करता है ताकि अधिकारी उचित निर्णय ले सकें।",
    mechanismEn: "SHAP / LIME Feature Attribution + Rule Clause Citation Engine",
    mechanismHi: "फीचर एट्रिब्यूशन + नीति नियम संदर्भ उद्धरण इंजन",
    impactEn: "Zero black-box decisions; builds legal accountability and trust among government stakeholders.",
    impactHi: "कोई ब्लैक-बॉक्स निर्णय नहीं; कानूनी जवाबदेही और सरकारी अधिकारियों का विश्वास स्थापित करता है।",
    architectureEn: [
      "1. Calculate composite risk score (0.00 to 1.00) based on 14 risk dimensions.",
      "2. Break down exact percentage contribution of cost, photo similarity, and delay.",
      "3. Cite exact clause from Revised MPLADS Guidelines 2023 governing the issue.",
      "4. Export one-click executive briefing document for judicial / vigilance review."
    ],
    architectureHi: [
      "1. 14 जोखिम आयामों के आधार पर समग्र जोखिम स्कोर (0.00 से 1.00) की गणना।",
      "2. लागत विचलन, फ़ोटो समानता और देरी के सटीक योगदान का विवरण।",
      "3. संशोधित सांसद निधि दिशानिर्देश 2023 के संबंधित नियम का उद्धरण।",
      "4. समीक्षा हेतु एक-क्लिक आधिकारिक रिपोर्ट निर्यात करना।"
    ],
    challengeEn: "Adoption Resistance — Government stakeholders may hesitate to trust AI recommendations.",
    challengeHi: "स्वीकृति में झिझक — अधिकारी एआई सिफारिशों पर भरोसा करने में संकोच कर सकते हैं।",
    strategyEn: "Trust-by-Design — Transparent evidence trails, confidence percentages, and clear audit justification.",
    strategyHi: "ट्रस्ट-बाय-डिजाइन — पारदर्शी साक्ष्य, विश्वसनीयता स्कोर और पूर्ण कानूनी संदर्भ।",
    stakeholdersEn: "District Magistrates, Vigilance Officers, and Parliamentary Standing Committees.",
    stakeholdersHi: "जिला मजिस्ट्रेट, सतर्कता अधिकारी और संसदीय समितियां।",
    demoUrl: "/dashboard/ai-audit",
    demoLabelEn: "View Explainable AI Triage",
    demoLabelHi: "व्याख्यात्मक एआई रिपोर्ट देखें",
  },
  {
    id: "feat-6",
    nameEn: "Human-in-the-Loop Governance & Traceable Audit",
    nameHi: "मानव-सत्यापित अभिशासन एवं ट्रैसेबल ऑडिट ट्रेल",
    category: "Governance",
    tagEn: "Human Oversight",
    tagHi: "मानव निगरानी",
    briefEn: "Authorities review and validate AI alerts, evidence packages, and recommendations before taking action, with all decisions recorded in a tamper-evident audit trail.",
    briefHi: "अधिकारी कार्रवाई से पूर्व एआई अलर्ट और साक्ष्यों की समीक्षा करते हैं; सभी निर्णय अपरिवर्तनीय ऑडिट लॉग में दर्ज होते हैं।",
    mechanismEn: "Role-Based Access Control (RBAC) + SHA-256 Hash Chain Audit Logs",
    mechanismHi: "भूमिका आधारित अभिगम नियंत्रण (RBAC) + SHA-256 हैश ऑडिट ट्रेल",
    impactEn: "Preserves constitutional authority of district officers while augmenting their analytical speed 10x.",
    impactHi: "जिला अधिकारियों के वैधानिक अधिकारों को सुरक्षित रखते हुए उनकी कार्य क्षमता को 10 गुना तेज करता है।",
    architectureEn: [
      "1. AI flags projects exceeding risk thresholds to District Collector dashboard.",
      "2. Official inspects contractor response, engineering field report, and satellite view.",
      "3. Official records administrative decision: Approve, Hold, or Initiate Probe.",
      "4. Cryptographic timestamped audit entry generated and synchronized with MoSPI."
    ],
    architectureHi: [
      "1. एआई उच्च जोखिम वाले मामलों को जिला कलेक्टर डैशबोर्ड पर भेजता है।",
      "2. अधिकारी ठेकेदार के जवाब, इंजीनियरिंग रिपोर्ट और उपग्रह दृश्य की समीक्षा करते हैं।",
      "3. स्वीकृति, रोक या जांच का प्रशासनिक निर्णय दर्ज किया जाता है।",
      "4. समय-मुद्रित डिजिटल ऑडिट प्रविष्टि स्वतः मंत्रालय को प्रेषित की जाती है।"
    ],
    challengeEn: "Workload Burden — Officers overwhelmed by excessive alert notifications.",
    challengeHi: "कार्यभार — अत्यधिक अलर्ट से अधिकारियों पर अतिरिक्त बोझ।",
    strategyEn: "Intelligent Triage & Auto-Approval of Low-Risk Projects (<0.05 Risk Score).",
    strategyHi: "इंटेलिजेंट ट्रायज — कम जोखिम वाली परियोजनाओं (<0.05) का स्वतः त्वरित निस्तारण।",
    stakeholdersEn: "District Collectors, Chief Planning Officers, and MoSPI Nodal Officers.",
    stakeholdersHi: "जिला कलेक्टर, मुख्य योजना अधिकारी और मंत्रालय के नोडल अधिकारी।",
    demoUrl: "/dashboard/district",
    demoLabelEn: "Open District Decision Desk",
    demoLabelHi: "जिला निर्णय डेस्क खोलें",
  },
  {
    id: "feat-7",
    nameEn: "Decision Simulation & Fund Flow Forecasting",
    nameHi: "निर्णय सिमुलेशन एवं निधि प्रवाह पूर्वानुमान",
    category: "USP / Edge",
    tagEn: "Predictive AI",
    tagHi: "पूर्वानुमान एआई",
    briefEn: "Simulates potential outcomes of 'Release Fund', 'Hold Disbursement', or 'Corrective Action' based on contractor historical performance and milestone risks.",
    briefHi: "ठेकेदार के पिछले प्रदर्शन और जोखिम स्कोर के आधार पर 'निधि विमुक्ति', 'भुगतान रोक' या 'सुधारात्मक कार्रवाई' के परिणामों का पूर्वानुमान लगाता है।",
    mechanismEn: "Monte Carlo Risk Simulations + Predictive Contractor Reliability Metrics",
    mechanismHi: "मोंटे कार्लो सिमुलेशन + ठेकेदार विश्वसनीयता मेट्रिक्स",
    impactEn: "Prevents stuck abandoned projects and optimizes annual constituency budget utilization.",
    impactHi: "अधूरे व बंद पड़े कार्यों को रोकता है और वार्षिक संसदीय बजट के 100% सदुपयोग को सक्षम बनाता है।",
    architectureEn: [
      "1. Model contractor historical delivery speed, past dispute rates, and liquidity.",
      "2. Simulate financial impact of issuing 2nd/3rd installment under current delays.",
      "3. Recommend optimal milestone release schedule to prevent contractor default.",
      "4. Provide confidence interval graphs to District Nodal Planning committees."
    ],
    architectureHi: [
      "1. ठेकेदार की ऐतिहासिक निर्माण गति और पिछले विवादों का विश्लेषण करना।",
      "2. वर्तमान विलंब की स्थिति में अगली किस्त जारी करने के वित्तीय प्रभाव का सिमुलेशन।",
      "3. कार्य रुकने से बचाने हेतु इष्टतम मील का पत्थर भुगतान शेड्यूल सुझाना।",
      "4. जिला योजना समितियों को पूर्वानुमान रेखांकन प्रदान करना।"
    ],
    challengeEn: "Economic Uncertainty & Price Inflation of Construction Raw Materials.",
    challengeHi: "कच्चे माल की कीमतों में मुद्रास्फीति और अनिश्चितता।",
    strategyEn: "Real-time Wholesale Price Index (WPI) integration with SoR elasticity limits.",
    strategyHi: "थोक मूल्य सूचकांक (WPI) और एसओआर मूल्य सीमा का वास्तविक समय एकीकरण।",
    stakeholdersEn: "Members of Parliament & District Planning Committees for project scheduling.",
    stakeholdersHi: "संसद सदस्य और जिला योजना समितियां।",
    demoUrl: "/dashboard/mp",
    demoLabelEn: "Simulate Fund Scenarios",
    demoLabelHi: "निधि परिदृश्य सिमुलेशन देखें",
  },
  {
    id: "feat-8",
    nameEn: "Natural Language AI Copilot for Public Query",
    nameHi: "प्राकृतिक भाषा एआई कोपायलट एवं संवादात्मक विश्लेषिकी",
    category: "USP / Edge",
    tagEn: "Conversational AI",
    tagHi: "संवादात्मक एआई",
    briefEn: "Replaces complex dashboard filtering with plain-language queries in English and Hindi (e.g. 'Show all delayed drinking water projects in Varanasi constituency').",
    briefHi: "जटिल डैशबोर्ड फ़िल्टर को सरल हिंदी/अंग्रेजी प्रश्नों में बदलता है (जैसे: 'वाराणसी में लंबित पेयजल कार्य दिखाएं')।",
    mechanismEn: "Retrieval-Augmented Generation (RAG) + Domain-Fine-Tuned MoSPI LLM",
    mechanismHi: "आरएजी आर्किटेक्चर + सांसद निधि दिशानिर्देशों पर प्रशिक्षित एआई मॉडल",
    impactEn: "Empowers citizens and non-technical staff to query complex data effortlessly in seconds.",
    impactHi: "नागरिकों और अधिकारियों को बिना तकनीकी ज्ञान के सेकंडों में सटीक जानकारी प्राप्त करने में सक्षम बनाता है।",
    architectureEn: [
      "1. User enters natural language prompt in voice or text.",
      "2. Vector retriever indexes 543 constituency databases and circular guidelines.",
      "3. LLM compiles structured SQL/GeoJSON queries and verifies numerical accuracy.",
      "4. Returns interactive charts, maps, and direct PDF evidence links."
    ],
    architectureHi: [
      "1. उपयोगकर्ता बोलकर या लिखकर सरल प्रश्न दर्ज करता है।",
      "2. वेक्टर इंजन 543 संसदीय क्षेत्रों के डेटाबेस से संबंधित जानकारी खोजता है।",
      "3. एआई मॉडल संख्यात्मक सटीकता की पुष्टि के साथ परिणाम तैयार करता है।",
      "4. सीधे इंटरेक्टिव चार्ट, मैप और पीडीएफ साक्ष्य प्रस्तुत करता है।"
    ],
    challengeEn: "Hallucinations — LLMs generating inaccurate project cost figures.",
    challengeHi: "हैलुसिनेशन — एआई मॉडल द्वारा गलत वित्तीय आंकड़ों का निर्माण।",
    strategyEn: "Strict RAG Grounding — Enforce SQL execution against validated databases with zero ungrounded generation.",
    strategyHi: "कड़ा आरएजी सत्यापन — सीधे सत्यापित डेटाबेस से एसक्यूएल निष्पादन द्वारा शून्य त्रुटि।",
    stakeholdersEn: "Citizens, RTI Applicants, Journalists, MPs, and District Officers.",
    stakeholdersHi: "नागरिक, आरटीआई आवेदक, पत्रकार, सांसद और प्रशासनिक अधिकारी।",
    demoUrl: "/dashboard/ai-audit",
    demoLabelEn: "Ask AI Copilot",
    demoLabelHi: "एआई कोपायलट से पूछें",
  },
];

const RESEARCH_REFERENCES = [
  {
    id: "ref-1",
    titleEn: "Revised Guidelines on MPLAD Scheme (Feb 2023)",
    titleHi: "संशोधित सांसद स्थानीय क्षेत्र विकास योजना दिशानिर्देश (फरवरी 2023)",
    authority: "Ministry of Statistics and Programme Implementation (MoSPI)",
    categoryEn: "Statutory Policy",
    categoryHi: "वैधानिक नीति",
    docId: "MoSPI/MPLADS/2023/REV-01",
    date: "February 2023",
    summaryEn: "Mandates 100% digital sanctioning via Web-MPLADS, direct bank account transfer through PFMS, and digital geo-tagged photo verification for asset registration.",
    summaryHi: "वेब-एमपीलैड्स के माध्यम से 100% डिजिटल स्वीकृति, पीएफएमएस द्वारा प्रत्यक्ष बैंक अंतरण और जियो-टैग्ड फ़ोटो सत्यापन अनिवार्य करता है।",
    impactEn: "Foundation of NIDHI-RAKSHAK legal compliance and milestone validation rules.",
    impactHi: "निधि-रक्षक के कानूनी अनुपालन और मील के पत्थर सत्यापन नियमों का आधार।",
    downloadUrl: "https://mplads.gov.in",
  },
  {
    id: "ref-2",
    titleEn: "Smart India Hackathon 2026: Code_Warriors Feasibility & Viability Analysis",
    titleHi: "स्मार्ट इंडिया हैकाथॉन 2026: कोड_वॉरियर्स व्यवहार्यता एवं व्यवहार्यता विश्लेषण",
    authority: "Ministry of Education Innovation Cell (MIC) & MoSPI",
    categoryEn: "AI Technical Architecture",
    categoryHi: "एआई तकनीकी वास्तुकला",
    docId: "SIH2026/CODE_WARRIORS/NIDHI_01",
    date: "September 2026",
    summaryEn: "Comprehensive analysis proving data feasibility, hybrid ML anomaly detection, non-invasive integration over e-SAKSHI & PFMS, and scalable low-cost deployment.",
    summaryHi: "डेटा व्यवहार्यता, हाइब्रिड एमएल विसंगति पहचान, ई-साक्षी व पीएफएमएस पर नॉन-इनवेसिव एकीकरण और स्केलेबल कम लागत परिनियोजन का प्रमाण।",
    impactEn: "Core architecture design specification for 543 Parliamentary constituencies.",
    impactHi: "543 संसदीय क्षेत्रों हेतु कोर आर्किटेक्चर डिजाइन विनिर्देश।",
    downloadUrl: "/dashboard/ai-audit",
  },
  {
    id: "ref-3",
    titleEn: "PFMS Central Sector Scheme (CSS) & SNA Model Integration Protocol",
    titleHi: "पीएफएमएस केंद्रीय क्षेत्र योजना (CSS) एवं एसएनए मॉडल एकीकरण प्रोटोकॉल",
    authority: "Public Financial Management System (PFMS) / Ministry of Finance",
    categoryEn: "Financial Protocol",
    categoryHi: "वित्तीय प्रोटोकॉल",
    docId: "DoE/PFMS/SNA/2022-23",
    date: "March 2024",
    summaryEn: "Defines Single Nodal Account (SNA) zero-balance holding rules, just-in-time disbursement milestones, and automated bank webhook feedback for vendor payments.",
    summaryHi: "एकल नोडल खाता (SNA) नियम, आवश्यकता-आधारित किस्त विमुक्ति और विक्रेता भुगतानों के स्वचालित बैंक सत्यापन को परिभाषित करता है।",
    impactEn: "Powers NIDHI-RAKSHAK escrow release checks and duplicate payment prevention.",
    impactHi: "निधि-रक्षक के एस्क्रो रिलीज और दोहरे भुगतान रोकथाम इंजन को संचालित करता है।",
    downloadUrl: "https://pfms.nic.in",
  },
  {
    id: "ref-4",
    titleEn: "ISRO Bhuvan Geoportal Technical Standard for Asset Geo-Tagging",
    titleHi: "परिसंपत्ति जियो-टैगिंग हेतु इसरो भुवन जियोपोर्टल तकनीकी मानक",
    authority: "National Remote Sensing Centre (NRSC) / ISRO",
    categoryEn: "Geospatial Standard",
    categoryHi: "भू-स्थानिक मानक",
    docId: "NRSC/BHUVAN/GEO-TAG/V3",
    date: "June 2024",
    summaryEn: "Establishes accuracy standards for EXIF metadata validation, spatial polygon bounding, and satellite timeline change detection for rural infrastructure assets.",
    summaryHi: "ईएक्सआईएफ मेटाडेटा सत्यापन, स्थानिक पॉलीगॉन बाउंडिंग और ग्रामीण अवसंरचना के उपग्रह परिवर्तन पहचान हेतु सटीकता मानक।",
    impactEn: "Governs satellite verification accuracy and polygon bounding in GIS module.",
    impactHi: "जीआईएस मॉड्यूल में उपग्रह सत्यापन सटीकता और स्थान निर्धारण को नियंत्रित करता है।",
    downloadUrl: "https://bhuvan.nrsc.gov.in",
  },
];

export function DocumentsPersonasLinks({ language }: DocumentsPersonasLinksProps) {
  const [activeTableTab, setActiveTableTab] = useState<"features" | "references">("features");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [activeSheetItem, setActiveSheetItem] = useState<FeatureItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openDrawer = (item: FeatureItem) => {
    setActiveSheetItem(item);
    setIsSheetOpen(true);
  };

  const closeDrawer = () => {
    setIsSheetOpen(false);
  };

  const filteredFeatures = ALL_FEATURES_USPS.filter((f) => {
    const matchesSearch =
      f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.briefEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nameHi.includes(searchQuery);
    const matchesCategory =
      categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredReferences = RESEARCH_REFERENCES.filter((r) => {
    return (
      r.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.docId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <section id="features-research-tables" className="w-full bg-slate-50/70 py-16 px-4 sm:px-8 border-b border-slate-200 select-none relative">
      <div id="documents" className="absolute -top-20 left-0" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-[#133E87] px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E65100]" />
              <span>{language === "hi" ? "व्यापक तकनीकी विनिर्देश" : "Technical Specifications & Repository"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
              {language === "hi"
                ? "निधि-रक्षक विशेषताएं, यूएसपी एवं अनुसंधान संदर्भ"
                : "NIDHI-RAKSHAK Features, USPs & Research References"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              {language === "hi"
                ? "किसी भी विशेषता पर क्लिक करके विस्तृत वास्तुकला, कार्यप्रणाली एवं व्यवहार्यता शीट देखें।"
                : "Click on any feature row to inspect its in-depth architecture, data flow, and feasibility sheet."}
            </p>
          </div>

          {/* Table Tab Selector */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTableTab("features");
                setCategoryFilter("All");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTableTab === "features"
                  ? "bg-[#133E87] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "विशेषताएं एवं यूएसपी (12)" : "Features & USPs (12)"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTableTab("references");
                setCategoryFilter("All");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTableTab === "references"
                  ? "bg-[#133E87] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "अनुसंधान एवं दिशानिर्देश (4)" : "Research & References (4)"}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTableTab === "features"
                  ? language === "hi" ? "विशेषता या कीवर्ड खोजें..." : "Search features, USPs, AI models..."
                  : language === "hi" ? "नीति, मानक या संदर्भ खोजें..." : "Search guidelines, acts, standards..."
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-[#133E87] text-slate-800"
            />
          </div>

          {activeTableTab === "features" && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                {language === "hi" ? "श्रेणी:" : "Filter:"}
              </span>
              {["All", "AI Core", "USP / Edge", "Governance"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-[#0B2545] text-white border-[#0B2545]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat === "All" ? (language === "hi" ? "सभी" : "All") : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TABLE 1: FEATURES & USPS TABLE */}
        {/* ========================================================= */}
        {activeTableTab === "features" && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B2545] text-white font-mono uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <th className="py-3.5 px-4 font-bold">
                      {language === "hi" ? "विशेषता एवं यूएसपी" : "Capability / Feature & USP"}
                    </th>
                    <th className="py-3.5 px-4 font-bold">
                      {language === "hi" ? "संक्षिप्त विवरण" : "Brief Capability Description"}
                    </th>
                    <th className="py-3.5 px-4 font-bold hidden lg:table-cell">
                      {language === "hi" ? "तकनीकी तंत्र" : "Core Tech Mechanism"}
                    </th>
                    <th className="py-3.5 px-4 font-bold text-right">
                      {language === "hi" ? "विस्तृत विवरण" : "Inspection Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredFeatures.map((feat) => (
                    <tr
                      key={feat.id}
                      onClick={() => openDrawer(feat)}
                      className="hover:bg-blue-50/70 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 align-top w-1/4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                              feat.category === "USP / Edge"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : feat.category === "AI Core"
                                ? "bg-purple-50 text-purple-800 border-purple-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {feat.category === "USP / Edge" ? "★ " : ""}
                            {language === "hi" ? feat.tagHi : feat.tagEn}
                          </span>
                          <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 group-hover:text-[#133E87] leading-tight">
                            {language === "hi" ? feat.nameHi : feat.nameEn}
                          </h4>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-slate-700 leading-relaxed max-w-md">
                        <p className="line-clamp-2">
                          {language === "hi" ? feat.briefHi : feat.briefEn}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top hidden lg:table-cell text-slate-600 font-mono text-[11px] max-w-xs">
                        <div className="bg-slate-50 border border-slate-200 px-2 py-1 rounded line-clamp-2">
                          {language === "hi" ? feat.mechanismHi : feat.mechanismEn}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#133E87] group-hover:text-blue-900 group-hover:underline">
                          <span>{language === "hi" ? "शीट खोलें" : "View Sheet"}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-slate-200">
              {filteredFeatures.map((feat) => (
                <div
                  key={feat.id}
                  onClick={() => openDrawer(feat)}
                  className="p-4 space-y-2.5 active:bg-blue-50/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                        feat.category === "USP / Edge"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : feat.category === "AI Core"
                          ? "bg-purple-50 text-purple-800 border-purple-300"
                          : "bg-emerald-50 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {feat.category === "USP / Edge" ? "★ " : ""}
                      {language === "hi" ? feat.tagHi : feat.tagEn}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {feat.id}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {language === "hi" ? feat.nameHi : feat.nameEn}
                  </h4>

                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    {language === "hi" ? feat.briefHi : feat.briefEn}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#133E87] font-bold">
                    <span>{language === "hi" ? "विस्तृत वास्तुकला शीट" : "Inspect Architecture Sheet"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABLE 2: RESEARCH & POLICY REFERENCES TABLE */}
        {/* ========================================================= */}
        {activeTableTab === "references" && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B2545] text-white font-mono uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <th className="py-3.5 px-4 font-bold">
                      {language === "hi" ? "दिशानिर्देश / संदर्भ दस्तावेज़" : "Statutory Policy / Research Reference"}
                    </th>
                    <th className="py-3.5 px-4 font-bold">
                      {language === "hi" ? "प्राधिकारी एवं कोड" : "Issuing Authority & Doc ID"}
                    </th>
                    <th className="py-3.5 px-4 font-bold hidden lg:table-cell">
                      {language === "hi" ? "दायरा एवं प्रभाव" : "Scope & Governance Impact"}
                    </th>
                    <th className="py-3.5 px-4 font-bold text-right">
                      {language === "hi" ? "दस्तावेज़ लिंक" : "Official Link"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReferences.map((ref) => (
                    <tr key={ref.id} className="hover:bg-blue-50/70 transition">
                      <td className="py-3.5 px-4 align-top w-1/3">
                        <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200 mb-1">
                          {language === "hi" ? ref.categoryHi : ref.categoryEn}
                        </span>
                        <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-snug">
                          {language === "hi" ? ref.titleHi : ref.titleEn}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{ref.date}</p>
                      </td>

                      <td className="py-3.5 px-4 align-top text-slate-700">
                        <p className="font-bold text-slate-900">{ref.authority}</p>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {ref.docId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top hidden lg:table-cell text-slate-600 leading-relaxed max-w-sm">
                        <p>{language === "hi" ? ref.summaryHi : ref.summaryEn}</p>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        <a
                          href={ref.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#133E87] hover:underline bg-slate-50 hover:bg-blue-100 px-2.5 py-1.5 rounded border border-slate-200"
                        >
                          <span>{language === "hi" ? "दस्तावेज़ खोलें" : "Open Source"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-slate-200">
              {filteredReferences.map((ref) => (
                <div key={ref.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
                      {language === "hi" ? ref.categoryHi : ref.categoryEn}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ref.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {language === "hi" ? ref.titleHi : ref.titleEn}
                  </h4>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">{ref.authority}</p>
                    <p className="text-[10px] font-mono text-slate-500">{ref.docId}</p>
                    <p className="pt-1">{language === "hi" ? ref.summaryHi : ref.summaryEn}</p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={ref.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#133E87] hover:underline"
                    >
                      <span>{language === "hi" ? "आधिकारिक दस्तावेज़ देखें" : "Open Official Source"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* RIGHT-SIDE SHEET DRAWER MODAL (Slides in when row clicked) */}
      {/* ========================================================= */}
      {isSheetOpen && activeSheetItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-full sm:max-w-xl md:max-w-2xl bg-white h-full shadow-2xl z-50 flex flex-col justify-between border-l border-slate-300 animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between sticky top-0 z-10">
              <div className="space-y-1.5 pr-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeSheetItem.category === "USP / Edge"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : activeSheetItem.category === "AI Core"
                        ? "bg-purple-100 text-purple-900 border-purple-300"
                        : "bg-emerald-100 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    {activeSheetItem.category === "USP / Edge" ? "★ UNIQUE EDGE (USP)" : activeSheetItem.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {activeSheetItem.id}
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-slate-950 leading-tight">
                  {language === "hi" ? activeSheetItem.nameHi : activeSheetItem.nameEn}
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer shrink-0"
                title="Close sheet"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-slate-800 text-xs sm:text-[13px] leading-relaxed">
              
              {/* 1. Executive Capability Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#133E87]" />
                  <span>{language === "hi" ? "कार्यप्रणाली सारांश" : "Executive Capability Overview"}</span>
                </h4>
                <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-lg text-slate-800 leading-relaxed font-medium">
                  {language === "hi" ? activeSheetItem.briefHi : activeSheetItem.briefEn}
                </div>
              </div>

              {/* 2. Technical Architecture & Step-by-Step Data Flow */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-[#133E87]" />
                  <span>{language === "hi" ? "तकनीकी आर्किटेक्चर एवं डेटा प्रवाह" : "Technical Architecture & Step-by-Step Data Flow"}</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  {(language === "hi" ? activeSheetItem.architectureHi : activeSheetItem.architectureEn).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#133E87] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <p className="text-slate-700 text-xs">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Potential Challenge vs Overcoming Strategy (From Feasibility Slide) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === "hi" ? "चुनौती एवं निवारण रणनीति (व्यवहार्यता विश्लेषण)" : "Potential Challenge & Overcoming Strategy"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                      {language === "hi" ? "संभावित चुनौती" : "Potential Challenge"}
                    </span>
                    <p className="text-slate-700 text-xs font-medium">
                      {language === "hi" ? activeSheetItem.challengeHi : activeSheetItem.challengeEn}
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {language === "hi" ? "निवारण रणनीति" : "Strategy to Overcome"}
                    </span>
                    <p className="text-slate-700 text-xs font-medium">
                      {language === "hi" ? activeSheetItem.strategyHi : activeSheetItem.strategyEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Core Tech Stack & Mechanism */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#133E87]" />
                  <span>{language === "hi" ? "अंतर्निहित एआई एवं डेटा स्टैक" : "Underlying AI Engine & Mechanism"}</span>
                </h4>
                <div className="bg-slate-900 text-emerald-400 font-mono text-[11.5px] p-3.5 rounded-lg border border-slate-800">
                  {language === "hi" ? activeSheetItem.mechanismHi : activeSheetItem.mechanismEn}
                </div>
              </div>

              {/* 5. Stakeholder Impact */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#133E87]" />
                  <span>{language === "hi" ? "हितधारक प्रभाव (सांसद, जिला अधिकारी, नागरिक)" : "Stakeholder Impact"}</span>
                </h4>
                <p className="text-slate-700 text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  {language === "hi" ? activeSheetItem.stakeholdersHi : activeSheetItem.stakeholdersEn}
                </p>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
              <button
                type="button"
                onClick={closeDrawer}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-300 transition cursor-pointer"
              >
                {language === "hi" ? "बंद करें" : "Close Sheet"}
              </button>

              <Link
                href={activeSheetItem.demoUrl}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#133E87] rounded flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>{language === "hi" ? activeSheetItem.demoLabelHi : activeSheetItem.demoLabelEn}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
