import axios, { AxiosInstance } from "axios";

// Base URL for API calls. For your Next.js API routes, you can leave it blank (relative)
// or set NEXT_PUBLIC_API_BASE_URL to your deployment origin.
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// We often want to include cookies for auth/session when calling same-origin APIs
const DEFAULTS = {
  baseURL,
  withCredentials: true,
};

// Client-side: attach Supabase JWT automatically if present
// Server-side: prefer using createServerApi() below to attach token
export const api: AxiosInstance = axios.create(DEFAULTS);

api.interceptors.request.use(async (config) => {
  try {
    // Only run this path in the browser
    if (typeof window !== "undefined") {
      // Lazy import to avoid bundling server utilities into the client
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        } as any;
      }
    }
  } catch {
    // noop; leave config as-is
  }
  return config;
});

// Server-side factory: attaches the current user's Supabase JWT if available.
// Usage in route handlers / server components:
//   const api = await createServerApi();
//   const { data } = await api.get('/api/jobs');
export async function createServerApi(): Promise<AxiosInstance> {
  const instance = axios.create(DEFAULTS);
  try {
    // Lazy import to avoid pulling server code in non-server environments
    const { createClient } = await import("@/utils/supabase/server");
    const { cookies } = await import("next/headers");
    const supabase = await createClient(cookies());
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      instance.interceptors.request.use((config) => {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        } as any;
        return config;
      });
    }
  } catch {
    // If anything fails, return instance without auth header
  }
  return instance;
}
