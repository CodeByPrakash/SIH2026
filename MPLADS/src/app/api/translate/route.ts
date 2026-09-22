import { NextRequest, NextResponse } from "next/server";

// Server-side in-memory translation cache across requests
const translationCache = new Map<string, string>();

// Pre-cached rich Indian governance dictionary for instant 0ms offline translation
const COMMON_DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    "National Overview": "राष्ट्रीय अवलोकन",
    "State Dashboard": "राज्य डैशबोर्ड",
    "State Performance": "राज्य प्रदर्शन",
    "District Performance": "जिला प्रदर्शन",
    "Projects & Work": "परियोजनाएं और कार्य",
    "Projects & Works": "परियोजनाएं और कार्य",
    "Overview & Key Insights": "अवलोकन और मुख्य अंतर्दृष्टि",
    "All Projects & Progress": "सभी परियोजनाएं और प्रगति",
    "3D Digital Twin": "3डी डिजिटल ट्विन",
    "3D Layouts & Viewpoints": "3डी लेआउट और दृश्य",
    "GIS Map View": "जीआईएस मानचित्र दृश्य",
    "Financial Analytics": "वित्तीय विश्लेषण",
    "AI Audit Engine": "एआई ऑडिट इंजन",
    "AI Risk Center": "एआई जोखिम केंद्र",
    "Alerts & Warnings": "अलर्ट और चेतावनियाँ",
    "Predictive Alerts": "पूर्वानुमानित अलर्ट",
    "Duplicate Detection": "डुप्लिकेट कार्य पहचान",
    "Compliance Engine": "अनुपालन इंजन",
    "Compliance Monitoring": "अनुपालन निगरानी",
    "Intervention Simulator": "हस्तक्षेप सिमुलेटर",
    "Reports & Exports": "रिपोर्ट और निर्यात",
    "Photo Geo-CrossCheck AI": "फोटो भू-सत्यापन एआई",
    "AI Intervention Simulator": "एआई हस्तक्षेप सिमुलेटर",
    "Citizen Evidence AI": "नागरिक साक्ष्य एआई",
    "Public Grievances": "सार्वजनिक शिकायतें",
    "Public Overview": "सार्वजनिक अवलोकन",
    "GIS Map": "जीआईएस मानचित्र",
    "Submit Evidence": "साक्ष्य जमा करें",
    "Track Grievance": "शिकायत ट्रैक करें",
    "Public Reports": "सार्वजनिक रिपोर्ट",
    "Project Information": "परियोजना सूचना",
    "Help & Guidelines": "सहायता और दिशानिर्देश",
    "Public Landing Page": "सार्वजनिक मुख्य पृष्ठ",
    "Field Verification": "क्षेत्र सत्यापन",
    "District Overview": "जिला अवलोकन",
    "Total Projects": "कुल परियोजनाएं",
    "Completed Works": "पूर्ण कार्य",
    "Active Execution": "सक्रिय निष्पादन",
    "Total Investment": "कुल निवेश",
    "Disbursed Funds": "संवितरित धनराशि",
    "Active Risk Alerts": "सक्रिय जोखिम अलर्ट",
    "High Risk": "उच्च जोखिम",
    "Critical": "गंभीर",
    "Early Risk": "प्रारंभिक जोखिम",
    "On Track": "समय पर",
    "Completed": "पूर्ण",
    "In Progress": "प्रगति पर",
    "Delayed": "विलंबित",
    "Not Started": "शुरू नहीं हुआ",
    "Search Works": "कार्य खोजें",
    "Search projects, locations, IDs...": "परियोजनाएं, स्थान, आईडी खोजें...",
    "Sync Now": "अभी सिंक करें",
    "Export": "निर्यात करें",
    "Close": "बंद करें",
    "Details": "विवरण",
    "3D View": "3डी दृश्य",
    "AI Audit": "एआई ऑडिट",
    "Simulate": "सिमुलेट करें",
    "Constituency": "निर्वाचन क्षेत्र",
    "District": "जिला",
    "State": "राज्य",
    "National": "राष्ट्रीय",
    "Sector": "क्षेत्र",
    "Status": "स्थिति",
    "Progress": "प्रगति",
    "Budget": "बजट",
    "Expenditure": "व्यय",
    "Sanctioned": "स्वीकृत",
    "Actions": "कार्रवाई",
    "Filter": "फ़िल्टर",
    "Citizen Transparency Portal": "नागरिक पारदर्शिता पोर्टल",
    "Track Public Works In Your Constituency": "अपने निर्वाचन क्षेत्र में सार्वजनिक कार्यों को ट्रैक करें",
    "NIDHI-RAKSHAK": "निधि-रक्षक",
    "Member of Parliament": "सांसद",
    "District Magistrate": "जिला मजिस्ट्रेट",
    "Citizen": "नागरिक",
    "State Nodal Officer": "राज्य नोडल अधिकारी",
    "Auditor": "लेखा परीक्षक",
    "Administrator": "व्यवस्थापक",
    "All Sectors": "सभी क्षेत्र",
    "Education": "शिक्षा",
    "Health": "स्वास्थ्य",
    "Roads & Bridges": "सड़कें और पुल",
    "Drinking Water": "पेयजल",
    "Rural Development": "ग्रामीण विकास",
    "Sanitation": "स्वच्छता",
    "Community Assets": "सामुदायिक संपत्ति",
    "Public Infrastructure": "सार्वजनिक बुनियादी ढांचा",
    "Live Projects Monitoring": "सजीव परियोजना निगरानी",
    "Government of India": "भारत सरकार",
    "Ministry of Statistics and Programme Implementation": "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय",
  },
  bn: {
    "National Overview": "জাতীয় সংক্ষিপ্ত বিবরণ",
    "Overview & Key Insights": "সংক্ষিপ্ত বিবরণ ও প্রধান তথ্য",
    "Projects & Works": "প্রকল্প ও কাজ",
    "All Projects & Progress": "সকল প্রকল্প ও অগ্রগতি",
    "3D Digital Twin": "থ্রিডি ডিজিটাল টুইন",
    "3D Layouts & Viewpoints": "থ্রিডি লেআউট ও ভিউ",
    "GIS Map View": "জিআইএস মানচিত্র দৃশ্য",
    "Financial Analytics": "আর্থিক বিশ্লেষণ",
    "AI Audit Engine": "এআই অডিট ইঞ্জিন",
    "AI Risk Center": "এআই ঝুঁকি কেন্দ্র",
    "Alerts & Warnings": "সতর্কতা এবং সাবধানবাণী",
    "Total Projects": "মোট প্রকল্প",
    "Completed Works": "সম্পন্ন কাজ",
    "Active Execution": "সক্রিয় বাস্তবায়ন",
    "Total Investment": "মোট বিনিয়োগ",
    "High Risk": "উচ্চ ঝুঁকি",
    "Critical": "সংকটপূর্ণ",
    "Early Risk": "প্রাথমিক ঝুঁকি",
    "On Track": "সঠিক পথে",
    "Completed": "সম্পন্ন",
    "In Progress": "চলমান",
    "Delayed": "বিলম্বিত",
    "Not Started": "শুরু হয়নি",
    "Search Works": "কাজ অনুসন্ধান করুন",
    "Sync Now": "এখনই সিঙ্ক করুন",
    "Export": "রপ্তানি",
    "Details": "বিবরণ",
    "3D View": "থ্রিডি ভিউ",
    "Actions": "পদক্ষেপ",
    "Constituency": "নির্বাচনী এলাকা",
    "District": "জেলা",
    "State": "রাজ্য",
    "Sector": "খাত",
    "Status": "অবস্থা",
    "Progress": "অগ্রগতি",
    "Education": "শিক্ষা",
    "Health": "স্বাস্থ্য",
    "Roads & Bridges": "রাস্তা ও সেতু",
    "Drinking Water": "পানীয় জল",
    "Government of India": "ভারত সরকার",
  },
  te: {
    "National Overview": "జాతీయ అవలోకనం",
    "Projects & Works": "ప్రాజెక్టులు & పనులు",
    "All Projects & Progress": "అన్ని ప్రాజెక్టులు & పురోగతి",
    "3D Digital Twin": "3D డిజిటల్ ట్విన్",
    "GIS Map View": "GIS మ్యాప్ వీక్షణ",
    "Financial Analytics": "ఆర్థిక విశ్లేషణ",
    "AI Audit Engine": "AI ఆడిట్ ఇంజిన్",
    "AI Risk Center": "AI రిస్క్ సెంటర్",
    "Total Projects": "మొత్తం ప్రాజెక్ట్‌లు",
    "Completed Works": "పూర్తయిన పనులు",
    "Active Execution": "క్రియాశీల అమలు",
    "Total Investment": "మొత్తం పెట్టుబడి",
    "High Risk": "అధిక ప్రమాదం",
    "Critical": "క్లిష్టమైనది",
    "On Track": "సరైన మార్గంలో",
    "Completed": "పూర్తయింది",
    "In Progress": "పురోగతిలో ఉంది",
    "Delayed": "ఆలస్యమైంది",
    "Not Started": "ప్రారంభం కాలేదు",
    "Sync Now": "ఇప్పుడే సమకాలీకరించు",
    "Export": "ఎగుమతి",
    "Details": "వివరాలు",
    "3D View": "3D వీక్షణ",
    "Constituency": "నియోజకవర్గం",
    "District": "జిల్లా",
    "State": "రాష్ట్రం",
    "Sector": "రంగం",
    "Status": "స్థితి",
    "Progress": "పురోగతి",
    "Education": "విద్య",
    "Health": "ఆరోగ్యం",
    "Roads & Bridges": "రోడ్లు & వంతెనలు",
    "Drinking Water": "తాగునీరు",
    "Government of India": "భారత ప్రభుత్వం",
  },
  ta: {
    "National Overview": "தேசிய கண்ணோட்டம்",
    "Projects & Works": "திட்டங்கள் & பணிகள்",
    "All Projects & Progress": "அனைத்து திட்டங்கள் & முன்னேற்றம்",
    "3D Digital Twin": "3D டிஜிட்டல் இரட்டை",
    "GIS Map View": "ஜிஐஎஸ் வரைபட பார்வை",
    "Financial Analytics": "நிதி பகுப்பாய்வு",
    "AI Audit Engine": "AI தணிக்கை பொறி",
    "Total Projects": "மொத்த திட்டங்கள்",
    "Completed Works": "முடிக்கப்பட்ட பணிகள்",
    "Total Investment": "மொத்த முதலீடு",
    "High Risk": "அதிக ஆபத்து",
    "Critical": "முக்கியமானது",
    "On Track": "சரியான பாதையில்",
    "Completed": "முடிந்தது",
    "In Progress": "செயலில் உள்ளது",
    "Delayed": "தாமதமானது",
    "Not Started": "தொடங்கப்படவில்லை",
    "Sync Now": "இப்போது ஒத்திசைக்கவும்",
    "Export": "ஏற்றுமதி",
    "Details": "விவரங்கள்",
    "3D View": "3D பார்வை",
    "Constituency": "தொகுதி",
    "District": "மாவட்டம்",
    "State": "மாநிலம்",
    "Sector": "துறை",
    "Status": "நிலை",
    "Progress": "முன்னேற்றம்",
    "Education": "கல்வி",
    "Health": "சுகாதாரம்",
    "Roads & Bridges": "சாலைகள் & பாலங்கள்",
    "Drinking Water": "குடிநீர்",
    "Government of India": "இந்திய அரசு",
  },
  mr: {
    "National Overview": "राष्ट्रीय आढावा",
    "Projects & Works": "प्रकल्प आणि कामे",
    "All Projects & Progress": "सर्व प्रकल्प आणि प्रगती",
    "3D Digital Twin": "3D डिजिटल ट्विन",
    "GIS Map View": "जीआयएस नकाशा दृश्य",
    "Financial Analytics": "आर्थिक विश्लेषण",
    "AI Audit Engine": "एआय ऑडिट इंजिन",
    "Total Projects": "एकूण प्रकल्प",
    "Completed Works": "पूर्ण झालेली कामे",
    "High Risk": "उच्च धोका",
    "On Track": "वेळेवर",
    "Completed": "पूर्ण",
    "In Progress": "प्रगतीपथावर",
    "Delayed": "विलंबित",
    "Not Started": "सुरू झाले नाही",
    "Sync Now": "आता सिंक करा",
    "Details": "तपशील",
    "Constituency": "मतदारसंघ",
    "District": "जिल्हा",
    "State": "राज्य",
    "Sector": "क्षेत्र",
    "Status": "स्थिती",
    "Education": "शिक्षण",
    "Health": "आरोग्य",
    "Government of India": "भारत सरकार",
  },
  gu: {
    "National Overview": "રાષ્ટ્રીય વિહંગાવલોકન",
    "Projects & Works": "પ્રોજેક્ટ્સ અને કાર્યો",
    "All Projects & Progress": "બધા પ્રોજેક્ટ્સ અને પ્રગતિ",
    "3D Digital Twin": "3D ડિજિટલ ટ્વિન",
    "GIS Map View": "GIS નકશા દૃશ્ય",
    "Financial Analytics": "નાણાકીય વિશ્લેષણ",
    "Total Projects": "કુલ પ્રોજેક્ટ્સ",
    "Completed Works": "પૂર્ણ થયેલ કામો",
    "High Risk": "ઉચ્ચ જોખમ",
    "Completed": "પૂર્ણ",
    "In Progress": "પ્રગતિમાં",
    "Delayed": "વિલંબિત",
    "Sync Now": "હમણાં સિંક કરો",
    "Details": "વિગતો",
    "Constituency": "મતવિસ્તાર",
    "District": "જિલ્લો",
    "State": "રાજ્ય",
    "Education": "શિક્ષણ",
    "Health": "આરોગ્ય",
    "Government of India": "ભારત સરકાર",
  },
  kn: {
    "National Overview": "ರಾಷ್ಟ್ರೀಯ ಅವಲೋಕನ",
    "Projects & Works": "ಯೋಜನೆಗಳು ಮತ್ತು ಕಾಮಗಾರಿಗಳು",
    "3D Digital Twin": "3D ಡಿಜಿಟಲ್ ಟ್ವಿನ್",
    "GIS Map View": "GIS ನಕ್ಷೆ ನೋಟ",
    "Total Projects": "ಒಟ್ಟು ಯೋಜನೆಗಳು",
    "Completed Works": "ಪೂರ್ಣಗೊಂಡ ಕಾಮಗಾರಿಗಳು",
    "Completed": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "Delayed": "ವಿಳಂಬವಾಗಿದೆ",
    "Constituency": "ಕ್ಷೇತ್ರ",
    "District": "ಜಿಲ್ಲೆ",
    "State": "ರಾಜ್ಯ",
    "Government of India": "ಭಾರತ ಸರ್ಕಾರ",
  },
  ml: {
    "National Overview": "ദേശീയ അവലോകനം",
    "Projects & Works": "പദ്ധതികളും പ്രവൃത്തികളും",
    "3D Digital Twin": "3D ഡിജിറ്റൽ ട്വിൻ",
    "Total Projects": "ആകെ പദ്ധതികൾ",
    "Completed": "പൂർത്തിയായി",
    "In Progress": "പുരോഗമിക്കുന്നു",
    "Delayed": "വൈകി",
    "District": "ജില്ല",
    "State": "സംസ്ഥാനം",
    "Government of India": "ഭാരത സർക്കാർ",
  },
  pa: {
    "National Overview": "ਰਾਸ਼ਟਰੀ ਸੰਖੇਪ",
    "Projects & Works": "ਪ੍ਰੋਜੈਕਟ ਅਤੇ ਕੰਮ",
    "Total Projects": "ਕੁੱਲ ਪ੍ਰੋਜੈਕਟ",
    "Completed": "ਮੁਕੰਮਲ",
    "In Progress": "ਚੱਲ ਰਿਹਾ ਹੈ",
    "Delayed": "ਦੇਰੀ ਨਾਲ",
    "District": "ਜ਼ਿਲ੍ਹਾ",
    "State": "ਰਾਜ",
    "Government of India": "ਭਾਰਤ ਸਰਕਾਰ",
  },
  or: {
    "National Overview": "ଜାତୀୟ ସମୀକ୍ଷା",
    "Projects & Works": "ପ୍ରକଳ୍ପ ଏବଂ କାର୍ଯ୍ୟ",
    "Total Projects": "ମୋଟ ପ୍ରକଳ୍ପ",
    "Completed": "ସମ୍ପୂର୍ଣ୍ଣ",
    "In Progress": "ପ୍ରଗତିରେ",
    "Delayed": "ବିଳମ୍ବିତ",
    "District": "ଜିଲ୍ଲା",
    "State": "ରାଜ୍ୟ",
    "Government of India": "ଭାରତ ସରକାର",
  },
  ur: {
    "National Overview": "قومی جائزہ",
    "Projects & Works": "منصوبے اور کام",
    "Total Projects": "کل منصوبے",
    "Completed": "مکمل",
    "In Progress": "جاری ہے",
    "Delayed": "تاخیر کا شکار",
    "District": "ضلع",
    "State": "ریاست",
    "Government of India": "حکومت ہند",
  },
  as: {
    "National Overview": "ৰাষ্ট্ৰীয় পৰ্যালোচনা",
    "Projects & Works": "প্ৰকল্প আৰু কাম",
    "Total Projects": "মুঠ প্ৰকল্প",
    "Completed": "সম্পূৰ্ণ",
    "In Progress": "চলি আছে",
    "Delayed": "বিলম্বিত",
    "District": "জিলা",
    "State": "ৰাজ্য",
    "Government of India": "ভাৰত চৰকাৰ",
  },
};

