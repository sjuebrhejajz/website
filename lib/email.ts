import { Resend } from 'resend'
import { SITE_NAME } from './config'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}) {
  if (!resend) {
    throw new Error('Resend API key not configured')
  }

  const response = await resend.emails.send({
    from: `${SITE_NAME} <${process.env.RESEND_FROM ?? 'noreply@uncertain.uk'}>`,
    to,
    subject,
    html: html ?? text,
  })

  if ((response as any).error) {
    throw new Error((response as any).error.message ?? 'Failed to send email')
  }

  return response
}
