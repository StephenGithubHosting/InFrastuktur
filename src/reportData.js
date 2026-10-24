export const REPORT_STORAGE_KEY = 'infrastuktur-discrepancy-reports'
export const REPORTS_UPDATED_EVENT = 'discrepancy-reports-updated'

export const REPORT_STATUSES = {
  pending: 'Belum ditinjau',
  reviewing: 'Sedang ditinjau',
  resolved: 'Selesai ditinjau',
}

export function loadReports() {
  const savedReports = localStorage.getItem(REPORT_STORAGE_KEY)

  if (!savedReports) return []

  const reports = JSON.parse(savedReports)

  if (!Array.isArray(reports)) {
    throw new Error('Format penyimpanan laporan tidak valid.')
  }

  return reports
}

function persistReports(reports) {
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports))
  window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT))
}

export function submitReport(report) {
  const reports = loadReports()
  const savedReport = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }

  persistReports([savedReport, ...reports])
  return savedReport
}

export function updateReportStatus(reportId, status) {
  if (!Object.hasOwn(REPORT_STATUSES, status)) {
    throw new Error('Status laporan tidak dikenal.')
  }

  const reports = loadReports()
  const reportExists = reports.some((report) => report.id === reportId)

  if (!reportExists) {
    throw new Error('Laporan tidak ditemukan. Muat ulang daftar laporan.')
  }

  persistReports(
    reports.map((report) =>
      report.id === reportId ? { ...report, status } : report,
    ),
  )
}

export function deleteReport(reportId) {
  const reports = loadReports()
  const remainingReports = reports.filter((report) => report.id !== reportId)

  if (remainingReports.length === reports.length) {
    throw new Error('Laporan tidak ditemukan. Muat ulang daftar laporan.')
  }

  persistReports(remainingReports)
}
