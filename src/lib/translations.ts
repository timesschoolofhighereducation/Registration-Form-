export type FormLanguage = "sinhala" | "tamil";

type TranslationPair = Record<FormLanguage, string>;

export const translations = {
  // Section titles
  programmeSelection: {
    sinhala: "පාඨමාලා තේරීම",
    tamil: "பாடநெறி தேர்வு",
  } satisfies TranslationPair,

  programmeSelectionDesc: {
    sinhala: "කරුණාකර ඔබ ලියාපදිංචි වන පාඨමාලාව තෝරාගන්න",
    tamil: "தயவுசெய்து நீங்கள் பதிவு செய்யும் பாடநெறியைத் தேர்ந்தெடுக்கவும்",
  } satisfies TranslationPair,

  personalInfo: {
    sinhala: "පෞද්ගලික තොරතුරු",
    tamil: "தனிப்பட்ட விவரங்கள்",
  } satisfies TranslationPair,

  contactInfo: {
    sinhala: "සම්බන්ධ වියහැකි තොරතුරු",
    tamil: "தொடர்பு விவரங்கள்",
  } satisfies TranslationPair,

  educationBackground: {
    sinhala: "අධ්‍යාපන පසුබිම",
    tamil: "கல்வித் தகவல்கள்",
  } satisfies TranslationPair,

  paymentInfo: {
    sinhala: "ගෙවීම් පිළිබඳ තොරතුරු",
    tamil: "கட்டணம் தொடர்பான விவரங்கள்",
  } satisfies TranslationPair,

  declaration: {
    sinhala: "ප්‍රකාශය",
    tamil: "அறிக்கை",
  } satisfies TranslationPair,

  // Field labels
  fullName: {
    sinhala: "සම්පූර්ණ නම",
    tamil: "முழு பெயர்",
  } satisfies TranslationPair,

  nameWithInitials: {
    sinhala: "මුලකුරු සමග නම",
    tamil: "தொடக்க எழுத்துகளுடன் உள்ள பெயர்",
  } satisfies TranslationPair,

  dateOfBirth: {
    sinhala: "උපන් දිනය",
    tamil: "பிறந்த தேதி",
  } satisfies TranslationPair,

  gender: {
    sinhala: "ස්ත්‍රී - පුරුෂ භාවය",
    tamil: "பாலினம்",
  } satisfies TranslationPair,

  nic: {
    sinhala: "ජා.හැ. අංකය",
    tamil: "தேசிய அடையாள எண்",
  } satisfies TranslationPair,

  address: {
    sinhala: "ලිපිනය",
    tamil: "முகவரி",
  } satisfies TranslationPair,

  mobileNumber: {
    sinhala: "ජංගම දුරකථන අංකය",
    tamil: "அலைபேசி எண்",
  } satisfies TranslationPair,

  email: {
    sinhala: "විද්‍යුත් තැපෑල",
    tamil: "மின்னஞ்சல்",
  } satisfies TranslationPair,

  emergencyContactName: {
    sinhala: "හදිසි අවස්ථාවක සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම",
    tamil: "அவசர தொடர்பு நபரின் பெயர்",
  } satisfies TranslationPair,

  emergencyContactNumber: {
    sinhala: "දුරකථන අංකය",
    tamil: "தொலைபேசி எண்",
  } satisfies TranslationPair,

  schoolInstitution: {
    sinhala: "පාසල / ආයතனය",
    tamil: "பள்ளி / நிறுவனம்",
  } satisfies TranslationPair,

  highestEducationQualification: {
    sinhala: "ඉහළම අධ්‍යාපන සුදුසුකම්",
    tamil: "அதிகூடிய கல்வித்தகுதி",
  } satisfies TranslationPair,

  qualification1: {
    sinhala: "සුදුසුකම් 1",
    tamil: "தகுதி 1",
  } satisfies TranslationPair,

  qualification2: {
    sinhala: "සුදුසුකම් 2",
    tamil: "தகுதி 2",
  } satisfies TranslationPair,

  otherEducationQualification: {
    sinhala: "වෙනත් අධ්‍යාපන සුදුසුකම්",
    tamil: "பிற கல்வித் தகுதிகள்",
  } satisfies TranslationPair,

  paymentMethod: {
    sinhala: "ගෙවීමේ ක්‍රමය",
    tamil: "கட்டணம் செலுத்தும் முறை",
  } satisfies TranslationPair,

  amountPaid: {
    sinhala: "ගෙවූ මුදල",
    tamil: "செலுத்திய தொகை",
  } satisfies TranslationPair,

  receiptNumber: {
    sinhala: "රිසිට් අංකය",
    tamil: "ரசீது எண்",
  } satisfies TranslationPair,

  bankBranch: {
    sinhala: "බැංකුව / ශාඛාව",
    tamil: "வங்கி / கிளை",
  } satisfies TranslationPair,

  // Payment method option labels (second part after "Cash /" etc.)
  cash: {
    sinhala: "මුදල්",
    tamil: "பணம்",
  } satisfies TranslationPair,

  bankTransfer: {
    sinhala: "බැංකු මාරු කිරීම",
    tamil: "வங்கி பரிமாற்றம்",
  } satisfies TranslationPair,

  // Declaration paragraph (second language only)
  declarationParagraph: {
    sinhala:
      "මම මෙහි සදහන් තොරතුරු සැබෑ සහ නිවැරදි බව සහතික කරමි. අසත්‍ය තොරතුරු ලබාදීමේදී ලියාපදිංචිය අවලංගු විය හැක.",
    tamil:
      "மேலுள்ள தகவல்கள் உண்மை மற்றும் சரியானவை என நான் உறுதியளிக்கிறேன். தவறான தகவல் வழங்கினால் எனது பதிவு ரத்து செய்யப்படலாம்.",
  } satisfies TranslationPair,
} as const;
