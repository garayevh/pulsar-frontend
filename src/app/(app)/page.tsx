'use client'
import { useState } from 'react'
import { Search, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { confluenceApi } from '@/lib/api/confluence'
import { analysisApi } from '@/lib/api/analysis'
import { useSessionStore } from '@/stores/session.store'
import { useSessionPolling } from '@/hooks/useSessionPolling'
import type { ConfluencePage } from '@/types'

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ConfluencePage[]>([])
  const [selected, setSelected] = useState<ConfluencePage | null>(null)
  const [searching, setSearching] = useState(false)
  const [starting, setStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { initSession, setStage } = useSessionStore()
  useSessionPolling(sessionId)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const pages = await confluenceApi.search(query)
      setResults(pages)
    } catch (e) { console.error(e) }
    finally { setSearching(false) }
  }

  const handleStart = async () => {
    if (!selected) return
    setStarting(true)
    try {
      initSession([selected])
      const { session_id } = await analysisApi.start({ page_ids: [selected.id], page_title: selected.title })
      setSessionId(session_id)
      setStage('analysis')
    } catch (e) { console.error(e) }
    finally { setStarting(false) }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-sm text-surface-500">Search a Confluence page to start analysis</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search Confluence pages..."
          className="flex-1 rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {results.map((page) => (
            <div
              key={page.id}
              onClick={() => setSelected(page)}
              className={selected?.id === page.id
                ? 'cursor-pointer rounded-lg border border-brand-500 bg-brand-50 p-4'
                : 'cursor-pointer rounded-lg border border-surface-200 bg-white p-4 hover:border-brand-200'}
            >
              <div className="flex items-start gap-3">
                <FileText size={18} className="mt-0.5 shrink-0 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900">{page.title}</p>
                  <p className="mt-0.5 text-xs text-surface-400">{page.spaceKey}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <button
          onClick={handleStart}
          disabled={starting}
          className="flex items-center gap-2 self-start rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {starting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Start Analysis
        </button>
      )}
    </div>
  )
}