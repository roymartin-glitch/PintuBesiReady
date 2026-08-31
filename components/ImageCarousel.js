'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function ImageCarousel({ slides = [], autoPlayMs = 4000 }) {
    const [current, setCurrent] = useState(0)
    const timerRef = useRef(null)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const total = slides.length

    const goTo = useCallback((idx) => {
        setCurrent(((idx % total) + total) % total)
    }, [total])

    const next = useCallback(() => goTo(current + 1), [current, goTo])
    const prev = useCallback(() => goTo(current - 1), [current, goTo])

    // Autoplay
    useEffect(() => {
        if (total <= 1) return
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % total)
        }, autoPlayMs)
        return () => clearInterval(timerRef.current)
    }, [total, autoPlayMs, current])

    const pauseAutoplay = () => clearInterval(timerRef.current)
    const resumeAutoplay = () => {
        clearInterval(timerRef.current)
        if (total <= 1) return
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % total)
        }, autoPlayMs)
    }

    const handleTouchStart = (e) => {
        pauseAutoplay()
        touchStartX.current = e.touches[0].clientX
    }
    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX
    }
    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev()
        }
        resumeAutoplay()
    }

    if (total === 0) return null

    return (
        <div
            className="relative w-full overflow-hidden rounded-3xl shadow-premium-lg group"
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Slides track */}
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide, idx) => (
                    <Link
                        key={idx}
                        href={slide.link || '#'}
                        className="relative w-full shrink-0 aspect-[9/12] sm:aspect-[21/8] bg-slate-900"
                    >
                        <img
                            src={slide.image}
                            alt={slide.title || `Slide ${idx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                        {/* Gradient overlay for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                        {(slide.title || slide.subtitle) && (
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10">
                                {slide.badge && (
                                    <span className="inline-block bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-lg mb-3 shadow-lg">
                                        {slide.badge}
                                    </span>
                                )}
                                {slide.title && (
                                    <h3 className="text-white font-extrabold text-lg sm:text-2xl md:text-3xl drop-shadow-lg max-w-xl">
                                        {slide.title}
                                    </h3>
                                )}
                                {slide.subtitle && (
                                    <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-1.5 max-w-md">
                                        {slide.subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Prev / Next Arrows */}
            {total > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); resumeAutoplay() }}
                        aria-label="Sebelumnya"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); resumeAutoplay() }}
                        aria-label="Berikutnya"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots */}
            {total > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { goTo(idx); resumeAutoplay() }}
                            aria-label={`Ke slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}