export const PROGRESS_REQUESTS_STORAGE_KEY = 'infrastuktur-progress-delete-requests'
export const PROGRESS_REQUESTS_UPDATED_EVENT = 'progress-delete-requests-updated'
export const PROGRESS_REQUEST_STATUSES = {
  pending: 'Menunggu ditinjau',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export function loadProgressDeleteRequests() {
  const savedRequests = localStorage.getItem(PROGRESS_REQUESTS_STORAGE_KEY)
  if (!savedRequests) return []

  const requests = JSON.parse(savedRequests)
  if (!Array.isArray(requests)) {
    throw new Error('Format permintaan penghapusan progres tidak valid.')
  }
  return requests
}

function saveRequests(requests) {
  localStorage.setItem(PROGRESS_REQUESTS_STORAGE_KEY, JSON.stringify(requests))
  window.dispatchEvent(new Event(PROGRESS_REQUESTS_UPDATED_EVENT))
}

export function submitProgressDeleteRequest(request) {
  const savedRequest = {
    ...request,
    id: `delete-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  saveRequests([savedRequest, ...loadProgressDeleteRequests()])
  return savedRequest
}

export function updateProgressDeleteRequestStatus(requestId, status) {
  if (!Object.hasOwn(PROGRESS_REQUEST_STATUSES, status)) {
    throw new Error('Status permintaan tidak dikenal.')
  }
  const requests = loadProgressDeleteRequests()
  if (!requests.some((request) => request.id === requestId)) {
    throw new Error('Permintaan tidak ditemukan.')
  }
  saveRequests(
    requests.map((request) =>
      request.id === requestId ? { ...request, status } : request,
    ),
  )
}
