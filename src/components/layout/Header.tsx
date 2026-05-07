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
  draft:     'bg-surface-800 text-surface-400',
  in_review: 'bg-amber-950 text-amber-400',
  approved:  'bg-green-950 text-green-400',
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-800 bg-surface-950 px-6">
      <div>
        <h1 className="text-[15px] font-medium text-surface-50">
          {title ?? stageLabel ?? 'Pulsar'}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-surface-500">{subtitle}</p>
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