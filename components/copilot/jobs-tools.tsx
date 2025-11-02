"use client";

import { useFrontendTool, useHumanInTheLoop } from "@copilotkit/react-core";
import { useMemo, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/axios";

// Registers Copilot frontend tools for job search and job creation.
// Include <JobsTools /> once on pages where <CopilotChat /> is used.
export default function JobsTools() {
  // Human-in-the-loop form for job creation
  // The AI should call this to collect/confirm fields before invoking createJob.
  useHumanInTheLoop({
    name: "jobCreationForm",
    description:
      "Render a form to collect missing fields when the user wants to create a job. After submission, continue by calling the createJob tool with the returned values.",
    // Use array-style parameters for compatibility with current library typings.
    parameters: [
      { name: "title", type: "string", required: false, description: "Job title (required to create)" },
      { name: "company", type: "string", required: false, description: "Company name" },
      { name: "location", type: "string", required: false, description: "Location (e.g., Remote, City, Country)" },
      { name: "type", type: "string", required: false, description: "Employment type (e.g., full-time, contract)" },
      { name: "salary", type: "string", required: false, description: "Salary range or amount" },
      { name: "description", type: "string", required: false, description: "Short description for the listing" },
      { name: "jd", type: "string", required: false, description: "Full job description / responsibilities" },
    ],
    render: (props: any) => {
      const { args, status, respond, result } = props || {};
      // Initialize local form state from provided args (which may be partial)
      const [form, setForm] = useState<{ [k: string]: any }>(() => ({
        title: (args as any)?.title ?? "",
        company: (args as any)?.company ?? "",
        location: (args as any)?.location ?? "",
        type: (args as any)?.type ?? "",
        salary: (args as any)?.salary ?? "",
        description: (args as any)?.description ?? "",
        jd: (args as any)?.jd ?? "",
      }));

      if (status === "executing" && respond) {
        const onChange = (key: string) =>
          (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));

        const onSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          // Minimal validation: title required for creation
          if (!form.title || String(form.title).trim().length === 0) {
            // Simple inline guard; in a fuller app, show a toast or message
            alert("Please provide a job title.");
            return;
          }
          // Normalize salary empty string to undefined
          const payload = {
            ...form,
            salary:
              form.salary === "" || form.salary === null || typeof form.salary === "undefined"
                ? undefined
                : form.salary,
          };
          respond(payload);
        };

        return (
          <div className="p-4 border rounded-md bg-background text-foreground max-w-xl">
            <h3 className="text-base font-semibold mb-3">Create a Job</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fill out the details below. After you submit, I will create the job with these values.
            </p>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.title}
                  onChange={onChange("title")}
                  placeholder="e.g., Senior Frontend Engineer"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.company}
                    onChange={onChange("company")}
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.location}
                    onChange={onChange("location")}
                    placeholder="Remote or City, Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.type}
                    onChange={onChange("type")}
                    placeholder="Full-time, Contract, Internship"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.salary}
                    onChange={onChange("salary")}
                    placeholder="$120k–$150k or 80€/h"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-20"
                  value={form.description}
                  onChange={onChange("description")}
                  placeholder="A few lines about the role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Job Description (JD)</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-36"
                  value={form.jd}
                  onChange={onChange("jd")}
                  placeholder="Responsibilities, requirements, benefits..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => respond({ cancelled: true })}
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      }

      if (status === "complete") {
        return (
          <div className="p-2 text-sm text-muted-foreground">
            {result?.cancelled ? "Cancelled" : "Submitted job details."}
          </div>
        );
      }

      // In the inProgress phase, arguments may be streaming; show a minimal placeholder.
      return <div className="p-2 text-sm text-muted-foreground">Preparing job form…</div>;
    },
  });

  // Search Jobs tool
  useFrontendTool({
    name: "searchJobs",
    description:
      "Search for jobs. Optional text query 'q' (matches title, description, company, location). Supports 'page' and 'limit'. Returns a concise list.",
    parameters: [
      {
        name: "q",
        type: "string",
        description: "Free-text query; leave empty to fetch latest jobs.",
        required: false,
      },
      {
        name: "page",
        type: "number",
        description: "Page number (1-based). Default 1.",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Items per page (default 10, max 100).",
        required: false,
      },
    ],
    handler: async ({ q, page, limit }: { q?: string; page?: number; limit?: number }) => {
      const params: Record<string, any> = {};
      if (q) params.q = q;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const { data } = await api.get("/api/jobs", { params });
      const items = Array.isArray(data?.data) ? data.data : [];
      const meta = data?.meta ?? {};

      // Return a concise summary plus raw items for follow-up reasoning
      const summaryLines = items.map((j: any) => {
        const parts = [j.title, j.company, j.location].filter(Boolean);
        return `• ${parts.join(" — ")}`;
      });

      return {
        message: `Found ${meta?.total ?? items.length} jobs (showing ${summaryLines.length}).\n` + summaryLines.join("\n"),
        items,
        jobs: items, // convenience alias to match renderJobList({ jobs })
        meta,
      } as any;
    },
  });

  // Create Job tool (recruiter only)
  useFrontendTool({
    name: "createJob",
    description:
      "Create a new job (recruiter only). Provide at least a non-empty 'title'. Optional: description, location, company, type, salary, metadata.",
    parameters: [
      { name: "title", type: "string", description: "Job title", required: true },
      { name: "description", type: "string", description: "Job description", required: false },
      { name: "location", type: "string", description: "Location (e.g., Remote, City, Country)", required: false },
      { name: "company", type: "string", description: "Company name", required: false },
      { name: "type", type: "string", description: "Employment type (e.g., full-time, contract)", required: false },
      { name: "salary", type: "string", description: "Salary range or amount", required: false },
      { name: "metadata", type: "object", description: "Arbitrary JSON metadata for the job", required: false },
    ],
    handler: async (input: Record<string, any>) => {
      try {
        const { data } = await api.post("/api/jobs", input);
        const job = data?.data ?? null;
        return {
          message: job ? `Job created: ${job.title} at ${job.company ?? "(company not specified)"}.` : "Job created.",
          job,
        } as any;
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Failed to create job";
        // Throwing will surface as an error in the copilot tool execution output
        throw new Error(msg);
      }
    },
  });

  // Search Companies tool
  useFrontendTool({
    name: "searchCompanies",
    description:
      "Search for companies. Optional text query 'q' (matches name, description, industry, location). Supports 'industry', 'location', 'page', and 'limit'. Returns a concise list.",
    parameters: [
      {
        name: "q",
        type: "string",
        description: "Free-text query across name, description, industry, location.",
        required: false,
      },
      {
        name: "industry",
        type: "string",
        description: "Filter by industry (partial match).",
        required: false,
      },
      {
        name: "location",
        type: "string",
        description: "Filter by location (partial match).",
        required: false,
      },
      {
        name: "page",
        type: "number",
        description: "Page number (1-based). Default 1.",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Items per page (default 10, max 100).",
        required: false,
      },
    ],
    handler: async ({ q, industry, location, page, limit }: { q?: string; industry?: string; location?: string; page?: number; limit?: number }) => {
      const params: Record<string, any> = {};
      if (q) params.q = q;
      if (industry) params.industry = industry;
      if (location) params.location = location;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const { data } = await api.get("/api/companies", { params });
      const items = Array.isArray(data?.data) ? data.data : [];
      const meta = data?.meta ?? {};

      const summaryLines = items.map((c: any) => {
        const parts = [c.name, c.industry, c.location].filter(Boolean);
        return `• ${parts.join(" — ")}`;
      });

      return {
        message:
          `Found ${meta?.total ?? items.length} companies (showing ${summaryLines.length}).\n` +
          summaryLines.join("\n"),
        items,
        companies: items,
        meta,
      } as any;
    },
  });

  // Search Jobs for a Company tool
  useFrontendTool({
    name: "searchCompanyJobs",
    description:
      "Search available jobs for a specific company. Provide 'companyIdOrName' (UUID or company name). Optional 'q', 'page', and 'limit'.",
    parameters: [
      {
        name: "companyIdOrName",
        type: "string",
        description: "Company UUID (preferred) or company name to match.",
        required: true,
      },
      {
        name: "q",
        type: "string",
        description: "Free-text query across job title, description, location, type.",
        required: false,
      },
      {
        name: "page",
        type: "number",
        description: "Page number (1-based). Default 1.",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Items per page (default 10, max 100).",
        required: false,
      },
    ],
    handler: async ({ companyIdOrName, q, page, limit }: { companyIdOrName: string; q?: string; page?: number; limit?: number }) => {
      if (typeof companyIdOrName !== "string" || companyIdOrName.trim().length === 0) {
        throw new Error("'companyIdOrName' is required and must be a non-empty string.");
      }

      const params: Record<string, any> = {};
      if (q) params.q = q;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const path = `/api/companies/${encodeURIComponent(companyIdOrName)}/jobs`;
      const { data } = await api.get(path, { params });
      const items = Array.isArray(data?.data) ? data.data : [];
      const meta = data?.meta ?? {};

      const summaryLines = items.map((j: any) => {
        const parts = [j.title, j.company ?? j?.company_info?.name, j.location].filter(Boolean);
        return `• ${parts.join(" — ")}`;
      });

      return {
        message:
          `Found ${meta?.total ?? items.length} jobs (showing ${summaryLines.length}).\n` +
          summaryLines.join("\n"),
        items,
        jobs: items,
        meta,
      } as any;
    },
  });

  return null;
}
