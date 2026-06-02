import { api } from './client'
import type { Gap, ManualTestCase, BDDTestCase } from '@/types'

export interface StartAnalysisRequest {
  page_ids: string[]
  analysis_prompt?: string
  tc_prompt?: string
  bdd_prompt?: string
  figma_frames?: { id: string; name: string; type: string; page?: string }[]
}

export interface SessionState {
  session_id: string
  current_stage: string
  gaps?: any[]
  score?: any
  summary?: string
  manual_test_cases?: ManualTestCase[]
  bdd_test_cases?: BDDTestCase[]
  error?: string
}

export interface GapReviewRequest {
  session_id: string
  gap_id: string
  action: 'approve' | 'comment' | 'skip'
  comment?: string
}

export const analysisApi = {
  start: (body: StartAnalysisRequest) =>
    api.post<{ session_id: string; current_stage: string }>('/analysis/start', body),

  getSession: (sessionId: string) =>
    api.get<SessionState>(`/analysis/${sessionId}`),

  reviewGap: (body: GapReviewRequest) =>
    api.post<any>('/review/gap', body),

  reviewTestCases: (session_id: string, test_cases: ManualTestCase[], approved: boolean) =>
    api.post<any>('/review/test-cases', { session_id, test_cases, approved }),

  reviewBdd: (session_id: string, test_cases: BDDTestCase[], approved: boolean) =>
    api.post<any>('/review/bdd', { session_id, test_cases, approved }),

  export: (sessionId: string, format: 'bdd' | 'csv' = 'bdd') =>
    api.get<any>(`/export/${sessionId}?format=${format}`),

  getSessions: () =>
    api.get<{ sessions: any[] }>('/sessions'),

  deleteSession: (sessionId: string) =>
    api.delete<any>(`/sessions/${sessionId}`),

  updatePrompts: (session_id: string, prompts: { tc_prompt?: string; bdd_prompt?: string; analysis_prompt?: string }) =>
    api.post<any>('/session/prompts', { session_id, ...prompts }),

}