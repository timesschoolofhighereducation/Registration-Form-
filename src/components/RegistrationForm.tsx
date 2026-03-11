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
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-4xl flex-col gap-8 rounded-xl bg-white p-6 shadow-sm sm:p-10"
    >
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          TIMES SCHOOL OF HIGHER EDUCATION
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-800">
          STUDENT REGISTRATION FORM
        </p>
      </header>

      {submitError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Registration received. Thank you.
        </div>
      )}

      {/* 1. Programme Selection */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">
          1. Programme Selection / <span className="font-normal">පාඨමාලා තේරීම</span>
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Please choose the program you are registering for / කරුණාකර ඔබ ලියාපදිංචි වන පාඨමාලාව තෝරාගන්න
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-gray-800">
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
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-gray-800">
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
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Master of Business Administration</span>
              </label>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-gray-800">
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
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Advanced Certificate in Professional Communication and Digital
                  Skills for School Leaders
                </span>
              </label>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-gray-800">
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
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Cambridge Linguaskill</span>
              </label>
            </fieldset>
          </div>
        </div>
        {renderError("programmeName")}
      </section>

      {/* 2. Personal Information */}
      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          2. Personal Information /{" "}
          <span className="font-normal">පෞද්ගලික තොරතුරු</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name / <span className="font-normal">සම්පූර්ණ නම</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("fullName")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name with Initials /{" "}
              <span className="font-normal">මුලකුරු සමග නම</span>
            </label>
            <input
              type="text"
              name="nameWithInitials"
              value={values.nameWithInitials}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("nameWithInitials")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth / <span className="font-normal">උපන් දිනය</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={values.dateOfBirth}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("dateOfBirth")}
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Gender / <span className="font-normal">ස්ත්‍රී - පුරුෂ භාවය</span>
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
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("gender")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              NIC / <span className="font-normal">ජා.හැ. අංකය</span>
            </label>
            <input
              type="text"
              name="nic"
              value={values.nic}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("nic")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Photo (optional)
            </label>
            <div
              className={`mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed px-3 py-4 text-center text-xs ${
                profileDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
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
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profileImageBase64")}
                className="sr-only"
                id="profile-image-input"
              />
              <label
                htmlFor="profile-image-input"
                className="cursor-pointer font-medium text-blue-700"
              >
                Click to upload
              </label>
              <p className="mt-1 text-gray-500">
                or drag and drop an image (max 2 MB)
              </p>
              {values.profileImageBase64 && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-[11px] text-emerald-700">Preview:</p>
                  <img
                    src={values.profileImageBase64}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contact Information */}
      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          3. Contact Information /{" "}
          <span className="font-normal">සම්බන්ධ වියහැකි තොරතුරු</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Address / <span className="font-normal">ලිපිනය</span>
            </label>
            <textarea
              name="address"
              value={values.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("address")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number /{" "}
              <span className="font-normal">ජංගම දුරකථන අංකය</span>
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={values.mobileNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("mobileNumber")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address /{" "}
              <span className="font-normal">විද්‍යුත් තැපෑල</span>
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("email")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emergency Contact Name /{" "}
              <span className="font-normal">
                හදිසි අවස්ථාවක සම්බන්ධ කරගත යුතු පුද්ගලයාගේ නම
              </span>
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={values.emergencyContactName}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("emergencyContactName")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emergency Contact Number /{" "}
              <span className="font-normal">දුරකථන අංකය</span>
            </label>
            <input
              type="tel"
              name="emergencyContactNumber"
              value={values.emergencyContactNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("emergencyContactNumber")}
          </div>
        </div>
      </section>

      {/* 4. Education Background */}
      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          4. Education Background /{" "}
          <span className="font-normal">අධ්‍යාපන පසුබිම</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              School / Institution /{" "}
              <span className="font-normal">පාසල / ආයතනය</span>
            </label>
            <input
              type="text"
              name="schoolInstitution"
              value={values.schoolInstitution}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("schoolInstitution")}
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Highest Education Qualification /{" "}
              <span className="font-normal">ඉහළම අධ්‍යාපන සුදුසුකම්</span>
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
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("highestEducationQualification")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Qualification 1 / <span className="font-normal">සුදුසුකම් 1</span>
            </label>
            <input
              type="text"
              name="qualification1"
              value={values.qualification1 ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("qualification1")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Qualification 2 / <span className="font-normal">සුදුසුකම් 2</span>
            </label>
            <input
              type="text"
              name="qualification2"
              value={values.qualification2 ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("qualification2")}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Other Education Qualification /{" "}
              <span className="font-normal">වෙනත් අධ්‍යාපන සුදුසුකම්</span>
            </label>
            <textarea
              name="otherEducationQualification"
              value={values.otherEducationQualification ?? ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("otherEducationQualification")}
          </div>
        </div>
      </section>

      {/* 5. Payment Information */}
      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          5. Payment Information /{" "}
          <span className="font-normal">ගෙවීම් පිළිබඳ තොරතුරු</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Payment Method /{" "}
              <span className="font-normal">ගෙවීමේ ක්‍රමය</span>
            </span>
            <div className="mt-1 flex flex-col gap-1 text-sm">
              {[
                ["cash", "Cash / මුදල්"],
                ["bank_transfer", "Bank Transfer / බැංකු මාරු කිරීම"],
                ["card", "Card / කාඩ්පත"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={values.paymentMethod === value}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {renderError("paymentMethod")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount Paid / <span className="font-normal">ගෙවූ මුදල</span>
            </label>
            <input
              type="text"
              name="amountPaid"
              value={values.amountPaid ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("amountPaid")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receipt Number / <span className="font-normal">රිසිට් අංකය</span>
            </label>
            <input
              type="text"
              name="receiptNumber"
              value={values.receiptNumber ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("receiptNumber")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank / Branch (if applicable) /{" "}
              <span className="font-normal">බැංකුව / ශාඛාව</span>
            </label>
            <input
              type="text"
              name="bankBranch"
              value={values.bankBranch ?? ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {renderError("bankBranch")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Receipt Photo (optional)
            </label>
            <div
              className={`mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed px-3 py-4 text-center text-xs ${
                receiptDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
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
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "bankReceiptBase64")}
                className="sr-only"
                id="bank-receipt-input"
              />
              <label
                htmlFor="bank-receipt-input"
                className="cursor-pointer font-medium text-blue-700"
              >
                Click to upload
              </label>
              <p className="mt-1 text-gray-500">
                or drag and drop a receipt image (max 2 MB)
              </p>
              {values.bankReceiptBase64 && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-[11px] text-emerald-700">Preview:</p>
                  <img
                    src={values.bankReceiptBase64}
                    alt="Bank receipt preview"
                    className="max-h-32 w-auto rounded-md border border-emerald-500 object-contain bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Declaration */}
      <section className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          6. Declaration / <span className="font-normal">ප්‍රකාශය</span>
        </h2>
        <p className="text-sm text-gray-700">
          I hereby declare that the above information is true and correct. I
          understand that any false information may result in the cancellation of
          my enrollment.
        </p>
        <p className="mt-1 text-sm text-gray-700">
          මම මෙහි සදහන් තොරතුරු සැබෑ සහ නිවැරදි බව සහතික කරමි. අසත්‍ය තොරතුරු
          ලබාදීමේදී ලියාපදිංචිය අවලංගු විය හැක.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            name="applicantSigned"
            checked={values.applicantSigned}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>I agree to the above declaration.</span>
        </label>
        {renderError("applicantSigned")}
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}

