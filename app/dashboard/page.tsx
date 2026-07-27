import React, { Suspense } from 'react'
import Link from 'next/link'
import { ProfileEditor } from '@/components/profile-editor'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { session, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Server-side auth: check cookies against session tokens in DB.
  const ck = cookies()
  const all = ck.getAll().map((c) => c.value)
  let currentUser: any = null

  for (const val of all) {
    if (!val) continue
    const rows = await db
      .select()
      .from(session)
      .where(eq(session.token, val))
      .limit(1)
    const s = rows[0]
    if (s) {
      const users = await db.select().from(user).where(eq(user.id, s.userId)).limit(1)
      currentUser = users[0]
      break
    }
  }

  if (!currentUser) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-dvh p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link href="/" className="text-sm text-muted-foreground">Home</Link>
        </header>

        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit profile</h2>
          <Suspense fallback={<div>Loading editor…</div>}>
            <ProfileEditor />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
