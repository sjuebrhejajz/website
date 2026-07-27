import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { Resend } from 'resend'
import { SITE_NAME } from '@/lib/config'

const advanced: any = {}

if (process.env.NODE_ENV === 'development') {
  advanced.defaultCookieAttributes = {
    // In dev (v0 preview iframe), force cross-site cookies so the
    // session cookie is stored by the browser.
    sameSite: 'none' as const,
    secure: true,
  }
}

if (process.env.RESEND_API_KEY) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const resendFrom = process.env.RESEND_FROM ?? 'noreply@uncertain.uk'
  advanced.sendEmail = async ({ to, subject, html, text }: any) => {
    // Use Resend to deliver transactional emails. `RESEND_FROM` allows a
    // verified sender address like `noreply@uncertain.uk`.
    const response = await resend.emails.send({
      from: `${SITE_NAME} <${resendFrom}>`,
      to,
      subject,
      html: html ?? text,
    })

    if (response.error) {
      throw new Error(response.error.message ?? 'Failed to send email')
    }

    return response
  }
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(Object.keys(advanced).length ? { advanced } : {}),
})
