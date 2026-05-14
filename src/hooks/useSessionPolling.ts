import { useEffect, useRef } from 'react'
import { analysisApi } from '@/lib/api/analysis'
import { useSessionStore } from '@/stores/session.store'

const POLL_INTERVAL = 2000

export function useSessionPolling(sessionId: string | null) {
  const { setStage, setLoading, setError } = useSessionStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!sessionId) return

    setLoading(true)

    intervalRef.current = setInterval(async () => {
      try {
        const session = await analysisApi.getSession(sessionId)
        const stage = (session as any).current_stage

        if (stage === 'human_review_1') {
          setStage('review1')
          setLoading(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else if (stage === 'human_review_2') {
          setStage('review2')
          setLoading(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else if (stage === 'done') {
          setStage('export')
          setLoading(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else if (stage === 'error') {
          setError(session.error || 'Unknown error')
          setLoading(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch (err) {
        setError('Failed to fetch session state')
        setLoading(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sessionId])
}