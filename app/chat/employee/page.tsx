"use client";

import { useEffect, useMemo, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import JobsTools from "@/components/copilot/jobs-tools";
import JobsGenerativeUI from "@/components/copilot/jobs-generative-ui";
import { createClient } from "@/utils/supabase/client";
import LogoutButton from "@/components/auth/logout-button";

export default function EmployeeChatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<string>("employee");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      if (ignore) return;
      const r = (userData?.user?.user_metadata as any)?.account_role ?? "employee";
      setRole(r);
      setToken(sessionData?.session?.access_token ?? null);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const instructions = `You are an AI assistant helping an employee find jobs.
User role: ${role}.
If the role is not employee, still assist with job search but prefer employee-centric responses.
Provide tailored job search strategies, resume tips, and relevant openings.

TOOLS USAGE GUIDELINES (IMPORTANT):
- To search jobs, ALWAYS use the frontend tool: searchJobs({ q?: string, page?: number, limit?: number }).
  * q is optional free text (matches title, description, company, location). If omitted, fetch latest jobs.
  * Use sensible defaults: page=1, limit=10 unless the user requests otherwise.
- To search companies, use: searchCompanies({ q?: string, industry?: string, location?: string, page?: number, limit?: number }).
- To list jobs for a specific company, use: searchCompanyJobs({ companyIdOrName: string, q?: string, page?: number, limit?: number }).
- NEVER invent job results. Always call searchJobs to retrieve them, then summarize for the user.
- Do NOT attempt to create jobs as an employee. If the user asks to create a job, explain only recruiters can create jobs.
RENDERING RESULTS:
- If search returns exactly 1 job, call renderJobCard({ job }).
- If search returns multiple jobs, call renderJobList({ jobs }).
- When presenting available jobs of one company, call renderCompanyJobs({ company?, jobs, meta? }). Prefer passing the company object if available (from companies search), or rely on jobs[0].company_info.`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-white/10 p-4">
        <h1 className="text-lg font-semibold">Job Finder Chat</h1>
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
            className="h-full"
            instructions={instructions}
            labels={{ title: "Career Copilot", initial: "Hi! Tell me about the roles you’re targeting." }}
          />
        </div>
      </main>
    </div>
  );
}
