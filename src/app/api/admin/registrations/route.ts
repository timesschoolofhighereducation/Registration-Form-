import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";
import type {
  StudentRegistrationListItem,
  StudentRegistrationRow,
} from "@/types/registration";

const LIST_COLUMNS =
  "id, programme_category, programme_name, full_name, name_with_initials, date_of_birth, gender, nic, address, mobile_number, email, emergency_contact_name, emergency_contact_number, school_institution, highest_education_qualification, qualification_1, qualification_2, other_education_qualification, payment_method, amount_paid, receipt_number, bank_branch, applicant_signed, applicant_signed_at, ip_hash, created_at";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    const supabase = supabaseAdminClient();

    if (idParam) {
      const id = Number(idParam);
      if (!Number.isFinite(id) || id < 1) {
        return NextResponse.json(
          { ok: false, message: "Invalid registration id" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("student_registrations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, message: "Could not load registration" },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { ok: false, message: "Registration not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        registration: data as StudentRegistrationRow,
      });
    }

    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "25"))
    );
    const search = searchParams.get("search")?.trim() ?? "";
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("student_registrations")
      .select(LIST_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `full_name.ilike.${term},nic.ilike.${term},email.ilike.${term},mobile_number.ilike.${term},programme_name.ilike.${term}`
      );
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json(
        { ok: false, message: "Could not load registrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      registrations: (data ?? []) as StudentRegistrationListItem[],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Missing")
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Server is missing Supabase environment configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Unexpected error" },
      { status: 500 }
    );
  }
}
