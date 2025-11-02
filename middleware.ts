import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata as any)?.account_role as string | undefined;

  const isAuth = !!user;
  const isAuthPage = ["/login", "/signup"].includes(nextUrl.pathname);
  const isRoot = nextUrl.pathname === "/";
  const isChat = nextUrl.pathname.startsWith("/chat");

  const chatPathForRole = (r?: string) => (r === "recruiter" ? "/chat/recruiter" : "/chat/employee");

  if (isAuth && (isAuthPage || isRoot)) {
    return NextResponse.redirect(new URL(chatPathForRole(role), request.url));
  }

  if (!isAuth && isChat) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/signup", "/chat/:path*"],
};
