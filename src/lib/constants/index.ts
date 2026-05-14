export const STAGES = [
  { key: 'selection',   step: '1', label: 'Page Selection' },
  { key: 'analysis',   step: '2', label: 'Analysis'        },
  { key: 'review1',    step: '3', label: 'Gap Review'      },
  { key: 'generation', step: '4', label: 'TC Generation'   },
  { key: 'review2',    step: '5', label: 'TC Review'       },
  { key: 'export',     step: '6', label: 'Export'          },
] as const

export const SCORE_THRESHOLDS = {
  critical: 40,
  warning: 70,
  good: 90,
} as const
