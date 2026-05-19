'use client'
import { useSessionStore } from '@/stores/session.store'
import { analysisApi } from '@/lib/api/analysis'
import { useState } from 'react'
import { CheckCircle, Loader2, Download } from 'lucide-react'
import type { BDDTestCase } from '@/types'

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

export default function BddReviewPage() {
  const { session, backendSessionId, setStage } = useSessionStore()
  const sessionId = backendSessionId ?? ''
  const testCases = (session?.bddTestCases ?? []) as BDDTestCase[]

  const [approving, setApproving] = useState(false)
  const [exported, setExported] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    try {
      await analysisApi.reviewBdd(sessionId, testCases, true)
      setStage('export')
    } catch (e) {
      console.error(e)
    } finally {
      setApproving(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await analysisApi.export(sessionId, 'bdd')
      const tcs = (result as any).test_cases ?? []
      const content = tcs.map((tc: any) =>
        `# ${tc.id} — ${tc.title}\n# Type: ${tc.type} | Priority: ${tc.priority}\n\n${tc.bdd}\n`
      ).join('\n---\n\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bdd-test-cases-${sessionId.slice(0, 8)}.txt`
      a.click()
      URL.revokeObjectURL(url)
      setExported(true)
    } catch (e) {
      console.error(e)
    }
  }

  if (!session || testCases.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-surface-400">No BDD test cases yet. Complete Manual TC Review first.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-surface-900">BDD Review</h1>
          <p className="mt-1 text-sm text-surface-500">
            {testCases.length} test cases converted to BDD format
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {testCases.map((tc) => (
            <div key={tc.id} className="rounded-lg border border-surface-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_COLORS[tc.type] ?? 'bg-surface-100 text-surface-600'}`}>
                  {tc.type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[tc.priority] ?? 'bg-surface-100 text-surface-600'}`}>
                  {tc.priority}
                </span>
                <span className="text-[11px] text-surface-400">{tc.id}</span>
              </div>

              <p className="text-sm font-medium text-surface-900 mb-3">{tc.title}</p>

              <div className="rounded-lg bg-surface-50 p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap">
                {`Scenario: ${tc.title}\n  Given ${tc.given}\n  When ${tc.when}\n  Then ${tc.then}`}
              </div>

              {tc.notes && (
                <p className="mt-2 text-xs text-surface-400">📝 {tc.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-surface-200 bg-white p-4 flex gap-3">
        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
        >
          {approving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Approve & Export
        </button>
        {session?.currentStage === 'export' && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
          >
            <Download size={16} />
            {exported ? 'Downloaded!' : 'Download BDD'}
          </button>
        )}
      </div>
    </div>
  )
}