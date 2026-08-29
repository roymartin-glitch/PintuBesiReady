'use client'

import { useState } from 'react'

export default function ProductGallery({ images, name }) {
  const [activeImage, setActiveImage] = useState(
    images?.find((img) => img.is_primary)?.image_url ||
    images?.[0]?.image_url ||
    null
  )
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (!activeImage) {
    return (
      <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-sm rounded-xl">
        Tidak ada foto
      </div>
    )
  }

  const allImages = images || [{ image_url: activeImage }]
  
  const openLightbox = (imageUrl) => {
    const index = allImages.findIndex(img => img.image_url === imageUrl)
    setLightboxIndex(index >= 0 ? index : 0)
    setIsLightboxOpen(true)
    // Prevent body scroll when lightbox open
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    document.body.style.overflow = 'auto'
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image - Clickable for Zoom */}
        <div 
          className="aspect-square bg-slate-100 rounded-xl overflow-hidden border cursor-zoom-in group relative"
          onClick={() => openLightbox(activeImage)}
        >
          <img 
            src={activeImage} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
          />
          
          {/* Zoom Hint Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold text-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              Klik untuk Zoom
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images && images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img.image_url)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 bg-slate-50 transition ${activeImage === img.image_url ? 'border-slate-800' : 'border-transparent hover:border-slate-300'}`}
              >
                <img src={img.image_url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-md border border-white/20"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-md border border-white/20 z-10"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main Lightbox Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIndex]?.image_url}
              alt={`${name} - Gambar ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-md border border-white/20 z-10"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Thumbnails in Lightbox */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-2 px-4">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${lightboxIndex === idx ? 'border-white' : 'border-white/30 hover:border-white/60'}`}
                >
                  <img src={img.image_url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center hidden md:block">
            <p>Tekan ESC untuk keluar • ← → untuk navigasi</p>
          </div>
        </div>
      )}
    </>
  )
}
