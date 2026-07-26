'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { ADMIN_EMAIL } from '@/lib/config'

export function AdminAuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const isSignUp = mode === 'sign-up'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    // Client-side whitelist guard (also enforced on the server / by the
    // dashboard gate). Only the whitelisted admin email may create an account.
    if (isSignUp && normalizedEmail !== ADMIN_EMAIL) {
      setError('This email is not whitelisted to create an account.')
      return
    }

    setPending(true)
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email: normalizedEmail,
          password,
          name: 'Admin',
        })
        if (error) {
          setError(error.message ?? 'Could not create account.')
          return
        }
      } else {
        const { error } = await authClient.signIn.email({
          email: normalizedEmail,
          password,
        })
        if (error) {
          setError(error.message ?? 'Invalid credentials.')
          return
        }
      }
      router.push('/admin')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

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
          placeholder="insanity@uncertain.uk"
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
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
        {pending ? 'Please wait…' : isSignUp ? 'Create admin account' : 'Sign in'}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        {isSignUp ? (
          <>
            Already set up?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            First time?{' '}
            <Link href="/sign-up" className="text-primary hover:underline">
              Create admin account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
