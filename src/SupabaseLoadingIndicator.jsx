import { useEffect, useState } from 'react'
import {
  getPendingSupabaseReads,
  SUPABASE_READS_EVENT,
} from './supabaseClient.js'
import { useTheme } from './theme.js'
import './SupabaseLoadingIndicator.css'

export default function SupabaseLoadingIndicator() {
  const { isDarkTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(
    () => getPendingSupabaseReads() > 0,
  )

  useEffect(() => {
    function updateLoadingState(event) {
      setIsLoading(event.detail.pending > 0)
    }

    window.addEventListener(SUPABASE_READS_EVENT, updateLoadingState)
    return () => {
      window.removeEventListener(SUPABASE_READS_EVENT, updateLoadingState)
    }
  }, [])

  if (!isLoading) return null

  return (
    <aside
      className={`supabase-loading-indicator ${isDarkTheme ? 'supabase-loading-dark' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="supabase-loading-spinner" aria-hidden="true" />
      <span className="supabase-loading-copy">
        <strong>Mengambil data terbaru</strong>
        <small>dari database</small>
      </span>
    </aside>
  )
}