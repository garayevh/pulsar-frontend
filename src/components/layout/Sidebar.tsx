'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StageIndicator } from './StageIndicator'
import { useSessionStore } from '@/stores/session.store'

const NAV_BOTTOM = [
  { href: '/history',  label: 'History',  icon: History  },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const session  = useSessionStore((s) => s.session)

  return (
    <aside className="flex h-full w-[220px] min-w-[220px] flex-col border-r border-surface-200 bg-white">
      <div className="border-b border-surface-200 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
          <span className="text-[18px] font-medium text-surface-900">Pulsar</span>
        </div>
        <p className="mt-0.5 text-[11px] text-surface-400">AI-Assisted QA Platform</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <StageIndicator currentStage={session?.currentStage ?? 'selection'} />
      </div>

      <div className="border-t border-surface-200 p-3">
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] transition-colors',
              pathname === href
                ? 'bg-surface-100 text-surface-900'
                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700',
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}