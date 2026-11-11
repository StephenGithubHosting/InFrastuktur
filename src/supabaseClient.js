import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const SUPABASE_READS_EVENT = 'supabase-reads-changed'
let pendingReads = 0

function notifyReadCount() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SUPABASE_READS_EVENT, { detail: { pending: pendingReads } }),
    )
  }
}

async function trackedFetch(input, init = {}) {
  const method = String(init.method || input?.method || 'GET').toUpperCase()
  const isRead = method === 'GET' || method === 'HEAD'

  if (isRead) {
    pendingReads += 1
    notifyReadCount()
  }

  try {
    return await fetch(input, init)
  } finally {
    if (isRead) {
      pendingReads = Math.max(0, pendingReads - 1)
      notifyReadCount()
    }
  }
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { global: { fetch: trackedFetch } })
    : null

export function getPendingSupabaseReads() {
  return pendingReads
}

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return supabase
}