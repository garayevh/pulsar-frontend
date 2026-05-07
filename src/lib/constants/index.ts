export const STAGES = [
  { key: 'selection',  label: 'Page Selection',  step: 1 },
  { key: 'analysis',   label: 'AI Analysis',      step: 2 },
  { key: 'review1',    label: 'Human Review #1',  step: 3 },
  { key: 'generation', label: 'TC Generation',    step: 4 },
  { key: 'review2',    label: 'Human Review #2',  step: 5 },
  { key: 'export',     label: 'Export',           step: 6 },
] as const

export const GAP_TYPE_LABELS: Record<string, string> = {
  missing_negative_scenario: 'Missing Negative Scenario',
  missing_validation:        'Missing Validation',
  missing_error_handling:    'Missing Error Handling',
  missing_edge_case:         'Missing Edge Case',
  ambiguity:                 'Ambiguity',
}

export const GAP_SCORE_IMPACTS: Record<string, number> = {
  missing_negative_scenario: -10,
  missing_validation:        -8,
  missing_error_handling:    -6,
  missing_edge_case:         -5,
  ambiguity:                 -4,
}

export const SCORE_THRESHOLDS = {
  low:    { max: 50,  label: 'Poor',      color: 'text-red-500'   },
  medium: { max: 75,  label: 'Fair',      color: 'text-amber-500' },
  high:   { max: 90,  label: 'Good',      color: 'text-blue-500'  },
  great:  { max: 100, label: 'Excellent', color: 'text-green-500' },
}

export const API_ROUTES = {
  confluence: {
    search: '/api/confluence/search',
    pages:  '/api/confluence/pages',
  },
  analysis: {
    start:   '/api/analysis/start',
    clarify: '/api/analysis/clarify',
    approve: '/api/analysis/approve',
  },
  testCases: {
    generate: '/api/test-cases/generate',
    approve:  '/api/test-cases/approve',
  },
  export: '/api/export',
} as const