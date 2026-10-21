import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ADMIN_SESSION_KEY,
  DEFAULT_PROJECT_DATA,
  formatRupiah,
  loadProjectData,
  saveProjectData,
} from './projectData'
import './AdminPage.css'

const DEMO_EMAIL = 'admin@infrastuktur.id'
const DEMO_PASSWORD = 'admin123'

function AdminLogin({ onLogin }) {
  const navigate = useNavigate()
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
    navigate('/admin', { replace: true })
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
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

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(loadProjectData)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

    if (spentBudget > totalBudget) {
      setErrorMessage('Realisasi anggaran tidak boleh melebihi total anggaran.')
      setMessage('')
      return
    }

    if (categoryTotal !== spentBudget) {
      setErrorMessage(
        `Jumlah kategori (${formatRupiah(categoryTotal)}) harus sama dengan realisasi anggaran (${formatRupiah(spentBudget)}).`,
      )
      setMessage('')
      return
    }

    if (
      Number(draft.progress) < 0 ||
      Number(draft.progress) > 100 ||
      Number(draft.targetProgress) < 0 ||
      Number(draft.targetProgress) > 100
    ) {
      setErrorMessage('Progres dan target harus berada di antara 0 sampai 100%.')
      setMessage('')
      return
    }

    try {
      saveProjectData({
        ...draft,
        year: Number(draft.year),
        daysRemaining: Number(draft.daysRemaining),
        progress: Number(draft.progress),
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

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">I</span>
          <span>InFrastuktur</span>
        </Link>
        <div className="admin-topbar-actions">
          <span className="admin-role-label">Admin proyek</span>
          <button className="admin-logout-button" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-kicker">PANEL ADMINISTRATOR</span>
            <h1>Kelola data proyek</h1>
            <p>
              Perubahan yang disimpan akan tampil di dashboard publik untuk
              dilihat semua pengunjung.
            </p>
          </div>
          <Link className="admin-preview-link" to="/">
            Lihat halaman publik
          </Link>
        </div>

        <div className="admin-demo-notice" role="note">
          <strong>Mode demo lokal</strong>
          <span>
            Data hanya tersimpan pada browser ini. Login ini bukan pengamanan
            produksi dan tidak memiliki server atau database.
          </span>
        </div>

        <form className="project-editor" onSubmit={handleSave}>
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
              <Field
                label="Nama dokumen izin"
                name="permitDocumentName"
                value={draft.permitDocumentName}
                onChange={updateProjectField}
              />
              <Field
                label="URL dokumen izin (PDF)"
                name="permitDocumentUrl"
                type="text"
                value={draft.permitDocumentUrl}
                onChange={updateProjectField}
              />
              <Field
                label="URL denah bangunan (opsional)"
                name="planDocumentUrl"
                type="text"
                value={draft.planDocumentUrl}
                onChange={updateProjectField}
              />
            </div>
          </section>

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

          <section className="editor-section">
            <div className="editor-section-heading editor-heading-with-action">
              <span className="editor-step">04</span>
              <div>
                <h2>Laporan progres harian</h2>
                <p>Catat perkembangan dan tautan foto dokumentasi lapangan.</p>
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

          {(message || errorMessage) && (
            <div
              className={`admin-message ${errorMessage ? 'admin-error' : 'admin-success'}`}
              role={errorMessage ? 'alert' : 'status'}
            >
              {errorMessage || message}
            </div>
          )}

          <div className="editor-actions">
            <button
              className="admin-reset-button"
              type="button"
              onClick={resetDemoData}
            >
              Pulihkan data demo
            </button>
            <button className="admin-primary-button" type="submit">
              Simpan dan terbitkan perubahan
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active',
  )

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />
  }

  return <AdminLogin onLogin={() => setIsAdmin(true)} />
}
