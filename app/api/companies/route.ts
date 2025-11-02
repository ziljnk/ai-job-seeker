import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Ensure fresh data on each request (avoid caching list endpoints)
export const dynamic = "force-dynamic";

// Lightweight guards/utilities
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

// GET /api/companies?q=acme&page=1&limit=10&industry=software&location=remote
// Returns paginated companies with meta: { page, perPage, total, totalPages }
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(cookies());

    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    const rawQ = searchParams.get("q");
    const q = rawQ ? rawQ.trim() : "";
    const rawIndustry = searchParams.get("industry");
    const rawLocation = searchParams.get("location");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const perPage = clamp(
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10,
      1,
      100
    );

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("companies")
      .select("id,name,website,logo_url,location,industry,size,description,created_at", {
        count: "exact",
      });

    if (isNonEmptyString(q)) {
      const safeQ = q.replace(/[ ,]/g, " ");
      query = query.or(
        `name.ilike.%${safeQ}%,description.ilike.%${safeQ}%,industry.ilike.%${safeQ}%,location.ilike.%${safeQ}%`
      );
    }

    if (isNonEmptyString(rawIndustry)) {
      query = query.ilike("industry", `%${rawIndustry!.trim()}%`);
    }

    if (isNonEmptyString(rawLocation)) {
      query = query.ilike("location", `%${rawLocation!.trim()}%`);
    }

    query = query.order("name", { ascending: true }).range(from, to);

    let { data, error, count } = await query;

    // Fallback ordering if "name" doesn't exist
    if (error) {
      const alt = await supabase
        .from("companies")
        .select(
          "id,name,website,logo_url,location,industry,size,description,created_at",
          { count: "exact" }
        )
        .order("id", { ascending: true })
        .range(from, to);

      if (alt.error) {
        const plain = await supabase
          .from("companies")
          .select(
            "id,name,website,logo_url,location,industry,size,description,created_at",
            { count: "exact" }
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
