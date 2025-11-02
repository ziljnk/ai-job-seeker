"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  redirectTo?: string;
  className?: string;
  label?: string;
};

export default function LogoutButton({ redirectTo = "/login", className = "", label = "Log out" }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(redirectTo);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Signing out…" : label}
    </button>
  );
}
