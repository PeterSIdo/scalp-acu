import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const card = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800'
const btn = 'text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50'
const btnPlain = `${btn} border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`
const btnDanger = `${btn} border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950`
const input = 'w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

function relTime(d) {
  if (!d) return 'never'
  const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  if (mins < 60) return 'within the hour'
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 60) return `${days}d ago`
  return fmtDate(d)
}

function Stat({ label, value }) {
  return (
    <div className={`${card} p-4`}>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">{value ?? '—'}</div>
    </div>
  )
}

function Badge({ children, tone }) {
  const tones = {
    red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${tones[tone]}`}>{children}</span>
}

function EditUser({ user, onSaved, onClose }) {
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function save(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      const { user: updated } = await api.admin.updateUser(user.id, { fullName, email })
      if (password) await api.admin.setPassword(user.id, password)
      onSaved(updated)
      onClose()
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="grid gap-3 sm:grid-cols-3 p-4 bg-gray-50 dark:bg-gray-950/60 border-t border-gray-200 dark:border-gray-800">
      <label className="text-xs text-gray-500 dark:text-gray-400">Name
        <input className={`${input} mt-1`} value={fullName} onChange={e => setFullName(e.target.value)} />
      </label>
      <label className="text-xs text-gray-500 dark:text-gray-400">Email
        <input className={`${input} mt-1`} type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label className="text-xs text-gray-500 dark:text-gray-400">New password (optional)
        <input className={`${input} mt-1`} type="text" autoComplete="off" placeholder="leave blank to keep"
          value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <div className="sm:col-span-3 flex items-center gap-2">
        <button type="submit" disabled={busy}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-1.5 rounded-lg disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className={btnPlain}>Cancel</button>
        {msg && <span className="text-sm text-red-600 dark:text-red-400">{msg}</span>}
      </div>
    </form>
  )
}

export default function AdminPage() {
  const { user: me } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function load() {
    Promise.all([api.admin.stats(), api.admin.users()])
      .then(([s, u]) => { setStats(s); setUsers(u.users); setError(null) })
      .catch(err => setError(err.message))
  }
  useEffect(load, [])

  const shown = useMemo(() => {
    if (!users) return []
    const q = query.trim().toLowerCase()
    let list = users.filter(u =>
      (!q || u.email.includes(q) || u.fullName.toLowerCase().includes(q) || (u.signupRef ?? '').includes(q)) &&
      (filter === 'all' || (filter === 'disabled' ? u.disabled : filter === 'admins' ? u.isAdmin : !u.disabled)))
    const by = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      seen: (a, b) => new Date(b.lastSeenAt ?? 0) - new Date(a.lastSeenAt ?? 0),
      name: (a, b) => a.fullName.localeCompare(b.fullName),
    }
    return [...list].sort(by[sort])
  }, [users, query, filter, sort])

  function replaceUser(updated) {
    setUsers(list => list.map(u => (u.id === updated.id ? { ...u, ...updated, feedbackCount: u.feedbackCount } : u)))
  }

  async function toggleDisabled(u) {
    if (!u.disabled && !window.confirm(`Disable ${u.email}? They will be signed out and unable to log in.`)) return
    setBusyId(u.id)
    try {
      const { user } = await api.admin.updateUser(u.id, { disabled: !u.disabled })
      replaceUser(user)
      setStats(s => s && { ...s, disabled: s.disabled + (user.disabled ? 1 : -1) })
    } catch (err) { window.alert(err.message) } finally { setBusyId(null) }
  }

  async function remove(u) {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return
    setBusyId(u.id)
    try {
      await api.admin.deleteUser(u.id)
      setUsers(list => list.filter(x => x.id !== u.id))
      setStats(s => s && { ...s, total: s.total - 1 })
    } catch (err) { window.alert(err.message) } finally { setBusyId(null) }
  }

  function exportCsv() {
    const cols = ['fullName', 'email', 'signupRef', 'createdAt', 'lastSeenAt', 'subscriptionStatus', 'disabled', 'feedbackCount']
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...shown.map(u => cols.map(c => esc(u[c])).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `acumap-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/viewer" className="text-amber-500 dark:text-amber-400 font-bold text-xl">AcuMap</Link>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={load} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Refresh</button>
            <Link to="/account" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Account</Link>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin</h1>

        {error && <div className={`${card} p-4 mb-4 text-red-600 dark:text-red-400`}>{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Stat label="Users" value={stats?.total} />
          <Stat label="New · 7 days" value={stats?.last7} />
          <Stat label="New · 30 days" value={stats?.last30} />
          <Stat label="Active · 7 days" value={stats?.active7} />
          <Stat label="Feedback" value={stats?.feedback} />
        </div>

        {stats?.byRef?.length > 0 && (
          <div className={`${card} p-4 mb-4`}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Signups by source</div>
            <div className="flex flex-wrap gap-2">
              {stats.byRef.map(r => (
                <button key={r.ref} onClick={() => setQuery(r.ref === '(direct)' ? '' : r.ref)}
                  className="text-sm px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                  {r.ref} <span className="font-semibold tabular-nums">{r.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={card}>
          <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
            <input className={`${input} flex-1 min-w-[12rem]`} placeholder="Search name, email or source…"
              value={query} onChange={e => setQuery(e.target.value)} />
            <select className={`${input} w-auto`} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Enabled</option>
              <option value="disabled">Disabled ({stats?.disabled ?? 0})</option>
              <option value="admins">Admins</option>
            </select>
            <select className={`${input} w-auto`} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="seen">Last seen</option>
              <option value="name">Name A–Z</option>
            </select>
            <button onClick={exportCsv} disabled={!shown.length} className={btnPlain}>Export CSV</button>
          </div>

          {!users && !error && <div className="p-6 text-gray-400">Loading…</div>}
          {users && shown.length === 0 && <div className="p-6 text-gray-400">No users match.</div>}

          <ul>
            {shown.map(u => (
              <li key={u.id} className="border-b last:border-b-0 border-gray-200 dark:border-gray-800">
                <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${u.disabled ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-[14rem]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">{u.fullName}</span>
                      {u.isAdmin && <Badge tone="amber">admin</Badge>}
                      {u.disabled && <Badge tone="red">disabled</Badge>}
                      {u.subscriptionStatus !== 'none' && <Badge tone="teal">{u.subscriptionStatus}</Badge>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 break-all">{u.email}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                    <div><div className="text-gray-400">Joined</div>{fmtDate(u.createdAt)}</div>
                    <div><div className="text-gray-400">Last seen</div>{relTime(u.lastSeenAt)}</div>
                    <div><div className="text-gray-400">Source</div>{u.signupRef ?? 'direct'}</div>
                    <div><div className="text-gray-400">Feedback</div>{u.feedbackCount}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className={btnPlain} onClick={() => setEditing(editing === u.id ? null : u.id)}>Edit</button>
                    {u.id !== me?.id && (
                      <>
                        <button className={btnPlain} disabled={busyId === u.id} onClick={() => toggleDisabled(u)}>
                          {u.disabled ? 'Enable' : 'Disable'}
                        </button>
                        <button className={btnDanger} disabled={busyId === u.id} onClick={() => remove(u)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
                {editing === u.id && <EditUser user={u} onSaved={replaceUser} onClose={() => setEditing(null)} />}
              </li>
            ))}
          </ul>
        </div>
        {users && <p className="text-xs text-gray-400 mt-3">Showing {shown.length} of {users.length} users.</p>}
      </div>
    </div>
  )
}
