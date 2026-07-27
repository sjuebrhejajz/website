import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accessRequest } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import { SITE_NAME } from '@/lib/config'

export async function POST(req: Request) {
  try {
    const adminKey = req.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    if (!email) return NextResponse.json({ ok: false, error: 'missing_email' }, { status: 400 })

    // Mark the access request as approved
    await db
      .update(accessRequest)
      .set({ status: 'approved' })
      .where(eq(accessRequest.email, email))

    // Send approval email with sign-up link
    const host =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

    const signUpUrl = `${host.replace(/\/$/, '')}/sign-up?email=${encodeURIComponent(email)}`

    const subject = `Your access to ${SITE_NAME} has been approved`
    const html = `<p>Hi —</p>
<p>Your request to join <strong>${SITE_NAME}</strong> has been approved.</p>
<p>Click <a href="${signUpUrl}">here to create your account</a>. The link will prefill your email on the sign-up form.</p>
<p>If you didn't request access, ignore this email.</p>`

    try {
      await sendEmail({ to: email, subject, html })
    } catch (err) {
      // Log and continue (don't fail the approval because of email errors)
      console.error('Failed to send approval email', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
