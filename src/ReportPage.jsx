import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from './theme.js'
import {
  REPORT_STATUSES,
  submitReport as saveReport,
} from './reportData.js'
import ThemeToggle from './ThemeToggle.jsx'
import './ReportPage.css'

const REPORT_CATEGORIES = [
  'Indikasi penyimpangan material',
  'Dokumen perizinan tidak sesuai',
  'Keterlambatan waktu pembangunan',
  'Ketidaksesuaian kualitas pekerjaan',
  'Lainnya',
]

export default function ReportPage() {
  const { isDarkTheme } = useTheme()
  const [savedReport, setSavedReport] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const report = saveReport({
        reporterName: String(formData.get('reporterName') || '').trim(),
        contact: String(formData.get('contact') || '').trim(),
        category: String(formData.get('category') || ''),
        location: String(formData.get('location') || '').trim(),
        description: String(formData.get('description') || '').trim(),
      })
      setSavedReport(report)
      setErrorMessage('')
    } catch (error) {
      console.error('Gagal menyimpan laporan ketidaksesuaian.', error)
      setErrorMessage(
        'Laporan belum tersimpan. Periksa penyimpanan browser dan coba lagi.',
      )
    }
  }

  return (
    <div className={`report-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="report-page-header">
        <Link className="report-page-brand" to="/">
          <span className="report-page-brand-mark">I</span>
          <span>InFrastuktur</span>
        </Link>
        <div className="report-page-header-actions">
          <ThemeToggle />
          <Link className="report-back-link" to="/laporan-warga">
            Lihat laporan warga
          </Link>
        </div>
      </header>

      <main className="report-page-content">
        <div className="report-page-heading">
          <span className="report-page-kicker">PARTISIPASI MASYARAKAT</span>
          <h1>Laporkan ketidaksesuaian</h1>
          <p>
            Sampaikan temuan terkait proyek agar dapat ditinjau oleh pengelola.
            Isi detail yang Anda ketahui; nama dan kontak boleh dikosongkan.
          </p>
        </div>

        {savedReport ? (
          <section className="report-confirmation" role="status">
            <span className="report-confirmation-mark" aria-hidden="true">
              ✓
            </span>
            <h2>Laporan berhasil dicatat</h2>
            <p>
              Kode laporan: <strong>{savedReport.id}</strong>
            </p>
            <p>
              Status saat ini: {REPORT_STATUSES[savedReport.status]}. Simpan
              kode ini bila Anda ingin merujuk laporan tersebut.
            </p>
            <button
              className="report-page-submit"
              type="button"
              onClick={() => setSavedReport(null)}
            >
              Kirim laporan lain
            </button>
            <Link className="report-back-link" to="/laporan-warga">
              Lihat laporan warga
            </Link>
          </section>
        ) : (
          <form className="report-page-form" onSubmit={handleSubmit}>
            <div className="report-form-note">
              <strong>Informasi yang ditampilkan kepada publik</strong>
              <span>
                Kategori, lokasi, deskripsi, dan status laporan dapat dilihat
                di halaman laporan warga. Nama serta kontak pelapor tidak
                ditampilkan. Jangan sertakan nomor identitas atau informasi
                rahasia dalam deskripsi.
              </span>
            </div>

            <label>
              <span>Jenis ketidaksesuaian</span>
              <select name="category" defaultValue="" required>
                <option value="" disabled>
                  Pilih jenis laporan
                </option>
                {REPORT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Lokasi temuan</span>
              <input
                name="location"
                type="text"
                placeholder="Contoh: sisi timur, lantai 2"
                required
              />
            </label>

            <label>
              <span>Deskripsi temuan</span>
              <textarea
                name="description"
                minLength="10"
                rows="5"
                placeholder="Ceritakan apa yang terjadi, kapan ditemukan, dan informasi yang membantu pemeriksaan."
                required
              />
            </label>

            <div className="report-form-contact-fields">
              <label>
                <span>Nama pelapor (opsional)</span>
                <input
                  name="reporterName"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama Anda"
                />
              </label>
              <label>
                <span>Email atau nomor kontak (opsional)</span>
                <input
                  name="contact"
                  type="text"
                  autoComplete="email"
                  placeholder="Untuk tindak lanjut"
                />
              </label>
            </div>

            {errorMessage && (
              <div className="report-page-error" role="alert">
                {errorMessage}
              </div>
            )}

            <button className="report-page-submit" type="submit">
              Kirim laporan
            </button>
            <p className="report-storage-disclaimer">
              Prototipe ini menyimpan laporan pada browser lokal. Pengiriman
              belum tersinkron ke server atau perangkat lain.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
