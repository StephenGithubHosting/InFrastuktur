import { requireSupabase, supabase } from './supabaseClient.js'

export const REPORTS_UPDATED_EVENT = 'discrepancy-reports-updated'

export const REPORT_STATUSES = {
  pending: 'Belum ditinjau',
  reviewing: 'Sedang ditinjau',
  resolved: 'Selesai ditinjau',
}

function mapReport(row) {
  return {
    id: row.id,
    reporterName: row.reporter_name || '',
    contact: row.contact || '',
    category: row.category,
    location: row.location,
    description: row.description,
    relatedProgressId: row.related_progress_id || '',
    status: row.status,
    createdAt: row.created_at,
  }
}

function notifyReportsUpdated() {
  window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT))
}

export async function loadPublicReports() {
  const { data, error } = await requireSupabase()
    .from('reports')
    .select('id, category, location, description, related_progress_id, status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapReport)
}

export async function countPublicReports() {
  const { count, error } = await requireSupabase()
    .from('reports')
    .select('id', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

export async function loadReports() {
  const { data, error } = await requireSupabase()
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapReport)
}

export async function submitReport(report) {
  const { data, error } = await requireSupabase()
    .from('reports')
    .insert({
      reporter_name: report.reporterName,
      contact: report.contact,
      category: report.category,
      location: report.location,
      description: report.description,
      related_progress_id: report.relatedProgressId,
    })
    .select('id, status, created_at')
    .single()

  if (error) throw error
  notifyReportsUpdated()
  return { ...report, id: data.id, createdAt: data.created_at, status: data.status }
}

export async function importLegacyReports(reports = []) {
  if (!reports.length) return 0

  const rows = reports.map((report, index) => ({
    legacy_id: String(report.id || `legacy-report-${index}`),
    reporter_name: String(report.reporterName || ''),
    contact: String(report.contact || ''),
    category: String(report.category || 'Lainnya'),
    location: String(report.location || ''),
    description: String(report.description || ''),
    related_progress_id: String(report.relatedProgressId || ''),
    status: Object.hasOwn(REPORT_STATUSES, report.status)
      ? report.status
      : 'pending',
    created_at: report.createdAt || new Date().toISOString(),
  }))

  const { error } = await requireSupabase()
    .from('reports')
    .upsert(rows, { onConflict: 'legacy_id', ignoreDuplicates: true })

  if (error) throw error
  notifyReportsUpdated()
  return rows.length
}

export async function updateReportStatus(reportId, status) {
  if (!Object.hasOwn(REPORT_STATUSES, status)) {
    throw new Error('Status laporan tidak dikenal.')
  }

  const { data, error } = await requireSupabase()
    .from('reports')
    .update({ status })
    .eq('id', reportId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Laporan tidak ditemukan atau akses ditolak.')
  notifyReportsUpdated()
}

export async function deleteReport(reportId) {
  const { data, error } = await requireSupabase()
    .from('reports')
    .delete()
    .eq('id', reportId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Laporan tidak ditemukan atau akses ditolak.')
  notifyReportsUpdated()
}

export function subscribeToReports(onChange) {
  const client = supabase
  if (!client) return () => {}

  const channel = client
    .channel(`reports-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, onChange)
    .subscribe()

  return () => client.removeChannel(channel)
}
