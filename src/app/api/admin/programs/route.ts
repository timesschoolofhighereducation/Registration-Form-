import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = supabaseAdminClient();

    const [categoriesRes, programsRes] = await Promise.all([
      supabase.from("program_categories").select("*").order("id", { ascending: true }),
      supabase.from("programs").select("*").order("id", { ascending: true }),
    ]);

    if (categoriesRes.error || programsRes.error) {
      return NextResponse.json(
        { ok: false, message: "Failed to fetch programs data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      categories: categoriesRes.data || [],
      programs: programsRes.data || [],
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    const supabase = supabaseAdminClient();

    if (action === "save_category") {
      const { id, code, name } = payload;
      if (!code?.trim() || !name?.trim()) {
        return NextResponse.json({ ok: false, message: "Code and Name are required" }, { status: 400 });
      }

      const categoryData = { code: code.trim(), name: name.trim() };

      let result;
      if (id) {
        result = await supabase
          .from("program_categories")
          .update(categoryData)
          .eq("id", id)
          .select();
      } else {
        result = await supabase
          .from("program_categories")
          .insert(categoryData)
          .select();
      }

      console.log("Save category full result:", result);

      if (result.error) {
        console.error("Save category error:", result.error);
        return NextResponse.json({ ok: false, message: result.error.message }, { status: 400 });
      }

      const category = result.data?.[0];
      if (!category) {
        return NextResponse.json({ ok: false, message: "Failed to save category or retrieve result" }, { status: 400 });
      }

      return NextResponse.json({ ok: true, category });
    }

    if (action === "save_program") {
      const { id, category_code, code, name } = payload;
      if (!category_code?.trim() || !code?.trim() || !name?.trim()) {
        return NextResponse.json(
          { ok: false, message: "Category, Code and Name are required" },
          { status: 400 }
        );
      }

      const programData = {
        category_code: category_code.trim(),
        code: code.trim(),
        name: name.trim(),
      };

      let result;
      if (id) {
        result = await supabase
          .from("programs")
          .update(programData)
          .eq("id", id)
          .select();
      } else {
        result = await supabase
          .from("programs")
          .insert(programData)
          .select();
      }

      console.log("Save program full result:", result);

      if (result.error) {
        console.error("Save program error:", result.error);
        return NextResponse.json({ ok: false, message: result.error.message }, { status: 400 });
      }

      const program = result.data?.[0];
      if (!program) {
        return NextResponse.json({ ok: false, message: "Failed to save program or retrieve result" }, { status: 400 });
      }

      return NextResponse.json({ ok: true, program });
    }

    return NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const idParam = searchParams.get("id");

    if (!type || !idParam) {
      return NextResponse.json({ ok: false, message: "Type and ID are required" }, { status: 400 });
    }

    const id = Number(idParam);
    const supabase = supabaseAdminClient();

    let result;
    if (type === "category") {
      result = await supabase.from("program_categories").delete().eq("id", id);
    } else if (type === "program") {
      result = await supabase.from("programs").delete().eq("id", id);
    } else {
      return NextResponse.json({ ok: false, message: "Invalid type" }, { status: 400 });
    }

    if (result.error) {
      console.error("Delete error:", result.error);
      return NextResponse.json({ ok: false, message: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Unexpected server error" }, { status: 500 });
  }
}
