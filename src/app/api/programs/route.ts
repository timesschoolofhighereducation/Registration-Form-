import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = supabaseServerClient();

    // Fetch categories and programs
    const [categoriesRes, programsRes] = await Promise.all([
      supabase.from("program_categories").select("*").order("id", { ascending: true }),
      supabase.from("programs").select("*").order("id", { ascending: true }),
    ]);

    if (categoriesRes.error || programsRes.error) {
      console.error("Supabase error fetching programs:", categoriesRes.error || programsRes.error);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch programs data" },
        { status: 500 }
      );
    }

    const categories = categoriesRes.data || [];
    const programs = programsRes.data || [];

    // Group programs by category_code
    const groupedCategories = categories.map((cat) => ({
      ...cat,
      programs: programs.filter((p) => p.category_code === cat.code),
    }));

    return NextResponse.json({
      ok: true,
      categories: groupedCategories,
    });
  } catch (error) {
    console.error("Unexpected error in /api/programs:", error);
    return NextResponse.json(
      { ok: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
