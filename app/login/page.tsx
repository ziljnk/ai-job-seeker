"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const providers = [
	{
		name: "Google",
		href: "#",
	},
];

export default function LoginPage() {
	const router = useRouter();
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	function fillCredentials(email: string, password: string) {
		try {
			setError(null);
			setInfo(null);
			const emailEl = document.getElementById("email") as
				HTMLInputElement | null;
			const passwordEl = document.getElementById("password") as
				HTMLInputElement | null;
			if (emailEl) emailEl.value = email;
			if (passwordEl) passwordEl.value = password;
			if (emailEl) emailEl.focus();
		} catch (e) {
			// no-op
		}
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			setInfo("Copied to clipboard");
			setTimeout(() => setInfo(null), 2000);
		} catch (e) {
			setError("Failed to copy to clipboard");
			setTimeout(() => setError(null), 2000);
		}
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setInfo(null);

		const form = e.currentTarget;
		const formData = new FormData(form);
		const email = String(formData.get("email") || "").trim();
		const password = String(formData.get("password") || "");

		try {
			if (!email || !password)
				throw new Error("Email and password are required");
			const { data, error: signInError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});
			if (signInError) throw signInError;
			// Fetch role to redirect appropriately
			const { data: userData } = await supabase.auth.getUser();
			const role = (userData?.user?.user_metadata as any)?.account_role;
			router.push(
				role === "recruiter" ? "/chat/recruiter" : "/chat/employee"
			);
		} catch (err: any) {
			setError(err?.message ?? "Unable to sign in.");
		} finally {
			setLoading(false);
		}
	}

	async function onForgotPassword(emailInputId = "email") {
		setError(null);
		setInfo(null);
		const emailEl = document.getElementById(
			emailInputId
		) as HTMLInputElement | null;
		const email = emailEl?.value.trim();
		if (!email) {
			setError("Enter your email first.");
			return;
		}
		const origin = window.location.origin;
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(
			email,
			{
				redirectTo: `${origin}/auth/confirm`,
			}
		);
		if (resetError) {
			setError(resetError.message);
		} else {
			setInfo("Check your email for a password reset link.");
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
			<div className="w-full max-w-md space-y-8 rounded-3xl bg-white/5 p-10 shadow-xl ring-1 ring-white/10 backdrop-blur">
				<div className="space-y-3 text-center">
					<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
						Welcome back
					</span>
					<h1 className="text-3xl font-semibold text-foreground">
						Sign in to your AI Job Seeker
					</h1>
					<p className="text-sm text-foreground/70">
						Access your tailored career insights, tracked
						applications, and smart interview prep.
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

					{/* Demo/Test accounts card */}
					<Card className="border-white/10 bg-white/5 text-foreground">
						<CardHeader>
							<CardTitle>Try a test account</CardTitle>
							<CardDescription>
								Use one of these ready-made accounts for a quick
								demo.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
								<div className="flex min-w-0 items-center gap-2">
									<Badge className="shrink-0">Recruiter</Badge>
									<div className="truncate text-sm">
										linhnd2805@gmail.com
									</div>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											fillCredentials(
												"linhnd2805@gmail.com",
												"123456"
											)
										}
									>
										Fill
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											copyToClipboard("linhnd2805@gmail.com")
										}
									>
										Copy email
									</Button>
								</div>
							</div>

							<div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
								<div className="flex min-w-0 items-center gap-2">
									<Badge variant="secondary" className="shrink-0">
										Employee
									</Badge>
									<div className="truncate text-sm">
										duy0000linh0000@gmail.com
									</div>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											fillCredentials(
												"duy0000linh0000@gmail.com",
												"123456"
											)
										}
									>
										Fill
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											copyToClipboard(
												"duy0000linh0000@gmail.com"
											)
										}
									>
										Copy email
									</Button>
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
								<div className="text-foreground/80">
									Password: <span className="font-medium">123456</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => copyToClipboard("123456")}
								>
									Copy password
								</Button>
							</div>
						</CardContent>
					</Card>

					<form className="space-y-5" onSubmit={onSubmit}>
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium text-foreground"
							>
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
							<label
								htmlFor="password"
								className="text-sm font-medium text-foreground"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="••••••••"
								className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
							/>
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="inline-flex items-center gap-2 text-foreground/70">
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-400 focus:ring-emerald-400"
								/>
								Remember me
							</label>
							<button
								type="button"
								onClick={() => onForgotPassword()}
								className="font-medium text-emerald-300 hover:text-emerald-200"
							>
								Forgot password?
							</button>
						</div>

						{error && (
							<p className="text-sm text-red-400">{error}</p>
						)}
						{info && (
							<p className="text-sm text-emerald-300">{info}</p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</form>
				</div>

				{/* <p className="text-center text-sm text-foreground/70">
					New to AI Job Seeker?{" "}
					<Link
						href="/signup"
						className="font-semibold text-emerald-300 hover:text-emerald-200"
					>
						Create an account
					</Link>
				</p> */}
			</div>
		</div>
	);
}
