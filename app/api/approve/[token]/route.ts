import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accessRequest } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import { SITE_NAME } from '@/lib/config'

export async function GET(req: Request, { params }: { params: { token?: string } }) {
  try {
    // Support token in path (`/api/approve/<token>`) or as query `?token=...`.
    const url = new URL(req.url)
    const token = params?.token ?? url.searchParams.get('token') ?? undefined
    if (!token) return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 400 })

    const rows = await db.select().from(accessRequest).where(eq(accessRequest.approvalToken, token)).limit(1)
    const row = rows[0]
    if (!row) return NextResponse.json({ ok: false, error: 'invalid_or_used' }, { status: 404 })

    if (row.status !== 'pending') {
      return NextResponse.json({ ok: false, error: 'already_processed' }, { status: 410 })
    }

    if (row.approvalTokenExpiresAt && new Date(row.approvalTokenExpiresAt) < new Date()) {
      return NextResponse.json({ ok: false, error: 'token_expired' }, { status: 410 })
    }

    // Mark approved and invalidate token
    await db
      .update(accessRequest)
      .set({ status: 'approved', approvalToken: null, approvalTokenExpiresAt: null })
      .where(eq(accessRequest.id, row.id))

    // Send applicant the approval email with sign-up link
    try {
      const host =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

      const signUpUrl = `${host.replace(/\/$/, '')}/sign-up?email=${encodeURIComponent(row.email)}`

      const subject = `Your access to ${SITE_NAME} has been approved`
      const html = `<p>Hi —</p>
<p>Your request to join <strong>${SITE_NAME}</strong> has been approved.</p>
<p>Click <a href="${signUpUrl}">here to create your account</a>. The link will prefill your email on the sign-up form.</p>
<p>If you didn't request access, ignore this email.</p>`

      await sendEmail({ to: row.email, subject, html })
    } catch (err) {
      console.error('Failed to send applicant approval email', err)
    }

    // Redirect to a simple confirmation page (home with query param)
    const url = new URL(req.url)
    const redirectTo = `${url.origin}/?approved=1`
    return NextResponse.redirect(redirectTo)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
