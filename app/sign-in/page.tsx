import Link from 'next/link'
import { SignInForm } from '@/components/signin-form'

export default function SignInPage() {
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
          <h1 className="text-lg font-semibold text-card-foreground">Sign in</h1>
          <p className="mb-5 mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
            Sign in with a whitelisted email or an account that was previously approved.
          </p>
          <SignInForm />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need an account?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
