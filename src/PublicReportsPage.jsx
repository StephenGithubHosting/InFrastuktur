import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import ReportPage from './ReportPage.jsx'
import {
  loadReports,
  REPORTS_UPDATED_EVENT,
  REPORT_STATUSES,
} from './reportData.js'
import './PublicReportsPage.css'

const navigationIconPaths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  flag: (
    <>
      <path d="M4 22V4" />
      <path d="M4 4c5-4 9 4 16 0v12c-7 4-11-4-16 0" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 9h18M16 15h.01" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </>
  ),
  camera: (
    <>
      <path d="M14 5h-4l-2 3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3z" />
      <circle cx="12" cy="14" r="3" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
}

function NavigationIcon({ name }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {navigationIconPaths[name]}
    </svg>
  )
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')
  const isMobileViewport = window.matchMedia('(max-width: 850px)').matches

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
  const isSubmitView = searchParams.get('view') === 'submit'

  function handleTabKeyDown(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return

    event.preventDefault()
    const nextIsSubmit =
      event.key === 'End' ||
      (event.key === 'ArrowRight' && !isSubmitView) ||
      (event.key === 'ArrowLeft' && isSubmitView)
    const nextTabId = nextIsSubmit ? 'submit-report-tab' : 'reports-tab'
    document.getElementById(nextTabId)?.focus()
    setSearchParams(nextIsSubmit ? { view: 'submit' } : {})
  }

  return (
    <div
      className={`app-shell view-reports public-reports-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isDarkTheme ? 'dark-theme theme-dark' : ''}`}
    >
      <header className="topbar" role="banner">
        <button
          className="mobile-menu icon-button"
          type="button"
          aria-label={
            isMobileViewport
              ? mobileNavOpen
                ? 'Tutup menu'
                : 'Buka menu'
              : sidebarCollapsed
                ? 'Tampilkan sidebar'
                : 'Sembunyikan sidebar'
          }
          aria-expanded={isMobileViewport ? mobileNavOpen : !sidebarCollapsed}
          onClick={() => {
            if (window.matchMedia('(max-width: 850px)').matches) {
              setMobileNavOpen((isOpen) => !isOpen)
            } else {
              setSidebarCollapsed((isCollapsed) => !isCollapsed)
            }
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link className="brand topbar-brand" to="/ringkasan" aria-label="InFrastuktur">
          <span className="brand-mark"><BrandMark /></span>
          <span className="brand-name">In<span>Frastuktur</span></span>
        </Link>
        <div className="breadcrumb">
          <Link to="/ringkasan">Proyek publik</Link>
          <span aria-hidden="true">›</span>
          <strong>Laporan warga</strong>
        </div>
        <div className="topbar-actions">
          <ThemeToggle />
          <Link className="topbar-landing-link" to="/">
            Beranda
          </Link>
        </div>
      </header>

      <aside
        className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}
        role="complementary"
      >
        <div className="workspace-switch">
          <span className="workspace-avatar">DK</span>
          <span className="workspace-copy">
            <strong>Dashboard publik</strong>
            <small>Kab. Sleman, DIY</small>
          </span>
          <span className="switch-caret">⌄</span>
        </div>

        <p className="nav-heading">MENU UTAMA</p>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link
            className="nav-link"
            to="/ringkasan"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="grid" />
            <span>Ringkasan</span>
          </Link>
          <Link
            className="nav-link nav-active"
            to="/laporan-warga"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="flag" />
            <span>Laporan warga</span>
          </Link>
          <Link
            className="nav-link"
            to="/anggaran"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="wallet" />
            <span>Anggaran</span>
          </Link>
          <Link
            className="nav-link"
            to="/anggaran/material"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="wallet" />
            <span>Rincian material</span>
          </Link>
          <Link
            className="nav-link"
            to="/detail"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="building" />
            <span>Detail proyek</span>
          </Link>
          <Link
            className="nav-link"
            to="/dokumentasi"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="camera" />
            <span>Dokumentasi</span>
          </Link>
          <Link
            className="nav-link"
            to="/dokumen"
            onClick={() => setMobileNavOpen(false)}
          >
            <NavigationIcon name="file" />
            <span>Dokumen</span>
          </Link>
        </nav>

        <div className="sidebar-project">
          <div className="sidebar-project-icon">
            <NavigationIcon name="building" />
          </div>
          <div>
            <span>PROYEK AKTIF</span>
            <strong>Puskesmas Prambanan</strong>
          </div>
          <i className="online-dot" />
        </div>

        <div className="sidebar-access-links">
          <Link className="sidebar-login-link sidebar-admin-link" to="/login">
            Masuk admin
          </Link>
          <Link className="sidebar-login-link sidebar-reporter-link" to="/login">
            Masuk reporter
          </Link>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="main-content">
        <div className="page-container">
        <div className="public-reports-heading">
          <span className="public-reports-kicker">TRANSPARANSI PUBLIK</span>
          <h1>Laporan warga</h1>
          <p>
            Kirim temuan proyek atau lihat laporan warga dan status
            tindak lanjutnya dalam satu halaman.
          </p>
        </div>

        <div className="public-reports-notice" role="note">
          Data prototipe ini tersimpan di browser dan perangkat ini. Laporan
          belum dibagikan ke perangkat lain.
        </div>

        <div className="public-reports-tabs" role="tablist" aria-label="Jenis laporan">
          <button
            id="reports-tab"
            className={`public-reports-tab ${!isSubmitView ? 'tab-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={!isSubmitView}
            aria-controls="reports-layer"
            tabIndex={isSubmitView ? -1 : 0}
            onKeyDown={handleTabKeyDown}
            onClick={() => setSearchParams({})}
          >
            Laporan warga
          </button>
          <button
            id="submit-report-tab"
            className={`public-reports-tab ${isSubmitView ? 'tab-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={isSubmitView}
            aria-controls="submit-report-layer"
            tabIndex={isSubmitView ? 0 : -1}
            onKeyDown={handleTabKeyDown}
            onClick={() => setSearchParams({ view: 'submit' })}
          >
            Laporkan ketidaksesuaian
          </button>
        </div>

        <section
          id="reports-layer"
          className={`public-reports-layer ${!isSubmitView ? 'layer-active' : ''}`}
          aria-label="Daftar laporan"
          role="tabpanel"
          aria-labelledby="reports-tab"
          hidden={isSubmitView}
        >
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
                  {report.relatedProgressId && (
                    <span className="public-report-related-progress">
                      Terkait progres: {report.relatedProgressId}
                    </span>
                  )}
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

        </section>
        <section
          id="submit-report-layer"
          className={`public-reports-layer ${isSubmitView ? 'layer-active' : ''}`}
          aria-label="Formulir laporan"
          role="tabpanel"
          aria-labelledby="submit-report-tab"
          hidden={!isSubmitView}
        >
          <ReportPage embedded />
        </section>
        </div>
      </main>
    </div>
  )
}
