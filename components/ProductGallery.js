'use client'

import { useState } from 'react'

export default function ProductGallery({ images, name }) {
  const [activeImage, setActiveImage] = useState(
    images?.find((img) => img.is_primary)?.image_url ||
    images?.[0]?.image_url ||
    null
  )

  if (!activeImage) {
    return (
      <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-sm rounded-xl">
        Tidak ada foto
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border">
        <img src={activeImage} alt={name} className="w-full h-full object-cover" />
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
  )
}
