export interface ConfluencePage {
  id: string
  title: string
  spaceKey: string
  spaceName: string
  url: string
  lastModified: string
  excerpt?: string
}

export type GapType =
  | 'missing_negative_scenario'
  | 'missing_validation'
  | 'missing_error_handling'
  | 'missing_edge_case'
  | 'ambiguity'

export type GapStatus = 'open' | 'clarified' | 'exported'

export interface Gap {
  id: string
  type: GapType
  title: string
  description: string
  clarificationQuestion: string
  status: GapStatus
  userClarification?: string
  scoreImpact: number
}

export interface ScoreFactor {
  label: string
  impact: number
  type: 'penalty' | 'bonus' | 'recovery'
  description: string
}

export interface CompletenessScore {
  total: number
  factors: ScoreFactor[]
}

export interface AnalysisResult {
  id: string
  pageId: string
  pageTitle: string
  businessLogicSummary: string
  gaps: Gap[]
  score: CompletenessScore
  status: 'draft' | 'in_review' | 'approved'
  createdAt: string
  updatedAt: string
}

export type TestCaseType = 'positive' | 'negative' | 'edge' | 'risk'
export type TestCasePriority = 'critical' | 'high' | 'medium' | 'low'

export interface ManualTestCase {
  id: string
  title: string
  type: TestCaseType
  priority: TestCasePriority
  preconditions: string
  steps: string[]
  expected_result: string
  notes?: string
  generated_at?: string
  source_pages?: string[]
  manually_edited?: boolean
}

export interface BDDTestCase {
  id: string
  title: string
  type: TestCaseType
  priority: TestCasePriority
  given: string
  when: string
  then: string
  notes?: string
  generated_at?: string
  source_pages?: string[]
  manually_edited?: boolean
}

export type ExportTarget = 'csv' | 'excel' | 'jira' | 'testrail' | 'qmetry'

export interface ProjectSession {
  session_id: string
  page_title_display: string
  page_ids: string[]
  current_stage: string
  score: { total: number; breakdown: any[] }
  created_at: string
  updated_at: string
}

export interface AnalysisSession {
  id: string
  pages: ConfluencePage[]
  figmaUrl?: string
  analysis?: AnalysisResult
  manualTestCases?: ManualTestCase[]
  bddTestCases?: BDDTestCase[]
  currentStage: 'selection' | 'analysis' | 'review1' | 'generation' | 'review2' | 'bdd_generation' | 'review3' | 'export'
  createdAt: string
}