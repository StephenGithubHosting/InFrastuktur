import { requireSupabase, supabase } from './supabaseClient.js'

export const PROGRESS_REQUESTS_UPDATED_EVENT = 'progress-delete-requests-updated'
export const PROGRESS_REQUEST_STATUSES = {
  pending: 'Menunggu ditinjau',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

function mapRequest(row) {
  return {
    id: row.id,
    progressId: row.progress_id,
    progressTitle: row.progress_title,
    progressDate: row.progress_date,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }
}

function notifyRequestsUpdated() {
  window.dispatchEvent(new Event(PROGRESS_REQUESTS_UPDATED_EVENT))
}

export async function loadProgressDeleteRequests() {
  const { data, error } = await requireSupabase()
    .from('progress_delete_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapRequest)
}

export async function submitProgressDeleteRequest(request) {
  const client = requireSupabase()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  if (!userData.user) throw new Error('Masuk sebagai reporter untuk mengirim permintaan.')

  const { data, error } = await client
    .from('progress_delete_requests')
    .insert({
      progress_id: request.progressId,
      progress_title: request.progressTitle,
      progress_date: request.progressDate,
      reporter_id: userData.user.id,
      reporter_name: request.reporterName,
      reason: request.reason,
    })
    .select('*')
    .single()

  if (error) throw error
  notifyRequestsUpdated()
  return mapRequest(data)
}

export async function importLegacyProgressRequests(requests = []) {
  if (!requests.length) return 0

  const rows = requests.map((request, index) => ({
    legacy_id: String(request.id || `legacy-delete-request-${index}`),
    progress_id: String(request.progressId || ''),
    progress_title: String(request.progressTitle || ''),
    progress_date: request.progressDate,
    reporter_id: null,
    reporter_name: String(request.reporterName || ''),
    reason: String(request.reason || ''),
    status: Object.hasOwn(PROGRESS_REQUEST_STATUSES, request.status)
      ? request.status
      : 'pending',
    created_at: request.createdAt || new Date().toISOString(),
  }))

  const { error } = await requireSupabase()
    .from('progress_delete_requests')
    .upsert(rows, { onConflict: 'legacy_id', ignoreDuplicates: true })

  if (error) throw error
  window.dispatchEvent(new Event(PROGRESS_REQUESTS_UPDATED_EVENT))
  return rows.length
}

export async function updateProgressDeleteRequestStatus(requestId, status) {
  if (!Object.hasOwn(PROGRESS_REQUEST_STATUSES, status)) {
    throw new Error('Status permintaan tidak dikenal.')
  }

  const { data, error } = await requireSupabase()
    .from('progress_delete_requests')
    .update({ status })
    .eq('id', requestId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Permintaan tidak ditemukan atau akses ditolak.')
  notifyRequestsUpdated()
}

export function subscribeToProgressRequests(onChange) {
  const client = supabase
  if (!client) return () => {}

  const channel = client
    .channel(`progress-requests-${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'progress_delete_requests' },
      onChange,
    )
    .subscribe()

  return () => client.removeChannel(channel)
}
