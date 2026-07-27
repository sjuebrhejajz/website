import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const rows = await db.select().from(user).where(eq(user.name, params.username)).limit(1)
  const p = rows[0]
  if (!p) return <main className="p-8">Profile not found</main>

  const links = p.links ? JSON.parse(p.links) : []
  const theme = p.theme ? JSON.parse(p.theme) : { accent: '#60a5fa' }

  return (
    <main className="min-h-dvh p-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="mb-4">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.displayName || p.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="mx-auto mb-2 h-24 w-24 rounded-full bg-secondary/30" />
            )}
          </div>
          <h1 className="text-2xl font-semibold">{p.displayName || p.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>

          <div className="mt-6 flex flex-col gap-3">
            {links.map((l: any, i: number) => (
              <a key={i} href={l.url} className="rounded-lg border border-border px-4 py-3 text-left hover:bg-muted/20">
                <div className="text-sm font-medium">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.url}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
