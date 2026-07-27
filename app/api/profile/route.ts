import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const username = url.searchParams.get('username')
    if (!username) return NextResponse.json({ error: 'missing_username' }, { status: 400 })

    const rows = await db.select().from(user).where(eq(user.name, username)).limit(1)
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    return NextResponse.json({ profile: row })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, displayName, bio, avatarUrl, links, theme } = body
    if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 })

    await db
      .update(user)
      .set({
        displayName: displayName ?? null,
        bio: bio ?? null,
        avatarUrl: avatarUrl ?? null,
        links: links ? JSON.stringify(links) : null,
        theme: theme ? JSON.stringify(theme) : null,
      })
      .where(eq(user.email, email))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
