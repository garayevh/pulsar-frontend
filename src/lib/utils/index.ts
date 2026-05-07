import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { SCORE_THRESHOLDS } from '@/lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreLabel(score: number) {
  if (score <= SCORE_THRESHOLDS.low.max)    return SCORE_THRESHOLDS.low
  if (score <= SCORE_THRESHOLDS.medium.max) return SCORE_THRESHOLDS.medium
  if (score <= SCORE_THRESHOLDS.high.max)   return SCORE_THRESHOLDS.high
  return SCORE_THRESHOLDS.great
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}