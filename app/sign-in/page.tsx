import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { AdminAuthForm } from '@/components/admin-auth-form'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/admin')

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
          <h1 className="text-lg font-semibold text-card-foreground">Admin sign in</h1>
          <p className="mb-5 mt-1 text-xs text-muted-foreground">
            Restricted area. Whitelisted operators only.
          </p>
          <AdminAuthForm mode="sign-in" />
        </div>
      </div>
    </main>
  )
}
