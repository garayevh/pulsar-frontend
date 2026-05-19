import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AnalysisSession, ConfluencePage, AnalysisResult, ManualTestCase, BDDTestCase } from '@/types'

interface SessionStore {
  session: AnalysisSession | null
  backendSessionId: string | null
  isLoading: boolean
  error: string | null
  resumedGapReviews: Record<string, { action: string; comment: string }>
  initSession: (pages: ConfluencePage[]) => void
  setBackendSessionId: (id: string) => void
  setAnalysisResult: (result: AnalysisResult) => void
  setManualTestCases: (cases: ManualTestCase[]) => void
  setBddTestCases: (cases: BDDTestCase[]) => void
  setStage: (stage: AnalysisSession['currentStage']) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  setResumedGapReviews: (reviews: Record<string, any>) => void
  resumeSession: (sessionId: string, stage: AnalysisSession['currentStage']) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>()(
  devtools((set) => ({
    session: null,
    backendSessionId: null,
    isLoading: false,
    error: null,
    resumedGapReviews: {},

    initSession: (pages) =>
      set({
        session: {
          id: crypto.randomUUID(),
          pages,
          currentStage: 'selection',
          createdAt: new Date().toISOString(),
        },
        resumedGapReviews: {},
      }),

    setBackendSessionId: (id) => set({ backendSessionId: id }),

    setAnalysisResult: (result) =>
      set((s) => ({
        session: s.session ? { ...s.session, analysis: result } : null,
      })),

    setManualTestCases: (manualTestCases) =>
      set((s) => ({
        session: s.session ? { ...s.session, manualTestCases } : null,
      })),

    setBddTestCases: (bddTestCases) =>
      set((s) => ({
        session: s.session ? { ...s.session, bddTestCases } : null,
      })),

    setStage: (stage) =>
      set((s) => ({
        session: s.session ? { ...s.session, currentStage: stage } : null,
      })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    setResumedGapReviews: (resumedGapReviews) => set({ resumedGapReviews }),

    resumeSession: (sessionId, stage) =>
      set({
        backendSessionId: sessionId,
        session: {
          id: sessionId,
          pages: [],
          currentStage: stage,
          createdAt: new Date().toISOString(),
        },
        resumedGapReviews: {},
      }),

    reset: () =>
      set({
        session: null,
        backendSessionId: null,
        isLoading: false,
        error: null,
        resumedGapReviews: {},
      }),
  }))
)

