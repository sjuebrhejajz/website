import Link from 'next/link'
import { getRequestCount } from '@/app/actions/access'
import { RequestAccessForm } from '@/components/request-access-form'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const requestCount = await getRequestCount()

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/bg-grid.png)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            uncertain<span className="text-primary">.uk</span>
          </span>
          <Link
            href="/sign-in"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </header>

        {/* Hero */}
        <section className="mt-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Invite only
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground">
            One link.<br />Everything you are.
          </h1>
          <p className="mt-3 text-balance text-sm leading-relaxed text-muted-foreground">
            A modern, customizable bio-link for the ones who get in. Approval
            required — request your spot below.
          </p>

          {/* Live counter */}
          <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur">
            <CountUpDot />
            <span className="font-mono text-sm font-semibold text-foreground">
              {requestCount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {requestCount === 1 ? 'request received' : 'requests received'}
            </span>
          </div>
        </section>

        {/* Form card */}
        <section className="mt-10 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">
            Request access
          </h2>
          <RequestAccessForm />
        </section>

        <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground/60">
          {'© '}
          {new Date().getFullYear()}
          {' uncertain.uk — all requests reviewed manually.'}
        </footer>
      </div>
    </main>
  )
}

function CountUpDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  )
}
