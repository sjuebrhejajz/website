import 'server-only'

type Field = { name: string; value: string; inline?: boolean }

/**
 * Posts an embed to the configured Discord webhook. The webhook URL is read
 * from the DISCORD_WEBHOOK_URL environment variable and never exposed to the
 * client. Failures are swallowed (logged only) so a Discord outage never
 * breaks the signup flow.
 */
export async function postToDiscord(opts: {
  title: string
  description?: string
  color?: number
  fields?: Field[]
}) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) {
    console.log('[v0] DISCORD_WEBHOOK_URL not set, skipping Discord post')
    return
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'uncertain.uk',
        embeds: [
          {
            title: opts.title,
            description: opts.description,
            color: opts.color ?? 0x8b5cf6,
            fields: opts.fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })
    if (!res.ok) {
      console.log('[v0] Discord webhook responded with status', res.status)
    }
  } catch (err) {
    console.log('[v0] Failed to post to Discord webhook:', (err as Error).message)
  }
}
