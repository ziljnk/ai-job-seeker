"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const providers = [
  {
    name: "Google",
    href: "#",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      if (!email || !password) throw new Error("Email and password are required");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      // Fetch role to redirect appropriately
      const { data: userData } = await supabase.auth.getUser();
      const role = (userData?.user?.user_metadata as any)?.account_role;
      router.push(role === "recruiter" ? "/chat/recruiter" : "/chat/employee");
    } catch (err: any) {
      setError(err?.message ?? "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword(emailInputId = "email") {
    setError(null);
    setInfo(null);
    const emailEl = document.getElementById(emailInputId) as HTMLInputElement | null;
    const email = emailEl?.value.trim();
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/confirm`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo("Check your email for a password reset link.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/5 p-10 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Welcome back
          </span>
          <h1 className="text-3xl font-semibold text-foreground">Sign in to your AI Job Seeker</h1>
          <p className="text-sm text-foreground/70">
            Access your tailored career insights, tracked applications, and smart interview prep.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {providers.map((provider) => (
              <button
                key={provider.name}
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-white/30 hover:bg-white/10"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-background">
                  G
                </span>
                Continue with {provider.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-foreground/60">
            <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />
            or
            <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-foreground/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-400 focus:ring-emerald-400"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => onForgotPassword()}
                className="font-medium text-emerald-300 hover:text-emerald-200"
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {info && <p className="text-sm text-emerald-300">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

  <p className="text-center text-sm text-foreground/70">
          New to AI Job Seeker?{" "}
          <Link href="/signup" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
