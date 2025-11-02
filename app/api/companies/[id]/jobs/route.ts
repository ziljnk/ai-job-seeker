import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function looksLikeUUID(value: string) {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

// GET /api/companies/:id/jobs?q=frontend&page=1&limit=10
// "id" can be a company UUID (preferred) or a company name (fallback by ilike)
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient(cookies());

    const { id: companyKey } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    const rawQ = searchParams.get("q");
    const q = rawQ ? rawQ.trim() : "";

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const perPage = clamp(
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10,
      1,
      100
    );

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let base = supabase
      .from("jobs")
      .select(
        "*, company_info:companies!jobs_company_id_fkey(id,name,website,logo_url,location,industry,size,description)",
        { count: "exact" }
      );

    if (looksLikeUUID(companyKey)) {
      base = base.eq("company_id", companyKey);
    } else {
      // Fallback to matching by the free-text company name column
      base = base.ilike("company", `%${companyKey}%`);
    }

    if (q) {
      const safeQ = q.replace(/[,]/g, " ");
      base = base.or(
        `title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,location.ilike.%${safeQ}%,type.ilike.%${safeQ}%`
      );
    }

    base = base.order("created_at", { ascending: false }).range(from, to);

    let { data, error, count } = await base;

    if (error) {
      // Fallback ordering if created_at doesn't exist
      const alt = await supabase
        .from("jobs")
        .select(
          "*, company_info:companies!jobs_company_id_fkey(id,name,website,logo_url,location,industry,size,description)",
          { count: "exact" }
        )
        [looksLikeUUID(companyKey) ? "eq" : "ilike"](
          looksLikeUUID(companyKey) ? "company_id" : "company",
          looksLikeUUID(companyKey) ? companyKey : `%${companyKey}%`
        )
        .order("id", { ascending: false })
        .range(from, to);

      if (alt.error) {
        const plain = await supabase
          .from("jobs")
          .select(
            "*, company_info:companies!jobs_company_id_fkey(id,name,website,logo_url,location,industry,size,description)",
            { count: "exact" }
          )
          [looksLikeUUID(companyKey) ? "eq" : "ilike"](
            looksLikeUUID(companyKey) ? "company_id" : "company",
            looksLikeUUID(companyKey) ? companyKey : `%${companyKey}%`
          )
          .range(from, to);
        if (plain.error) {
          return NextResponse.json(
            { error: plain.error.message },
            { status: 500 }
          );
        }
        data = plain.data;
        count = plain.count ?? plain.data?.length ?? 0;
      } else {
        data = alt.data;
        count = alt.count ?? alt.data?.length ?? 0;
      }
    }

    return NextResponse.json(
      {
        data: data ?? [],
        meta: {
          page,
          perPage,
          total: count ?? (data?.length ?? 0),
          totalPages: count ? Math.ceil(count / perPage) : null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
