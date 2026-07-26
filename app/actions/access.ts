'use server'

import { db } from '@/lib/db'
import { accessRequest } from '@/lib/db/schema'
import { postToDiscord } from '@/lib/discord'
import { count, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { ADMIN_EMAIL } from '@/lib/config'
import { revalidatePath } from 'next/cache'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_.-]{2,32}$/

export type RequestState = {
  ok?: boolean
  error?: string
}

// Public: submit an access request. Stores it in the DB, increments the total
// request count, and notifies the admin via the Discord webhook.
export async function submitAccessRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const username = String(formData.get('username') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const reason = String(formData.get('reason') ?? '').trim()

  if (!USERNAME_RE.test(username)) {
    return { error: 'Username must be 2-32 chars (letters, numbers, _ . -).' }
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (reason.length > 500) {
    return { error: 'Reason must be under 500 characters.' }
  }

  const hdrs = await headers()
  const ipAddress =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    null
  const userAgent = hdrs.get('user-agent') ?? null

  await db.insert(accessRequest).values({
    username,
    email,
    reason: reason || null,
    ipAddress,
    userAgent,
  })

  // Total number of requests received so far.
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(accessRequest)

  await postToDiscord({
    title: 'New access request',
    description: `A new user requested access to uncertain.uk.`,
    color: 0x8b5cf6,
    fields: [
      { name: 'Username', value: username, inline: true },
      { name: 'Email', value: email, inline: true },
      { name: 'Total requests', value: String(total), inline: true },
      { name: 'Reason', value: reason || '—' },
      { name: 'IP', value: ipAddress ?? 'unknown', inline: true },
    ],
  })

  return { ok: true }
}

// Public: total request count for the live counter on the landing page.
export async function getRequestCount(): Promise<number> {
  const [{ value }] = await db.select({ value: count() }).from(accessRequest)
  return value
}

// --- Admin-only helpers ----------------------------------------------------

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function getAccessRequests() {
  await requireAdmin()
  return db.select().from(accessRequest).orderBy(desc(accessRequest.createdAt))
}

export async function setRequestStatus(id: number, status: 'approved' | 'denied') {
  await requireAdmin()
  await db
    .update(accessRequest)
    .set({ status })
    .where(eq(accessRequest.id, id))
  revalidatePath('/admin')
}
