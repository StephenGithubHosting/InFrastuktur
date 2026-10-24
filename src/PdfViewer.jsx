import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

function PdfViewer({ url }) {
  const containerRef = useRef(null)
  const [pageCount, setPageCount] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [loadStatus, setLoadStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
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
  }, [])

  function handleLoadSuccess({ numPages }) {
    setPageCount(numPages)
    setPageNumber(1)
    setLoadStatus('ready')
  }

  function handleLoadError(error) {
    setLoadStatus('error')
    setErrorMessage(`PDF tidak dapat dimuat: ${error.message}`)
  }

  function handlePageError(error) {
    setLoadStatus('error')
    setErrorMessage(`Halaman PDF gagal ditampilkan: ${error.message}`)
  }

  function changePage(nextPage) {
    if (pageCount && nextPage >= 1 && nextPage <= pageCount) {
      setPageNumber(nextPage)
    }
  }

  return (
    <div className="pdf-js-viewer" ref={containerRef}>
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
      <Document
        file={url}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={null}
        error={null}
        className="pdf-document"
      >
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
              Halaman {pageNumber} dari {pageCount}
            </span>
            <button
              type="button"
              onClick={() => changePage(pageNumber + 1)}
              disabled={pageNumber >= pageCount}
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
          hidden={loadStatus !== 'ready'}
        >
          {loadStatus === 'ready' && containerWidth > 32 && (
            <Page
              className="pdf-canvas"
              pageNumber={pageNumber}
              width={containerWidth - 32}
              scale={zoom}
              onLoadError={handlePageError}
              loading={null}
              error={null}
            />
          )}
        </div>
      </Document>
    </div>
  )
}

export default PdfViewer
