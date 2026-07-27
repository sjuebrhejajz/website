import React, { Suspense } from 'react'
import Link from 'next/link'
import { ProfileEditor } from '@/components/profile-editor'

export default function DashboardPage() {
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
