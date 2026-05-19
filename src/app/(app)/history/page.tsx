'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { analysisApi } from '@/lib/api/analysis'
import { useSessionStore } from '@/stores/session.store'
import { Trash2, ArrowRight, Loader2 } from 'lucide-react'
import type { ProjectSession } from '@/types'

const STAGE_LABELS: Record<string, string> = {
  human_review_1: 'Gap Review',
  human_review_2: 'Manual TC Review',
  bdd_generation: 'BDD Generation',
  human_review_3: 'BDD Review',
  completed:      'Completed',
  error:          'Error',
}

const STAGE_COLORS: Record<string, string> = {
  human_review_1: 'bg-yellow-100 text-yellow-800',
  human_review_2: 'bg-blue-100 text-blue-800',
  bdd_generation: 'bg-purple-100 text-purple-800',
  human_review_3: 'bg-indigo-100 text-indigo-800',
  completed:      'bg-green-100 text-green-800',
  error:          'bg-red-100 text-red-800',
}

const STAGE_ROUTES: Record<string, string> = {
  human_review_1: '/analysis',
  human_review_2: '/test-cases',
  bdd_generation: '/test-cases',
  human_review_3: '/bdd-review',
  completed:      '/bdd-review',
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPage() {
  const router = useRouter()
  const { resumeSession } = useSessionStore()
  const [sessions, setSessions] = useState<ProjectSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const result = await analysisApi.getSessions()
      setSessions(result.sessions ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async (s: ProjectSession) => {
    const frontendStage = (
      s.current_stage === 'human_review_1' ? 'review1' :
      s.current_stage === 'human_review_2' ? 'review2' :
      s.current_stage === 'human_review_3' ? 'review3' :
      s.current_stage === 'completed'       ? 'export'  : 'review1'
    ) as any

    resumeSession(s.session_id, frontendStage)

    // Загружаем полный state из БД
    try {
      const state = await analysisApi.getSession(s.session_id)
      const store = useSessionStore.getState()

      // Восстанавливаем gaps если human_review_1
      if (s.current_stage === 'human_review_1') {
        const gaps = (state as any).gaps ?? []
        const score = (state as any).score ?? {}
        const gapReviews = (state as any).gap_reviews ?? {}
        store.setAnalysisResult({
          id: s.session_id,
          pageId: '',
          pageTitle: s.page_title_display,
          businessLogicSummary: (state as any).summary ?? '',
          gaps,
          score: { total: score.total ?? 0, factors: score.breakdown ?? [] },
          status: 'in_review',
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        })
        store.setResumedGapReviews(gapReviews)
      }

      // Восстанавливаем manual TC если human_review_2
      if (s.current_stage === 'human_review_2') {
        const tcs = (state as any).manual_test_cases ?? []
        store.setManualTestCases(tcs)
      }

      // Восстанавливаем BDD TC если human_review_3 или completed
      if (s.current_stage === 'human_review_3' || s.current_stage === 'completed') {
        const tcs = (state as any).bdd_test_cases ?? []
        store.setBddTestCases(tcs)
      }
    } catch (e) {
      console.error('Failed to load session state:', e)
    }

    const route = STAGE_ROUTES[s.current_stage] ?? '/analysis'
    router.push(route)
  }

  const handleDelete = async (sessionId: string) => {
    setDeleting(sessionId)
    try {
      await analysisApi.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 size={24} className="animate-spin text-surface-400" />
    </div>
  )

  if (sessions.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-surface-400">No sessions yet. Start an analysis first.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-surface-900">History</h1>
          <p className="mt-1 text-sm text-surface-500">
            {sessions.length} project{sessions.length !== 1 ? 's' : ''} — resume any session
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.session_id} className="rounded-lg border border-surface-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {s.page_title_display || 'Untitled'}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {formatDate(s.updated_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STAGE_COLORS[s.current_stage] ?? 'bg-surface-100 text-surface-600'}`}>
                    {STAGE_LABELS[s.current_stage] ?? s.current_stage}
                  </span>

                  {s.score?.total !== undefined && (
                    <span className="text-[11px] font-medium text-surface-500">
                      {s.score.total}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleResume(s)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
                >
                  <ArrowRight size={13} />
                  Resume
                </button>
                <button
                  onClick={() => handleDelete(s.session_id)}
                  disabled={deleting === s.session_id}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-xs font-medium text-surface-500 hover:bg-surface-50 disabled:opacity-50"
                >
                  {deleting === s.session_id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}