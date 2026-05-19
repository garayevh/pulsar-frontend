'use client'
import { useSessionStore } from '@/stores/session.store'
import { analysisApi } from '@/lib/api/analysis'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, MessageSquare, SkipForward, Loader2, ArrowRight } from 'lucide-react'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ambiguous:                  { label: 'Ambiguous',          color: 'bg-yellow-100 text-yellow-800'  },
  missing_negative:           { label: 'Missing Negative',   color: 'bg-red-100 text-red-800'        },
  missing_negative_scenario:  { label: 'Missing Negative',   color: 'bg-red-100 text-red-800'        },
  missing_validation:         { label: 'Missing Validation', color: 'bg-orange-100 text-orange-800'  },
  missing_error:              { label: 'Missing Error',      color: 'bg-red-100 text-red-800'        },
  missing_error_handling:     { label: 'Missing Error',      color: 'bg-red-100 text-red-800'        },
  missing_edge:               { label: 'Edge Case',          color: 'bg-blue-100 text-blue-800'      },
  missing_edge_case:          { label: 'Edge Case',          color: 'bg-blue-100 text-blue-800'      },
}

export default function GapReviewPage() {
  const { session, backendSessionId, setStage, setTestCases } = useSessionStore()
  const sessionId = backendSessionId ?? ''
  const gaps = (session?.analysis?.gaps ?? []) as any[]
  const router = useRouter()

  const [reviews, setReviews] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [activeComment, setActiveComment] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleAction = async (gap: any, action: 'approve' | 'comment' | 'skip') => {
    if (action === 'comment' && activeComment !== gap.id) {
      setActiveComment(gap.id)
      return
    }
    setSubmitting(gap.id)
    try {
      await analysisApi.reviewGap({
        session_id: sessionId,
        gap_id: gap.id,
        action,
        comment: action === 'comment' ? comments[gap.id] : undefined,
      })
      setReviews((r) => ({ ...r, [gap.id]: action }))
      setActiveComment(null)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(null)
    }
  }

  const handleGenerateTCs = async () => {
    setGenerating(true)
    try {
      // Skip все unreviewed gaps
      const unreviewed = gaps.filter((g) => !reviews[g.id])
      for (const gap of unreviewed) {
        await analysisApi.reviewGap({
          session_id: sessionId,
          gap_id: gap.id,
          action: 'skip',
        })
        setReviews((r) => ({ ...r, [gap.id]: 'skip' }))
      }

      // Последний gap triggerует TC generation на backend
      // Polling подхватит human_review_2 и переключит stage
      // Но нам нужно poll вручную здесь
      let attempts = 0
      while (attempts < 60) {
        await new Promise((r) => setTimeout(r, 2000))
        const state = await analysisApi.getSession(sessionId)
        const stage = (state as any).current_stage
        if (stage === 'human_review_2') {
          const tcs = (state as any).test_cases ?? []
          setTestCases(tcs)
          setStage('review2')
          router.push('/test-cases')
          return
        }
        attempts++
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  if (!session || gaps.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-surface-400">No gaps to review. Start an analysis first.</p>
    </div>
  )

  const reviewed = Object.keys(reviews).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-surface-900">Gap Review</h1>
          <p className="mt-1 text-sm text-surface-500">
            {gaps.length} gaps found · {reviewed} reviewed
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-100">
            <div
              className="h-1.5 rounded-full bg-brand-500 transition-all"
              style={{ width: `${gaps.length ? (reviewed / gaps.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {gaps.map((gap) => {
            const status = reviews[gap.id]
            const typeInfo = TYPE_LABELS[gap.type] ?? { label: gap.type, color: 'bg-surface-100 text-surface-600' }
            const question = gap.clarificationQuestion ?? gap.question

            return (
              <div
                key={gap.id}
                className={`rounded-lg border p-5 transition-colors ${
                  status === 'approve' ? 'border-green-200 bg-green-50' :
                  status === 'skip'    ? 'border-surface-100 bg-surface-50 opacity-50' :
                  status === 'comment' ? 'border-blue-200 bg-blue-50' :
                  'border-surface-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-[11px] text-surface-400">{gap.id}</span>
                </div>

                <p className="text-sm text-surface-800">{gap.description}</p>
                {question && (
                  <p className="mt-2 text-sm font-medium text-surface-600">❓ {question}</p>
                )}

                {activeComment === gap.id && (
                  <textarea
                    value={comments[gap.id] ?? ''}
                    onChange={(e) => setComments((c) => ({ ...c, [gap.id]: e.target.value }))}
                    placeholder="Your clarification..."
                    className="mt-3 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    rows={3}
                  />
                )}

                {!status && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAction(gap, 'approve')}
                      disabled={submitting === gap.id || generating}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      {submitting === gap.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(gap, 'comment')}
                      disabled={submitting === gap.id || generating}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      <MessageSquare size={12} />
                      {activeComment === gap.id ? 'Submit' : 'Comment'}
                    </button>
                    <button
                      onClick={() => handleAction(gap, 'skip')}
                      disabled={submitting === gap.id || generating}
                      className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-50"
                    >
                      <SkipForward size={12} />
                      Skip
                    </button>
                  </div>
                )}

                {status && (
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-surface-400">
                    {status === 'approve' ? '✅ Approved' : status === 'comment' ? '💬 Commented' : '⏭ Skipped'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-surface-200 bg-white p-4">
        <button
          onClick={handleGenerateTCs}
          disabled={generating || !sessionId}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {generating ? 'Generating Test Cases...' : 'Generate Test Cases'}
        </button>
      </div>
    </div>
  )
}