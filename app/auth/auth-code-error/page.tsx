export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white/5 p-10 text-center shadow-xl ring-1 ring-white/10 backdrop-blur">
        <h1 className="text-2xl font-semibold">Authentication error</h1>
        <p className="text-sm text-foreground/70">
          We couldn't verify your link. It may have expired or already been used.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Go to sign in
        </a>
      </div>
    </div>
  );
}
