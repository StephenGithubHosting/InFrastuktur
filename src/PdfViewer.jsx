import { useEffect, useRef, useState } from 'react'
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

function PdfViewer({ url }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [loadStatus, setLoadStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    let loadingTask
    const abortController = new AbortController()

    Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      fetch(url, { signal: abortController.signal }),
    ])
      .then(async ([{ getDocument, GlobalWorkerOptions }, response]) => {
        if (cancelled) return null

        if (!response.ok || response.status === 204) {
          throw new Error(`server mengembalikan HTTP ${response.status}`)
        }

        const data = new Uint8Array(await response.arrayBuffer())
        if (!data.length) {
          throw new Error('berkas PDF kosong')
        }

        GlobalWorkerOptions.workerSrc = pdfWorkerUrl
        loadingTask = getDocument({ data })
        return loadingTask.promise
      })
      .then((document) => {
        if (!document) return
        if (cancelled) {
          document.destroy()
          return
        }

        setPdfDocument(document)
        setLoadStatus('ready')
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadStatus('error')
          setErrorMessage(`PDF tidak dapat dimuat: ${error.message}`)
        }
      })

    return () => {
      cancelled = true
      abortController.abort()
      loadingTask?.destroy()
    }
  }, [url])

  useEffect(() => {
    if (loadStatus !== 'ready') return undefined

    const container = containerRef.current
    if (!container) return undefined

    const animationFrame = requestAnimationFrame(() => {
      setContainerWidth(container.getBoundingClientRect().width)
    })
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(container)
    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [loadStatus])

  useEffect(() => {
    if (!pdfDocument || !containerWidth || !canvasRef.current) return undefined

    let cancelled = false
    let renderTask

    pdfDocument
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const fitScale = Math.max(0.1, (containerWidth - 32) / baseViewport.width)
        const viewport = page.getViewport({ scale: fitScale * zoom })
        const outputScale = window.devicePixelRatio || 1
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform:
            outputScale === 1
              ? null
              : [outputScale, 0, 0, outputScale, 0, 0],
        })
        return renderTask.promise
      })
      .catch((error) => {
        if (!cancelled && error.name !== 'RenderingCancelledException') {
          setErrorMessage(`Halaman PDF gagal ditampilkan: ${error.message}`)
          setLoadStatus('error')
        }
      })

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [containerWidth, pageNumber, pdfDocument, zoom])

  function changePage(nextPage) {
    if (pdfDocument && nextPage >= 1 && nextPage <= pdfDocument.numPages) {
      setPageNumber(nextPage)
    }
  }

  return (
    <div className="pdf-js-viewer">
      {loadStatus === 'loading' && (
        <div className="pdf-viewer-message" role="status">
          Memuat dokumen PDF...
        </div>
      )}
      {loadStatus === 'error' && (
        <div className="pdf-viewer-message pdf-viewer-error" role="alert">
          {errorMessage}
        </div>
      )}
      {loadStatus === 'ready' && (
        <div className="pdf-viewer-controls" aria-label="Kontrol PDF">
            <button
              type="button"
              onClick={() => changePage(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              Sebelumnya
            </button>
            <span aria-live="polite">
              Halaman {pageNumber} dari {pdfDocument.numPages}
            </span>
            <button
              type="button"
              onClick={() => changePage(pageNumber + 1)}
              disabled={pageNumber >= pdfDocument.numPages}
            >
              Berikutnya
            </button>
            <span className="pdf-control-spacer" />
            <button
              type="button"
              onClick={() => setZoom((currentZoom) => Math.max(0.6, currentZoom - 0.2))}
              disabled={zoom <= 0.6}
              aria-label="Perkecil PDF"
            >
              −
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((currentZoom) => Math.min(2, currentZoom + 0.2))}
              disabled={zoom >= 2}
              aria-label="Perbesar PDF"
            >
              +
            </button>
        </div>
      )}
      <div
        className="pdf-canvas-container"
        ref={containerRef}
        hidden={loadStatus !== 'ready'}
      >
        {loadStatus === 'ready' && (
            <canvas
              className="pdf-canvas"
              ref={canvasRef}
              aria-label={`Halaman ${pageNumber} dari dokumen PDF`}
            />
        )}
      </div>
    </div>
  )
}

export default PdfViewer
