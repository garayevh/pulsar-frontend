export const STAGES = [
  { key: 'selection',      step: '1', label: 'Page Selection'  },
  { key: 'review1',        step: '2', label: 'Gap Review'       },
  { key: 'generation',     step: '3', label: 'Manual TC Gen'    },
  { key: 'review2',        step: '4', label: 'Manual TC Review' },
  { key: 'bdd_generation', step: '5', label: 'BDD Generation'   },
  { key: 'review3',        step: '6', label: 'BDD Review'       },
  { key: 'export',         step: '7', label: 'Export'           },
] as const

export const SCORE_THRESHOLDS = {
  critical: 40,
  warning: 70,
  good: 90,
} as const
