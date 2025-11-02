import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Ensure fresh data on each request (avoid caching list endpoints)
export const dynamic = "force-dynamic";

// Basic schema guards without external deps (keep it lightweight)
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
// GET /api/jobs?page=1&limit=10
// Returns paginated jobs with meta: { page, perPage, total, totalPages }
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(cookies());

    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    const rawQ = searchParams.get("q");
    const q = rawQ ? rawQ.trim() : "";

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    // Hard-cap to prevent abuse; adjust as needed
    const perPage = clamp(Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10, 1, 100);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Build base query with optional search across common fields
    // Include related company (via jobs_company_id_fkey) in the response
    let query = supabase
      .from("jobs")
      .select(
        "*, company_info:companies!jobs_company_id_fkey(id,name,website,logo_url,location,industry,size,description)",
        { count: "exact" }
      );
    if (q) {
      const safeQ = q.replace(/[,]/g, " ");
      query = query.or(
        `title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,company.ilike.%${safeQ}%,location.ilike.%${safeQ}%`
      );
    }
    query = query.order("created_at", { ascending: false }).range(from, to);

    let { data, error, count } = await query;

    // Fallback: if created_at doesn't exist, try ordering by id; if that also fails, do plain select
    if (error) {
      const alt = await supabase
        .from("jobs")
        .select(
          "*, company_info:companies!jobs_company_id_fkey(id,name,website,logo_url,location,industry,size,description)",
          { count: "exact" }
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
// POST /api/jobs
// Requires authenticated user. If user_metadata.role is present and not "recruiter", returns 403.
// Accepts a minimal payload: { title: string, description?: string, location?: string, company?: string, type?: string, salary?: string | number, metadata?: object }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(cookies());

    // Auth check
    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Recruiter-only creation: check both account_role and role keys
    const meta = (user.user_metadata as any) || {};
    const role = (meta.account_role as string | undefined) || (meta.role as string | undefined);
    if (role !== "recruiter") {
      return NextResponse.json(
        { error: "Forbidden: recruiter role required" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { title, description, location, company, type, salary, metadata, jd } =
      body as Record<string, unknown>;

    if (!isNonEmptyString(title)) {
      return NextResponse.json(
        { error: "'title' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, any> = {
      title: title.trim(),
      description: typeof description === "string" ? description : null,
      location: typeof location === "string" ? location : null,
      company: typeof company === "string" ? company : null,
      type: typeof type === "string" ? type : null,
      salary: typeof salary === "number" || typeof salary === "string" ? salary : null,
      metadata: typeof metadata === "object" && metadata !== null ? metadata : null,
      jd: typeof jd === "string" ? jd : null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
