'use client'
import { useSessionStore } from '@/stores/session.store'
import { analysisApi } from '@/lib/api/analysis'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ManualTestCase } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  high:     'bg-red-100 text-red-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
  critical: 'bg-red-200 text-red-900',
}

const TYPE_COLORS: Record<string, string> = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  edge:     'bg-blue-100 text-blue-800',
  risk:     'bg-orange-100 text-orange-800',
}

export default function TestCasesPage() {
  const { session, backendSessionId, setStage, setManualTestCases } = useSessionStore()
  const sessionId = backendSessionId ?? ''
  const router = useRouter()
  const testCases = (session?.manualTestCases ?? []) as ManualTestCase[]

  const [approving, setApproving] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      // Проверяем — может BDD уже сгенерированы
      const currentState = await analysisApi.getSession(sessionId)
      const currentStage = (currentState as any).current_stage

      if (currentStage === 'human_review_3') {
        const bddTcs = (currentState as any).bdd_test_cases ?? []
        useSessionStore.getState().setBddTestCases(bddTcs)
        setStage('review3')
        router.push('/bdd-review')
        return
      }

      // Иначе апрувим и ждём генерации
      const result = await analysisApi.reviewTestCases(sessionId, testCases, true)
      const bddTcs = (result as any).bdd_test_cases ?? []
      if (bddTcs.length > 0) {
        useSessionStore.getState().setBddTestCases(bddTcs)
        setStage('review3')
        router.push('/bdd-review')
        return
      }

      // Если не пришли сразу — ждём
      let attempts = 0
      while (attempts < 60) {
        await new Promise((r) => setTimeout(r, 2000))
        const state = await analysisApi.getSession(sessionId)
        const stage = (state as any).current_stage
        if (stage === 'human_review_3') {
          const tcs = (state as any).bdd_test_cases ?? []
          useSessionStore.getState().setBddTestCases(tcs)
          setStage('review3')
          router.push('/bdd-review')
          return
        }
        attempts++
      }
    } catch (e) {
      console.error(e)
    } finally {
      setApproving(false)
    }
  }

  if (!session || testCases.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-surface-400">No test cases yet. Complete Gap Review first.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-surface-900">Manual Test Cases</h1>
          <p className="mt-1 text-sm text-surface-500">
            Review {testCases.length} test cases — then approve to generate BDD
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {testCases.map((tc) => (
            <div key={tc.id} className="rounded-lg border border-surface-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_COLORS[tc.type] ?? 'bg-surface-100 text-surface-600'}`}>
                    {tc.type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[tc.priority] ?? 'bg-surface-100 text-surface-600'}`}>
                    {tc.priority}
                  </span>
                  <span className="text-[11px] text-surface-400">{tc.id}</span>
                </div>
                <button
                  onClick={() => toggleExpand(tc.id)}
                  className="text-surface-400 hover:text-surface-600"
                >
                  {expanded[tc.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <p className="mt-2 text-sm font-medium text-surface-900">{tc.title}</p>

              {expanded[tc.id] && (
                <div className="mt-3 space-y-3">
                  {tc.preconditions && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-surface-400 mb-1">Preconditions</p>
                      <p className="text-xs text-surface-600">{tc.preconditions}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-surface-400 mb-1">Steps</p>
                    <ol className="space-y-1">
                      {(tc.steps ?? []).map((step, i) => (
                        <li key={i} className="text-xs text-surface-700 flex gap-2">
                          <span className="shrink-0 text-surface-400">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-surface-400 mb-1">Expected Result</p>
                    <p className="text-xs text-surface-600">{tc.expected_result}</p>
                  </div>

                  {tc.notes && (
                    <p className="text-xs text-surface-400">📝 {tc.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-surface-200 bg-white p-4 flex gap-3">
        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {approving
            ? <><Loader2 size={16} className="animate-spin" /> Generating BDD...</>
            : <><CheckCircle size={16} /> Approve & Generate BDD</>
          }
        </button>
      </div>
    </div>
  )
}