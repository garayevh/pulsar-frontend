'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, FileText, ArrowRight, Loader2, CheckSquare, Square, Figma, X, CheckCircle2 } from 'lucide-react'
import { confluenceApi } from '@/lib/api/confluence'
import { analysisApi } from '@/lib/api/analysis'
import { useSessionStore } from '@/stores/session.store'
import { useSessionPolling } from '@/hooks/useSessionPolling'
import { PromptEditor } from '@/components/ui/PromptEditor'
import { figmaApi, type FigmaFrame } from '@/lib/api/figma'
import type { ConfluencePage } from '@/types'

const DEFAULT_ANALYSIS_PROMPT = `You are a senior QA analyst. Analyze the following requirements from Confluence.

Your task:
1. Identify ALL gaps in the requirements:
   - Missing negative scenarios
   - Missing validation rules
   - Missing error handling
   - Missing edge cases
   - Ambiguous or contradictory statements

2. For each gap, generate ONE clear clarification question.

3. Calculate a Completeness Score (0-100) with this breakdown:
   PENALTIES:
   - Missing negative scenarios: -10 each
   - Missing validation rules: -8 each
   - Missing error handling: -6 each
   - Missing edge cases: -5 each
   BONUSES:
   - Complete happy path: +10
   - Good UI coverage: +15

Requirements to analyze:
{requirements_text}

Past clarifications already provided (apply these automatically):
{past_clarifications}

Respond ONLY in valid JSON, no markdown, no backticks, no explanation:
{
  "gaps": [...],
  "score": {"total": 72, "breakdown": []},
  "summary": "Brief summary"
}`

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ConfluencePage[]>([])
  const [selected, setSelected] = useState<ConfluencePage[]>([])
  const [searching, setSearching] = useState(false)
  const [starting, setStarting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Figma state
  const [figmaUrl, setFigmaUrl] = useState('')
  const [figmaFrames, setFigmaFrames] = useState<FigmaFrame[]>([])
  const [figmaLoading, setFigmaLoading] = useState(false)
  const [figmaError, setFigmaError] = useState<string | null>(null)

  const { initSession, setStage, setBackendSessionId, prompts, setPrompt } = useSessionStore()
  useSessionPolling(sessionId)
  const { session } = useSessionStore()
  const router = useRouter()

  useEffect(() => {
    if (session?.currentStage === 'review1') {
      router.push('/analysis')
    }
  }, [session?.currentStage])

  // Progress bar animation while starting
  useEffect(() => {
    if (!starting) { setProgress(0); return }
    setProgress(10)
    const intervals = [
      setTimeout(() => setProgress(30), 1000),
      setTimeout(() => setProgress(50), 3000),
      setTimeout(() => setProgress(70), 6000),
      setTimeout(() => setProgress(85), 10000),
    ]
    return () => intervals.forEach(clearTimeout)
  }, [starting])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const pages = await confluenceApi.search(query)
      setResults(pages)
    } catch (e) { console.error(e) }
    finally { setSearching(false) }
  }

  const togglePage = (page: ConfluencePage) => {
    setSelected((prev) =>
      prev.find((p) => p.id === page.id)
        ? prev.filter((p) => p.id !== page.id)
        : [...prev, page]
    )
  }

  const isSelected = (page: ConfluencePage) => selected.some((p) => p.id === page.id)

  const handleFigmaFetch = async () => {
    if (!figmaUrl.trim()) return
    setFigmaLoading(true)
    setFigmaError(null)
    try {
      const frames = await figmaApi.getFrames(figmaUrl)
      setFigmaFrames(frames)
    } catch (e: any) {
      setFigmaError(e?.message ?? 'Failed to fetch Figma frames')
    } finally {
      setFigmaLoading(false)
    }
  }

  const handleStart = async () => {
    if (selected.length === 0) return
    setStarting(true)
    try {
      initSession(selected)
      const { session_id } = await analysisApi.start({
        page_ids: selected.map((p) => p.id),
        analysis_prompt: prompts.analysis || undefined,
        tc_prompt: prompts.tc || undefined,
        bdd_prompt: prompts.bdd || undefined,
        figma_frames: figmaFrames.length > 0 ? figmaFrames : undefined,
      })
      setProgress(100)
      setSessionId(session_id)
      setBackendSessionId(session_id)
      setStage('selection')
    } catch (e) { console.error(e) }
    finally { setStarting(false) }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-50 dark:bg-surface-800">
      {/* Progress bar */}
      {starting && (
        <div className="h-1 w-full bg-surface-200 dark:bg-surface-700">
          <div
            className="h-1 bg-brand-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              AI-Assisted QA Analysis
            </h1>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              Search and select Confluence pages to analyze
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search Confluence pages..."
              className="flex-1 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 px-4 py-3 text-sm text-surface-900 dark:text-white outline-none focus:border-brand-500 dark:focus:border-brand-500 placeholder:text-surface-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-surface-400 dark:text-surface-500">
                {selected.length > 0
                  ? `${selected.length} page${selected.length > 1 ? 's' : ''} selected`
                  : 'Click to select pages'}
              </p>
              <div className="flex flex-col gap-1.5 max-h-[calc(100vh-400px)] overflow-y-auto">
                {results.map((page) => {
                  const sel = isSelected(page)
                  return (
                    <button
                      key={page.id}
                      onClick={() => togglePage(page)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        sel
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-400'
                          : 'border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 hover:border-brand-300 dark:hover:border-surface-500'
                      }`}
                    >
                      {sel
                        ? <CheckSquare size={16} className="shrink-0 text-brand-500" />
                        : <Square size={16} className="shrink-0 text-surface-300 dark:text-surface-500" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{page.title}</p>
                        {(page as any).space && (
                          <p className="text-xs text-surface-400 truncate">{(page as any).space}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Figma Context (always visible) */}
          <div className="mt-6 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Figma size={16} className="text-surface-500 dark:text-surface-400" />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">Figma Context</span>
              <span className="text-xs text-surface-400 dark:text-surface-500 ml-1">(optional)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={figmaUrl}
                onChange={(e) => {
                  setFigmaUrl(e.target.value)
                  setFigmaFrames([])
                  setFigmaError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleFigmaFetch()}
                placeholder="https://www.figma.com/design/..."
                className="flex-1 rounded-lg border border-surface-200 dark:border-surface-500 bg-surface-50 dark:bg-surface-600 px-4 py-2.5 text-sm text-surface-900 dark:text-white outline-none focus:border-brand-500 placeholder:text-surface-400"
              />
              <button
                onClick={handleFigmaFetch}
                disabled={figmaLoading || !figmaUrl.trim()}
                className="flex items-center gap-2 rounded-lg bg-surface-100 dark:bg-surface-600 px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-500 disabled:opacity-50 transition-colors"
              >
                {figmaLoading ? <Loader2 size={16} className="animate-spin" /> : 'Fetch Frames'}
              </button>
            </div>

            {figmaError && (
              <p className="mt-2 text-xs text-red-500">{figmaError}</p>
            )}

            {figmaFrames.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {figmaFrames.length} frames loaded — will be passed to AI as context
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {figmaFrames.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1 rounded-md bg-surface-50 dark:bg-surface-600 border border-surface-200 dark:border-surface-500 px-2 py-0.5 text-xs text-surface-600 dark:text-surface-300"
                    >
                      {f.page && (
                        <span className="text-surface-400 dark:text-surface-500">{f.page} /</span>
                      )}
                      {f.name}
                      <button
                        onClick={() => setFigmaFrames((prev) => prev.filter((x) => x.id !== f.id))}
                        className="ml-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected + Start */}
          {selected.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <PromptEditor
                label="Analysis Prompt"
                value={prompts.analysis}
                defaultValue={DEFAULT_ANALYSIS_PROMPT}
                onChange={(v) => setPrompt('analysis', v)}
              />
              <button
                onClick={handleStart}
                disabled={starting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-70 transition-colors"
              >
                {starting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {starting
                  ? 'Analyzing requirements...'
                  : `Start Analysis${selected.length > 1 ? ` (${selected.length} pages)` : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
