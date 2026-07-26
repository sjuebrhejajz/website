import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { ADMIN_EMAIL } from '@/lib/config'
import { getAccessRequests } from '@/app/actions/access'
import { RequestsTable } from '@/components/requests-table'
import { SignOutButton } from '@/components/sign-out-button'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  // Gate: must be signed in AND be the whitelisted admin email.
  if (!session?.user) redirect('/sign-in')
  if (session.user.email.toLowerCase() !== ADMIN_EMAIL) redirect('/')

  const requests = await getAccessRequests()
  const pending = requests.filter((r) => r.status === 'pending').length
  const approved = requests.filter((r) => r.status === 'approved').length

  return (
    <main className="relative min-h-dvh px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-sm font-semibold text-foreground">
              uncertain<span className="text-primary">.uk</span> / admin
            </h1>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <SignOutButton />
        </header>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Total" value={requests.length} />
          <Stat label="Pending" value={pending} />
          <Stat label="Approved" value={approved} />
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Access requests
          </h2>
          <RequestsTable requests={requests} />
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
