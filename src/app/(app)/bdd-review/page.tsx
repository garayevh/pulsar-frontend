'use client'
import { useSessionStore } from '@/stores/session.store'
import { analysisApi } from '@/lib/api/analysis'
import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, Download, PartyPopper } from 'lucide-react'
import { exportBDDToExcel } from '@/lib/utils/exportToExcel'
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

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    color: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 7)],
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function CompletionScreen({ testCases, sessionTitle, onBack }: { testCases: BDDTestCase[], sessionTitle: string, onBack: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      {showConfetti && <Confetti />}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <PartyPopper size={48} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-surface-900">Analysis Complete!</h1>
      <p className="mt-3 text-surface-500 max-w-md">
        {testCases.length} BDD test cases have been generated and approved. Ready to download.
      </p>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => exportBDDToExcel(testCases, sessionTitle)}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Download size={16} />
          Download BDD Test Cases (.csv)
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 px-6 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50"
        >
          Back to Review
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { label: 'Total TCs', value: testCases.length },
          { label: 'Positive', value: testCases.filter((t: any) => t.type === 'positive' || t.raw?.type === 'positive').length },
          { label: 'Negative', value: testCases.filter((t: any) => t.type === 'negative' || t.raw?.type === 'negative').length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-200 bg-white p-4">
            <p className="text-2xl font-bold text-brand-600">{s.value}</p>
            <p className="text-xs text-surface-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BddReviewPage() {
  const { session, backendSessionId, setStage } = useSessionStore()
  const sessionId = backendSessionId ?? ''
  const testCases = (session?.bddTestCases ?? []) as BDDTestCase[]
  const sessionTitle = (session as any)?.pages?.[0]?.title ?? 'session'

  const [approving, setApproving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    try {
      await analysisApi.reviewBdd(sessionId, testCases, true)
      setStage('export')
      setCompleted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setApproving(false)
    }
  }

  const handleExport = () => {
    exportBDDToExcel(testCases, sessionTitle)
  }

  if (!session || testCases.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-surface-400">No BDD test cases yet. Complete Manual TC Review first.</p>
    </div>
  )

  if (completed) return (
    <CompletionScreen
      testCases={testCases}
      sessionTitle={sessionTitle}
      onBack={() => setCompleted(false)}
    />
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">BDD Review</h1>
            <p className="mt-1 text-sm text-surface-500">
              {testCases.length} test cases converted to BDD format
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
          >
            <Download size={14} />
            Export Excel
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {testCases.map((tc) => {
            const raw = (tc as any).raw ?? tc
            return (
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
                  {(tc as any).bdd || `Scenario: ${tc.title}\n  Given ${raw.given}\n  When ${raw.when}\n  Then ${raw.then}`}
                </div>

                {raw.notes && (
                  <p className="mt-2 text-xs text-surface-400">📝 {raw.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-surface-200 bg-white p-6 flex gap-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-surface-200 px-6 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50"
        >
          <Download size={16} />
          Export Excel
        </button>
        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {approving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {approving ? 'Approving...' : 'Approve & Complete'}
        </button>
      </div>
    </div>
  )
}