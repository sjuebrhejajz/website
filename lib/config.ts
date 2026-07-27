// The default whitelisted admin email that is allowed to create an account
// and access the admin dashboard for uncertain.uk.
export const ADMIN_EMAIL = 'insanity@uncertain.uk'

export const SITE_NAME = 'uncertain.uk'

const EXTRA_WHITELISTED_EMAILS = (process.env.WHITELISTED_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export const WHITELISTED_EMAILS = [ADMIN_EMAIL, ...EXTRA_WHITELISTED_EMAILS]

export function isWhitelistedEmail(email?: string | null) {
  if (!email) return false

  return WHITELISTED_EMAILS.includes(email.trim().toLowerCase())
}
