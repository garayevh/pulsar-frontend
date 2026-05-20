function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return `"${s}"`
  }
  const csv = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportGapsToExcel(gaps: any[], sessionTitle: string) {
  const rows = gaps.map((gap, i) => ({
    '#': i + 1,
    'ID': gap.id,
    'Type': gap.type,
    'Description': gap.description,
    'Question': gap.question || gap.clarificationQuestion || '',
    'Penalty': gap.penalty || '',
  }))
  downloadCSV(`${sessionTitle}_gaps.csv`, rows)
}

export function exportManualTCToExcel(testCases: any[], sessionTitle: string) {
  const rows = testCases.map((tc, i) => ({
    '#': i + 1,
    'ID': tc.id,
    'Summary': tc.summary || tc.title || '',
    'Type': tc.type,
    'Priority': tc.priority,
    'Preconditions': tc.preconditions || '',
    'Steps': Array.isArray(tc.steps) ? tc.steps.join(' | ') : tc.steps || '',
    'Expected Result': tc.expected_result || '',
    'Actual Result': tc.actual_result || '',
    'Notes': tc.notes || '',
  }))
  downloadCSV(`${sessionTitle}_manual_tc.csv`, rows)
}

export function exportBDDToExcel(testCases: any[], sessionTitle: string) {
  const rows = testCases.map((tc, i) => {
    const raw = (tc as any).raw ?? tc
    return {
      '#': i + 1,
      'ID': tc.id || raw.id || '',
      'Title': tc.title || raw.title || '',
      'Type': tc.type || raw.type || '',
      'Priority': tc.priority || raw.priority || '',
      'Given': raw.given || tc.given || '',
      'When': raw.when || tc.when || '',
      'Then': raw.then || tc.then || '',
      'Notes': raw.notes || tc.notes || '',
      'BDD': tc.bdd || '',
    }
  })
  downloadCSV(`${sessionTitle}_bdd.csv`, rows)
}