import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useToast } from '../../../components/ui/use-toast'
import type { GroupInvite } from '../../../domain/types'
import { useGroups } from '../../hooks/useGroups'
import { useStore } from '../../store-context'

export function GroupsPage() {
  const store = useStore()
  const { groups, loading, error, refresh } = useGroups()
  const toast = useToast()
  const nav = useNavigate()

  const [invites, setInvites] = React.useState<GroupInvite[]>([])
  const [invLoading, setInvLoading] = React.useState(true)
  const [q, setQ] = React.useState('')

  const loadInvites = React.useCallback(async () => {
    setInvLoading(true)
    try {
      setInvites(await store.listMyInvites())
    } finally {
      setInvLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInvites().catch(() => {})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadInvites])

  async function respond(inviteId: string, status: 'accepted' | 'declined') {
    try {
      await store.respondToInvite(inviteId, status)
      await Promise.all([refresh(), loadInvites()])
      toast.push({ title: status === 'accepted' ? 'הצטרפת לקבוצה' : 'ההזמנה נדחתה' })
    } catch (err: unknown) {
      toast.push({ title: 'נכשל', description: err instanceof Error ? err.message : String(err) })
    }
  }

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(q.trim().toLowerCase()))
  const pendingInvites = invites.filter((i) => i.status === 'pending')

  return (
    <div className="bg-surface text-on-surface font-body-sm pb-[100px]">
      <main className="mt-[0px] flex flex-col gap-section-margin">
        {/* Search Bar */}
        <div className="relative motion-safe:animate-fadeIn">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container h-touch-target rounded-full pl-4 pr-10 border border-outline-variant focus:border-tertiary focus:ring-2 focus:ring-tertiary/40 text-body-lg font-body-lg text-on-surface placeholder-on-surface-variant transition-all duration-200 outline-none"
            placeholder="חיפוש קבוצות..."
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Content Area */}
        <section className="flex flex-col gap-stack-gap">
          <h2 className="text-headline-md font-headline-md text-on-surface">הקבוצות שלי</h2>

          {error ? <div className="text-body-sm font-body-sm text-error">{error}</div> : null}

          {invLoading ? null : pendingInvites.length ? (
            <div className="flex flex-col gap-stack-gap">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-primary-container border border-tertiary-container/50 rounded-xl p-4 flex items-center justify-between relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tertiary-container/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center border border-tertiary-container/50">
                      <span className="material-symbols-outlined text-tertiary-container">mail</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-data-tabular font-data-tabular text-on-surface">הזמנה לקבוצה</span>
                      <span className="text-body-sm font-body-sm text-on-surface-variant">{inv.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 relative z-10">
                    <span className="bg-[#1B4332] text-tertiary-container border border-tertiary-container/30 px-2 py-1 rounded text-label-caps font-label-caps">
                      הזמנה חדשה
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="bg-surface-container-highest hover:bg-surface-variant transition-all duration-200 active:scale-[0.98] py-1.5 px-3 rounded-lg border border-outline-variant flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        type="button"
                        onClick={() => respond(inv.id, 'declined')}
                      >
                        דחייה
                      </button>
                      <button
                        className="bg-[#2D6A4F] hover:bg-[#1B4332] transition-all duration-200 active:scale-[0.98] py-1.5 px-3 rounded-lg border border-[rgba(212,175,55,0.3)] flex items-center justify-center gap-2 font-body-sm text-body-sm text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        type="button"
                        onClick={() => respond(inv.id, 'accepted')}
                      >
                        אישור
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-tertiary/14 bg-surface-container/70 p-4 text-body-sm font-body-sm text-on-surface-variant">טוען…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-tertiary/22 bg-surface-container/70 p-5 text-center shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
              <div className="chip-face mx-auto mb-4 h-16 w-16 rounded-full" />
              <h3 className="text-lg font-black text-on-surface">אין עדיין קבוצות</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">
                קבוצה היא המקום לתכנן משחקים, לשלוח הזמנות ולפתוח לדג׳ר משותף לערב.
              </p>
              <button
                type="button"
                onClick={() => nav('/groups/new')}
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-tertiary/25 bg-[linear-gradient(180deg,#e9c349,#b88c17)] px-4 py-2 text-sm font-semibold text-on-tertiary shadow-[0_12px_30px_rgba(233,195,73,0.16)] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                צור קבוצה ראשונה
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-stack-gap">
              {filtered.map((g) => (
                <Link
                  key={g.id}
                  to={`/group/${g.id}`}
                  className="relative rounded-xl p-[1px] bg-gradient-to-l from-[#D4AF37]/35 via-[#D4AF37]/10 to-[#D4AF37]/35 motion-safe:animate-cardSlideIn transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="bg-primary-container/90 backdrop-blur-sm hover:backdrop-blur-md rounded-xl p-4 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center border border-[rgba(212,175,55,0.3)] transition-all duration-200">
                        <span className="material-symbols-outlined text-primary">casino</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-data-tabular font-data-tabular text-on-surface">{g.name}</span>
                        <span className="text-body-sm font-body-sm text-on-surface-variant">
                          עודכן {new Date(g.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-body-sm font-body-sm text-on-surface-variant">הקשה לפתיחה</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <button
        className="fixed bottom-[100px] left-6 w-14 h-14 bg-[#2D6A4F] text-white rounded-full flex items-center justify-center shadow-[0px_4px_20px_rgba(0,0,0,0.5)] z-40 hover:bg-[#1B4332] transition-all duration-200 active:scale-[0.98] border border-[rgba(212,175,55,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        type="button"
        onClick={() => nav('/groups/new')}
        aria-label="יצירת קבוצה"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  )
}
