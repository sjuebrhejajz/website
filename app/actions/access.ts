"use server"

import { db } from '@/lib/db'
import { accessRequest } from '@/lib/db/schema'
import { postToDiscord } from '@/lib/discord'
import { count } from 'drizzle-orm'
import { headers } from 'next/headers'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'
import { SITE_NAME } from '@/lib/config'

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

  const token = randomBytes(32).toString('hex')
  const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

  await db.insert(accessRequest).values({
    username,
    email,
    reason: reason || null,
    approvalToken: token,
    approvalTokenExpiresAt: tokenExpires,
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

  // Send an approval email to the site owner with a one-time approve link.
  try {
    const host =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

    const approveUrl = `${host.replace(/\/$/, '')}/api/approve/${token}`

    const subject = `New access request for ${SITE_NAME}: ${username}`
    const html = `<p>A new access request was submitted.</p>
<p><strong>Username:</strong> ${username}<br/>
<strong>Email:</strong> ${email}<br/>
<strong>Reason:</strong> ${reason || '—'}</p>
<p>To approve this request, click the link below. This link can only be used once.</p>
<p><a href="${approveUrl}">Approve request</a></p>`

    await sendEmail({ to: 'insanity@uncertain.uk', subject, html })
  } catch (err) {
    console.error('Failed to send admin approval email', err)
  }

  return { ok: true }
}

// Public: total request count for the live counter on the landing page.
export async function getRequestCount(): Promise<number> {
  const [{ value }] = await db.select({ value: count() }).from(accessRequest)
  return value
}
// (Admin dashboard removed) Admin-only helpers were intentionally deleted.
