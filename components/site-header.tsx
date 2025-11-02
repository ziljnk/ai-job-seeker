"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  const tabs = [
    { href: "/chat/employee", label: "Chat" },
    { href: "/jobs", label: "Explore Jobs" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">AI Job Seeker</Link>
        <nav className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          {tabs.map((tab) => {
            // Special-case Chat: highlight for both /chat/employee and /chat/recruiter (any /chat/*)
            const isActive = (href: string) => {
              if (href === "/chat/employee") {
                return pathname === "/chat" || pathname.startsWith("/chat/");
              }
              return pathname === href || pathname.startsWith(href + "/");
            };
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center rounded-md px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
