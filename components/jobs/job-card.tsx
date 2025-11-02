"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CalendarClock, Clock, MapPin, MessageSquareMore, MoreVertical, Share2, Star, ExternalLink } from "lucide-react";

export type Job = {
  id?: number | string;
  title: string;
  description?: string | null;
  jd?: string | null;
  location?: string | null;
  company?: string | { name?: string | null } | null;
  company_info?: {
    id?: number | string;
    name?: string | null;
    website?: string | null;
    logo_url?: string | null;
    location?: string | null;
    industry?: string | null;
    size?: string | null;
    description?: string | null;
  } | null;
  type?: string | null;
  salary?: string | number | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  labels?: string[] | null;
  skills?: string[] | null;
  remote?: boolean | null;
  work_anytime?: boolean | null;
  hours_per_week?: number | string | null;
  url?: string | null;
};

function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="mt-3 text-lg font-semibold" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mt-3 text-base font-semibold" {...props} />,
        h3: ({ node, ...props }) => <h3 className="mt-2 text-sm font-semibold" {...props} />,
        p: ({ node, ...props }) => <p className="mt-2 text-sm leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed" {...props} />,
        ol: ({ node, ...props }) => <ol className="mt-2 list-decimal pl-5 text-sm leading-relaxed" {...props} />,
        li: ({ node, ...props }) => <li className="mt-1" {...props} />,
        code: (p: any) => {
          const { inline, className, children, ...props } = p || {};
          return inline ? (
            <code className="rounded bg-white/10 px-1 py-px text-[12px]" {...props}>{children}</code>
          ) : (
            <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-3 text-[12px] leading-relaxed ring-1 ring-white/10">
              <code className={className} {...props}>{children}</code>
            </pre>
          );
        },
        a: ({ node, ...props }) => (
          <a className="text-primary underline" target="_blank" rel="noreferrer noopener" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="mt-2 border-l-2 border-white/20 pl-3 text-sm italic" {...props} />
        ),
        hr: ({ node, ...props }) => <hr className="my-3 border-white/10" {...props} />,
      }}
      className="text-foreground/85"
    >
      {text}
    </ReactMarkdown>
  );
}

function SkillTag({ text }: { text: string }) {
  return (
    <Badge className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-50 border-emerald-500/40">
      {text}
    </Badge>
  );
}

export function JobCard({ job }: { job: Job }) {
  const companyName = (() => {
    const c: any = (job as any).company;
    if (!c) return "Unknown company";
    if (typeof c === "string") return c;
    if (typeof c === "object") return c?.name ?? "Unknown company";
    return "Unknown company";
  })();
  const info: any = (job as any).company_info || (typeof (job as any).company === "object" ? (job as any).company : null);
  const displayLocation = job.location || info?.location || null;
  const jdText = job.jd ?? null;
  const md = job.metadata || {};
  const labels: string[] = Array.isArray(job.labels) ? (job.labels as string[]) : (Array.isArray((md as any).labels) ? (md as any).labels : []);
  const skills: string[] = Array.isArray(job.skills) ? (job.skills as string[]) : (Array.isArray((md as any).skills) ? (md as any).skills : []);
  const remote: boolean = typeof job.remote === "boolean" ? !!job.remote : !!(md as any).remote;
  const workAny: boolean = typeof job.work_anytime === "boolean" ? !!job.work_anytime : !!(md as any).work_anytime;
  const hpw: any = job.hours_per_week ?? (md as any).hours_per_week ?? null;
  const url: string | null = (job as any).url ?? (md as any).url ?? null;
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {labels?.length ? (
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {labels.slice(0, 3).map((l, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-white/10 text-foreground/80 border-white/10"
                >
                  {l}
                </Badge>
              ))}
            </div>
          ) : null}

          <h3 className="truncate text-lg font-semibold text-foreground">{job.title}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/80">
            <Avatar className="size-7">
              {info?.logo_url ? <AvatarImage src={info.logo_url} alt={companyName} /> : null}
              <AvatarFallback className="text-[10px] font-medium uppercase">
                {companyName?.[0] ?? "C"}
              </AvatarFallback>
            </Avatar>
            {info?.website ? (
              <a href={info.website} target="_blank" rel="noreferrer noopener" className="hover:underline" title={info.website}>
                {companyName}
              </a>
            ) : (
              <span>{companyName}</span>
            )}

            {(remote || displayLocation) ? (
              <>
                <span className="text-foreground/40">·</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {remote ? "Work from anywhere" : displayLocation}</span>
              </>
            ) : null}
            {workAny ? (
              <>
                <span className="text-foreground/40">·</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Work anytime</span>
              </>
            ) : null}
            {hpw ? (
              <>
                <span className="text-foreground/40">·</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {String(hpw)} hrs/week</span>
              </>
            ) : null}
          </div>

          {skills?.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {skills.slice(0, 6).map((s, i) => (
                <SkillTag key={i} text={s} />
              ))}
            </div>
          ) : null}

          {job.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">{job.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" className="rounded-full" title="Share"><Share2 /></Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full" title="Comment"><MessageSquareMore /></Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full" title="Save"><Star /></Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full" title="More"><MoreVertical /></Button>
          </div>
          {job.salary ? (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-foreground ring-1 ring-white/10">
              {String(job.salary)}
            </div>
          ) : null}
          {url ? (
            <Button asChild className="rounded-full">
              <a href={url} target="_blank" rel="noreferrer noopener">
                View job <ExternalLink className="ml-0.5" />
              </a>
            </Button>
          ) : (
            <Button className="rounded-full">View job</Button>
          )}
        </div>
      </div>

      {jdText ? (
        <div className="mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="jd">
              <AccordionTrigger className="text-xs font-medium uppercase tracking-wide">
                Job details
              </AccordionTrigger>
              <AccordionContent>
                <Markdown text={jdText} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : null}
    </Card>
  );
}