// Resilient online translation query using Google Dict Chrome API or MyMemory fallback
async function fetchOnlineTranslation(phrase: string, targetLang: string): Promise<string | null> {
  // Method 1: Google Clients5 Dict Chrome Extension API (Very fast, no CAPTCHA block)
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(
      targetLang
    )}&q=${encodeURIComponent(phrase)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && typeof data[0] === "string" && data[0].trim()) {
        return data[0].trim();
      }
      if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0][0] === "string") {
        return data[0][0].trim();
      }
    }
  } catch {
    // try fallback
  }

  // Method 2: MyMemory Translated API (Reliable secondary fallback)
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      phrase
    )}&langpair=en|${encodeURIComponent(targetLang)}`;
    const mmRes = await fetch(mmUrl, { next: { revalidate: 86400 } });
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      if (mmData?.responseData?.translatedText && mmData.responseData.translatedText !== phrase) {
        return mmData.responseData.translatedText.trim();
      }
    }
  } catch {
    // fallback
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { texts, targetLang } = body as { texts: string[]; targetLang: string };

    if (!texts || !Array.isArray(texts) || !targetLang || targetLang === "en") {
      return NextResponse.json({ translations: {} });
    }

    const translations: Record<string, string> = {};
    const uncachedTexts: string[] = [];
    const langDict = COMMON_DICTIONARY[targetLang] || {};

    // 1. Process with dictionary & server memory cache first (0ms)
    for (const text of texts) {
      const trimmed = text.trim();
      if (
        !trimmed ||
        trimmed.length <= 1 ||
        /^[0-9₹%,.\-/:#\s]+$/.test(trimmed) ||
        trimmed.startsWith("http") ||
        trimmed.startsWith("PROJ-")
      ) {
        continue;
      }

      const cacheKey = `${targetLang}:::${trimmed}`;
      if (translationCache.has(cacheKey)) {
        translations[trimmed] = translationCache.get(cacheKey)!;
      } else if (langDict[trimmed]) {
        translations[trimmed] = langDict[trimmed];
        translationCache.set(cacheKey, langDict[trimmed]);
      } else {
        uncachedTexts.push(trimmed);
      }
    }

    // 2. Translate uncached phrases (limited to top 60 unique phrases per call to prevent lag)
    const uniqueUncached = Array.from(new Set(uncachedTexts)).slice(0, 60);

    if (uniqueUncached.length > 0) {
      // Chunk into smaller batches of 8 to avoid rate limiting
      const chunkSize = 8;
      for (let i = 0; i < uniqueUncached.length; i += chunkSize) {
        const chunk = uniqueUncached.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (phrase) => {
            const translated = await fetchOnlineTranslation(phrase, targetLang);
            if (translated && translated !== phrase) {
              translations[phrase] = translated;
              translationCache.set(`${targetLang}:::${phrase}`, translated);
            }
          })
        );
      }
    }

    return NextResponse.json({
      success: true,
      translations,
      cachedCount: Object.keys(translations).length,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ success: false, translations: {} }, { status: 200 });
  }
}
