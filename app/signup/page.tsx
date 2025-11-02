"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const providers = [
  {
    name: "Google",
    href: "#",
  },
];

export default function SignupPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const targetRole = String(formData.get("role") || "").trim();
    const accountRole = String(formData.get("account_role") || "employee");

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const origin = window.location.origin;

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            target_role: targetRole,
            account_role: accountRole,
          },
          // For PKCE email confirmation flow
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });

      if (signUpError) throw signUpError;

      setMessage(
        "Check your email to confirm your account. Once confirmed, you'll be signed in."
      );
      form.reset();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while signing up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/5 p-10 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Join the waitlist
          </span>
          <h1 className="text-3xl font-semibold text-foreground">Create your AI Job Seeker account</h1>
          <p className="text-sm text-foreground/70">
            Unlock personalized role recommendations, resume feedback, and automated interview prep.
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
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>

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
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Account role</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <input type="radio" name="account_role" value="employee" defaultChecked className="h-4 w-4" />
                  Employee
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <input type="radio" name="account_role" value="recruiter" className="h-4 w-4" />
                  Recruiter
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Target role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                placeholder="Product Manager, Data Scientist, ..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            {message && (
              <p className="text-sm text-emerald-300">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

  <p className="text-center text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
