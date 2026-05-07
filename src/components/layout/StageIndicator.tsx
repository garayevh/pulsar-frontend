'use client'
import { cn } from '@/lib/utils'
import { STAGES } from '@/lib/constants'
import type { AnalysisSession } from '@/types'
import { Check } from 'lucide-react'

interface StageIndicatorProps {
  currentStage: AnalysisSession['currentStage']
}

const STAGE_KEYS = STAGES.map((s) => s.key)

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = STAGE_KEYS.indexOf(currentStage)

  return (
    <nav aria-label="Workflow stages">
      <p className="mb-2.5 px-2 text-[11px] font-medium uppercase tracking-widest text-surface-400">
        Workflow
      </p>
      {STAGES.map((stage, i) => {
        const isDone    = i < currentIndex
        const isActive  = i === currentIndex
        const isPending = i > currentIndex
        const isLast    = i === STAGES.length - 1
        return (
          <div key={stage.key}>
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors',
                isActive && 'bg-brand-50',
                !isActive && !isDone && 'opacity-50',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={cn(
                  'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                  isDone    && 'bg-brand-100 text-brand-700',
                  isActive  && 'bg-brand-500 text-white',
                  isPending && 'border border-surface-200 bg-surface-100 text-surface-400',
                )}
              >
                {isDone ? <Check size={12} strokeWidth={2.5} /> : stage.step}
              </div>
              <span
                className={cn(
                  'text-[13px]',
                  isActive  && 'font-medium text-brand-700',
                  isDone    && 'text-surface-500',
                  isPending && 'text-surface-400',
                )}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div className="ml-[19px] h-3 w-px bg-surface-200" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </nav>
  )
}