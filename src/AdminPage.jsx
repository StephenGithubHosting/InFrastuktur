import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import {
  ADMIN_SESSION_KEY,
  DEFAULT_PROJECT_DATA,
  formatRupiah,
  loadProjectData,
  saveProjectData,
} from './projectData'
import {
  deleteReport,
  loadReports,
  REPORTS_UPDATED_EVENT,
  REPORT_STATUSES,
  updateReportStatus,
} from './reportData.js'
import './AdminPage.css'

const DEMO_EMAIL = 'admin@infrastuktur.id'
const DEMO_PASSWORD = 'admin123'

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
]

function AdminLogin({ onLogin }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setErrorMessage('Email atau kata sandi tidak sesuai.')
      return
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, 'active')
    onLogin()
    navigate('/admin/informasi-proyek', { replace: true })
  }

  return (
    <div className={`admin-auth-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <div className="admin-auth-card">
        <div className="admin-auth-actions">
          <ThemeToggle />
        </div>
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">I</span>
          <span>InFrastuktur</span>
        </Link>

        <div className="admin-auth-heading">
          <span className="admin-kicker">AREA PENGELOLA</span>
          <h1>Masuk sebagai admin</h1>
          <p>Kelola informasi anggaran dan progres proyek publik.</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email admin</label>
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
            Masuk ke panel admin
          </button>
        </form>

        <div className="demo-credentials">
          <strong>Akun demo untuk prototipe</strong>
          <span>Email: {DEMO_EMAIL}</span>
          <span>Kata sandi: {DEMO_PASSWORD}</span>
        </div>

        <div className="security-notice">
          Ini adalah login demo di browser. Jangan gunakan untuk melindungi data
          sungguhan tanpa autentikasi backend.
        </div>

        <Link className="back-to-public" to="/">
          Kembali ke halaman publik
        </Link>
      </div>
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
    navigate('/admin/login', { replace: true })
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
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">I</span>
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

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkTheme } = useTheme()
  const [draft, setDraft] = useState(loadProjectData)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const normalizedPath = location.pathname.replace(/\/+$/, '').toLowerCase()
  const activeSection =
    ADMIN_SECTIONS.find(
      (section) => section.path.toLowerCase() === normalizedPath,
    ) ??
    ADMIN_SECTIONS[0]

  if (activeSection.path === '/admin/laporan-ketidaksesuaian') {
    return <AdminReportsPage onLogout={onLogout} />
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
    const spentBudget = Number(draft.budgetSpent)
    const categoryTotal = draft.categories.reduce(
      (total, category) => total + Number(category.amount || 0),
      0,
    )

    if (
      activeSection.path === '/admin/anggaran' &&
      spentBudget > totalBudget
    ) {
      setErrorMessage('Realisasi anggaran tidak boleh melebihi total anggaran.')
      setMessage('')
      return
    }

    if (
      activeSection.path === '/admin/anggaran' &&
      categoryTotal !== spentBudget
    ) {
      setErrorMessage(
        `Jumlah kategori (${formatRupiah(categoryTotal)}) harus sama dengan realisasi anggaran (${formatRupiah(spentBudget)}).`,
      )
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
    navigate('/admin/login', { replace: true })
  }

  const headingTitle = activeSection.title
  const saveLabel =
    activeSection.path === '/admin/progres-harian'
      ? 'Simpan laporan harian'
      : `Simpan ${activeSection.title.toLowerCase()}`

  return (
    <div className={`admin-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="admin-topbar">
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">I</span>
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
          <Link className="admin-preview-link" to="/">
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
                  Nilai kategori harus berjumlah sama dengan realisasi anggaran.
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
              <Field
                label="Realisasi anggaran (Rp)"
                name="budgetSpent"
                type="number"
                min="0"
                value={draft.budgetSpent}
                onChange={updateProjectField}
                required
              />
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
                Total saat ini:{' '}
                {formatRupiah(
                  draft.categories.reduce(
                    (sum, category) => sum + Number(category.amount || 0),
                    0,
                  ),
                )}
              </span>
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
                    label="Nilai (Rp)"
                    name="amount"
                    type="number"
                    min="0"
                    value={category.amount}
                    onChange={(name, value) =>
                      updateListItem('categories', index, name, value)
                    }
                    required
                  />
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
                  terbaru. Tambahkan foto jika tersedia. Perubahan akan tampil
                  pada halaman publik setelah disimpan.
                </p>
              </section>
              <section className="editor-section">
                <div className="editor-section-heading editor-heading-with-action">
                  <span className="editor-step">04</span>
                  <div>
                    <h2>Laporan progres harian</h2>
                    <p>
                      Catat perkembangan dan tautan foto dokumentasi lapangan.
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
                        <Field
                          label="URL foto dokumentasi"
                          name="image"
                          type="url"
                          value={update.image}
                          onChange={(name, value) =>
                            updateListItem('updates', index, name, value)
                          }
                        />
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
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active',
  )

  if (isAdmin) {
    if (location.pathname === '/admin') {
      return <Navigate to="/admin/informasi-proyek" replace />
    }
    if (location.pathname === '/admin/login') {
      return <Navigate to="/admin/informasi-proyek" replace />
    }
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />
  }

  if (location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminLogin onLogin={() => setIsAdmin(true)} />
}
