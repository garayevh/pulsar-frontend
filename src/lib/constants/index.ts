export const STAGES = [
  { key: 'selection',      step: '1', label: 'Page Selection'  },
  { key: 'review1',        step: '2', label: 'Gap Review'       },
  { key: 'review2',        step: '3', label: 'Manual TC Review' },
  { key: 'review3',        step: '4', label: 'BDD Review'       },
  { key: 'export',         step: '5', label: 'Export'           },
] as const

export const SCORE_THRESHOLDS = {
  low:    { max: 40,  label: 'Critical', color: 'text-red-600'    },
  medium: { max: 70,  label: 'Warning',  color: 'text-yellow-600' },
  high:   { max: 90,  label: 'Good',     color: 'text-blue-600'   },
  great:  { max: 100, label: 'Great',    color: 'text-green-600'  },
}
