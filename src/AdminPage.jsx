import { useEffect, useRef, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import {
  ADMIN_SESSION_KEY,
  DEFAULT_PROJECT_DATA,
  calculateBudgetRealization,
  calculateMaterialTotal,
  formatRupiah,
  loadProjectData,
  saveProjectData,
  useProjectData,
} from './projectData'
import {
  deleteReport,
  loadReports,
  REPORTS_UPDATED_EVENT,
  REPORT_STATUSES,
  updateReportStatus,
} from './reportData.js'
import {
  loadProgressDeleteRequests,
  PROGRESS_REQUESTS_UPDATED_EVENT,
  PROGRESS_REQUEST_STATUSES,
  submitProgressDeleteRequest,
  updateProgressDeleteRequestStatus,
} from './progressRequests.js'
import './AdminPage.css'

const DEMO_EMAIL = 'admin@infrastuktur.id'
const DEMO_PASSWORD = 'admin123'
const REPORTER_EMAIL = 'reporter@infrastuktur.id'
const REPORTER_PASSWORD = 'reporter123'

async function prepareDocumentationPhoto(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Pilih file gambar untuk dokumentasi.')
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Ukuran foto maksimal 15 MB.')
  }

  const imageBitmap = await createImageBitmap(file)
  try {
    const maxDimension = 1280
    const scale = Math.min(
      1,
      maxDimension / Math.max(imageBitmap.width, imageBitmap.height),
    )
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(imageBitmap.width * scale))
    canvas.height = Math.max(1, Math.round(imageBitmap.height * scale))

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Browser tidak dapat memproses foto ini.')
    }

    context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  } finally {
    imageBitmap.close()
  }
}

const ADMIN_SECTIONS = [
  {
    path: '/admin/informasi-proyek',
    title: 'Informasi proyek',
    description: 'Nama, lokasi, pelaksana, dan jadwal pekerjaan.',
  },
  {
    path: '/admin/anggaran',
    title: 'Anggaran',
    description: 'Total anggaran, realisasi, dan pembagian biaya.',
  },
  {
    path: '/admin/material',
    title: 'Material',
    description: 'Catat bahan utama dan nilai penggunaannya.',
  },
  {
    path: '/admin/progres-harian',
    title: 'Progres harian',
    description: 'Tambah catatan pekerjaan dan progres terbaru di lapangan.',
  },
  {
    path: '/admin/dokumen',
    title: 'Dokumen',
    description: 'Atur nama dan tautan dokumen proyek.',
  },
  {
    path: '/admin/laporan-ketidaksesuaian',
    title: 'Laporan warga',
    description: 'Tinjau dan tindak lanjuti laporan yang dikirim masyarakat.',
  },
  {
    path: '/admin/permintaan-hapus',
    title: 'Permintaan hapus progres',
    description: 'Tinjau permintaan reporter untuk menghapus laporan progres.',
  },
]

