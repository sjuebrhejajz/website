"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const normalizedEmail = email.trim().toLowerCase()

    setPending(true)
    try {
      // Check server-side whether this email has an approved access request.
      const res = await fetch('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      if (!res.ok) {
        setError('Could not verify access. Please try again later.')
        return
      }
      const data = await res.json()
      if (!data.approved) {
        setError('This email is not approved to create an account.')
        return
      }

      // Proceed with better-auth signup
      const { error } = await authClient.signUp.email({
        email: normalizedEmail,
        password,
        name: normalizedEmail.split('@')[0],
      })
      if (error) {
        setError(error.message ?? 'Could not create account.')
        return
      }

      router.push('/')
      router.refresh()
    } finally {
      setPending(false)
    }
  }
  const searchParams = useSearchParams()

  useEffect(() => {
    const q = searchParams?.get('email')
    if (q) setEmail(String(q).trim())
  }, [searchParams])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Please wait…' : 'Create account'}
      </button>
    </form>
  )
}
