'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react'

interface PromptEditorProps {
  label: string
  value: string
  defaultValue: string
  onChange: (v: string) => void
}

export function PromptEditor({ label, value, defaultValue, onChange }: PromptEditorProps) {
  const [open, setOpen] = useState(false)
  const isCustom = value.trim() !== '' && value.trim() !== defaultValue.trim()

  return (
    <div className="rounded-lg border border-surface-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-surface-400" />
          {label}
          {isCustom && (
            <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
              Custom
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} className="text-surface-400" /> : <ChevronDown size={14} className="text-surface-400" />}
      </button>

      {open && (
        <div className="border-t border-surface-100 p-4">
          <textarea
            value={value || defaultValue}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full rounded-md border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-xs text-surface-700 outline-none focus:border-brand-400 resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 transition-colors"
            >
              <RotateCcw size={11} />
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

