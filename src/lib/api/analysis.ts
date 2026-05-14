import { api } from './client'
import type { Gap, TestCase } from '@/types'

export interface StartAnalysisRequest {
  page_ids: string[]
  page_title: string
}

export interface SessionState {
  session_id: string
  stage: 'analyzing' | 'gap_review' | 'tc_generation' | 'tc_review' | 'done' | 'error'
  progress?: number
  gaps?: Gap[]
  test_cases?: TestCase[]
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
    api.post<{ session_id: string }>('/analysis/start', body),

  getSession: (sessionId: string) =>
    api.get<SessionState>(`/analysis/${sessionId}`),

  reviewGap: (body: GapReviewRequest) =>
    api.post<void>('/review/gap', body),

  reviewTestCases: (session_id: string, approved: boolean) =>
    api.post<void>('/review/test-cases', { session_id, approved }),

  export: (sessionId: string, format: 'bdd' | 'csv' = 'bdd') =>
    api.get<{ content: string }>(`/export/${sessionId}?format=${format}`),
}
