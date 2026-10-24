import { lazy, Suspense, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminPage from './AdminPage.jsx'
import PublicReportsPage from './PublicReportsPage.jsx'
import ReportPage from './ReportPage.jsx'
import ThemeProvider from './ThemeProvider.jsx'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import {
  formatCompactRupiah,
  formatProjectDate,
  formatRupiah,
  useProjectData,
} from './projectData.js'
import './App.css'

const PdfViewer = lazy(() => import('./PdfViewer.jsx'))

const iconPaths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 9h18" />
      <path d="M16 15h.01" />
      <path d="M7 5V3h10v2" />
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
  flag: (
    <>
      <path d="M4 22V4" />
      <path d="M4 4c5-4 9 4 16 0v12c-7 4-11-4-16 0" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  arrow: (
    <>
      <path d="M7 17 17 7M7 7h10v10" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  close: (
    <>
      <path d="m18 6-12 12M6 6l12 12" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-5 5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
}

function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

const navItems = [
  { label: 'Ringkasan & anggaran', icon: 'grid', to: '/' },
  { label: 'Detail proyek', icon: 'building', to: '/detail' },
  { label: 'Dokumentasi', icon: 'camera', to: '/dokumentasi' },
  { label: 'Dokumen', icon: 'file', to: '/dokumen' },
  { label: 'Laporan warga', icon: 'flag', to: '/laporan-warga' },
]

function ViewerDashboard() {
  const project = useProjectData()
  const { pathname } = useLocation()
  const { isDarkTheme } = useTheme()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('')

  const budgetUsedPercent = project.budgetTotal
    ? Math.min(100, Math.round((project.budgetSpent / project.budgetTotal) * 100))
    : 0
  const budgetRemaining = Math.max(project.budgetTotal - project.budgetSpent, 0)
  const dateRange = `${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`
  const projectProgress = Math.min(100, Math.max(0, Number(project.progress)))
  const currentPage = navItems.find((item) => item.to === pathname)
  const isOverview = pathname === '/'
  const isProjectDetails = pathname === '/detail'
  const isDocumentation = pathname === '/dokumentasi'
  const isDocuments = pathname === '/dokumen'
  const isMobileViewport = window.matchMedia('(max-width: 850px)').matches

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isDarkTheme ? 'dark-theme' : ''}`}
    >
      <div className="topbar" role="banner">
        
        <button
          className="mobile-menu icon-button"
          aria-label={
            isMobileViewport
              ? mobileNavOpen
                ? 'Tutup menu'
                : 'Buka menu'
              : sidebarCollapsed
                ? 'Tampilkan sidebar'
                : 'Sembunyikan sidebar'
          }
          aria-expanded={
            isMobileViewport ? mobileNavOpen : !sidebarCollapsed
          }
          onClick={() => {
            if (window.matchMedia('(max-width: 850px)').matches) {
              setMobileNavOpen((isOpen) => !isOpen)
            } else {
              setSidebarCollapsed((isCollapsed) => !isCollapsed)
            }
          }}
        >
          <Icon name="menu" />
        </button>
        <Link className="brand topbar-brand" to="/" aria-label="InFrastuktur">
          <span className="brand-mark">
            <Icon name="building" size={18} />
          </span>
          <span className="brand-name">
            In<span>Frastuktur</span>
          </span>
        </Link>
        <div className="breadcrumb">
          <Link to="/">Proyek publik</Link>
          <Icon name="chevron" size={14} />
          <strong>
            {isOverview ? project.name : currentPage?.label || project.name}
          </strong>
        </div>
        <div className="topbar-actions">
          <span className="data-badge">
            <i /> Data simulasi
          </span>
          <ThemeToggle className="icon-button theme-toggle" />
          <Link className="admin-entry-link" to="/admin">
            Masuk admin
          </Link>
          <button className="icon-button search-button" aria-label="Cari">
            <Icon name="search" />
          </button>
          <div className="notification-wrap">
            <button
              className={`icon-button ${notificationOpen ? 'button-selected' : ''}`}
              aria-label="Notifikasi"
              onClick={() => setNotificationOpen(!notificationOpen)}
            >
              <Icon name="bell" />
              <i className="notification-dot" />
            </button>
            {notificationOpen && (
              <div className="notification-popover">
                <strong>Semua pembaruan</strong>
                <p>
                  Progres {project.name} terakhir diperbarui{' '}
                  {formatProjectDate(project.updates[0]?.date)}.
                </p>
                <span>3 hari dokumentasi baru ditambahkan.</span>
              </div>
            )}
          </div>
        </div>
       
      </div>
      <div
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
        <div className="main-nav" role="navigation" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const isActive = pathname === item.to

            return (
            <Link
              key={item.label}
              className={`nav-link ${isActive ? 'nav-active' : ''}`}
              to={item.to}
              onClick={() => {
                setMobileNavOpen(false)
              }}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.label === 'Dokumentasi' && project.updates.length > 0 && (
                <span className="nav-count">{project.updates.length}</span>
              )}
            </Link>
            )
          })}
          <Link
            className="nav-link report-nav-link"
            to="/laporan-ketidaksesuaian"
            onClick={() => setMobileNavOpen(false)}
          >
            <Icon name="flag" size={18} />
            <span>Laporkan ketidaksesuaian</span>
          </Link>
        </div>

        <div className="sidebar-project">
          <div className="sidebar-project-icon">
            <Icon name="building" size={16} />
          </div>
          <div>
            <span>PROYEK AKTIF</span>
            <strong>{project.name}</strong>
          </div>
          <i className="online-dot" />
        </div>

      </div>
      {mobileNavOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div
        className={`main-content ${isProjectDetails ? 'project-detail-page' : ''} ${isDocumentation ? 'documentation-page' : ''}`}
        id="ringkasan"
        role="main"
      >
        <div className="page-container">
          {!isOverview && (
            <div className="route-heading">
              <span className="section-kicker">PROYEK PUBLIK</span>
              <h1>{currentPage?.label}</h1>
              <p>
                {isProjectDetails &&
                  `Informasi lengkap tentang ${project.name}, lokasi, pelaksana, dan jadwal pengerjaan.`}
                {isDocumentation &&
                  'Dokumentasi kegiatan dan pembaruan progres proyek di lapangan.'}
                {isDocuments &&
                  'Dokumen perizinan dan berkas pendukung proyek yang tersedia untuk publik.'}
              </p>
            </div>
          )}

          {(isOverview || isProjectDetails) && (
          <div className="project-hero" role="region" aria-label="Detail proyek">
            <div className="hero-image">
              <img
                src={project.projectImage}
                alt={`Pekerjaan konstruksi ${project.name}`}
              />
              <span className="image-label">
                <span className="live-dot" /> PEMBANGUNAN BERJALAN
              </span>
              <span className="image-credit">
                Dokumentasi proyek · {formatProjectDate(project.updates[0]?.date)}
              </span>
            </div>
            <div className="hero-content">
              <div className="eyebrow">
                <span>{project.category.toUpperCase()}</span>
                <span className="eyebrow-divider">·</span>
                <span>TAHUN ANGGARAN {project.year}</span>
              </div>
              <h1>
                Pembangunan<br className="desktop-break" /> {project.name}
              </h1>
              <p className="hero-description">
                {project.description}
              </p>
              <div className="project-meta">
                <span>
                  <Icon name="pin" size={17} /> {project.location}
                </span>
                <span>
                  <Icon name="calendar" size={17} /> {dateRange}
                </span>
              </div>
              <div className="hero-footer">
                <div className="progress-label">
                  <span>Progres pembangunan</span>
                  <strong>{projectProgress}<span>%</span></strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${projectProgress}%` }} />
                </div>
                <div className="progress-subtext">
                  <span>
                    <i className="green-dot" /> 12 hari lebih cepat dari jadwal
                  </span>
                  <span>
                    Update {formatProjectDate(project.updates[0]?.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}

          {isOverview && <div className="stats-grid" role="region" aria-label="Ringkasan proyek">
            <div className="stat-card budget-stat">
              <div className="stat-top">
                <span>Total anggaran proyek</span>
                <span className="stat-icon mint-icon">
                  <Icon name="wallet" size={18} />
                </span>
              </div>
              <strong className="stat-value">
              {formatCompactRupiah(project.budgetTotal)}
              </strong>
              <div className="stat-bottom">
                <span>
                  <i className="green-dot" /> {budgetUsedPercent}% anggaran terserap
                </span>
                <span>Realisasi {formatCompactRupiah(project.budgetSpent)}</span>
              </div>
              <div className="mini-progress">
                <span style={{ width: `${budgetUsedPercent}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Progres fisik</span>
                <span className="stat-icon blue-icon">
                  <Icon name="chart" size={18} />
                </span>
              </div>
              <strong className="stat-value">
                {projectProgress}<small>%</small>
              </strong>
              <div className="stat-bottom">
                <span className="positive-text">
                  ↑ {project.monthlyProgress}% dari bulan lalu
                </span>
                <span>Target: {project.targetProgress}%</span>
              </div>
              <div className="mini-progress blue-progress">
                <span style={{ width: `${projectProgress}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Sisa waktu proyek</span>
                <span className="stat-icon orange-icon">
                  <Icon name="clock" size={18} />
                </span>
              </div>
              <strong className="stat-value">
                {project.daysRemaining} <small>hari</small>
              </strong>
              <div className="stat-bottom">
                <span>Target selesai</span>
                <span>{formatProjectDate(project.endDate)}</span>
              </div>
              <div className="stat-note">
                <i className="green-dot" /> Masih dalam jadwal
              </div>
            </div>
          </div>}

          <div className={`content-grid ${isOverview ? 'content-grid-overview' : 'content-grid-single'}`}>
            {isOverview && (
            <div className="panel budget-panel">
              <div className="budget-top-section">
                <div className="budget-overview">
                  <div className="panel-heading">
                    <div><span className="section-kicker">TRANSPARANSI ANGGARAN</span><h2>Ke mana anggaran digunakan?</h2><p>Rincian realisasi per kategori pengeluaran</p></div>
                    <button className="period-select">
                      Tahun {project.year} <span>⌄</span>
                    </button>
                  </div>
                  <div className="budget-summary">
                    <div
                      className="donut-chart"
                      style={{
                        background: `conic-gradient(var(--chart-spent, #27876a) 0deg ${budgetUsedPercent * 3.6}deg, var(--chart-remaining, #e4ede8) ${budgetUsedPercent * 3.6}deg 360deg)`,
                      }}
                    >
                      <div className="donut-hole">
                        <strong>{budgetUsedPercent}<span>%</span></strong>
                        <small>terserap</small>
                      </div>
                    </div>
                    <div className="budget-numbers">
                      <span>Total anggaran disetujui</span>
                      <strong>{formatRupiah(project.budgetTotal)}</strong>
                      <div className="budget-legend">
                        <span>
                          <i className="legend-spent" /> Sudah digunakan
                          <b>{formatCompactRupiah(project.budgetSpent)}</b>
                        </span>
                        <span>
                          <i className="legend-remaining" /> Sisa anggaran
                          <b>{formatCompactRupiah(budgetRemaining)}</b>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="material-section">
                  <div className="material-heading">
                    <div>
                      <h3>Rincian pengeluaran material</h3>
                      <span>Spesifikasi material dan nilai pembelian</span>
                    </div>
                    <button className="text-button">
                      Lihat semua <Icon name="arrow" size={14} />
                    </button>
                  </div>
                  <div className="material-table">
                    {project.materials.map((item) => (
                      <div className="material-row" key={item.name}>
                        <div className={`material-bullet ${item.color}`} />
                        <div className="material-name">
                          <strong>{item.name}</strong>
                          <span>{item.detail}</span>
                        </div>
                        <div className="material-bar">
                          <span style={{ width: `${item.percent}%` }} />
                        </div>
                        <strong className="material-amount">
                          {formatRupiah(item.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="category-list">
                {project.categories.map((category, index) => (
                  <div className="category-row" key={category.name}>
                    <div
                      className={`category-icon ${
                        ['cat-construction', 'cat-labor', 'cat-planning'][index % 3]
                      }`}
                    >
                      {['▧', '♙', '⌑'][index % 3]}
                    </div>
                    <div className="category-info">
                      <strong>{category.name}</strong>
                      <span>{category.detail}</span>
                    </div>
                    <div className="category-amount">
                      <strong>{formatRupiah(category.amount)}</strong>
                      <span>
                        {project.budgetSpent
                          ? Math.round((category.amount / project.budgetSpent) * 100)
                          : 0}
                        % dari realisasi
                      </span>
                    </div>
                    <span className="category-arrow">›</span>
                  </div>
                ))}
              </div>
              <div className="audit-note">
                <Icon name="shield" size={16} />
                <span>
                  Seluruh pengadaan tercatat dalam sistem LPSE dan dapat diverifikasi.
                </span>
                <button aria-label="Selengkapnya">ⓘ</button>
              </div>
            </div>
            )}

            <div className="right-column">
              {isProjectDetails && (
              <div className="panel info-panel">
                <div className="panel-heading compact-heading">
                  <div>
                    <span className="section-kicker">INFORMASI PROYEK</span>
                    <h2>Detail pembangunan</h2>
                  </div>
                  <button className="more-button" aria-label="Menu informasi">
                    •••
                  </button>
                </div>
                <div className="info-rows">
                  <div className="info-row">
                    <span className="info-icon">
                      <Icon name="building" size={17} />
                    </span>
                    <div>
                      <span>Pelaksana proyek</span>
                      <strong>{project.contractor}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <Icon name="pin" size={17} />
                    </span>
                    <div>
                      <span>Lokasi pembangunan</span>
                      <strong>{project.address}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <Icon name="calendar" size={17} />
                    </span>
                    <div>
                      <span>Waktu pelaksanaan</span>
                      <strong>{dateRange}</strong>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <Icon name="file" size={17} />
                    </span>
                    <div>
                      <span>Nomor kontrak</span>
                      <strong>{project.contractNumber}</strong>
                    </div>
                  </div>
                </div>
                {project.permitDocumentUrl ? (
                  <a
                    className="document-link"
                    href={project.permitDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="pdf-icon">PDF</span>
                    <span>
                      <strong>{project.permitDocumentName}</strong>
                      <small>Dokumen proyek · PDF</small>
                    </span>
                    <Icon name="download" size={17} />
                  </a>
                ) : (
                  <div className="plan-note">
                    <Icon name="file" size={15} />
                    <span>Dokumen izin belum tersedia.</span>
                  </div>
                )}
                {project.planDocumentUrl ? (
                  <a
                    className="plan-note"
                    href={project.planDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="file" size={15} />
                    <span>Lihat denah bangunan</span>
                  </a>
                ) : (
                  <div className="plan-note">
                    <Icon name="file" size={15} />
                    <span>Denah bangunan belum diunggah.</span>
                  </div>
                )}
              </div>
              )}

              {isDocumentation && (
              <div className="panel timeline-panel" id="dokumentasi">
                <div className="panel-heading compact-heading">
                  <div>
                    <span className="section-kicker">LAPORAN HARIAN</span>
                    <h2>Progres di lapangan</h2>
                  </div>
                  <button
                    className="round-arrow"
                    aria-label="Lihat seluruh dokumentasi"
                  >
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
                <div className="timeline-list">
                  {project.updates.length > 0 ? (
                    project.updates.map((item, index) => (
                      <div className="timeline-item" key={item.id}>
                        <div
                          className={`timeline-marker ${
                            index === 0 ? 'marker-current' : ''
                          }`}
                        >
                          <span />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-date">
                            {formatProjectDate(item.date)}
                            <span>{item.time}</span>
                          </div>
                          <strong>{item.title}</strong>
                          <p>{item.note}</p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={`Foto progres: ${item.title}`}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="document-empty">
                      Belum ada laporan progres yang diunggah.
                    </div>
                  )}
                </div>
                <Link
                  className="view-updates"
                  to="/"
                >
                  Kembali ke ringkasan <Icon name="arrow" size={15} />
                </Link>
              </div>
              )}

            </div>
          </div>

          {isDocuments && (
          <div className="panel documents-page-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">DOKUMEN PROYEK</span>
                <h2>Berkas yang tersedia</h2>
                <p>Dokumen yang dapat dilihat oleh masyarakat.</p>
              </div>
            </div>
            <div className="documents-list">
              {project.permitDocumentUrl ? (
                <button
                  className={`document-link document-select${
                    (selectedDocumentUrl || project.permitDocumentUrl) ===
                    project.permitDocumentUrl
                      ? ' document-selected'
                      : ''
                  }`}
                  type="button"
                  onClick={() => setSelectedDocumentUrl(project.permitDocumentUrl)}
                  aria-pressed={
                    (selectedDocumentUrl || project.permitDocumentUrl) ===
                    project.permitDocumentUrl
                  }
                >
                  <span className="pdf-icon">PDF</span>
                  <span>
                    <strong>{project.permitDocumentName}</strong>
                    <small>Contoh dokumen IMB/PBG · PDF</small>
                  </span>
                  <span className="document-action">Lihat PDF</span>
                </button>
              ) : (
                <div className="document-empty">
                  Dokumen perizinan belum tersedia.
                </div>
              )}
              {project.planDocumentUrl ? (
                <button
                  className={`document-link document-select${
                    (selectedDocumentUrl ||
                      project.permitDocumentUrl ||
                      project.planDocumentUrl) === project.planDocumentUrl
                      ? ' document-selected'
                      : ''
                  }`}
                  type="button"
                  onClick={() => setSelectedDocumentUrl(project.planDocumentUrl)}
                  aria-pressed={
                    (selectedDocumentUrl ||
                      project.permitDocumentUrl ||
                      project.planDocumentUrl) === project.planDocumentUrl
                  }
                >
                  <span className="pdf-icon">PDF</span>
                  <span>
                    <strong>Denah Bangunan Puskesmas Prambanan</strong>
                    <small>Contoh denah konseptual · PDF</small>
                  </span>
                  <span className="document-action">Lihat PDF</span>
                </button>
              ) : (
                <div className="document-empty">
                  Denah bangunan belum diunggah.
                </div>
              )}
            </div>
            {(project.permitDocumentUrl || project.planDocumentUrl) && (() => {
              const activeDocumentUrl =
                selectedDocumentUrl &&
                [project.permitDocumentUrl, project.planDocumentUrl].includes(
                  selectedDocumentUrl,
                )
                  ? selectedDocumentUrl
                  : project.permitDocumentUrl || project.planDocumentUrl
              const activeDocumentName =
                activeDocumentUrl === project.planDocumentUrl
                  ? 'Denah Bangunan Puskesmas Prambanan'
                  : project.permitDocumentName

              return (
                <div className="pdf-viewer">
                  <div className="pdf-viewer-heading">
                    <div>
                      <span className="section-kicker">PRATINJAU PDF</span>
                      <h3>{activeDocumentName}</h3>
                    </div>
                    <a
                      href={activeDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka di tab baru
                      <Icon name="arrow" size={15} />
                    </a>
                  </div>
                  <Suspense
                    fallback={
                      <div className="pdf-viewer-message" role="status">
                        Memuat dokumen PDF...
                      </div>
                    }
                  >
                    <PdfViewer
                      key={activeDocumentUrl}
                      url={activeDocumentUrl}
                    />
                  </Suspense>
                </div>
              )
            })()}
          </div>
          )}

          
          <div className="page-footer" role="contentinfo">
            <span>
              © {project.year} InFrastuktur · Transparansi infrastruktur publik
            </span>
            <span>
              <i className="green-dot" /> Data diperbarui{' '}
              {formatProjectDate(project.updates[0]?.date)}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<ViewerDashboard />} />
        <Route path="/detail" element={<ViewerDashboard />} />
        <Route path="/dokumentasi" element={<ViewerDashboard />} />
        <Route path="/dokumen" element={<ViewerDashboard />} />
        <Route path="/laporan-warga" element={<PublicReportsPage />} />
        <Route path="/laporan-ketidaksesuaian" element={<ReportPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
