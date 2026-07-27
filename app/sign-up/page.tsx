import Link from 'next/link'
import React, { Suspense } from 'react'
import { SignUpForm } from '@/components/signup-form'

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center font-mono text-sm font-semibold text-foreground"
        >
          uncertain<span className="text-primary">.uk</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-card-foreground">Create account</h1>
          <p className="mb-5 mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
            Only approved requests or whitelisted emails may create an account. Provide the email you used when requesting access.
          </p>
          <Suspense fallback={<div aria-hidden />}> 
            <SignUpForm />
          </Suspense>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
