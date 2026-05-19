export type StudentRegistrationRow = {
  id: number;
  programme_category: string;
  programme_name: string;
  full_name: string;
  name_with_initials: string;
  date_of_birth: string;
  gender: string;
  nic: string;
  address: string;
  mobile_number: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  school_institution: string;
  highest_education_qualification: string;
  qualification_1: string | null;
  qualification_2: string | null;
  other_education_qualification: string | null;
  payment_method: string;
  amount_paid: number | null;
  receipt_number: string | null;
  bank_branch: string | null;
  applicant_signed: boolean;
  applicant_signed_at: string | null;
  ip_hash: string | null;
  profile_image_base64?: string | null;
  bank_receipt_base64?: string | null;
  created_at: string;
};

export type StudentRegistrationListItem = Omit<
  StudentRegistrationRow,
  "profile_image_base64" | "bank_receipt_base64"
>;
