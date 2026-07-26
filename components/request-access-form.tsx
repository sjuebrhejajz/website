'use client'

import { useActionState } from 'react'
import { submitAccessRequest, type RequestState } from '@/app/actions/access'

const initialState: RequestState = {}

export function RequestAccessForm() {
  const [state, formAction, pending] = useActionState(
    submitAccessRequest,
    initialState,
  )

  if (state.ok) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckIcon />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">
          Request received
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          Your request is now in the queue. If approved, you&apos;ll be contacted
          at the email you provided.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
          Desired username
        </label>
        <div className="flex items-center rounded-lg border border-input bg-secondary/40 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
          <span className="pl-3 font-mono text-sm text-muted-foreground">
            uncertain.uk/
          </span>
          <input
            id="username"
            name="username"
            required
            autoComplete="off"
            placeholder="yourname"
            className="w-full bg-transparent px-1 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reason" className="text-xs font-medium text-muted-foreground">
          Why do you want in? <span className="text-muted-foreground/50">(optional)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          placeholder="Tell us a bit about yourself…"
          className="w-full resize-none rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Submitting…' : 'Request access'}
      </button>
      <p className="text-center text-xs text-muted-foreground/70 text-pretty">
        Access is manually reviewed. Not everyone gets in.
      </p>
    </form>
  )
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
