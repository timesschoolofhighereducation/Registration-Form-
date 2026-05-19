const programmeCategoryLabels: Record<string, string> = {
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  diploma_certificate: "Diploma / Certificate",
  languages: "Languages",
};

const programmeNameLabels: Record<string, string> = {
  BBA: "BBA",
  BTL: "BTL",
  BSCM: "BSCM",
  BIT: "BIT",
  MBA: "MBA",
  Diploma_Professional_English_Digital_Skills:
    "Diploma in Professional English & Digital Skills",
  AdvCert_Professional_Communication_Digital_Skills_School_Leaders:
    "Advanced Certificate – Professional Communication & Digital Skills for School Leaders",
  Cambridge_Linguaskill: "Cambridge Linguaskill",
};

const educationLabels: Record<string, string> = {
  bachelor: "Bachelor's Degree",
  hnd: "HND",
  diploma: "Diploma",
  certificate: "Certificate",
  al: "Advanced Level (A/L)",
  ol: "Ordinary Level (O/L)",
};

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
};

export function labelProgrammeCategory(value: string) {
  return programmeCategoryLabels[value] ?? value;
}

export function labelProgrammeName(value: string) {
  return programmeNameLabels[value] ?? value;
}

export function labelEducation(value: string) {
  return educationLabels[value] ?? value;
}

export function labelPayment(value: string) {
  return paymentLabels[value] ?? value;
}

export function labelGender(value: string) {
  if (value === "male") return "Male";
  if (value === "female") return "Female";
  return value;
}
