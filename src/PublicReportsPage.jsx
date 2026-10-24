import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import {
  loadReports,
  REPORTS_UPDATED_EVENT,
  REPORT_STATUSES,
} from './reportData.js'
import './PublicReportsPage.css'

function formatReportDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

export default function PublicReportsPage() {
  const { isDarkTheme } = useTheme()
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    function refreshReports() {
      try {
        setReports(loadReports())
        setErrorMessage('')
      } catch (error) {
        console.error('Gagal memuat laporan publik.', error)
        setErrorMessage(
          'Daftar laporan tidak dapat dibaca. Coba muat ulang halaman.',
        )
      }
    }

    refreshReports()
    window.addEventListener(REPORTS_UPDATED_EVENT, refreshReports)
    window.addEventListener('storage', refreshReports)

    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, refreshReports)
      window.removeEventListener('storage', refreshReports)
    }
  }, [])

  const visibleReports =
    filter === 'all'
      ? reports
      : reports.filter((report) => report.status === filter)

  return (
    <div className={`public-reports-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="public-reports-header">
        <Link className="public-reports-brand" to="/">
          <span className="public-reports-brand-mark">I</span>
          <span>InFrastuktur</span>
        </Link>
        <div className="public-reports-header-actions">
          <ThemeToggle />
          <Link className="public-reports-back" to="/">
            Kembali ke proyek
          </Link>
        </div>
      </header>

      <main className="public-reports-content">
        <div className="public-reports-heading">
          <span className="public-reports-kicker">TRANSPARANSI PUBLIK</span>
          <h1>Laporan warga</h1>
          <p>
            Lihat laporan ketidaksesuaian yang telah dikirim dan status
            tindak lanjutnya. Nama serta kontak pelapor tidak ditampilkan.
          </p>
        </div>

        <div className="public-reports-notice" role="note">
          Data prototipe ini tersimpan di browser dan perangkat ini. Laporan
          belum dibagikan ke perangkat lain.
        </div>

        <section className="public-reports-panel" aria-label="Daftar laporan">
          <div className="public-reports-toolbar">
            <div>
              <h2>Daftar laporan</h2>
              <span>{visibleReports.length} laporan</span>
            </div>
            <label>
              <span>Filter status</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">Semua status</option>
                {Object.entries(REPORT_STATUSES).map(([status, title]) => (
                  <option key={status} value={status}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {errorMessage ? (
            <div className="public-reports-error" role="alert">
              {errorMessage}
            </div>
          ) : visibleReports.length ? (
            <div className="public-report-list">
              {visibleReports.map((report) => (
                <article className="public-report-card" key={report.id}>
                  <div className="public-report-card-heading">
                    <div>
                      <span className="public-report-category">
                        {report.category || 'Kategori tidak tersedia'}
                      </span>
                      <h3>{report.location || 'Lokasi tidak tersedia'}</h3>
                      <time dateTime={report.createdAt}>
                        {formatReportDate(report.createdAt)}
                      </time>
                    </div>
                    <span
                      className={`public-report-status status-${report.status}`}
                    >
                      {REPORT_STATUSES[report.status] || 'Status tidak dikenal'}
                    </span>
                  </div>
                  <p className="public-report-description">
                    {report.description || 'Deskripsi tidak tersedia.'}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="public-reports-empty">
              <strong>
                {reports.length
                  ? 'Tidak ada laporan dengan status ini'
                  : 'Belum ada laporan terkirim'}
              </strong>
              <p>
                {reports.length
                  ? 'Pilih status lain untuk melihat laporan.'
                  : 'Laporan yang dikirim melalui formulir warga akan muncul di sini.'}
              </p>
            </div>
          )}
        </section>

        <Link
          className="public-reports-submit public-reports-submit-bottom"
          to="/laporan-ketidaksesuaian"
        >
          Kirim laporan baru
        </Link>
      </main>
    </div>
  )
}
