import * as React from 'react'
import { Pencil, Search, Trash2, UserPlus } from 'lucide-react'

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
  const [q, setQ] = React.useState('')

  async function add() {
    const n = name.trim()
    if (!n) return
    const p: Player = { id: id('ply'), name: n, phone: phone.trim() || undefined }
    await store.putPlayer(p)
    setRoster((prev) => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)))
    setName('')
    setPhone('')
    toast.push({ title: 'שחקן נוסף', description: p.name })
  }

  async function edit(p: Player) {
    const nextName = window.prompt('עריכת שם:', p.name)
    if (nextName === null) return
    const nextPhone = window.prompt('עריכת טלפון (אופציונלי):', p.phone || '')
    if (nextPhone === null) return
    const next: Player = { ...p, name: nextName.trim() || p.name, phone: nextPhone.trim() || undefined }
    await store.putPlayer(next)
    setRoster((prev) => prev.map((x) => (x.id === p.id ? next : x)).sort((a, b) => a.name.localeCompare(b.name)))
    toast.push({ title: 'שחקן עודכן', description: next.name })
  }

  async function remove(p: Player) {
    if (!window.confirm('להסיר מהרוסטר?')) return
    await store.deletePlayer(p.id)
    setRoster((prev) => prev.filter((x) => x.id !== p.id))
    toast.push({ title: 'שחקן הוסר', description: p.name })
  }

  const filtered = roster.filter((p) => {
    const needle = q.trim().toLowerCase()
    if (!needle) return true
    return p.name.toLowerCase().includes(needle) || p.phone?.includes(needle)
  })

  return (
    <div className="space-y-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-tertiary/12 text-tertiary">
            <UserPlus className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-tertiary">רשימת שחקנים</div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">רשימת שחקנים</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">הקבוצה הקבועה שלך. שם וטלפון אופציונלי לכל שחקן.</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>הוספת שחקן</CardTitle>
          <CardDescription>הרשימה הזו תשמש בכל השולחנות.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input placeholder="שם שחקן" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="טלפון (אופציונלי)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={add} disabled={!name.trim()}>
            <UserPlus className="h-4 w-4" />
            הוסף שחקן
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input className="pr-10" placeholder="חיפוש שחקנים..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid gap-3">
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>טוען…</CardTitle>
            </CardHeader>
          </Card>
        ) : roster.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>אין עדיין שחקנים</CardTitle>
              <CardDescription>הוסף שחקן ראשון כדי להשתמש בו בכל שולחן חדש.</CardDescription>
            </CardHeader>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>לא נמצאו שחקנים</CardTitle>
              <CardDescription>נסו חיפוש אחר.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{p.name}</span>
                  {p.phone && <span className="text-xs font-normal text-on-surface-variant">{p.phone}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => edit(p)}>
                  <Pencil className="h-4 w-4" />
                  עריכה
                </Button>
                <Button variant="ghost" onClick={() => remove(p)} className="text-red-200 hover:text-red-100">
                  <Trash2 className="h-4 w-4" />
                  הסרה
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
