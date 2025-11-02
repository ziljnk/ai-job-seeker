import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Handles PKCE token exchange for email confirmations and password recovery
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? undefined;

  if (!token_hash || !type) {
    redirect("/auth/auth-code-error");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(
    token_hash
  );

  if (error) {
    redirect("/auth/auth-code-error");
  }

  // After successful exchange, route user based on role (fallback to next or employee chat)
  const { data: userData } = await supabase.auth.getUser();
  const role = (userData?.user?.user_metadata as any)?.account_role;
  const target = next ?? (role === "recruiter" ? "/chat/recruiter" : "/chat/employee");
  redirect(target);
}
