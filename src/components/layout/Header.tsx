'use client'
import { useSessionStore } from '@/stores/session.store'
import { STAGES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?:    string
  subtitle?: string
  actions?:  React.ReactNode
}

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-surface-100 text-surface-500',
  in_review: 'bg-amber-50 text-amber-700',
  approved:  'bg-green-50 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  draft:     'Draft',
  in_review: 'In review',
  approved:  'Approved',
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const session = useSessionStore((s) => s.session)

  const stageLabel = session
    ? STAGES.find((s) => s.key === session.currentStage)?.label
    : null

  const analysisStatus = session?.analysis?.status

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-6">
      <div>
        <h1 className="text-[15px] font-medium text-surface-900">
          {title ?? stageLabel ?? 'Pulsar'}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-surface-400">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {analysisStatus && (
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', STATUS_STYLES[analysisStatus])}>
            {STATUS_LABELS[analysisStatus]}
          </span>
        )}
        {actions}
      </div>
    </header>
  )
}