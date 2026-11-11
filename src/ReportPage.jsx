import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import { useTheme } from './theme.js'
import {
  REPORT_STATUSES,
  submitReport as saveReport,
} from './reportData.js'
import { formatProjectDate, useProjectData } from './projectData.js'
import ThemeToggle from './ThemeToggle.jsx'
import './ReportPage.css'

const REPORT_CATEGORIES = [
  'Indikasi penyimpangan material',
  'Dokumen perizinan tidak sesuai',
  'Keterlambatan waktu pembangunan',
  'Ketidaksesuaian kualitas pekerjaan',
  'Tidak ada foto pada Progres',
  'Lainnya',
]

export default function ReportPage({ embedded = false, reporterMode = false }) {
  const { isDarkTheme } = useTheme()
  const [searchParams] = useSearchParams()
  const project = useProjectData()
  const relatedProgressId = searchParams.get('progress') || ''
  const relatedProgress = project.updates.find(
    (update) => update.id === relatedProgressId,
  )
  const isMissingPhotoReport = searchParams.get('issue') === 'missing-photo'
  const missingPhotoDescription = relatedProgress
    ? `Tidak ada foto dokumentasi pada progres "${relatedProgress.title}" (${formatProjectDate(relatedProgress.date)}). Mohon verifikasi dan unggah foto dokumentasi yang sesuai.`
    : 'Tidak ada foto dokumentasi pada progres yang dilaporkan. Mohon verifikasi dan unggah foto dokumentasi yang sesuai.'
  const [savedReport, setSavedReport] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const report = await saveReport({
        reporterName: String(formData.get('reporterName') || '').trim(),
        contact: String(formData.get('contact') || '').trim(),
        category: String(formData.get('category') || ''),
        location: String(formData.get('location') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        relatedProgressId,
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

  const ContentWrapper = embedded ? 'div' : 'main'

  return (
    <div
      className={`report-page ${isDarkTheme ? 'theme-dark' : ''} ${embedded ? 'report-page-embedded' : ''}`}
    >
      {!embedded && (
        <header className="report-page-header">
          <Link className="report-page-brand" to="/ringkasan">
            <span className="report-page-brand-mark"><BrandMark /></span>
            <span>InFrastuktur</span>
          </Link>
          <div className="report-page-header-actions">
            <ThemeToggle />
            {!reporterMode && (
              <Link className="report-back-link" to="/laporan-warga">
                Lihat laporan warga
              </Link>
            )}
          </div>
        </header>
      )}

      <ContentWrapper
        className={`report-page-content ${embedded ? 'embedded-content' : ''}`}
      >
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
            {relatedProgressId && (
              <div className="report-page-related-progress">
                Laporan ini terkait progres{' '}
                <strong>
                  {relatedProgress?.title || relatedProgressId}
                </strong>
                . Referensi {relatedProgressId}.
              </div>
            )}

            <label>
              <span>Jenis ketidaksesuaian</span>
              <select
                name="category"
                defaultValue={
                  isMissingPhotoReport ? 'Tidak ada foto pada Progres' : ''
                }
                required
              >
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
                defaultValue={
                  isMissingPhotoReport && relatedProgress
                    ? `Progres: ${relatedProgress.title}`
                    : ''
                }
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
                defaultValue={isMissingPhotoReport ? missingPhotoDescription : ''}
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
              Informasi kontak hanya dapat dilihat oleh pengelola proyek.
            </p>
          </form>
        )}
      </ContentWrapper>
    </div>
  )
}
