"use client"

import { useEffect, useState } from 'react'
import { authClient, useSession } from '@/lib/auth-client'

type LinkItem = { label: string; url: string }

export function ProfileEditor() {
  const { data: session } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [theme, setTheme] = useState({ accent: '#60a5fa' })
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user?.email) return
      try {
        const res = await fetch(`/api/profile?username=${encodeURIComponent(user.name)}`)
        if (res.ok) {
          const data = await res.json()
          const p = data.profile
          setDisplayName(p.displayName ?? p.name ?? '')
          setBio(p.bio ?? '')
          setAvatarUrl(p.avatarUrl ?? p.image ?? '')
          setLinks(p.links ? JSON.parse(p.links) : [])
          setTheme(p.theme ? JSON.parse(p.theme) : { accent: '#60a5fa' })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (!session) {
    // Not signed in — redirect to sign-in
    if (typeof window !== 'undefined') window.location.href = '/sign-in'
    return null
  }

  function addLink() {
    setLinks([...links, { label: '', url: '' }])
  }
  function updateLink(i: number, key: keyof LinkItem, value: string) {
    const next = [...links]
    next[i] = { ...next[i], [key]: value }
    setLinks(next)
  }
  function removeLink(i: number) {
    const next = [...links]
    next.splice(i, 1)
    setLinks(next)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          displayName,
          bio,
          avatarUrl,
          links,
          theme,
        }),
      })
      if (!res.ok) throw new Error('save-failed')
      setStatus('Saved')
    } catch (err) {
      setStatus('Save failed')
    }
  }

  return (
    <div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={save} className="flex flex-col gap-4">
          <div>
            <label className="text-xs">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded border px-2 py-1" />
          </div>

          <div>
            <label className="text-xs">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded border px-2 py-1" />
          </div>

          <div>
            <label className="text-xs">Avatar URL</label>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded border px-2 py-1" />
          </div>

          <div>
            <label className="text-xs">Links</label>
            <div className="flex flex-col gap-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Label" value={l.label} onChange={(e) => updateLink(i, 'label', e.target.value)} className="flex-1 rounded border px-2 py-1" />
                  <input placeholder="URL" value={l.url} onChange={(e) => updateLink(i, 'url', e.target.value)} className="flex-2 rounded border px-2 py-1" />
                  <button type="button" onClick={() => removeLink(i)} className="text-destructive">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addLink} className="mt-2 text-sm text-primary">Add link</button>
            </div>
          </div>

          <div>
            <label className="text-xs">Accent color</label>
            <input type="color" value={theme.accent} onChange={(e) => setTheme({ ...theme, accent: e.target.value })} />
          </div>

          <div>
            <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
            {status ? <span className="ml-3">{status}</span> : null}
          </div>
        </form>
      )}
    </div>
  )
}
