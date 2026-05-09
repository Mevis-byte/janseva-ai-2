export type Lang =
  | "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "gu" | "pa" | "ur" | "or" | "as";

type Strings = {
  appName: string; tagline: string;
  signIn: string; signInSub: string;
  aadhaar: string; phone: string; email: string;
  aadhaarPlaceholder: string; phonePlaceholder: string; emailPlaceholder: string;
  sendOtp: string; otpPlaceholder: string; verify: string; otpHint: string;
  greeting: string; greetingSub: string; placeholder: string;
  submit: string; upload: string; voice: string; listening: string;
  analyzing: string; detectLang: string; classifying: string; routing: string;
  result: string; complaintId: string; detectedLang: string; category: string;
  priority: string; department: string; summary: string;
  newComplaint: string; track: string; languageLabel: string; logout: string;
  suggestions: string; high: string; medium: string; low: string;
};

const en: Strings = {
  appName: "JanSeva AI",
  tagline: "Smart Citizen Grievance System",
  signIn: "Sign in to continue",
  signInSub: "Securely access civic services",
  aadhaar: "Aadhaar", phone: "Phone", email: "Email",
  aadhaarPlaceholder: "Enter 12-digit Aadhaar number",
  phonePlaceholder: "Enter 10-digit mobile number",
  emailPlaceholder: "you@example.com",
  sendOtp: "Send OTP", otpPlaceholder: "Enter 6-digit OTP",
  verify: "Verify & Continue", otpHint: "Demo OTP: 123456",
  greeting: "Hello, Citizen",
  greetingSub: "Describe your civic issue. AI will route it to the right department.",
  placeholder: "Type your complaint here…",
  submit: "Submit Complaint", upload: "Upload Image",
  voice: "Voice", listening: "Listening…",
  analyzing: "AI is analyzing your complaint…",
  detectLang: "Detecting language", classifying: "Classifying category", routing: "Routing to department",
  result: "Complaint Registered", complaintId: "Complaint ID",
  detectedLang: "Detected Language", category: "Category", priority: "Priority",
  department: "Department", summary: "Summary",
  newComplaint: "Submit Another", track: "Track Status",
  languageLabel: "Language", logout: "Logout",
  suggestions: "Try an example", high: "High", medium: "Medium", low: "Low",
};

