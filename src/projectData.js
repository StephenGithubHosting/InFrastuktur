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
  budgetSpent: 1737650000,
  budgetHistory: {
    2024: { budgetTotal: 3850000000, budgetSpent: 2910000000 },
    2025: { budgetTotal: 4250000000, budgetSpent: 3375000000 },
    2026: { budgetTotal: 4850000000, budgetSpent: 1737650000 },
  },
  projectImage:
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1500&q=85',
  permitDocumentName: 'Contoh Permohonan IMB/PBG (Draf)',
  permitDocumentUrl: '/dokumen-proyek.pdf',
  planDocumentUrl: '/denah-bangunan-puskesmas-prambanan.pdf',
  categories: [
    {
      name: 'Konstruksi & material',
      detail: 'Material, struktur, dan finishing',
      amount: 587650000,
      materialCategory: true,
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
      purpose: 'Perekat pasangan bata, plesteran, dan pekerjaan beton non-struktural.',
    },
    {
      name: 'Pasir pasang',
      detail: 'Pasir Muntilan · 1.200 m³',
      amount: 94500000,
      percent: 58,
      color: 'blue',
      purpose: 'Campuran pasangan bata dan mortar untuk pekerjaan dinding.',
    },
    {
      name: 'Besi beton',
      detail: 'Besi ulir SNI · 24.500 kg',
      amount: 238750000,
      percent: 86,
      color: 'orange',
      purpose: 'Tulangan kolom, balok, pelat, dan elemen struktur bangunan.',
    },
    {
      name: 'Batu split',
      detail: 'Agregat kelas A · 850 m³',
      amount: 68000000,
      percent: 46,
      color: 'purple',
      purpose: 'Agregat untuk campuran beton dan lapisan dasar konstruksi.',
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
    {
      id: 'update-4',
      date: '2026-09-30',
      time: '09:15 WIB',
      title: 'Bangunan mencapai tahap setengah jadi',
      note: 'Struktur utama dan sebagian dinding lantai 1–2 telah terbentuk. Pekerjaan berlanjut pada dinding, instalasi awal, dan penyelesaian struktur.',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-5',
      date: '2026-08-12',
      time: '10:30 WIB',
      title: 'Pekerjaan struktur lantai 2',
      note: 'Pengecoran pelat lantai 2 dilanjutkan setelah pemeriksaan tulangan dan bekisting.',
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-6',
      date: '2026-06-28',
      time: '08:50 WIB',
      title: 'Kolom dan balok lantai 1',
      note: 'Struktur kolom dan balok lantai 1 dikerjakan bertahap, termasuk pemeriksaan dimensi dan mutu beton.',
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-7',
      date: '2026-05-20',
      time: '13:20 WIB',
      title: 'Pengecoran fondasi bangunan',
      note: 'Pengecoran fondasi dilakukan setelah pemeriksaan pembesian dan kesiapan area kerja.',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-8',
      date: '2026-04-18',
      time: '09:05 WIB',
      title: 'Penggalian dan persiapan fondasi',
      note: 'Penggalian mengikuti denah kerja. Dasar galian dirapikan dan dipadatkan sebelum pekerjaan fondasi dimulai.',
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=650&q=75',
    },
    {
      id: 'update-9',
      date: '2026-03-12',
      time: '08:30 WIB',
      title: 'Pembongkaran dan pembersihan lahan',
      note: 'Material sisa bangunan dibongkar dan area dibersihkan sebagai tahap awal persiapan lokasi pembangunan.',
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=650&q=75',
    },
  ],
}

function cloneDefaultData() {
  const project = structuredClone(DEFAULT_PROJECT_DATA)
  project.categories = synchronizeMaterialCategoryAmounts(
    project.categories,
    project.materials,
  )
  project.budgetSpent = calculateBudgetRealization(
    project.categories,
    project.materials,
  )
  return project
}

export function calculateMaterialTotal(materials = []) {
  return materials.reduce(
    (total, material) => total + Number(material.amount || 0),
    0,
  )
}

export function synchronizeMaterialCategoryAmounts(
  categories = [],
  materials = [],
) {
  const materialTotal = calculateMaterialTotal(materials)

  return categories.map((category) =>
    category.materialCategory
      ? { ...category, amount: materialTotal }
      : category,
  )
}

export function calculateBudgetRealization(categories = [], materials = []) {
  const otherCategoryExpenses = categories.reduce(
    (total, category) =>
      category.materialCategory ? total : total + Number(category.amount || 0),
    0,
  )
  return otherCategoryExpenses + calculateMaterialTotal(materials)
}

export function loadProjectData() {
  const savedData = localStorage.getItem(PROJECT_STORAGE_KEY)

  if (!savedData) {
    return cloneDefaultData()
  }

  try {
    const savedProject = JSON.parse(savedData)
    const defaultProject = cloneDefaultData()
    const savedUpdates = Array.isArray(savedProject.updates)
      ? savedProject.updates
      : defaultProject.updates
    const savedUpdateIds = new Set(savedUpdates.map((update) => update.id))
    const project = {
      ...defaultProject,
      ...savedProject,
      categories: (
        Array.isArray(savedProject.categories)
          ? savedProject.categories
          : defaultProject.categories
      ).map((category) => ({
        ...category,
        materialCategory:
          typeof category.materialCategory === 'boolean'
            ? category.materialCategory
            : /material|bahan/i.test(category.name || ''),
      })),
      materials: Array.isArray(savedProject.materials)
        ? savedProject.materials
        : defaultProject.materials,
      updates: [
        ...savedUpdates,
        ...defaultProject.updates.filter(
          (update) => !savedUpdateIds.has(update.id),
        ),
      ].sort((first, second) =>
        String(second.date).localeCompare(String(first.date)),
      ),
    }
    project.budgetSpent = calculateBudgetRealization(
      project.categories,
      Array.isArray(project.materials) ? project.materials : [],
    )
    project.budgetHistory = {
      ...defaultProject.budgetHistory,
      ...(savedProject.budgetHistory &&
      typeof savedProject.budgetHistory === 'object' &&
      !Array.isArray(savedProject.budgetHistory)
        ? savedProject.budgetHistory
        : {}),
      [String(project.year)]: {
        budgetTotal: Number(project.budgetTotal),
        budgetSpent: project.budgetSpent,
      },
    }
    project.categories = synchronizeMaterialCategoryAmounts(
      project.categories,
      project.materials,
    )

    if (
      project.permitDocumentUrl === DEFAULT_PROJECT_DATA.permitDocumentUrl &&
      [
        'Surat permohonan IMB',
        'Ringkasan Proyek Puskesmas Prambanan',
      ].includes(project.permitDocumentName)
    ) {
      project.permitDocumentName = DEFAULT_PROJECT_DATA.permitDocumentName
      project.planDocumentUrl ||= DEFAULT_PROJECT_DATA.planDocumentUrl
    }

    return project
  } catch (error) {
    console.error('Tidak dapat membaca data proyek tersimpan.', error)
    return cloneDefaultData()
  }
}

export function saveProjectData(project) {
  const budgetSpent = calculateBudgetRealization(
    project.categories,
    project.materials,
  )
  const projectToSave = {
    ...project,
    budgetHistory: {
      ...(project.budgetHistory || {}),
      [String(project.year)]: {
        budgetTotal: Number(project.budgetTotal),
        budgetSpent,
      },
    },
    categories: synchronizeMaterialCategoryAmounts(
      project.categories,
      project.materials,
    ),
    budgetSpent,
  }
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectToSave))
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
