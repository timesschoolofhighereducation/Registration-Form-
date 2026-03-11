import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const supabase = supabaseServerClient();

    const { error } = await supabase.from("student_registrations").insert({
      programme_category: data.programmeCategory,
      programme_name: data.programmeName,
      full_name: data.fullName,
      name_with_initials: data.nameWithInitials,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      nic: data.nic,
      address: data.address,
      mobile_number: data.mobileNumber,
      email: data.email,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_number: data.emergencyContactNumber,
      school_institution: data.schoolInstitution,
      highest_education_qualification: data.highestEducationQualification,
      qualification_1: data.qualification1 ?? null,
      qualification_2: data.qualification2 ?? null,
      other_education_qualification: data.otherEducationQualification ?? null,
      payment_method: data.paymentMethod,
      amount_paid: data.amountPaid ? Number(data.amountPaid) : null,
      receipt_number: data.receiptNumber ?? null,
      bank_branch: data.bankBranch ?? null,
      applicant_signed: data.applicantSigned,
      applicant_signed_at: new Date().toISOString(),
      ip_hash: ip,
      profile_image_base64: data.profileImageBase64 ?? null,
      bank_receipt_base64: data.bankReceiptBase64 ?? null,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "Could not save registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unexpected error" },
      { status: 500 }
    );
  }
}

