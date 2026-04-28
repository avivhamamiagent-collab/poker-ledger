import * as React from 'react'
import { Pencil, Trash2, UserPlus } from 'lucide-react'

import type { Player } from '../../domain/types'
import { id } from '../../domain/ids'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useStore } from '../store-context'
import { useRoster } from '../hooks/useRoster'
import { useToast } from '../../components/ui/use-toast'

export function RosterPage() {
  const store = useStore()
  const { roster, setRoster, loading, error } = useRoster()
  const toast = useToast()

  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')

  async function add() {
    const n = name.trim()
    if (!n) return
    const p: Player = { id: id('ply'), name: n, phone: phone.trim() || undefined }
    await store.putPlayer(p)
    setRoster((prev) => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)))
    setName('')
    setPhone('')
    toast.push({ title: 'Player added', description: p.name })
  }

  async function edit(p: Player) {
    const nextName = window.prompt('Edit name:', p.name)
    if (nextName === null) return
    const nextPhone = window.prompt('Edit phone (optional):', p.phone || '')
    if (nextPhone === null) return
    const next: Player = { ...p, name: nextName.trim() || p.name, phone: nextPhone.trim() || undefined }
    await store.putPlayer(next)
    setRoster((prev) => prev.map((x) => (x.id === p.id ? next : x)).sort((a, b) => a.name.localeCompare(b.name)))
    toast.push({ title: 'Player updated', description: next.name })
  }

  async function remove(p: Player) {
    if (!window.confirm('Remove from roster?')) return
    await store.deletePlayer(p.id)
    setRoster((prev) => prev.filter((x) => x.id !== p.id))
    toast.push({ title: 'Player removed', description: p.name })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Roster</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your regular crew. Names + optional phone.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add player</CardTitle>
          <CardDescription>We’ll use this list across sessions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={add} disabled={!name.trim()}>
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3">
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading…</CardTitle>
            </CardHeader>
          </Card>
        ) : roster.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No players yet</CardTitle>
              <CardDescription>Add the first player above.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          roster.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{p.name}</span>
                  {p.phone && <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{p.phone}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => edit(p)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => remove(p)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

