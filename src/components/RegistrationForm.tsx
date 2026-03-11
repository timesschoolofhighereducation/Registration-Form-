"use client";

import { useState } from "react";
import type { RegistrationInput } from "@/lib/validation";
import { registrationSchema } from "@/lib/validation";

type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

const initialValues: RegistrationInput = {
  programmeCategory: "undergraduate",
  programmeName: "BBA",
  fullName: "",
  nameWithInitials: "",
  dateOfBirth: "",
  gender: "male",
  nic: "",
  address: "",
  mobileNumber: "",
  email: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  schoolInstitution: "",
  highestEducationQualification: "bachelor",
  qualification1: "",
  qualification2: "",
  otherEducationQualification: "",
  paymentMethod: "cash",
  amountPaid: "",
  receiptNumber: "",
  bankBranch: "",
  profileImageBase64: "",
  bankReceiptBase64: "",
  applicantSigned: true,
};

export function RegistrationForm() {
  const [values, setValues] = useState<RegistrationInput>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [profileDragOver, setProfileDragOver] = useState(false);
  const [receiptDragOver, setReceiptDragOver] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const processImageFile = (
    file: File | undefined,
    field: "profileImageBase64" | "bankReceiptBase64"
  ) => {
    if (!file) {
      setValues((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Images must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setValues((prev) => ({ ...prev, [field]: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profileImageBase64" | "bankReceiptBase64"
  ) => {
    const file = e.target.files?.[0];
    processImageFile(file, field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      const flat = parsed.error.flatten().fieldErrors;
      (Object.keys(flat) as (keyof RegistrationInput)[]).forEach((key) => {
        const msg = flat[key]?.[0];
        if (msg) fieldErrors[key] = msg;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(
          data?.message ?? "Something went wrong. Please try again."
        );
        return;
      }

      setSubmitSuccess(true);
      setValues(initialValues);
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field: keyof RegistrationInput) =>
    errors[field] ? (
      <p className="mt-1.5 text-sm text-rose-600">{errors[field]}</p>
    ) : null;

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-[#2d4084] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4084]/20 hover:border-slate-300";
  const sectionClass =
    "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-10"
    >
      <header className="flex flex-col items-center text-center">
        <img
          src="/tshelogo.jpg"
          alt="TIMES School of Higher Education"
          className="mb-4 h-20 w-auto object-contain sm:h-24"
        />
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#f01923]" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          TIMES SCHOOL OF HIGHER EDUCATION
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          Student Registration
        </p>
      </header>

      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800">
          Registration received. Thank you.
        </div>
      )}

      {/* 1. Programme Selection */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            1
          </span>
          Programme Selection / <span className="font-normal text-slate-600">පාඨමාලා තේරීම</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please choose the program you are registering for / කරුණාකර ඔබ ලියාපදිංචි වන පාඨමාලාව තෝරාගන්න
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <legend className="text-sm font-semibold text-slate-800">
              Undergraduate Programmes
            </legend>
            {[
              ["BBA", "Bachelor of Business Administration"],
              ["BTL", "Bachelor of Transportation and Logistics"],
              ["BSCM", "Bachelor of Supply Chain Management"],
              ["BIT", "Bachelor of Information and Technology"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="programmeName"
                  value={value}
                  checked={values.programmeName === value}
                  onChange={(e) => {
                    handleChange(e);
                    setValues((prev) => ({
                      ...prev,
                      programmeCategory: "undergraduate",
                    }));
                  }}
                  className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-4">
            <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <legend className="text-sm font-semibold text-slate-800">
                Postgraduate Programmes
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="programmeName"
                  value="MBA"
                  checked={values.programmeName === "MBA"}
                  onChange={(e) => {
                    handleChange(e);
                    setValues((prev) => ({
                      ...prev,
                      programmeCategory: "postgraduate",
                    }));
                  }}
                  className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                />
                <span>Master of Business Administration</span>
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <legend className="text-sm font-semibold text-slate-800">
                Diploma / Certificate Programmes
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="programmeName"
                  value="Diploma_Professional_English_Digital_Skills"
                  checked={
                    values.programmeName ===
                    "Diploma_Professional_English_Digital_Skills"
                  }
                  onChange={(e) => {
                    handleChange(e);
                    setValues((prev) => ({
                      ...prev,
                      programmeCategory: "diploma_certificate",
                    }));
                  }}
                  className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                />
                <span>
                  Diploma in Professional English and Digital Skills
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="programmeName"
                  value="AdvCert_Professional_Communication_Digital_Skills_School_Leaders"
                  checked={
                    values.programmeName ===
                    "AdvCert_Professional_Communication_Digital_Skills_School_Leaders"
                  }
                  onChange={(e) => {
                    handleChange(e);
                    setValues((prev) => ({
                      ...prev,
                      programmeCategory: "diploma_certificate",
                    }));
                  }}
                  className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                />
                <span>
                  Advanced Certificate in Professional Communication and Digital
                  Skills for School Leaders
                </span>
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <legend className="text-sm font-semibold text-slate-800">
                Languages
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="programmeName"
                  value="Cambridge_Linguaskill"
                  checked={values.programmeName === "Cambridge_Linguaskill"}
                  onChange={(e) => {
                    handleChange(e);
                    setValues((prev) => ({
                      ...prev,
                      programmeCategory: "languages",
                    }));
                  }}
                  className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                />
                <span>Cambridge Linguaskill</span>
              </label>
            </fieldset>
          </div>
        </div>
        {renderError("programmeName")}
      </section>

      {/* 2. Personal Information */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            2
          </span>
          Personal Information /{" "}
          <span className="font-normal text-slate-600">පෞද්ගලික තොරතුරු</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name / <span className="font-normal text-slate-500">සම්පූර්ණ නම</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("fullName")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Name with Initials /{" "}
              <span className="font-normal text-slate-500">මුලකුරු සමග නම</span>
            </label>
            <input
              type="text"
              name="nameWithInitials"
              value={values.nameWithInitials}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("nameWithInitials")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date of Birth / <span className="font-normal text-slate-500">උපන් දිනය</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={values.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("dateOfBirth")}
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-700">
              Gender / <span className="font-normal text-slate-500">ස්ත්‍රී - පුරුෂ භාවය</span>
            </span>
            <div className="mt-1 flex gap-4">
              {[
                ["male", "Male"],
                ["female", "Female"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={values.gender === value}
                    onChange={handleChange}
                    className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("gender")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              NIC / <span className="font-normal text-slate-500">ජා.හැ. අංකය</span>
            </label>
            <input
              type="text"
              name="nic"
              value={values.nic}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("nic")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Profile Photo (optional)
            </label>
            <div
              className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 text-center text-xs transition-colors ${
                profileDragOver ? "border-[#2d4084] bg-[#2d4084]/5" : "border-slate-200 bg-slate-50/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setProfileDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setProfileDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setProfileDragOver(false);
                const file = e.dataTransfer.files?.[0];
                processImageFile(file, "profileImageBase64");
              }}
            >
              <input
                key={values.profileImageBase64 ? "has-profile" : "no-profile"}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profileImageBase64")}
                className="sr-only"
                id="profile-image-input"
              />
              <label
                htmlFor="profile-image-input"
                className="cursor-pointer font-medium text-[#2d4084] hover:opacity-80"
              >
                Click to upload
              </label>
              <p className="mt-1 text-slate-500">
                or drag and drop an image (max 2 MB)
              </p>
              {values.profileImageBase64 && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-[11px] font-medium text-[#2d4084]">Preview</p>
                  <img
                    src={values.profileImageBase64}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-[#2d4084]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, profileImageBase64: "" }))}
                    className="mt-1 rounded-lg border border-[#f01923]/40 bg-[#f01923]/10 px-3 py-1.5 text-xs font-medium text-[#f01923] transition hover:bg-[#f01923]/20"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contact Information */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            3
          </span>
          Contact Information /{" "}
          <span className="font-normal text-slate-600">සම්බන්ධ වියහැකි තොරතුරු</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Address / <span className="font-normal text-slate-500">ලිපිනය</span>
            </label>
            <textarea
              name="address"
              value={values.address}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} min-h-[80px] resize-y`}
            />
            {renderError("address")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mobile Number /{" "}
              <span className="font-normal text-slate-500">ජංගම දුරකථන අංකය</span>
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={values.mobileNumber}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("mobileNumber")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email Address /{" "}
              <span className="font-normal text-slate-500">විද්‍යුත් තැපෑල</span>
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("email")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Emergency Contact Name /{" "}
              <span className="font-normal text-slate-500">
                හදිසි අවස්ථාවක සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම
              </span>
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={values.emergencyContactName}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("emergencyContactName")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Emergency Contact Number /{" "}
              <span className="font-normal text-slate-500">දුරකථන අංකය</span>
            </label>
            <input
              type="tel"
              name="emergencyContactNumber"
              value={values.emergencyContactNumber}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("emergencyContactNumber")}
          </div>
        </div>
      </section>

      {/* 4. Education Background */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            4
          </span>
          Education Background /{" "}
          <span className="font-normal text-slate-600">අධ්‍යාපන පසුබිම</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              School / Institution /{" "}
              <span className="font-normal text-slate-500">පාසල / ආයතනය</span>
            </label>
            <input
              type="text"
              name="schoolInstitution"
              value={values.schoolInstitution}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("schoolInstitution")}
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-700">
              Highest Education Qualification /{" "}
              <span className="font-normal text-slate-500">ඉහළම අධ්‍යාපන සුදුසුකම්</span>
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
              {[
                ["bachelor", "Bachelor"],
                ["hnd", "HND"],
                ["diploma", "Diploma"],
                ["certificate", "Certificate level"],
                ["al", "A/L"],
                ["ol", "O/L"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="highestEducationQualification"
                    value={value}
                    checked={values.highestEducationQualification === value}
                    onChange={handleChange}
                    className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("highestEducationQualification")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Qualification 1 / <span className="font-normal text-slate-500">සුදුසුකම් 1</span>
            </label>
            <input
              type="text"
              name="qualification1"
              value={values.qualification1 ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("qualification1")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Qualification 2 / <span className="font-normal text-slate-500">සුදුසුකම් 2</span>
            </label>
            <input
              type="text"
              name="qualification2"
              value={values.qualification2 ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("qualification2")}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Other Education Qualification /{" "}
              <span className="font-normal text-slate-500">වෙනත් අධ්‍යාපන සුදුසුකම්</span>
            </label>
            <textarea
              name="otherEducationQualification"
              value={values.otherEducationQualification ?? ""}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} min-h-[80px] resize-y`}
            />
            {renderError("otherEducationQualification")}
          </div>
        </div>
      </section>

      {/* 5. Payment Information */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            5
          </span>
          Payment Information /{" "}
          <span className="font-normal text-slate-600">ගෙවීම් පිළිබඳ තොරතුරු</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-slate-700">
              Payment Method /{" "}
              <span className="font-normal text-slate-500">ගෙවීමේ ක්‍රමය</span>
            </span>
            <div className="mt-1 flex flex-col gap-1 text-sm">
              {[
                ["cash", "Cash / මුදල්"],
                ["bank_transfer", "Bank Transfer / බැංකු මාරු කිරීම"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={values.paymentMethod === value}
                    onChange={handleChange}
                    className="h-4 w-4 border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("paymentMethod")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Amount Paid / <span className="font-normal text-slate-500">ගෙවූ මුදල</span>
            </label>
            <input
              type="text"
              name="amountPaid"
              value={values.amountPaid ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("amountPaid")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Receipt Number / <span className="font-normal text-slate-500">රිසිට් අංකය</span>
            </label>
            <input
              type="text"
              name="receiptNumber"
              value={values.receiptNumber ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("receiptNumber")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Bank / Branch (if applicable) /{" "}
              <span className="font-normal text-slate-500">බැංකුව / ශාඛාව</span>
            </label>
            <input
              type="text"
              name="bankBranch"
              value={values.bankBranch ?? ""}
              onChange={handleChange}
              className={inputClass}
            />
            {renderError("bankBranch")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Bank Receipt Photo (optional)
            </label>
            <div
              className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 text-center text-xs transition-colors ${
                receiptDragOver ? "border-[#2d4084] bg-[#2d4084]/5" : "border-slate-200 bg-slate-50/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setReceiptDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setReceiptDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setReceiptDragOver(false);
                const file = e.dataTransfer.files?.[0];
                processImageFile(file, "bankReceiptBase64");
              }}
            >
              <input
                key={values.bankReceiptBase64 ? "has-receipt" : "no-receipt"}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "bankReceiptBase64")}
                className="sr-only"
                id="bank-receipt-input"
              />
              <label
                htmlFor="bank-receipt-input"
                className="cursor-pointer font-medium text-[#2d4084] hover:opacity-80"
              >
                Click to upload
              </label>
              <p className="mt-1 text-slate-500">
                or drag and drop a receipt image (max 2 MB)
              </p>
              {values.bankReceiptBase64 && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-[11px] font-medium text-[#2d4084]">Preview</p>
                  <img
                    src={values.bankReceiptBase64}
                    alt="Bank receipt preview"
                    className="max-h-32 w-auto rounded-lg border border-slate-200 object-contain bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, bankReceiptBase64: "" }))}
                    className="mt-1 rounded-lg border border-[#f01923]/40 bg-[#f01923]/10 px-3 py-1.5 text-xs font-medium text-[#f01923] transition hover:bg-[#f01923]/20"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Declaration */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            6
          </span>
          Declaration / <span className="font-normal text-slate-600">ප්‍රකාශය</span>
        </h2>
        <p className="text-sm text-slate-700">
          I hereby declare that the above information is true and correct. I
          understand that any false information may result in the cancellation of
          my enrollment.
        </p>
        <p className="mt-1 text-sm text-slate-700">
          මම මෙහි සදහන් තොරතුරු සැබෑ සහ නිවැරදි බව සහතික කරමි. අසත්‍ය තොරතුරු
          ලබාදීමේදී ලියාපදිංචිය අවලංගු විය හැක.
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50">
          <input
            type="checkbox"
            name="applicantSigned"
            checked={values.applicantSigned}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-[#2d4084] focus:ring-[#2d4084]"
          />
          <span>I agree to the above declaration.</span>
        </label>
        {renderError("applicantSigned")}
      </section>

      <div className="flex items-center justify-end border-t border-slate-100 pt-8">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-[#f01923] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#f01923]/30 transition hover:bg-[#d9151e] hover:shadow-[#f01923]/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {submitting ? "Submitting…" : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}

