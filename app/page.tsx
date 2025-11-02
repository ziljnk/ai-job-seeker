import Link from "next/link";

export default function Page() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background text-foreground">
			<div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
			<div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

			<section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-16 px-6 py-24">
				<div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
					<div className="space-y-6">
						<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
							AI Job Seeker
						</span>
						<h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
							Your AI co-pilot for landing dream roles faster
						</h1>
						<p className="max-w-xl text-lg text-foreground/70">
							Craft laser-focused resumes, surface hidden opportunities, and train with adaptive interview simulations tailored to your target companies. Centralize your job hunt and let our AI assistant do the heavy lifting.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href="/signup"
								className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
							>
								Get started
							</Link>
							<Link
								href="/login"
								className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
							>
								Sign in
							</Link>
						</div>
						<ul className="grid gap-4 pt-8 text-sm text-foreground/70 sm:grid-cols-2">
							<li className="rounded-2xl border border-white/5 bg-white/5 p-4">
								<span className="text-emerald-300">▲</span> AI-crafted resumes aligned to each job posting
							</li>
							<li className="rounded-2xl border border-white/5 bg-white/5 p-4">
								<span className="text-emerald-300">▲</span> Live tracking for applications, referrals, and interviews
							</li>
							<li className="rounded-2xl border border-white/5 bg-white/5 p-4">
								<span className="text-emerald-300">▲</span> Smart interview drills with instant feedback
							</li>
							<li className="rounded-2xl border border-white/5 bg-white/5 p-4">
								<span className="text-emerald-300">▲</span> Curated opportunity feed across job boards
							</li>
						</ul>
					</div>

					<div className="relative hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur lg:flex lg:flex-col lg:gap-6">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Live insights</p>
							<h2 className="text-2xl font-semibold text-foreground">This week&apos;s wins</h2>
						</div>
						<div className="space-y-4 text-sm text-foreground/80">
							<div className="rounded-2xl border border-white/5 bg-background/60 p-4">
								<p className="font-semibold text-foreground">14 tailored intros</p>
								<p className="text-foreground/60">Matched via shared alumni networks</p>
							</div>
							<div className="rounded-2xl border border-white/5 bg-background/60 p-4">
								<p className="font-semibold text-foreground">9 interview preps</p>
								<p className="text-foreground/60">AI coached mock interviews completed</p>
							</div>
							<div className="rounded-2xl border border-white/5 bg-background/60 p-4">
								<p className="font-semibold text-foreground">4 accepted offers</p>
								<p className="text-foreground/60">Users hired in the last 7 days</p>
							</div>
						</div>
						<p className="text-xs text-foreground/60">
							Built to empower ambitious professionals navigating the AI-driven job landscape.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
