"use client";

import { useFrontendTool } from "@copilotkit/react-core";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BadgeCheck,
  CalendarClock,
  Clock,
  MapPin,
  MessageSquareMore,
  MoreVertical,
  Share2,
  Star,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Lightweight Job types matching our API shape
export type Job = {
  id?: number | string;
  title: string;
  description?: string | null;
  jd?: string | null;
  location?: string | null;
  company?: string | null;
  // Optional enriched company info from API join
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
  // Optional UI-centric fields (read from metadata if present)
  labels?: string[] | null; // e.g. ["Grant", "New"]
  skills?: string[] | null; // e.g. ["JavaScript", "Java", "HTML"]
  remote?: boolean | null; // Work from anywhere
  work_anytime?: boolean | null; // Flexible schedule
  hours_per_week?: number | string | null; // e.g. 40
  url?: string | null; // Apply / view link
};

// Minimal Company type used for grouped render
export type Company = {
  id?: number | string;
  name?: string | null;
  website?: string | null;
  logo_url?: string | null;
  location?: string | null;
  industry?: string | null;
  size?: string | null;
  description?: string | null;
};

// Using prebuilt UI components from components/ui

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
      <BadgeCheck className="h-3 w-3" /> {text}
    </Badge>
  );
}

function JobCard({ job }: { job: Job }) {
  // Render-safe company name: supports either a string or an object with a name field
  const companyName = (() => {
    const c: any = (job as any).company;
    if (!c) return "Unknown company";
    if (typeof c === "string") return c;
    if (typeof c === "object") return c?.name ?? "Unknown company";
    return "Unknown company";
  })();
  const info: any = (job as any).company_info || (typeof (job as any).company === 'object' ? (job as any).company : null);
  const displayLocation = job.location || info?.location || null;
  const jdText = job.jd ?? null;
  const md = job.metadata || {};
  const labels: string[] = Array.isArray(job.labels) ? job.labels as string[] : (Array.isArray((md as any).labels) ? (md as any).labels : []);
  const skills: string[] = Array.isArray(job.skills) ? job.skills as string[] : (Array.isArray((md as any).skills) ? (md as any).skills : []);
  const remote: boolean = typeof job.remote === 'boolean' ? !!job.remote : !!(md as any).remote;
  const workAny: boolean = typeof job.work_anytime === 'boolean' ? !!job.work_anytime : !!(md as any).work_anytime;
  const hpw: any = job.hours_per_week ?? (md as any).hours_per_week ?? null;
  const url: string | null = (job as any).url ?? (md as any).url ?? null;
  const defaultOpen = !!jdText && jdText.length <= 1000;
  return (
    <Card className="p-6">
      {/* Top row: left main + right actions */}
      <div className="flex items-start justify-between gap-3">
        {/* Left main column */}
        <div className="min-w-0 flex-1">
          {/* Labels row */}
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

          {/* Title */}
          <h3 className="truncate text-lg font-semibold text-foreground">{job.title}</h3>

          {/* Company + basics */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/80">
            {/* Company logo */}
            <Avatar className="size-7">
              {info?.logo_url ? (
                <AvatarImage src={info.logo_url} alt={companyName} />
              ) : null}
              <AvatarFallback className="text-[10px] font-medium uppercase">
                {companyName?.[0] ?? 'C'}
              </AvatarFallback>
            </Avatar>
            {info?.website ? (
              <a
                href={info.website}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:underline"
                title={info.website}
              >
                {companyName}
              </a>
            ) : (
              <span>{companyName}</span>
            )}

            {/* Job quick facts */}
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

          {/* Skills */}
          {skills?.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {skills.slice(0, 6).map((s, i) => (
                <SkillTag key={i} text={s} />
              ))}
            </div>
          ) : null}

          {/* Description preview */}
          {job.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">{job.description}</p>
          ) : null}
        </div>

        {/* Right column: actions + salary + CTA */}
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

      {/* Expandable JD */}
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

// Helper: short date like "Jan 18th"
function shortDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CompanyJobsBlock({ company, jobs, meta }: { company?: Company | null; jobs: Job[]; meta?: any }) {
  const info: Company = company ?? (jobs?.[0]?.company_info as any) ?? {};
  const name = info?.name ?? (typeof (jobs?.[0] as any)?.company === 'string' ? (jobs?.[0] as any)?.company : undefined) ?? "Company";
  const website = info?.website ?? null;
  const logo = info?.logo_url ?? null;
  const location = info?.location ?? null;
  const size = info?.size ?? null;
  const industry = info?.industry ?? null;
  const desc = info?.description ?? null;

  const total = meta?.total ?? jobs?.length ?? 0;
  const showing = jobs?.length ?? 0;
  const page = meta?.page ?? 1;
  const perPage = meta?.perPage ?? showing;

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-10">
            {logo ? <AvatarImage src={logo} alt={name ?? "Company"} /> : null}
            <AvatarFallback className="text-[12px] font-medium uppercase">{name?.[0] ?? 'C'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {website ? (
                <a href={website} target="_blank" rel="noreferrer noopener" className="truncate text-base font-semibold text-foreground hover:underline">
                  {name}
                </a>
              ) : (
                <span className="truncate text-base font-semibold text-foreground">{name}</span>
              )}
            </div>
            {desc ? (
              <div className="mt-1 line-clamp-2 text-sm text-foreground/70">{desc}</div>
            ) : null}

            {/* Tags */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {size ? (
                <Badge className="bg-violet-500/20 text-violet-900 dark:text-violet-50 border-violet-500/40">{size}</Badge>
              ) : null}
              {industry ? (
                <Badge className="bg-sky-500/20 text-sky-900 dark:text-sky-50 border-sky-500/40">{industry}</Badge>
              ) : null}
              {location ? (
                <Badge className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-50 border-emerald-500/40">{location}</Badge>
              ) : null}
            </div>
          </div>
        </div>
        {website ? (
          <a href={website} target="_blank" rel="noreferrer noopener" className="text-sm font-medium text-fuchsia-300 hover:underline">
            Jobs website
          </a>
        ) : null}
      </div>

      {/* Jobs list */}
      <div className="mt-4 divide-y divide-white/10 rounded-md border border-white/10">
        {jobs?.slice(0, perPage || 5).map((j, i) => {
          const t = j.title ?? "Untitled role";
          const where = j.location ?? (j.metadata as any)?.location ?? (j as any)?.company_info?.location ?? null;
          const date = shortDate(j.created_at ?? null);
          const link = (j as any).url ?? (j.metadata as any)?.url ?? null;
          return (
            <div key={(j.id as any) ?? i} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{t}</div>
                <div className="mt-0.5 text-xs text-foreground/60 flex items-center gap-2">
                  {where ? <span>{where}</span> : null}
                  {date ? (
                    <>
                      {where ? <span className="text-foreground/30">·</span> : null}
                      <span>{date}</span>
                    </>
                  ) : null}
                </div>
              </div>
              {link ? (
                <a href={link} target="_blank" rel="noreferrer noopener" className="text-foreground/70 hover:text-foreground" title="Open job">
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-foreground/30"><ExternalLink className="h-4 w-4" /></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
        <div>
          Jobs: {Math.min(showing, perPage || showing)}{total ? ` out of ${total}` : ""}
        </div>
        {meta?.totalPages && page < meta.totalPages ? (
          <div className="text-fuchsia-300">Next page ▶</div>
        ) : null}
      </div>
    </Card>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const name = company?.name ?? "Company";
  const website = company?.website ?? null;
  const logo = company?.logo_url ?? null;
  const location = company?.location ?? null;
  const size = company?.size ?? null;
  const industry = company?.industry ?? null;
  const desc = company?.description ?? null;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-10">
            {logo ? <AvatarImage src={logo} alt={name ?? "Company"} /> : null}
            <AvatarFallback className="text-[12px] font-medium uppercase">{name?.[0] ?? 'C'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {website ? (
                <a href={website} target="_blank" rel="noreferrer noopener" className="truncate text-base font-semibold text-foreground hover:underline">
                  {name}
                </a>
              ) : (
                <span className="truncate text-base font-semibold text-foreground">{name}</span>
              )}
            </div>
            {desc ? (
              <div className="mt-1 text-sm leading-relaxed text-foreground/70">{desc}</div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {size ? (
                <Badge className="bg-violet-500/20 text-violet-900 dark:text-violet-50 border-violet-500/40">{size}</Badge>
              ) : null}
              {industry ? (
                <Badge className="bg-sky-500/20 text-sky-900 dark:text-sky-50 border-sky-500/40">{industry}</Badge>
              ) : null}
              {location ? (
                <Badge className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-50 border-emerald-500/40">{location}</Badge>
              ) : null}
            </div>
          </div>
        </div>
        {website ? (
          <a href={website} target="_blank" rel="noreferrer noopener" className="text-sm font-medium text-fuchsia-300 hover:underline">
            Visit website
          </a>
        ) : null}
      </div>
    </Card>
  );
}

function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs?.length) {
    return <div className="text-sm text-foreground/60">No jobs to display.</div>;
  }
  return (
    <div className="grid gap-3">
      {jobs.map((job, idx) => (
        <JobCard key={(job.id as any) ?? idx} job={job} />
      ))}
    </div>
  );
}

export default function JobsGenerativeUI() {
  // Render a single job card (frontend tool with render-only behavior)
  useFrontendTool({
    name: "renderJobCard",
    description: "Render a single job as a nice card in the chat UI.",
    parameters: [
      {
        name: "job",
        type: "object",
        description: "A job object with title, company, location, type, salary, description, etc.",
        required: true,
      },
    ],
    // No-op handler; this is a render-only tool
  handler: async ({ job }: { job: any }) => ({ job }),
    render: (payload: any) => {
        console.log('render job card', payload);
      const { status, args } = payload || {};
      if (status === "inProgress") {
        return (
          <Card>
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-16 w-full animate-pulse rounded bg-white/5" />
          </Card>
        );
      }
      const job = (args as any)?.job as Job;
      if (!job || typeof job !== "object") {
        return <div className="text-sm text-red-400">Invalid job payload.</div>;
      }
      return <JobCard job={job} />;
    },
  });

  // Render a grouped company + jobs block, similar to a job board company section
  useFrontendTool({
    name: "renderCompanyJobs",
    description:
      "Render a company's available jobs as a grouped block (company header + list of roles). Pass jobs from searchCompanyJobs and optionally the company info.",
    parameters: [
      {
        name: "company",
        type: "object",
        description: "Company object (optional). If omitted, will use jobs[0].company_info if present.",
        required: false,
      },
      {
        name: "jobs",
        type: "object[]",
        description: "Array of job objects, e.g., items from searchCompanyJobs.",
        required: true,
      },
      {
        name: "meta",
        type: "object",
        description: "Optional pagination meta from the API (page, perPage, total, totalPages).",
        required: false,
      },
    ],
    // No-op logic; this is primarily render-only
    handler: async ({ company, jobs, meta }: { company?: Company; jobs: Job[]; meta?: any }) => ({ company, jobs, meta }),
    render: (payload: any) => {
      const { status, args } = payload || {};
      if (status === "inProgress") {
        return (
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-white/5" />
              <div className="h-10 w-full animate-pulse rounded bg-white/5" />
              <div className="h-10 w-full animate-pulse rounded bg-white/5" />
            </div>
          </Card>
        );
      }
      const company = (args as any)?.company as Company | undefined;
      const jobs = ((args as any)?.jobs as Job[]) || [];
      const meta = (args as any)?.meta;
      if (!Array.isArray(jobs)) {
        return <div className="text-sm text-red-400">Invalid jobs payload.</div>;
      }
      return <CompanyJobsBlock company={company} jobs={jobs} meta={meta} />;
    },
  });

  // Render a single company card (frontend tool with render-only behavior)
  useFrontendTool({
    name: "renderCompanyCard",
    description: "Render a single company's information as a card in the chat UI.",
    parameters: [
      {
        name: "company",
        type: "object",
        description: "Company object with name, website, logo_url, location, industry, size, description.",
        required: true,
      },
    ],
    // No-op handler; render-only tool
    handler: async ({ company }: { company: Company }) => ({ company }),
    render: (payload: any) => {
      const { status, args } = payload || {};
      if (status === "inProgress") {
        return (
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          </Card>
        );
      }
      const company = (args as any)?.company as Company | undefined;
      if (!company || typeof company !== "object") {
        return <div className="text-sm text-red-400">Invalid company payload.</div>;
      }
      return <CompanyCard company={company} />;
    },
  });

  // Render a list of jobs as multiple cards (frontend tool with render-only behavior)
  useFrontendTool({
    name: "renderJobList",
    description: "Render a list of jobs as cards in the chat UI.",
    parameters: [
      {
        name: "jobs",
        type: "object[]",
        description: "Array of job objects. Use the output of the searchJobs tool.",
        required: true,
      },
    ],
    // No-op handler; this is a render-only tool
  handler: async ({ jobs }: { jobs: any[] }) => ({ jobs }),
    render: (payload: any) => {
        console.log('render list jobs', payload)
      const { status, args } = payload || {};
      if (status === "inProgress") {
        return (
          <div className="grid gap-3">
            <Card>
              <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-16 w-full animate-pulse rounded bg-white/5" />
            </Card>
            <Card>
              <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-16 w-full animate-pulse rounded bg-white/5" />
            </Card>
          </div>
        );
      }
      const raw = args as any;
      let arr: Job[] = [];
      if (Array.isArray(raw)) {
        arr = raw as Job[];
      } else if (Array.isArray(raw?.jobs)) {
        arr = raw.jobs as Job[];
      } else if (Array.isArray(raw?.items)) {
        // Accept the entire searchJobs response object
        arr = raw.items as Job[];
      } else if (Array.isArray(raw?.data)) {
        // Accept generic { data: Job[] }
        arr = raw.data as Job[];
      }
      return <JobList jobs={arr} />;
    },
  });

  return null;
}
