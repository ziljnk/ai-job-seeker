"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { JobCard } from "@/components/jobs/job-card";

type Job = {
  id: string | number;
  title: string;
  description?: string | null;
  location?: string | null;
  company?: string | null;
  type?: string | null;
  created_at?: string | null;
  company_info?: {
    id: string | number;
    name?: string | null;
    website?: string | null;
    logo_url?: string | null;
    location?: string | null;
    industry?: string | null;
    size?: string | null;
  } | null;
};

type JobsResponse = {
  data: Job[];
  meta: {
    page: number;
    perPage: number;
    total: number | null;
    totalPages: number | null;
  };
};

const PER_PAGE = 10;

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<JobsResponse["meta"]>({ page: 1, perPage: PER_PAGE, total: null, totalPages: null });

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQ(input.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<JobsResponse>("/api/jobs", {
          params: { page, limit: PER_PAGE, q: q || undefined },
        });
        if (aborted) return;
        setJobs(data.data || []);
        setMeta(data.meta);
      } catch (e: any) {
        if (aborted) return;
        setError(e?.response?.data?.error || e?.message || "Failed to load jobs");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [page, q]);

  const totalPages = useMemo(() => meta.totalPages ?? (jobs.length < PER_PAGE && page === 1 ? 1 : undefined), [meta.totalPages, jobs.length, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Explore Jobs</h1>
        <div className="flex w-full max-w-md items-center gap-2">
          <Input
            placeholder="Search by title, company, location..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Search jobs"
          />
          <Button variant="outline" onClick={() => { setInput(""); setQ(""); setPage(1); }} disabled={!q && !input}>
            Clear
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading jobs...
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-sm text-muted-foreground">No jobs found.</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job as any} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Page {meta.page} {meta.total ? `of ${meta.totalPages}` : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>

          {typeof totalPages === "number" && totalPages > 1 ? (
            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const active = p === page;
                return (
                  <Button
                    key={p}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
          ) : null}

          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || (typeof totalPages === "number" ? page >= totalPages : jobs.length < PER_PAGE)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
