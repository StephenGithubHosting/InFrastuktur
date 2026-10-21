import { useEffect, useState } from 'react'

export const PROJECT_STORAGE_KEY = 'infrastuktur-project-data'
export const ADMIN_SESSION_KEY = 'infrastuktur-admin-session'

export const DEFAULT_PROJECT_DATA = {
  name: 'Puskesmas Prambanan',
  category: 'Infrastruktur kesehatan',
  year: 2026,
  description:
    'Fasilitas layanan kesehatan yang lebih dekat, nyaman, dan layak untuk seluruh warga Prambanan.',
  location: 'Kec. Prambanan, Kab. Sleman',
  address: 'Jl. Raya Piyungan, Prambanan',
  contractor: 'PT. Karya Bangun Sejahtera',
  contractNumber: '027/PKS-DINKES/III/2026',
  startDate: '2026-03-01',
  endDate: '2026-12-30',
  daysRemaining: 73,
  progress: 68,
  targetProgress: 60,
  monthlyProgress: 8,
  budgetTotal: 4850000000,
  budgetSpent: 3290000000,
  projectImage:
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1500&q=85',
  permitDocumentName: 'Surat permohonan IMB',
  permitDocumentUrl: '/dokumen-proyek.pdf',
  planDocumentUrl: '',
  categories: [
    {
      name: 'Konstruksi & material',
      detail: 'Material, struktur, dan finishing',
      amount: 2140000000,
    },
    {
      name: 'Tenaga kerja',
      detail: 'Upah pekerja dan tenaga ahli',
      amount: 682000000,
    },
    {
      name: 'Perencanaan & pengawasan',
      detail: 'Konsultan, uji mutu, dan administrasi',
      amount: 468000000,
    },
  ],
  materials: [
    {
      name: 'Semen Portland',
      detail: 'Semen Gresik · 50 kg / sak',
      amount: 186400000,
      percent: 72,
      color: 'mint',
    },
    {
      name: 'Pasir pasang',
      detail: 'Pasir Muntilan · 1.200 m³',
      amount: 94500000,
      percent: 58,
      color: 'blue',
    },
    {
      name: 'Besi beton',
      detail: 'Besi ulir SNI · 24.500 kg',
      amount: 238750000,
      percent: 86,
      color: 'orange',
    },
    {
      name: 'Batu split',
      detail: 'Agregat kelas A · 850 m³',
      amount: 68000000,
      percent: 46,
      color: 'purple',
    },
  ],
  updates: [
    {
      id: 'update-1',
      date: '2026-10-18',
      time: '09:42 WIB',
      title: 'Pengecoran kolom lantai 2',
      note: 'Pengecoran kolom sisi timur selesai. Mutu beton K-300.',
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-2',
      date: '2026-10-17',
      time: '15:18 WIB',
      title: 'Pemasangan tulangan balok',
      note: 'Pemeriksaan tulangan balok utama sebelum pengecoran.',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-3',
      date: '2026-10-16',
      time: '10:06 WIB',
      title: 'Pekerjaan dinding lantai 1',
      note: 'Pemasangan bata ringan mencapai sisi utara bangunan.',
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=650&q=75',
    },
  ],
}

function cloneDefaultData() {
  return structuredClone(DEFAULT_PROJECT_DATA)
}

export function loadProjectData() {
  const savedData = localStorage.getItem(PROJECT_STORAGE_KEY)

  if (!savedData) {
    return cloneDefaultData()
  }

  try {
    return {
      ...cloneDefaultData(),
      ...JSON.parse(savedData),
    }
  } catch (error) {
    console.error('Tidak dapat membaca data proyek tersimpan.', error)
    return cloneDefaultData()
  }
}

export function saveProjectData(project) {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project))
  window.dispatchEvent(new Event('project-data-updated'))
}

export function useProjectData() {
  const [project, setProject] = useState(loadProjectData)

  useEffect(() => {
    function refreshProject() {
      setProject(loadProjectData())
    }

    window.addEventListener('storage', refreshProject)
    window.addEventListener('project-data-updated', refreshProject)

    return () => {
      window.removeEventListener('storage', refreshProject)
      window.removeEventListener('project-data-updated', refreshProject)
    }
  }, [])

  return project
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function formatCompactRupiah(value) {
  return `Rp ${(Number(value || 0) / 1000000000).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M`
}

export function formatProjectDate(value) {
  if (!value) return 'Belum ditentukan'

  const date = new Date(`${value}T12:00:00`)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
