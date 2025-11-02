"use client";

import { useEffect, useMemo, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import JobsTools from "@/components/copilot/jobs-tools";
import JobsGenerativeUI from "@/components/copilot/jobs-generative-ui";
import { createClient } from "@/utils/supabase/client";
import LogoutButton from "@/components/auth/logout-button";

export default function RecruiterChatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<string>("recruiter");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      if (ignore) return;
      const r = (userData?.user?.user_metadata as any)?.account_role ?? "recruiter";
      setRole(r);
      setToken(sessionData?.session?.access_token ?? null);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const instructions = `You are an AI assistant helping a recruiter create and search job postings, and find candidates.
User role: ${role}.
Suggest sourcing strategies, screening criteria, and candidate outreach messages.
Always keep responses recruiter-focused.

TOOLS USAGE GUIDELINES (IMPORTANT):
- To search jobs, use the frontend tool: searchJobs({ q?: string, page?: number, limit?: number }). Summarize returned items for the user.
- To search companies, use: searchCompanies({ q?: string, industry?: string, location?: string, page?: number, limit?: number }).
- To list jobs for a specific company, use: searchCompanyJobs({ companyIdOrName: string, q?: string, page?: number, limit?: number }).
- To create a job, use the frontend tool: createJob({ title: string, description?: string, location?: string, company?: string, type?: string, salary?: string, metadata?: object }).
  * title is required; validate minimal inputs with the user if missing.
  * After creation, confirm the job details back to the user.
- If a creation attempt fails with Forbidden (403), inform the user they must be a recruiter to create jobs.
RENDERING RESULTS:
- If search returns exactly 1 job, call renderJobCard({ job }).
- If search returns multiple jobs, call renderJobList({ jobs }).
- When showing a company’s openings, call renderCompanyJobs({ company?, jobs, meta? }). Pass the company if you have it, otherwise rely on jobs[0].company_info.`;

  return (
    <div className="flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-white/10 p-4">
        <h1 className="text-lg font-semibold">Candidate Finder Chat</h1>
        <div className="flex items-center gap-3">
          <div className="text-xs text-foreground/60">
            Role: <span className="font-medium">{role}</span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 px-2 sm:p-4">
        <div className="mx-auto max-w-4xl">
          <JobsTools />
          <JobsGenerativeUI />
          <CopilotChat
            className="h-[calc(100vh-13rem)]"
            instructions={instructions}
            labels={{ title: "Recruiter Copilot", initial: "Hi! What role are you hiring for?" }}
          />
          {/* <div className="mt-3 text-xs text-foreground/50">
            {token ? (
              <span>Session loaded. Token available in component state (hidden).</span>
            ) : (
              <span>No session token yet.</span>
            )}
          </div> */}
        </div>
      </main>
    </div>
  );
}
