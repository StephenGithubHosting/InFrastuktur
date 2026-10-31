import { Link } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import { useTheme } from './theme.js'
import ThemeToggle from './ThemeToggle.jsx'
import {
  formatCompactRupiah,
  formatProjectDate,
  useProjectData,
} from './projectData.js'
import './LandingPage.css'

export default function LandingPage() {
  const project = useProjectData()
  const { isDarkTheme } = useTheme()
  const progress = Math.min(100, Math.max(0, Number(project.progress) || 0))
  const budgetUsed = project.budgetTotal
    ? Math.round((project.budgetSpent / project.budgetTotal) * 100)
    : 0
  const latestUpdate = project.updates[0]

  return (
    <main className={`landing-page ${isDarkTheme ? 'theme-dark' : ''}`}>
      <header className="landing-header">
        <Link className="landing-brand" to="/" aria-label="InFrastuktur, beranda">
          <span className="landing-brand-mark"><BrandMark /></span>
          <span>InFrastuktur</span>
        </Link>
        <nav className="landing-navigation" aria-label="Navigasi utama">
          <Link to="/ringkasan">Ringkasan proyek</Link>
          <Link to="/laporan-warga">Laporan warga</Link>
          <Link to="/login">Masuk admin</Link>
          <Link to="/login">Masuk reporter</Link>
        </nav>
        <div className="landing-actions">
          <ThemeToggle />
          <Link className="landing-header-cta" to="/ringkasan">
            Jelajahi proyek <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <img
          className="landing-hero-image"
          src={project.projectImage}
          alt={`Pembangunan ${project.name}`}
        />
        <div className="landing-hero-shade" />
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">
            <i /> TRANSPARANSI INFRASTRUKTUR PUBLIK
          </span>
          <h1 id="landing-title">Proyek publik, terbuka untuk semua.</h1>
          <p>
            Pantau perkembangan pembangunan, penggunaan anggaran, dan laporan
            warga dalam satu ruang informasi.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-primary-cta" to="/ringkasan">
              Lihat ringkasan proyek <span aria-hidden="true">↗</span>
            </Link>
            <Link className="landing-reporter-cta" to="/login">
              Masuk reporter
            </Link>
          </div>
        </div>
        <div className="landing-hero-meta">
          <div className="landing-image-caption">
            <span>PROYEK PILIHAN</span>
            <strong>{project.name}</strong>
            <span>{project.location}</span>
          </div>
          <div className="landing-project-status">
            <span className="landing-status-label">PROGRES PEMBANGUNAN</span>
            <strong>{progress}<small>%</small></strong>
            <div className="landing-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="landing-status-foot">
              Target selesai {formatProjectDate(project.endDate)}
            </span>
          </div>
        </div>
      </section>

      <section className="landing-project-strip" aria-label="Data proyek terkini">
        <div className="landing-project-intro">
          <span className="landing-section-label">SEDANG BERJALAN · {project.year}</span>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
        <div className="landing-metric">
          <span>Total anggaran</span>
          <strong>{formatCompactRupiah(project.budgetTotal)}</strong>
          <small>{budgetUsed}% telah terealisasi</small>
        </div>
        <div className="landing-metric">
          <span>Update lapangan</span>
          <strong>{latestUpdate ? formatProjectDate(latestUpdate.date) : 'Belum ada'}</strong>
          <small>{latestUpdate?.title || 'Belum ada laporan progres'}</small>
        </div>
        <Link className="landing-strip-link" to="/ringkasan" aria-label="Buka ringkasan proyek">
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className="landing-footer">
        <span>© {project.year} InFrastuktur</span>
        <span>Informasi pembangunan yang dapat diakses masyarakat.</span>
        <Link to="/laporan-warga">Lihat laporan warga <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  )
}