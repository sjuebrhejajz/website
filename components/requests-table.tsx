'use client'

import { useState, useTransition } from 'react'
import { setRequestStatus } from '@/app/actions/access'

type AccessRequest = {
  id: number
  username: string
  email: string
  reason: string | null
  status: string
  ipAddress: string | null
  createdAt: Date
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/15 text-primary',
  denied: 'bg-destructive/15 text-destructive',
}

export function RequestsTable({ requests }: { requests: AccessRequest[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>(
    'all',
  )

  const filtered =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'denied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          No {filter === 'all' ? '' : filter} requests yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </ul>
      )}
    </div>
  )
}

function RequestRow({ request }: { request: AccessRequest }) {
  const [pending, startTransition] = useTransition()

  function update(status: 'approved' | 'denied') {
    startTransition(() => setRequestStatus(request.id, status))
  }

  return (
    <li className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-card-foreground">
            {request.username}
          </p>
          <p className="truncate text-xs text-muted-foreground">{request.email}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
            STATUS_STYLES[request.status] ?? STATUS_STYLES.pending
          }`}
        >
          {request.status}
        </span>
      </div>

      {request.reason ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
          {request.reason}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60">
          {new Date(request.createdAt).toLocaleString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => update('approved')}
            disabled={pending || request.status === 'approved'}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Approve
          </button>
          <button
            onClick={() => update('denied')}
            disabled={pending || request.status === 'denied'}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Deny
          </button>
        </div>
      </div>
    </li>
  )
}
