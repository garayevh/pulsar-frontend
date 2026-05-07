import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AnalysisSession, ConfluencePage, AnalysisResult, TestCase } from '@/types'

interface SessionStore {
  session: AnalysisSession | null
  isLoading: boolean
  error: string | null
  initSession: (pages: ConfluencePage[], figmaUrl?: string) => void
  setAnalysisResult: (result: AnalysisResult) => void
  setTestCases: (cases: TestCase[]) => void
  setStage: (stage: AnalysisSession['currentStage']) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>()(
  devtools((set) => ({
    session: null,
    isLoading: false,
    error: null,

    initSession: (pages, figmaUrl) =>
      set({
        session: {
          id: crypto.randomUUID(),
          pages,
          figmaUrl,
          currentStage: 'analysis',
          createdAt: new Date().toISOString(),
        },
      }),

    setAnalysisResult: (result) =>
      set((s) => ({ session: s.session ? { ...s.session, analysis: result } : null })),

    setTestCases: (testCases) =>
      set((s) => ({ session: s.session ? { ...s.session, testCases } : null })),

    setStage: (stage) =>
      set((s) => ({ session: s.session ? { ...s.session, currentStage: stage } : null })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    reset: () => set({ session: null, isLoading: false, error: null }),
  }))
)