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

export type TestCaseType = 'positive' | 'negative' | 'edge' | 'risk_based'
export type TestCasePriority = 'critical' | 'high' | 'medium' | 'low'

export interface TestCase {
  id: string
  title: string
  type: TestCaseType
  priority: TestCasePriority
  preconditions: string
  steps: string[]
  expectedResult: string
  sourceGapId?: string
  approved: boolean
}

export type ExportTarget = 'csv' | 'excel' | 'jira' | 'testrail' | 'qmetry'

export interface ExportConfig {
  target: ExportTarget
  testCaseIds: string[]
  projectKey?: string
}

export interface AnalysisSession {
  id: string
  pages: ConfluencePage[]
  figmaUrl?: string
  analysis?: AnalysisResult
  testCases?: TestCase[]
  currentStage: 'selection' | 'analysis' | 'review1' | 'generation' | 'review2' | 'export'
  createdAt: string
}