// For brevity, non-English locales reuse English keys with localized greeting/title strings.
// Voice + AI responses are fully translated by the AI itself.
const hi: Strings = {
  ...en, appName: "जनसेवा AI", tagline: "स्मार्ट नागरिक शिकायत प्रणाली",
  signIn: "जारी रखने के लिए साइन इन करें", greeting: "नमस्ते, नागरिक",
  greetingSub: "अपनी समस्या लिखें। AI सही विभाग तक पहुँचाएगा।",
  placeholder: "अपनी शिकायत यहाँ लिखें…", submit: "शिकायत दर्ज करें",
  upload: "फ़ोटो अपलोड", listening: "सुन रहा हूँ…",
  analyzing: "AI आपकी शिकायत का विश्लेषण कर रहा है…",
  result: "शिकायत दर्ज हो गई", newComplaint: "नई शिकायत", track: "स्थिति देखें",
};
const kn: Strings = {
  ...en, appName: "ಜನಸೇವಾ AI", tagline: "ಸ್ಮಾರ್ಟ್ ನಾಗರಿಕ ದೂರು ವ್ಯವಸ್ಥೆ",
  greeting: "ನಮಸ್ಕಾರ, ನಾಗರಿಕರೇ",
  greetingSub: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಬರೆಯಿರಿ. AI ಸರಿಯಾದ ಇಲಾಖೆಗೆ ತಲುಪಿಸುತ್ತದೆ.",
  placeholder: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ…",
  submit: "ದೂರು ಸಲ್ಲಿಸಿ", listening: "ಆಲಿಸುತ್ತಿದೆ…",
  analyzing: "AI ನಿಮ್ಮ ದೂರನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ…",
  result: "ದೂರು ನೋಂದಣಿಯಾಗಿದೆ",
};
const ta: Strings = { ...en, appName: "ஜன்சேவா AI", greeting: "வணக்கம், குடிமகனே", placeholder: "உங்கள் புகாரை இங்கே எழுதுங்கள்…", submit: "புகார் சமர்ப்பி", analyzing: "AI பகுப்பாய்வு செய்கிறது…" };
const te: Strings = { ...en, appName: "జన్‌సేవ AI", greeting: "నమస్కారం, పౌరుడా", placeholder: "మీ ఫిర్యాదును ఇక్కడ రాయండి…", submit: "ఫిర్యాదు సమర్పించండి", analyzing: "AI విశ్లేషిస్తోంది…" };
const ml: Strings = { ...en, appName: "ജൻസേവ AI", greeting: "നമസ്കാരം, പൗരാ", placeholder: "നിങ്ങളുടെ പരാതി ഇവിടെ എഴുതുക…", submit: "പരാതി സമർപ്പിക്കുക", analyzing: "AI വിശകലനം ചെയ്യുന്നു…" };
const mr: Strings = { ...en, appName: "जनसेवा AI", greeting: "नमस्कार, नागरिक", placeholder: "आपली तक्रार येथे लिहा…", submit: "तक्रार दाखल करा", analyzing: "AI विश्लेषण करत आहे…" };
const bn: Strings = { ...en, appName: "জনসেবা AI", greeting: "নমস্কার, নাগরিক", placeholder: "আপনার অভিযোগ এখানে লিখুন…", submit: "অভিযোগ জমা দিন", analyzing: "AI বিশ্লেষণ করছে…" };
const gu: Strings = { ...en, appName: "જનસેવા AI", greeting: "નમસ્તે, નાગરિક", placeholder: "તમારી ફરિયાદ અહીં લખો…", submit: "ફરિયાદ સબમિટ કરો", analyzing: "AI વિશ્લેષણ કરી રહ્યું છે…" };
const pa: Strings = { ...en, appName: "ਜਨਸੇਵਾ AI", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਨਾਗਰਿਕ", placeholder: "ਆਪਣੀ ਸ਼ਿਕਾਇਤ ਇੱਥੇ ਲਿਖੋ…", submit: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ", analyzing: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ…" };
const ur: Strings = { ...en, appName: "جن سیوا AI", greeting: "السلام علیکم، شہری", placeholder: "اپنی شکایت یہاں لکھیں…", submit: "شکایت جمع کریں", analyzing: "AI تجزیہ کر رہا ہے…" };
const or: Strings = { ...en, appName: "ଜନସେବା AI", greeting: "ନମସ୍କାର, ନାଗରିକ", placeholder: "ଆପଣଙ୍କ ଅଭିଯୋଗ ଏଠାରେ ଲେଖନ୍ତୁ…", submit: "ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ", analyzing: "AI ବିଶ୍ଳେଷଣ କରୁଛି…" };
const as: Strings = { ...en, appName: "জনসেৱা AI", greeting: "নমস্কাৰ, নাগৰিক", placeholder: "আপোনাৰ অভিযোগ ইয়াত লিখক…", submit: "অভিযোগ দাখিল কৰক", analyzing: "AI বিশ্লেষণ কৰি আছে…" };

export const translations: Record<Lang, Strings> = {
  en, hi, kn, ta, te, ml, mr, bn, gu, pa, ur, or, as,
};

export const langLabel: Record<Lang, string> = {
  en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ", ta: "தமிழ்", te: "తెలుగు",
  ml: "മലയാളം", mr: "मराठी", bn: "বাংলা", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ",
  ur: "اردو", or: "ଓଡ଼ିଆ", as: "অসমীয়া",
};

// BCP-47 codes for SpeechRecognition / SpeechSynthesis
export const langBcp47: Record<Lang, string> = {
  en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN",
  ml: "ml-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN",
  ur: "ur-IN", or: "or-IN", as: "as-IN",
};

export const examples: Record<string, string[]> = {
  en: [
    "There is a large pothole on our road, dangerous in rain.",
    "Garbage piled up near the school for 3 days.",
    "Streetlight not working in our lane for a week.",
  ],
};
