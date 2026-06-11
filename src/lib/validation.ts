import { z } from "zod";

export const registrationSchema = z.object({
  programmeCategory: z.string().min(1, "Programme category is required"),
  programmeName: z.string().min(1, "Programme name is required"),
  fullName: z.string().min(1, "Full name is required"),
  nameWithInitials: z.string().min(1, "Name with initials is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  gender: z.enum(["male", "female"]),
  nic: z.string().min(5, "NIC is required"),
  address: z.string().min(1, "Address is required"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number is required")
    .max(15, "Mobile number is too long"),
  email: z.string().email("Invalid email address"),
  emergencyContactName: z
    .string()
    .min(1, "Emergency contact name is required"),
  emergencyContactNumber: z
    .string()
    .min(10, "Emergency contact number is required")
    .max(15, "Emergency contact number is too long"),
  schoolInstitution: z
    .string()
    .min(1, "School / institution is required"),
  highestEducationQualification: z.enum([
    "bachelor",
    "hnd",
    "diploma",
    "certificate",
    "al",
    "ol",
  ]),
  qualification1: z.string().optional(),
  qualification2: z.string().optional(),
  otherEducationQualification: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "cash_deposit"]),
  amountPaid: z
    .string()
    .refine((val) => val === "" || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Invalid amount",
    })
    .optional(),
  receiptNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  profileImageBase64: z
    .string()
    .max(2_000_000, "Profile image is too large")
    .optional(),
  bankReceiptBase64: z
    .string()
    .max(2_000_000, "Bank receipt image is too large")
    .optional(),
  remarks: z.string().optional(),
  applicantSigned: z.literal(true, "You must accept the declaration"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