function AdminLogin({ onLogin }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    const role =
      email === DEMO_EMAIL && password === DEMO_PASSWORD
        ? 'admin'
        : email === REPORTER_EMAIL && password === REPORTER_PASSWORD
          ? 'reporter'
          : null

    if (!role) {
      setErrorMessage('Email atau kata sandi tidak sesuai.')
      return
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, role)
    onLogin(role)
    navigate(
      role === 'admin' ? '/admin/informasi-proyek' : '/reporter/anggaran',
      { replace: true },
    )
  }

  return (
    <div className={`admin-auth-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <div className="admin-auth-card">
        <div className="admin-auth-actions">
          <ThemeToggle />
        </div>
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>

        <div className="admin-auth-heading">
          <span className="admin-kicker">AKSES PROYEK</span>
          <h1>Masuk admin atau reporter</h1>
          <p>
            Admin mengelola proyek. Reporter mengirim progres lapangan dan
            melihat anggaran.
          </p>
        </div>

        <div className="admin-auth-columns">
          <div className="admin-auth-form-column">
            <form className="admin-form" onSubmit={handleSubmit}>
              <label htmlFor="admin-email">Email akun</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@instansi.go.id"
                required
              />

              <label htmlFor="admin-password">Kata sandi</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                required
              />

              {errorMessage && (
                <div className="admin-message admin-error" role="alert">
                  {errorMessage}
                </div>
              )}

              <button className="admin-primary-button" type="submit">
                Masuk
              </button>
            </form>
            <button
              className="demo-toggle-button"
              type="button"
              aria-expanded={showDemoAccounts}
              aria-controls="demo-credentials"
              onClick={() => setShowDemoAccounts((visible) => !visible)}
            >
              {showDemoAccounts ? 'Sembunyikan akun demo' : 'Tampilkan akun demo'}
            </button>
          </div>

          <div className="demo-panel" id="demo-credentials">
            {showDemoAccounts ? (
              <div className="demo-credentials">
                <strong>Akun login demo admin</strong>
                <span>Email: {DEMO_EMAIL}</span>
                <span>Kata sandi: {DEMO_PASSWORD}</span>
                <strong>Akun login demo reporter</strong>
                <span>Email: {REPORTER_EMAIL}</span>
                <span>Kata sandi: {REPORTER_PASSWORD}</span>
              </div>
            ) : (
              <div className="demo-credentials-placeholder">
                <span>AKSES DEMO BROWSER</span>
                <strong>Akun admin &amp; reporter</strong>
                <p>
                  Kredensial demo tersedia di panel ini. Tekan tombol di bawah
                  Masuk untuk menampilkannya.
                </p>
                <span className="demo-placeholder-mark">ID · DEMO</span>
              </div>
            )}
          </div>
        </div>

        <div className="security-notice">
          Ini adalah login demo di browser. Jangan gunakan untuk melindungi data
          sungguhan tanpa autentikasi backend.
        </div>

        <Link className="back-to-public" to="/ringkasan">
          Kembali ke ringkasan
        </Link>
      </div>
    </div>
  )
}

function ReporterDashboard({ onLogout }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const project = useProjectData()
  const photoPickerRef = useRef(null)
  const cameraPickerRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [showPhotoUrl, setShowPhotoUrl] = useState(false)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const budgetRemaining = Math.max(
    Number(project.budgetTotal) - Number(project.budgetSpent),
    0,
  )

  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingPhoto(true)
    setMessage('')
    setErrorMessage('')
    try {
      const dataUrl = await prepareDocumentationPhoto(file)
      setPhoto({ name: file.name, dataUrl })
      setPhotoUrl('')
      setShowPhotoUrl(false)
    } catch (error) {
      console.error('Gagal memproses foto dokumentasi.', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Foto gagal diproses. Pilih file gambar lain.',
      )
    } finally {
      event.target.value = ''
      setIsProcessingPhoto(false)
    }
  }

  function submitProgress(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const progressValue = Number(formData.get('progress'))

    if (!Number.isFinite(progressValue) || progressValue < 0 || progressValue > 100) {
      setErrorMessage('Progres harus berada di antara 0 sampai 100%.')
      setMessage('')
      return
    }
    if (!photo?.dataUrl && !photoUrl.trim()) {
      setErrorMessage('Foto dokumentasi wajib disertakan sebelum mengirim progres.')
      setMessage('')
      return
    }

    const submittedAt = new Date()
    const update = {
      id: `update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: String(formData.get('date')),
      time: `${new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(submittedAt)} WIB`,
      title: String(formData.get('title') || '').trim(),
      note: String(formData.get('note') || '').trim(),
      image: photo?.dataUrl || photoUrl.trim(),
      progress: progressValue,
    }

    try {
      saveProjectData({
        ...project,
        progress: progressValue,
        updates: [update, ...project.updates],
      })
      form.reset()
      setPhoto(null)
      setPhotoUrl('')
      setShowPhotoUrl(false)
      setMessage('Progres lapangan berhasil dikirim dan tampil di dokumentasi proyek.')
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal menyimpan progres lapangan.', error)
      setErrorMessage(
        'Progres gagal disimpan. Periksa ruang penyimpanan browser dan coba lagi.',
      )
      setMessage('')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    onLogout()
  }

  return (
    <div className={`admin-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <span className="admin-role-label">Akun reporter</span>
          <ThemeToggle />
          <button
            className="admin-logout-button"
            type="button"
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="admin-content reporter-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-kicker">AREA REPORTER</span>
            <h1>Progres lapangan dan anggaran</h1>
            <p>
              Kirim perkembangan pekerjaan dari lapangan dan lihat rincian
              anggaran proyek.
            </p>
          </div>
        </div>

        <section className="editor-section reporter-budget-section">
          <div className="editor-section-heading">
            <span className="editor-step">01</span>
            <div>
              <h2>Ringkasan anggaran</h2>
              <p>{project.name}</p>
            </div>
          </div>
          <div className="reporter-budget-summary">
            <div>
              <span>Total anggaran</span>
              <strong>{formatRupiah(project.budgetTotal)}</strong>
            </div>
            <div>
              <span>Realisasi anggaran</span>
              <strong>{formatRupiah(project.budgetSpent)}</strong>
            </div>
            <div>
              <span>Sisa anggaran</span>
              <strong>{formatRupiah(budgetRemaining)}</strong>
            </div>
          </div>
          <div className="reporter-budget-details">
            <div>
              <h3>Rincian kategori</h3>
              {project.categories.map((category, index) => (
                <div
                  className="reporter-budget-row"
                  key={`${category.name}-${index}`}
                >
                  <span>{category.name}</span>
                  <strong>{formatRupiah(category.amount)}</strong>
                </div>
              ))}
            </div>
            <div>
              <h3>Rincian material</h3>
              {project.materials.map((material, index) => (
                <div
                  className="reporter-budget-row"
                  key={`${material.name}-${index}`}
                >
                  <span>{material.name}</span>
                  <strong>{formatRupiah(material.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
          <p className="reporter-budget-note">
            Realisasi merupakan jumlah seluruh pengeluaran material dan
            kategori lain. Kategori yang ditandai sebagai rincian material
            tidak dijumlahkan kembali.
          </p>
        </section>

        <section className="editor-section reporter-report-section">
          <div className="editor-section-heading">
            <span className="editor-step">02</span>
            <div>
              <h2>Kirim progres lapangan</h2>
              <p>Catat pekerjaan dan progres terbaru yang telah dicapai.</p>
            </div>
          </div>
          <form className="reporter-progress-form" onSubmit={submitProgress}>
            <div className="editor-fields">
              <label className="admin-field">
                <span>Tanggal laporan</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date().toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Jakarta',
                  })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Progres proyek saat ini (%)</span>
                <input
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  defaultValue={project.progress}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Judul pekerjaan</span>
                <input
                  name="title"
                  type="text"
                  placeholder="Contoh: Pemasangan rangka atap"
                  required
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>Catatan pekerjaan</span>
                <textarea
                  name="note"
                  rows="3"
                  placeholder="Jelaskan pekerjaan yang dilakukan dan kondisi di lapangan."
                  required
                />
              </label>
              <div className="admin-field admin-field-wide reporter-photo-field">
                <span>Foto dokumentasi <b className="required-field-mark">· wajib</b></span>
                {(photo || photoUrl) ? (
                  <div className="reporter-photo-preview">
                    <img
                      src={photo?.dataUrl || photoUrl}
                      alt="Pratinjau foto dokumentasi"
                    />
                    <div>
                      <span>{photo?.name || 'Foto dari URL'}</span>
                      <button
                        className="remove-update-button"
                        type="button"
                        onClick={() => {
                          setPhoto(null)
                          setPhotoUrl('')
                        }}
                      >
                        Hapus foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="reporter-photo-empty">
                    Pratinjau foto dokumentasi akan tampil di sini.
                  </div>
                )}
                <div className="reporter-photo-actions">
                  <input
                    ref={photoPickerRef}
                    className="reporter-photo-input"
                    type="file"
                    accept="image/*"
                    aria-label="Pilih foto dokumentasi dari perangkat"
                    onChange={handlePhotoSelected}
                  />
                  <input
                    ref={cameraPickerRef}
                    className="reporter-photo-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    aria-label="Ambil foto dokumentasi dengan kamera"
                    onChange={handlePhotoSelected}
                  />
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={() => photoPickerRef.current?.click()}
                    disabled={isProcessingPhoto}
                  >
                    Upload image
                  </button>
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={() => cameraPickerRef.current?.click()}
                    disabled={isProcessingPhoto}
                  >
                    Ambil foto
                  </button>
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={() => {
                      setShowPhotoUrl((isVisible) => !isVisible)
                      setPhoto(null)
                    }}
                  >
                    {photoUrl ? 'Edit URL foto' : 'Dari URL foto'}
                  </button>
                  {isProcessingPhoto && <span>Memproses foto…</span>}
                </div>
                {showPhotoUrl && (
                  <input
                    className="reporter-photo-url"
                    type="url"
                    value={photoUrl}
                    onChange={(event) => setPhotoUrl(event.target.value)}
                    placeholder="https://contoh.com/foto-dokumentasi.jpg"
                    aria-label="URL foto dokumentasi"
                  />
                )}
              </div>
            </div>
            {(message || errorMessage) && (
              <div
                className={`admin-message ${errorMessage ? 'admin-error' : 'admin-success'}`}
                role={errorMessage ? 'alert' : 'status'}
              >
                {errorMessage || message}
              </div>
            )}
            <button
              className="admin-primary-button"
              type="submit"
              disabled={isProcessingPhoto}
            >
              Kirim progres
            </button>
          </form>

          <div className="reporter-progress-history">
            <h3>Progres lapangan terbaru</h3>
            <Link
              className="progress-delete-request-link"
              to="/reporter/permintaan-hapus"
            >
              Minta hapus progres
            </Link>
            {project.updates.slice(0, 5).map((update) => (
              <article className="reporter-progress-item" key={update.id}>
                <div>
                  <strong>{update.title}</strong>
                  <span>{update.date} · {update.time}</span>
                </div>
                {update.progress !== undefined && (
                  <b>{Number(update.progress)}%</b>
                )}
                <p>{update.note}</p>
                <button
                  className="progress-delete-request-link"
                  type="button"
                  onClick={() =>
                    navigate(`/reporter/permintaan-hapus?progress=${encodeURIComponent(update.id)}`)
                  }
                >
                  Minta hapus progres ini
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', ...props }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        {...props}
      />
    </label>
  )
}

function AdminReportsPage({ onLogout }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    function refreshReports() {
      try {
        setReports(loadReports())
        setErrorMessage('')
      } catch (error) {
        console.error('Gagal memuat laporan warga.', error)
        setErrorMessage(
          'Daftar laporan tidak dapat dibaca. Data browser mungkin rusak.',
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

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    onLogout()
    navigate('/login', { replace: true })
  }

  function changeStatus(reportId, status) {
    try {
      updateReportStatus(reportId, status)
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal memperbarui status laporan.', error)
      setErrorMessage(
        'Status belum berubah. Muat ulang halaman dan coba kembali.',
      )
    }
  }

  function removeReport(reportId) {
    if (!window.confirm('Hapus laporan ini secara permanen dari browser ini?')) {
      return
    }

    try {
      deleteReport(reportId)
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal menghapus laporan.', error)
      setErrorMessage('Laporan tidak dapat dihapus. Coba muat ulang halaman.')
    }
  }

  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
  const visibleReports = reports.filter((report) => {
    const matchesStatus = filter === 'all' || report.status === filter
    const searchText = [
      report.id,
      report.reporterName,
      report.contact,
      report.category,
      report.location,
      report.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('id-ID')

    return matchesStatus && searchText.includes(normalizedSearch)
  })
  const statusCounts = Object.keys(REPORT_STATUSES).reduce(
    (counts, status) => ({
      ...counts,
      [status]: reports.filter((report) => report.status === status).length,
    }),
    {},
  )

  return (
    <div className={`admin-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <span className="admin-role-label">Panel pengelola proyek</span>
          <ThemeToggle />
          <button
            className="admin-logout-button"
            type="button"
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Menu pengelolaan">
          <span className="admin-sidebar-label">MENU PENGELOLAAN</span>
          <nav className="admin-navigation">
            {ADMIN_SECTIONS.map((section, index) => (
              <Link
                key={section.path}
                className={`admin-navigation-link ${section.path === '/admin/laporan-ketidaksesuaian' ? 'active' : ''}`}
                to={section.path}
                aria-current={
                  section.path === '/admin/laporan-ketidaksesuaian'
                    ? 'page'
                    : undefined
                }
              >
                <span className="admin-navigation-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{section.title}</span>
              </Link>
            ))}
          </nav>
          <p className="admin-storage-note">
            Mode demo: kiriman tersimpan di browser ini.
          </p>
        </aside>

        <main className="admin-content admin-reports-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-kicker">PENGELOLAAN MASUKAN WARGA</span>
              <h1>Laporan ketidaksesuaian</h1>
              <p>
                Tinjau setiap temuan dan perbarui statusnya setelah ditindaklanjuti.
              </p>
            </div>
            <Link
              className="admin-preview-link"
              to="/laporan-ketidaksesuaian"
              target="_blank"
            >
              Buka formulir warga
            </Link>
          </div>

          <div className="reports-demo-notice" role="note">
            Laporan prototipe hanya tersimpan pada browser/perangkat ini. Agar
            laporan dari pengguna di perangkat lain masuk ke sini, dibutuhkan
            backend dan database.
          </div>

          <div className="report-summary-grid" aria-label="Ringkasan laporan">
            <div className="report-summary-card">
              <span>Total laporan</span>
              <strong>{reports.length}</strong>
            </div>
            <div className="report-summary-card">
              <span>Belum ditinjau</span>
              <strong>{statusCounts.pending}</strong>
            </div>
            <div className="report-summary-card">
              <span>Sedang ditinjau</span>
              <strong>{statusCounts.reviewing}</strong>
            </div>
            <div className="report-summary-card">
              <span>Selesai ditinjau</span>
              <strong>{statusCounts.resolved}</strong>
            </div>
          </div>

          <section className="admin-reports-panel">
            <div className="admin-reports-toolbar">
              <label>
                <span>Cari laporan</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama, lokasi, kategori, atau kode"
                />
              </label>
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

            {errorMessage && (
              <div className="admin-message admin-error" role="alert">
                {errorMessage}
              </div>
            )}

            {visibleReports.length > 0 ? (
              <div className="admin-report-list">
                {visibleReports.map((report) => (
                  <article className="admin-report-card" key={report.id}>
                    <div className="admin-report-card-heading">
                      <div>
                        <span className="admin-report-category">
                          {report.category}
                        </span>
                        <h2>{report.location}</h2>
                        <p>
                          {report.reporterName || 'Pelapor anonim'}
                          {' · '}
                          {new Intl.DateTimeFormat('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(report.createdAt))}
                        </p>
                      </div>
                      <span
                        className={`admin-report-status status-${report.status}`}
                      >
                        {REPORT_STATUSES[report.status] || 'Status tidak dikenal'}
                      </span>
                    </div>

                    <p className="admin-report-description">
                      {report.description}
                    </p>

                    <div className="admin-report-card-footer">
                      <div>
                        <span>Kode: {report.id}</span>
                        {report.contact && <span>Kontak: {report.contact}</span>}
                      </div>
                      <div className="admin-report-actions">
                        <label>
                          <span>Ubah status</span>
                          <select
                            aria-label={`Status laporan ${report.id}`}
                            value={
                              Object.hasOwn(REPORT_STATUSES, report.status)
                                ? report.status
                                : 'pending'
                            }
                            onChange={(event) =>
                              changeStatus(report.id, event.target.value)
                            }
                          >
                            {Object.entries(REPORT_STATUSES).map(
                              ([status, title]) => (
                                <option key={status} value={status}>
                                  {title}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button
                          className="admin-report-delete"
                          type="button"
                          onClick={() => removeReport(report.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-reports-empty">
                <strong>
                  {reports.length
                    ? 'Tidak ada laporan yang cocok'
                    : 'Belum ada laporan masuk'}
                </strong>
                <p>
                  {reports.length
                    ? 'Coba ubah kata pencarian atau filter status.'
                    : 'Laporan yang dikirim melalui formulir warga akan muncul di sini.'}
                </p>
                {!reports.length && (
                  <Link
                    className="admin-secondary-button"
                    to="/laporan-ketidaksesuaian"
                    target="_blank"
                  >
                    Lihat formulir laporan
                  </Link>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function ProgressDeleteRequestPage() {
  const project = useProjectData()
  const { isDarkTheme } = useTheme()
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const requestedProgressId = searchParams.get('progress') || ''

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const update = project.updates.find(
      (item) => item.id === String(formData.get('progressId')),
    )
    if (!update) {
      setErrorMessage('Pilih progres yang masih tersedia untuk dimintakan penghapusan.')
      setMessage('')
      return
    }

    try {
      submitProgressDeleteRequest({
        progressId: update.id,
        progressTitle: update.title,
        progressDate: update.date,
        reporterName: String(formData.get('reporterName') || '').trim(),
        reason: String(formData.get('reason') || '').trim(),
      })
      event.currentTarget.reset()
      setMessage('Permintaan terkirim kepada admin untuk ditinjau.')
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal mengirim permintaan penghapusan progres.', error)
      setErrorMessage('Permintaan gagal disimpan. Coba kembali beberapa saat lagi.')
      setMessage('')
    }
  }

  return (
    <div className={`admin-page request-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <ThemeToggle />
          <Link className="admin-preview-link" to="/reporter/anggaran">
            Kembali
          </Link>
        </div>
      </header>
      <main className="admin-content request-content">
        <div className="admin-page-heading request-heading">
          <div>
            <span className="admin-kicker">AREA REPORTER</span>
            <h1>Permintaan hapus progres</h1>
            <p>
              Kirim permintaan kepada admin. Progres hanya dihapus setelah
              ditinjau dan disetujui.
            </p>
          </div>
        </div>
        <section className="editor-section request-form-card">
          <form className="project-editor" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span>Progres yang dimintakan penghapusan</span>
              <select
                name="progressId"
                defaultValue={requestedProgressId}
                required
              >
                <option value="" disabled>Pilih progres</option>
                {project.updates.map((update) => (
                  <option key={update.id} value={update.id}>
                    {update.date} · {update.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Nama reporter</span>
              <input name="reporterName" type="text" required />
            </label>
            <label className="admin-field">
              <span>Alasan permintaan</span>
              <textarea name="reason" rows="4" minLength="10" required />
            </label>
            <p className="admin-message request-contact-note">
              Perlu tindak lanjut langsung? Hubungi admin di{' '}
              <a href="tel:08212442083">08212442083</a>.
            </p>
            {(message || errorMessage) && (
              <div
                className={`admin-message ${errorMessage ? 'admin-error' : 'admin-success'}`}
                role={errorMessage ? 'alert' : 'status'}
              >
                {errorMessage || message}
              </div>
            )}
            <button className="admin-primary-button" type="submit">
              Kirim permintaan
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

function AdminProgressDeleteRequestsPage({ onLogout }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const [requests, setRequests] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    function refreshRequests() {
      try {
        setRequests(loadProgressDeleteRequests())
        setErrorMessage('')
      } catch (error) {
        console.error('Gagal memuat permintaan hapus progres.', error)
        setErrorMessage('Daftar permintaan tidak dapat dibaca.')
      }
    }
    refreshRequests()
    window.addEventListener(PROGRESS_REQUESTS_UPDATED_EVENT, refreshRequests)
    window.addEventListener('storage', refreshRequests)
    return () => {
      window.removeEventListener(PROGRESS_REQUESTS_UPDATED_EVENT, refreshRequests)
      window.removeEventListener('storage', refreshRequests)
    }
  }, [])

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    onLogout()
    navigate('/login', { replace: true })
  }

  function changeStatus(requestId, status) {
    try {
      updateProgressDeleteRequestStatus(requestId, status)
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal memperbarui status permintaan hapus progres.', error)
      setErrorMessage('Status permintaan gagal diperbarui.')
    }
  }

  return (
    <div className={`admin-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <span className="admin-role-label">Panel pengelola proyek</span>
          <ThemeToggle />
          <button className="admin-logout-button" type="button" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Menu pengelolaan">
          <span className="admin-sidebar-label">MENU PENGELOLAAN</span>
          <nav className="admin-navigation">
            {ADMIN_SECTIONS.map((section, index) => (
              <Link
                key={section.path}
                className={`admin-navigation-link ${section.path === '/admin/permintaan-hapus' ? 'active' : ''}`}
                to={section.path}
                aria-current={section.path === '/admin/permintaan-hapus' ? 'page' : undefined}
              >
                <span className="admin-navigation-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{section.title}</span>
              </Link>
            ))}
          </nav>
          <p className="admin-storage-note">Mode demo: permintaan tersimpan di browser ini.</p>
        </aside>
        <main className="admin-content admin-reports-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-kicker">PENGELOLAAN PROGRES</span>
              <h1>Permintaan hapus progres</h1>
              <p>Tinjau dan putuskan permintaan penghapusan dari reporter.</p>
            </div>
            <a className="admin-preview-link" href="tel:08212442083">Telepon admin: 08212442083</a>
          </div>
          {errorMessage && <div className="admin-message admin-error" role="alert">{errorMessage}</div>}
          <section className="admin-reports-panel progress-delete-requests">
            {requests.length ? requests.map((request) => (
              <article className="admin-report-card" key={request.id}>
                <div className="admin-report-card-heading">
                  <div>
                    <span className="admin-report-category">{request.progressDate} · {request.reporterName}</span>
                    <h2>{request.progressTitle}</h2>
                    <p>{request.reason}</p>
                  </div>
                  <span className={`admin-report-status status-${request.status}`}>
                    {PROGRESS_REQUEST_STATUSES[request.status]}
                  </span>
                </div>
                <div className="admin-report-card-footer">
                  <span>Nomor admin: <a href="tel:08212442083">08212442083</a></span>
                  <label className="progress-request-status">
                    <span>Ubah status</span>
                    <select
                      value={request.status}
                      onChange={(event) => changeStatus(request.id, event.target.value)}
                    >
                      {Object.entries(PROGRESS_REQUEST_STATUSES).map(([status, title]) => (
                        <option key={status} value={status}>{title}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            )) : (
              <div className="admin-reports-empty">
                <strong>Belum ada permintaan</strong>
                <p>Permintaan dari reporter akan muncul di halaman ini.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkTheme } = useTheme()
  const [draft, setDraft] = useState(loadProjectData)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingPhotoUrlIndex, setEditingPhotoUrlIndex] = useState(null)
  const [processingPhotoIndex, setProcessingPhotoIndex] = useState(null)
  const normalizedPath = location.pathname.replace(/\/+$/, '').toLowerCase()
  const activeSection =
    ADMIN_SECTIONS.find(
      (section) => section.path.toLowerCase() === normalizedPath,
    ) ??
    ADMIN_SECTIONS[0]

  if (activeSection.path === '/admin/laporan-ketidaksesuaian') {
    return <AdminReportsPage onLogout={onLogout} />
  }
  if (activeSection.path === '/admin/permintaan-hapus') {
    return <AdminProgressDeleteRequestsPage onLogout={onLogout} />
  }

  function updateProjectField(name, value) {
    setDraft((current) => ({ ...current, [name]: value }))
    setMessage('')
    setErrorMessage('')
  }

  function updateListItem(listName, index, fieldName, value) {
    setDraft((current) => ({
      ...current,
      [listName]: current[listName].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [fieldName]: value } : item,
      ),
    }))
    setMessage('')
    setErrorMessage('')
  }

  function updateMaterialCategory(index, isMaterialCategory) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, categoryIndex) => ({
        ...category,
        materialCategory: isMaterialCategory
          ? categoryIndex === index
          : categoryIndex === index
            ? false
            : Boolean(category.materialCategory),
      })),
    }))
    setMessage('')
    setErrorMessage('')
  }

  function addCategory() {
    setDraft((current) => ({
      ...current,
      categories: [
        ...current.categories,
        { name: '', detail: '', amount: 0, materialCategory: false },
      ],
    }))
    setMessage('')
    setErrorMessage('')
  }

  function addMaterial() {
    setDraft((current) => ({
      ...current,
      materials: [
        ...current.materials,
        {
          name: '',
          detail: '',
          amount: 0,
          percent: 0,
          color: ['mint', 'blue', 'orange', 'purple'][
            current.materials.length % 4
          ],
        },
      ],
    }))
    setMessage('')
    setErrorMessage('')
  }

  function removeMaterial(index) {
    setDraft((current) => ({
      ...current,
      materials: current.materials.filter((_, itemIndex) => itemIndex !== index),
    }))
    setMessage('')
    setErrorMessage('')
  }

  async function handleAdminPhotoSelected(event, index) {
    const file = event.target.files?.[0]
    if (!file) return

    setProcessingPhotoIndex(index)
    setErrorMessage('')
    try {
      const image = await prepareDocumentationPhoto(file)
      updateListItem('updates', index, 'image', image)
      setEditingPhotoUrlIndex(null)
    } catch (error) {
      console.error('Gagal memproses foto progres.', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Foto progres gagal diproses.',
      )
    } finally {
      event.target.value = ''
      setProcessingPhotoIndex(null)
    }
  }

  function addProgressUpdate() {
    setDraft((current) => ({
      ...current,
      updates: [
        {
          id: `update-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          time: '09:00 WIB',
          title: '',
          note: '',
          image: '',
          progress: current.progress,
        },
        ...current.updates,
      ],
    }))
  }

  function removeProgressUpdate(index) {
    setDraft((current) => ({
      ...current,
      updates: current.updates.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function handleSave(event) {
    event.preventDefault()

    const totalBudget = Number(draft.budgetTotal)
    const spentBudget = calculateBudgetRealization(
      draft.categories,
      draft.materials,
    )

    if (
      ['/admin/anggaran', '/admin/material'].includes(activeSection.path) &&
      spentBudget > totalBudget
    ) {
      setErrorMessage('Realisasi anggaran tidak boleh melebihi total anggaran.')
      setMessage('')
      return
    }

    const latestProgressInput = draft.updates[0]?.progress
    const latestDailyProgress =
      latestProgressInput === undefined || latestProgressInput === ''
        ? Number.NaN
        : Number(latestProgressInput)
    const progressToSave =
      activeSection.path === '/admin/progres-harian' &&
      Number.isFinite(latestDailyProgress)
        ? latestDailyProgress
        : Number(draft.progress)

    if (
      activeSection.path === '/admin/anggaran' &&
      (Number(draft.progress) < 0 ||
        Number(draft.progress) > 100 ||
        Number(draft.targetProgress) < 0 ||
        Number(draft.targetProgress) > 100)
    ) {
      setErrorMessage('Progres dan target harus berada di antara 0 sampai 100%.')
      setMessage('')
      return
    }

    if (
      activeSection.path === '/admin/progres-harian' &&
      (progressToSave < 0 || progressToSave > 100)
    ) {
      setErrorMessage('Progres harian harus berada di antara 0 sampai 100%.')
      setMessage('')
      return
    }
    if (
      activeSection.path === '/admin/progres-harian' &&
      draft.updates.some((update) => !String(update.image || '').trim())
    ) {
      setErrorMessage('Foto dokumentasi wajib disertakan pada setiap laporan progres.')
      setMessage('')
      return
    }

    try {
      saveProjectData({
        ...draft,
        year: Number(draft.year),
        daysRemaining: Number(draft.daysRemaining),
        progress: progressToSave,
        targetProgress: Number(draft.targetProgress),
        monthlyProgress: Number(draft.monthlyProgress),
        budgetTotal: totalBudget,
        budgetSpent: spentBudget,
        categories: draft.categories.map((category) => ({
          ...category,
          amount: Number(category.amount),
        })),
        materials: draft.materials.map((material) => ({
          ...material,
          amount: Number(material.amount),
          percent: Number(material.percent),
        })),
      })
      setMessage('Perubahan tersimpan. Dashboard publik sudah diperbarui.')
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal menyimpan perubahan proyek.', error)
      setErrorMessage(
        'Perubahan gagal disimpan. Periksa ruang penyimpanan browser Anda.',
      )
      setMessage('')
    }
  }

  function resetDemoData() {
    if (
      !window.confirm(
        'Pulihkan semua informasi proyek ke data demo awal? Perubahan saat ini akan diganti.',
      )
    ) {
      return
    }

    try {
      const resetData = structuredClone(DEFAULT_PROJECT_DATA)
      saveProjectData(resetData)
      setDraft(resetData)
      setMessage('Data proyek dikembalikan ke data demo awal.')
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal mengatur ulang data proyek.', error)
      setErrorMessage('Data demo gagal dipulihkan.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    onLogout()
    navigate('/login', { replace: true })
  }

  const headingTitle = activeSection.title
  const saveLabel =
    activeSection.path === '/admin/progres-harian'
      ? 'Simpan laporan harian'
      : `Simpan ${activeSection.title.toLowerCase()}`

  return (
    <div className={`admin-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/ringkasan">
          <span className="admin-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <span className="admin-role-label">Panel pengelola proyek</span>
          <ThemeToggle />
          <button className="admin-logout-button" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Menu pengelolaan">
          <span className="admin-sidebar-label">MENU PENGELOLAAN</span>
          <nav className="admin-navigation">
            {ADMIN_SECTIONS.map((section, index) => (
              <Link
                key={section.path}
                className={`admin-navigation-link ${activeSection.path === section.path ? 'active' : ''}`}
                to={section.path}
                aria-current={
                  activeSection.path === section.path ? 'page' : undefined
                }
              >
                <span className="admin-navigation-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{section.title}</span>
              </Link>
            ))}
          </nav>
          <p className="admin-storage-note">
            Mode demo: perubahan tersimpan di browser ini.
          </p>
        </aside>

        <main className="admin-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-kicker">PENGELOLAAN PROYEK</span>
            <h1>{headingTitle}</h1>
            <p>{activeSection.description}</p>
          </div>
          <Link className="admin-preview-link" to="/ringkasan">
            Lihat halaman publik
          </Link>
        </div>

        <form className="project-editor" onSubmit={handleSave}>
          {activeSection.path === '/admin/informasi-proyek' && (
            <section className="editor-section">
            <div className="editor-section-heading">
              <span className="editor-step">01</span>
              <div>
                <h2>Informasi proyek</h2>
                <p>Nama, lokasi, pelaksana, jadwal, dan dokumen proyek.</p>
              </div>
            </div>

            <div className="editor-fields">
              <Field
                label="Nama proyek"
                name="name"
                value={draft.name}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Kategori proyek"
                name="category"
                value={draft.category}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Tahun anggaran"
                name="year"
                type="number"
                min="2000"
                max="2100"
                value={draft.year}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Lokasi"
                name="location"
                value={draft.location}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Alamat lengkap"
                name="address"
                value={draft.address}
                onChange={updateProjectField}
              />
              <Field
                label="Pelaksana proyek"
                name="contractor"
                value={draft.contractor}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Nomor kontrak"
                name="contractNumber"
                value={draft.contractNumber}
                onChange={updateProjectField}
              />
              <Field
                label="Tanggal mulai"
                name="startDate"
                type="date"
                value={draft.startDate}
                onChange={updateProjectField}
              />
              <Field
                label="Target selesai"
                name="endDate"
                type="date"
                value={draft.endDate}
                onChange={updateProjectField}
              />
              <Field
                label="Sisa waktu (hari)"
                name="daysRemaining"
                type="number"
                min="0"
                value={draft.daysRemaining}
                onChange={updateProjectField}
              />
              <Field
                label="URL foto utama proyek"
                name="projectImage"
                type="url"
                value={draft.projectImage}
                onChange={updateProjectField}
              />
              <label className="admin-field admin-field-wide">
                <span>Deskripsi proyek</span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    updateProjectField('description', event.target.value)
                  }
                  rows="3"
                />
              </label>
            </div>
            </section>
          )}

          {activeSection.path === '/admin/anggaran' && (
            <section className="editor-section">
            <div className="editor-section-heading">
              <span className="editor-step">02</span>
              <div>
                <h2>Anggaran dan progres</h2>
                <p>
                  Realisasi dihitung otomatis dari material dan kategori lain.
                </p>
              </div>
            </div>

            <div className="editor-fields editor-fields-4">
              <Field
                label="Total anggaran (Rp)"
                name="budgetTotal"
                type="number"
                min="0"
                value={draft.budgetTotal}
                onChange={updateProjectField}
                required
              />
              <div className="admin-field reporter-realization-field">
                <span>Realisasi anggaran (otomatis)</span>
                <strong>
                  {formatRupiah(
                    calculateBudgetRealization(
                      draft.categories,
                      draft.materials,
                    ),
                  )}
                </strong>
              </div>
              <Field
                label="Progres fisik (%)"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={draft.progress}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Target progres saat ini (%)"
                name="targetProgress"
                type="number"
                min="0"
                max="100"
                value={draft.targetProgress}
                onChange={updateProjectField}
                required
              />
              <Field
                label="Perubahan progres bulanan (%)"
                name="monthlyProgress"
                type="number"
                value={draft.monthlyProgress}
                onChange={updateProjectField}
              />
            </div>

            <div className="editor-subheading">
              <h3>Rincian per kategori</h3>
              <span>
                Subtotal kategori non-material:{' '}
                {formatRupiah(
                  draft.categories.reduce(
                    (sum, category) =>
                      category.materialCategory
                        ? sum
                        : sum + Number(category.amount || 0),
                    0,
                  ),
                )}
              </span>
              <button
                className="admin-secondary-button"
                type="button"
                onClick={addCategory}
              >
                Tambah kategori
              </button>
            </div>
            <div className="repeatable-list">
              {draft.categories.map((category, index) => (
                <div className="repeatable-row" key={`category-${index}`}>
                  <Field
                    label={`Kategori ${index + 1}`}
                    name="name"
                    value={category.name}
                    onChange={(name, value) =>
                      updateListItem('categories', index, name, value)
                    }
                    required
                  />
                  <Field
                    label="Keterangan"
                    name="detail"
                    value={category.detail}
                    onChange={(name, value) =>
                      updateListItem('categories', index, name, value)
                    }
                  />
                  <Field
                    label={
                      category.materialCategory
                        ? 'Nilai (Rp, dari material)'
                        : 'Nilai (Rp)'
                    }
                    name="amount"
                    type="number"
                    min="0"
                    value={
                      category.materialCategory
                        ? calculateMaterialTotal(draft.materials)
                        : category.amount
                    }
                    onChange={(name, value) =>
                      updateListItem('categories', index, name, value)
                    }
                    disabled={Boolean(category.materialCategory)}
                    required
                  />
                  <label className="admin-category-material-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(category.materialCategory)}
                      onChange={(event) =>
                        updateMaterialCategory(index, event.target.checked)
                      }
                    />
                    <span>
                      Hitung biaya kategori ini dari rincian material agar
                      tidak dihitung dua kali.
                    </span>
                  </label>
                </div>
              ))}
            </div>
            </section>
          )}

          {activeSection.path === '/admin/material' && (
            <section className="editor-section">
            <div className="editor-section-heading">
              <span className="editor-step">03</span>
              <div>
                <h2>Rincian material</h2>
                <p>Ubah spesifikasi dan nilai pengeluaran material.</p>
              </div>
            </div>

            <div className="editor-subheading">
              <h3>Daftar material</h3>
              <span>
                {draft.materials.length} material · Total realisasi{' '}
                {formatRupiah(
                  calculateBudgetRealization(
                    draft.categories,
                    draft.materials,
                  ),
                )}
              </span>
              <button
                className="admin-secondary-button"
                type="button"
                onClick={addMaterial}
              >
                Tambah material
              </button>
            </div>
            <div className="repeatable-list">
              {draft.materials.map((material, index) => (
                <div className="repeatable-row material-editor-row" key={`material-${index}`}>
                  <Field
                    label={`Nama material ${index + 1}`}
                    name="name"
                    value={material.name}
                    onChange={(name, value) =>
                      updateListItem('materials', index, name, value)
                    }
                    required
                  />
                  <Field
                    label="Spesifikasi"
                    name="detail"
                    value={material.detail}
                    onChange={(name, value) =>
                      updateListItem('materials', index, name, value)
                    }
                  />
                  <Field
                    label="Keperluan material"
                    name="purpose"
                    value={material.purpose}
                    onChange={(name, value) =>
                      updateListItem('materials', index, name, value)
                    }
                  />
                  <Field
                    label="Pengeluaran (Rp)"
                    name="amount"
                    type="number"
                    min="0"
                    value={material.amount}
                    onChange={(name, value) =>
                      updateListItem('materials', index, name, value)
                    }
                    required
                  />
                  <Field
                    label="Realisasi material (%)"
                    name="percent"
                    type="number"
                    min="0"
                    max="100"
                    value={material.percent}
                    onChange={(name, value) =>
                      updateListItem('materials', index, name, value)
                    }
                  />
                  <button
                    className="remove-update-button material-delete-button"
                    type="button"
                    onClick={() => removeMaterial(index)}
                  >
                    Hapus material
                  </button>
                </div>
              ))}
            </div>
            </section>
          )}

          {activeSection.path === '/admin/progres-harian' && (
            <>
              <section className="editor-section daily-progress-guide">
                <h2>Isi laporan dalam 3 langkah</h2>
                <p>
                  Pilih tanggal, tulis pekerjaan yang dilakukan, lalu isi progres
                  terbaru dan sertakan foto dokumentasi. Perubahan akan tampil
                  pada halaman publik setelah disimpan.
                </p>
              </section>
              <section className="editor-section">
                <div className="editor-section-heading editor-heading-with-action">
                  <span className="editor-step">04</span>
                  <div>
                    <h2>Laporan progres harian</h2>
                    <p>
                      Catat perkembangan dan sertakan foto dokumentasi lapangan.
                    </p>
                  </div>
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={addProgressUpdate}
                  >
                    Tambah laporan
                  </button>
                </div>

                <div className="progress-editor-list">
                  {draft.updates.map((update, index) => (
                    <div className="progress-editor-card" key={update.id}>
                      <div className="progress-editor-header">
                        <strong>Laporan {index + 1}</strong>
                        <button
                          className="remove-update-button"
                          type="button"
                          onClick={() => removeProgressUpdate(index)}
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="editor-fields">
                        <Field
                          label="Tanggal"
                          name="date"
                          type="date"
                          value={update.date}
                          onChange={(name, value) =>
                            updateListItem('updates', index, name, value)
                          }
                        />
                        <Field
                          label="Waktu"
                          name="time"
                          value={update.time}
                          onChange={(name, value) =>
                            updateListItem('updates', index, name, value)
                          }
                        />
                        <Field
                          label="Judul pekerjaan"
                          name="title"
                          value={update.title}
                          onChange={(name, value) =>
                            updateListItem('updates', index, name, value)
                          }
                          required
                        />
                        <Field
                          label="Progres proyek saat ini (%)"
                          name="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={
                            update.progress ??
                            (index === 0 ? draft.progress : '')
                          }
                          onChange={(name, value) =>
                            updateListItem('updates', index, name, value)
                          }
                          required={index === 0}
                        />
                        <div className="admin-field admin-field-wide progress-photo-editor">
                          <span>Foto dokumentasi · wajib</span>
                          {update.image ? (
                            <img
                              className="progress-photo-preview"
                              src={update.image}
                              alt={`Pratinjau foto progres ${index + 1}`}
                            />
                          ) : (
                            <div className="progress-photo-empty">
                              Pratinjau foto akan tampil di sini
                            </div>
                          )}
                          <input
                            className="reporter-photo-input"
                            type="file"
                            accept="image/*"
                            aria-label={`Unggah foto progres ${index + 1}`}
                            onChange={(event) =>
                              handleAdminPhotoSelected(event, index)
                            }
                          />
                          <div className="progress-photo-editor-actions">
                            <button
                              className="admin-secondary-button"
                              type="button"
                              onClick={(event) =>
                                event.currentTarget.previousElementSibling.click()
                              }
                              disabled={processingPhotoIndex === index}
                            >
                              {processingPhotoIndex === index
                                ? 'Memproses foto…'
                                : 'Upload image'}
                            </button>
                            {!update.image?.startsWith('data:image/') && (
                              <button
                                className="admin-secondary-button"
                                type="button"
                                onClick={() =>
                                  setEditingPhotoUrlIndex(
                                    editingPhotoUrlIndex === index ? null : index,
                                  )
                                }
                              >
                                {update.image ? 'Edit URL' : 'Dari URL foto'}
                              </button>
                            )}
                          </div>
                          {(editingPhotoUrlIndex === index ||
                            (update.image &&
                              !update.image.startsWith('data:image/'))) && (
                            <label className="admin-field">
                              <span>URL foto dokumentasi</span>
                              <input
                                type="url"
                                value={update.image?.startsWith('data:image/')
                                  ? ''
                                  : update.image || ''}
                                onChange={(event) =>
                                  updateListItem(
                                    'updates',
                                    index,
                                    'image',
                                    event.target.value,
                                  )
                                }
                                placeholder="https://contoh.com/foto.jpg"
                                readOnly={
                                  Boolean(update.image) &&
                                  editingPhotoUrlIndex !== index
                                }
                                required={!update.image}
                              />
                            </label>
                          )}
                        </div>
                        <label className="admin-field admin-field-wide">
                          <span>Catatan progres</span>
                          <textarea
                            value={update.note}
                            onChange={(event) =>
                              updateListItem(
                                'updates',
                                index,
                                'note',
                                event.target.value,
                              )
                            }
                            rows="2"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeSection.path === '/admin/dokumen' && (
            <section className="editor-section">
            <div className="editor-section-heading">
              <span className="editor-step">05</span>
              <div>
                <h2>Dokumen proyek</h2>
                <p>Masukkan alamat PDF yang disimpan di folder public atau URL yang dapat diakses.</p>
              </div>
            </div>
            <div className="editor-fields">
              <Field
                label="Nama dokumen IMB/PBG"
                name="permitDocumentName"
                value={draft.permitDocumentName}
                onChange={updateProjectField}
              />
              <Field
                label="URL dokumen IMB/PBG (PDF)"
                name="permitDocumentUrl"
                type="text"
                value={draft.permitDocumentUrl}
                onChange={updateProjectField}
              />
              <Field
                label="URL denah bangunan (PDF)"
                name="planDocumentUrl"
                type="text"
                value={draft.planDocumentUrl}
                onChange={updateProjectField}
              />
            </div>
            </section>
          )}

          {(message || errorMessage) && (
            <div
              className={`admin-message ${errorMessage ? 'admin-error' : 'admin-success'}`}
              role={errorMessage ? 'alert' : 'status'}
            >
              {errorMessage || message}
            </div>
          )}

          <div className="editor-actions">
            <button className="admin-primary-button" type="submit">
              {saveLabel}
            </button>
          </div>
          <details className="admin-advanced-actions">
            <summary>Pengaturan lanjutan</summary>
            <button
              className="admin-reset-button"
              type="button"
              onClick={resetDemoData}
            >
              Pulihkan semua data demo
            </button>
          </details>
        </form>
      </main>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const location = useLocation()
  const [userRole, setUserRole] = useState(
    () => {
      const savedRole = sessionStorage.getItem(ADMIN_SESSION_KEY)
      return savedRole === 'reporter' ? 'reporter' : savedRole ? 'admin' : null
    },
  )

  if (userRole === 'admin') {
    if (location.pathname.startsWith('/reporter')) {
      return <Navigate to="/admin/informasi-proyek" replace />
    }
    if (location.pathname === '/login' || location.pathname === '/admin') {
      return <Navigate to="/admin/informasi-proyek" replace />
    }
    return <AdminDashboard onLogout={() => setUserRole(null)} />
  }

  if (userRole === 'reporter') {
    if (location.pathname === '/reporter/permintaan-hapus') {
      return <ProgressDeleteRequestPage />
    }
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/reporter/anggaran" replace />
    }
    if (location.pathname === '/login' || location.pathname === '/reporter') {
      return <Navigate to="/reporter/anggaran" replace />
    }
    return <ReporterDashboard onLogout={() => setUserRole(null)} />
  }

  if (location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return <AdminLogin onLogin={(role) => setUserRole(role)} />
}
