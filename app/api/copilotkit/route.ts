import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const runtime = new CopilotRuntime();
  const serviceAdapter = new GoogleGenerativeAIAdapter({ model: "gemini-2.5-flash" });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
