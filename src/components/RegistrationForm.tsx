"use client";

import { useEffect, useRef, useState } from "react";
import type { RegistrationInput } from "@/lib/validation";
import { registrationSchema } from "@/lib/validation";
import type { FormLanguage } from "@/lib/translations";
import { translations } from "@/lib/translations";

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
  const [language, setLanguage] = useState<FormLanguage>("sinhala");
  const [showPreview, setShowPreview] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [activeImageField, setActiveImageField] = useState<
    "profileImageBase64" | "bankReceiptBase64" | null
  >(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmissionCompleted(false);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (submissionCompleted) {
      resetForm();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsStartingCamera(false);
  };

  useEffect(() => {
    // Detect camera API support once on mount (helps for mobile browsers)
    if (typeof navigator !== "undefined") {
      const supported =
        !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
      setIsCameraSupported(supported);
    } else {
      setIsCameraSupported(false);
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openImagePopup = (
    field: "profileImageBase64" | "bankReceiptBase64"
  ) => {
    setActiveImageField(field);
    setCameraError(null);
  };

  const closeImagePopup = () => {
    setActiveImageField(null);
    setCameraError(null);
    stopCamera();
  };

  const startCamera = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Direct camera access is not available in this browser. Please use 'Choose from device' or try a different browser."
      );
      return;
    }

    try {
      setIsStartingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setCameraError("Unable to access camera. Please check permissions.");
      stopCamera();
    } finally {
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const capturePhotoFromCamera = () => {
    if (!videoRef.current || !activeImageField) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    if (!dataUrl) return;

    setValues((prev) => ({
      ...prev,
      [activeImageField]: dataUrl,
    }));

    closeImagePopup();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    // Any edit should hide the preview so user reviews again
    if (showPreview) setShowPreview(false);
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
      if (typeof window !== "undefined") {
        window.alert("Images must be 2 MB or smaller.");
      }
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
    setSubmissionCompleted(false);

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
    // First successful validation: show preview instead of submitting
    if (!showPreview) {
      setShowPreview(true);
      return;
    }

    await submitForm();
  };

  const submitForm = async () => {
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
      setSubmissionCompleted(true);
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
        <div className="mt-4 flex gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
          <button
            type="button"
            onClick={() => setLanguage("sinhala")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              language === "sinhala"
                ? "bg-[#2d4084] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            සිංහල
          </button>
          <button
            type="button"
            onClick={() => setLanguage("tamil")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              language === "tamil"
                ? "bg-[#2d4084] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            தமிழ்
          </button>
        </div>
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
          Programme Selection / <span className="font-normal text-slate-600">{translations.programmeSelection[language]}</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please choose the program you are registering for / {translations.programmeSelectionDesc[language]}
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
          <span className="font-normal text-slate-600">{translations.personalInfo[language]}</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name / <span className="font-normal text-slate-500">{translations.fullName[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.nameWithInitials[language]}</span>
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
              Date of Birth / <span className="font-normal text-slate-500">{translations.dateOfBirth[language]}</span>
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
              Gender / <span className="font-normal text-slate-500">{translations.gender[language]}</span>
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
              NIC / <span className="font-normal text-slate-500">{translations.nic[language]}</span>
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
                capture="environment"
                onChange={(e) => handleFileChange(e, "profileImageBase64")}
                className="sr-only"
                id="profile-image-input"
              />
              <button
                type="button"
                onClick={() => openImagePopup("profileImageBase64")}
                className="cursor-pointer font-medium text-[#2d4084] hover:opacity-80"
              >
                Click to upload or take photo
              </button>
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
          <span className="font-normal text-slate-600">{translations.contactInfo[language]}</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Address / <span className="font-normal text-slate-500">{translations.address[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.mobileNumber[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.email[language]}</span>
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
                {translations.emergencyContactName[language]}
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
              <span className="font-normal text-slate-500">{translations.emergencyContactNumber[language]}</span>
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
          <span className="font-normal text-slate-600">{translations.educationBackground[language]}</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              School / Institution /{" "}
              <span className="font-normal text-slate-500">{translations.schoolInstitution[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.highestEducationQualification[language]}</span>
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
              Qualification 1 / <span className="font-normal text-slate-500">{translations.qualification1[language]}</span>
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
              Qualification 2 / <span className="font-normal text-slate-500">{translations.qualification2[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.otherEducationQualification[language]}</span>
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
          <span className="font-normal text-slate-600">{translations.paymentInfo[language]}</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-slate-700">
              Payment Method /{" "}
              <span className="font-normal text-slate-500">{translations.paymentMethod[language]}</span>
            </span>
            <div className="mt-1 flex flex-col gap-1 text-sm">
              {[
                ["cash", `Cash / ${translations.cash[language]}`],
                ["bank_transfer", `Bank Transfer / ${translations.bankTransfer[language]}`],
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
              Amount Paid / <span className="font-normal text-slate-500">{translations.amountPaid[language]}</span>
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
              Receipt Number / <span className="font-normal text-slate-500">{translations.receiptNumber[language]}</span>
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
              <span className="font-normal text-slate-500">{translations.bankBranch[language]}</span>
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
                capture="environment"
                onChange={(e) => handleFileChange(e, "bankReceiptBase64")}
                className="sr-only"
                id="bank-receipt-input"
              />
              <button
                type="button"
                onClick={() => openImagePopup("bankReceiptBase64")}
                className="cursor-pointer font-medium text-[#2d4084] hover:opacity-80"
              >
                Click to upload or take photo
              </button>
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

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={handleClosePreview}
        >
          <div
            className="relative flex h-full max-h-[95vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
              <div className="flex items-center gap-3">
                <img
                  src="/tshelogo.jpg"
                  alt="TIMES School of Higher Education"
                  className="h-8 w-auto object-contain"
                />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    TIMES SCHOOL OF HIGHER EDUCATION
                  </h2>
                  <p className="text-xs font-medium text-slate-600">
                    Student Registration – Preview
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 px-4 py-4">
              <div className="mx-auto w-full max-w-[900px] bg-white p-6 shadow-sm">
                {/* Top header similar to PDF */}
                <div className="flex items-start border-b border-slate-200 pb-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-slate-500">
                      1 | Page
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <img
                        src="/tshelogo.jpg"
                        alt="TIMES School of Higher Education"
                        className="h-8 w-auto object-contain"
                      />
                      <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">
                          TIMES SCHOOL OF HIGHER EDUCATION
                        </h1>
                        <p className="text-sm font-semibold text-slate-800">
                          STUDENT REGISTRATION FORM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body content laid out like PDF */}
                <div className="mt-4 space-y-4 text-[11px] text-slate-900">
                  {/* 1. Programme Selection */}
                  <div>
                    <p className="font-semibold">
                      1. Programme Selection /{" "}
                      <span className="font-normal text-slate-700">
                        {translations.programmeSelection[language]}
                      </span>
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-[11px]">
                          Undergraduate Programmes
                        </p>
                        <ul className="mt-0.5 space-y-0.5">
                          {[
                            ["BBA", "Bachelor of Business Administration"],
                            ["BTL", "Bachelor of Transportation and Logistics"],
                            ["BSCM", "Bachelor of Supply Chain Management"],
                            ["BIT", "Bachelor of Information and Technology"],
                          ].map(([code, label]) => (
                            <li key={code} className="flex items-center gap-1">
                              <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                                {values.programmeName === code ? "✓" : ""}
                              </span>
                              <span>{label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <p className="font-semibold text-[11px]">
                            Postgraduate Programmes
                          </p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                              {values.programmeName === "MBA" ? "✓" : ""}
                            </span>
                            <span>Master of Business Administration</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-[11px]">
                            Diploma Programmes / Certificate Programmes
                          </p>
                          <ul className="mt-0.5 space-y-0.5">
                            <li className="flex items-center gap-1">
                              <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                                {values.programmeName ===
                                "Diploma_Professional_English_Digital_Skills"
                                  ? "✓"
                                  : ""}
                              </span>
                              <span>
                                Diploma in Professional English and Digital
                                Skills
                              </span>
                            </li>
                            <li className="flex items-center gap-1">
                              <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                                {values.programmeName ===
                                "AdvCert_Professional_Communication_Digital_Skills_School_Leaders"
                                  ? "✓"
                                  : ""}
                              </span>
                              <span>
                                Advanced Certificate in Professional
                                Communication and Digital Skills for School
                                Leaders
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[11px]">
                            Languages
                          </p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                              {values.programmeName === "Cambridge_Linguaskill"
                                ? "✓"
                                : ""}
                            </span>
                            <span>Cambridge Linguaskill</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2 & 3. Personal + Contact Information */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="font-semibold">
                        2. Personal Information /{" "}
                        <span className="font-normal text-slate-700">
                          {translations.personalInfo[language]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-16 w-16 overflow-hidden rounded border border-slate-300 bg-slate-50">
                          {values.profileImageBase64 ? (
                            <img
                              src={values.profileImageBase64}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                              Photo
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500">
                          Personal section photo
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Full Name /{" "}
                        <span className="font-normal">
                          {translations.fullName[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Name with Initials /{" "}
                        <span className="font-normal">
                          {translations.nameWithInitials[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.nameWithInitials}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Date of Birth /{" "}
                        <span className="font-normal">
                          {translations.dateOfBirth[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.dateOfBirth}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Gender /{" "}
                        <span className="font-normal">
                          {translations.gender[language]}
                        </span>
                      </p>
                      <div className="mt-0.5 flex items-center gap-4">
                        {[
                          ["male", "Male"],
                          ["female", "Female"],
                        ].map(([code, label]) => (
                          <div
                            key={code}
                            className="flex items-center gap-1 text-[11px]"
                          >
                            <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                              {values.gender === code ? "✓" : ""}
                            </span>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">
                        NIC /{" "}
                        <span className="font-normal">
                          {translations.nic[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.nic}
                      </p>
                    </div>
                    <div className="col-span-2 mt-2 font-semibold">
                      3. Contact Information /{" "}
                      <span className="font-normal text-slate-700">
                        {translations.contactInfo[language]}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold">
                        Address /{" "}
                        <span className="font-normal">
                          {translations.address[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[32px] whitespace-pre-line border border-slate-300 px-1 py-1">
                        {values.address}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Mobile Number /{" "}
                        <span className="font-normal">
                          {translations.mobileNumber[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.mobileNumber}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Email Address /{" "}
                        <span className="font-normal">
                          {translations.email[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.email}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Emergency Contact Name /{" "}
                        <span className="font-normal">
                          {translations.emergencyContactName[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.emergencyContactName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Emergency Contact Number /{" "}
                        <span className="font-normal">
                          {translations.emergencyContactNumber[language]}
                        </span>
                      </p>
                      <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                        {values.emergencyContactNumber}
                      </p>
                    </div>
                  </div>

                  {/* 4. Education Background */}
                  <div>
                    <p className="font-semibold">
                      4. Education Background /{" "}
                      <span className="font-normal text-slate-700">
                        {translations.educationBackground[language]}
                      </span>
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold">
                          School / Institution /{" "}
                          <span className="font-normal">
                            {translations.schoolInstitution[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.schoolInstitution}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">
                          Highest Education Qualification /{" "}
                          <span className="font-normal">
                            {translations.highestEducationQualification[
                              language
                            ]}
                          </span>
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-3">
                          {[
                            ["bachelor", "Bachelor"],
                            ["hnd", "HND"],
                            ["diploma", "Diploma"],
                            ["certificate", "Certificate level"],
                            ["al", "A/L"],
                            ["ol", "O/L"],
                          ].map(([code, label]) => (
                            <div
                              key={code}
                              className="flex items-center gap-1 text-[11px]"
                            >
                              <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                                {values.highestEducationQualification === code
                                  ? "✓"
                                  : ""}
                              </span>
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">
                          Qualification 1 /{" "}
                          <span className="font-normal">
                            {translations.qualification1[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.qualification1}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">
                          Qualification 2 /{" "}
                          <span className="font-normal">
                            {translations.qualification2[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.qualification2}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">
                          Other Education Qualification /{" "}
                          <span className="font-normal">
                            {translations.otherEducationQualification[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[32px] whitespace-pre-line border border-slate-300 px-1 py-1">
                          {values.otherEducationQualification}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Payment Information */}
                  <div>
                    <p className="font-semibold">
                      5. Payment Information /{" "}
                      <span className="font-normal text-slate-700">
                        {translations.paymentInfo[language]}
                      </span>
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold">
                          Payment Method /{" "}
                          <span className="font-normal">
                            {translations.paymentMethod[language]}
                          </span>
                        </p>
                        <div className="mt-0.5 space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                              {values.paymentMethod === "cash" ? "✓" : ""}
                            </span>
                            <span>
                              Cash / {translations.cash[language]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
                              {values.paymentMethod === "bank_transfer"
                                ? "✓"
                                : ""}
                            </span>
                            <span>
                              Bank Transfer / {translations.bankTransfer[language]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">
                          Amount Paid /{" "}
                          <span className="font-normal">
                            {translations.amountPaid[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.amountPaid}
                        </p>
                        <p className="mt-2 font-semibold">
                          Receipt Number /{" "}
                          <span className="font-normal">
                            {translations.receiptNumber[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.receiptNumber}
                        </p>
                        <p className="mt-2 font-semibold">
                          Bank / Branch (if applicable) /{" "}
                          <span className="font-normal">
                            {translations.bankBranch[language]}
                          </span>
                        </p>
                        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">
                          {values.bankBranch}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 6. Declaration */}
                  <div className="mt-2 border-t border-slate-200 pt-2 text-[11px]">
                    <p className="font-semibold">
                      6. Declaration /{" "}
                      <span className="font-normal text-slate-700">
                        {translations.declaration[language]}
                      </span>
                    </p>
                    <p className="mt-1 text-slate-800">
                      I hereby declare that the above information is true and
                      correct. I understand that any false information may
                      result in the cancellation of my enrollment.
                    </p>
                    <p className="mt-1 text-slate-800">
                      {translations.declarationParagraph[language]}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[11px] text-slate-700">
                          Signature of Applicant
                        </p>
                        <div className="mt-4 border-b border-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-700">Date</p>
                        <div className="mt-4 border-b border-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Receipt section at bottom for cutting */}
                  <div className="mt-4 border-t border-dashed border-slate-400 pt-3">
                    <p className="text-[11px] font-semibold text-slate-900">
                      Payment Receipt (Student Copy)
                    </p>
                    <p className="mb-2 text-[10px] text-slate-500">
                      Cut along the dotted line and keep this receipt.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <p className="font-semibold">Name</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300">
                          {values.fullName}
                        </p>
                        <p className="mt-2 font-semibold">Programme</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300">
                          {values.programmeName}
                        </p>
                        <p className="mt-2 font-semibold">Amount Paid</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300">
                          {values.amountPaid}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Receipt Number</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300">
                          {values.receiptNumber}
                        </p>
                        <p className="mt-2 font-semibold">Bank / Branch</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300">
                          {values.bankBranch}
                        </p>
                        <p className="mt-2 font-semibold">Received By</p>
                        <p className="mt-0.5 min-h-[16px] border-b border-slate-300" />
                      </div>
                    </div>
                    {values.bankReceiptBase64 && (
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] font-semibold text-slate-900">
                          Bank Receipt Image
                        </p>
                        <div className="flex items-center justify-center rounded border border-slate-300 bg-slate-50 p-2">
                          <img
                            src={values.bankReceiptBase64}
                            alt="Bank receipt"
                            className="max-h-40 w-auto object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
              {submissionCompleted ? (
                <>
                  <div className="flex flex-col gap-1 text-[11px] text-emerald-700">
                    <span className="font-semibold">
                      Registration submitted successfully.
                    </span>
                    <span className="text-emerald-800">
                      You can download / print this page as the student&apos;s PDF copy.
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Download / Print PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleClosePreview}
                      className="rounded-lg bg-[#f01923] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d9151e]"
                    >
                      OK
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Print
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Back &amp; Edit
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={submitForm}
                      className="rounded-lg bg-[#f01923] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d9151e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Confirm & Submit"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeImageField && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={closeImagePopup}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {activeImageField === "profileImageBase64"
                  ? "Profile Photo"
                  : "Bank Receipt Photo"}
              </h2>
              <button
                type="button"
                onClick={closeImagePopup}
                className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Choose an existing image from your device or take a new photo using
              your camera. Works on mobile and desktop (where supported by your
              browser).
            </p>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  const inputId =
                    activeImageField === "profileImageBase64"
                      ? "profile-image-input"
                      : "bank-receipt-input";
                  const input = document.getElementById(
                    inputId
                  ) as HTMLInputElement | null;
                  input?.click();
                  closeImagePopup();
                }}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                Choose from device
              </button>

              {isCameraSupported ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">
                      Take photo with camera
                    </span>
                    <button
                      type="button"
                      onClick={cameraStream ? stopCamera : startCamera}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {cameraStream ? "Stop camera" : "Start camera"}
                    </button>
                  </div>
                  {cameraError && (
                    <p className="mt-2 text-xs text-rose-600">{cameraError}</p>
                  )}
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-100">
                      {cameraStream ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          Camera preview will appear here
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={capturePhotoFromCamera}
                      disabled={!cameraStream || isStartingCamera}
                      className="mt-1 inline-flex items-center justify-center rounded-lg bg-[#2d4084] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#25336a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isStartingCamera ? "Starting camera…" : "Capture photo"}
                    </button>
                    <p className="text-[10px] text-slate-500">
                      Make sure to allow camera access in your browser when asked.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-medium">
                    Direct camera access is not available in this browser or connection.
                  </p>
                  <p className="mt-1">
                    You can still upload photos by using{" "}
                    <span className="font-semibold">Choose from device</span>. On many
                    phones this will let you pick an existing photo or open the camera.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Declaration */}
      <section className={`grid gap-5 ${sectionClass}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4084]/10 text-sm font-medium text-[#2d4084]">
            6
          </span>
          Declaration / <span className="font-normal text-slate-600">{translations.declaration[language]}</span>
        </h2>
        <p className="text-sm text-slate-700">
          I hereby declare that the above information is true and correct. I
          understand that any false information may result in the cancellation of
          my enrollment.
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {translations.declarationParagraph[language]}
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50">
          <input
            type="checkbox"
            name="applicantSigned"
            checked={values.applicantSigned === true}
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
          {submitting
            ? "Submitting…"
            : showPreview
            ? "Re-open Preview"
            : "Review & Preview"}
        </button>
      </div>
    </form>
  );
}

