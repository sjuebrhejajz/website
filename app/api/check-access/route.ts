import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accessRequest } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    if (!email) return NextResponse.json({ approved: false }, { status: 400 })

    const rows = await db
      .select()
      .from(accessRequest)
      .where(eq(accessRequest.email, email))
      .limit(1)

    const row = rows[0]
    if (row && row.status === 'approved') {
      return NextResponse.json({ approved: true })
    }

    return NextResponse.json({ approved: false })
  } catch (err) {
    return NextResponse.json({ approved: false, error: 'internal' }, { status: 500 })
  }
}
