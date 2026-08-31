'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ProductFilters({ categories, categorySlug, sortBy, inStock, searchParams }) {
    const [isOpen, setIsOpen] = useState(false)

    const activeCount =
        (categorySlug ? 1 : 0) + (sortBy && sortBy !== 'latest' ? 1 : 0) + (inStock ? 1 : 0)

    return (
        <aside className="w-full lg:w-64 shrink-0">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden w-full flex items-center justify-between bg-white border border-slate-200/60 rounded-2xl px-5 py-3.5 shadow-sm mb-3 font-bold text-sm text-slate-800"
            >
                <span className="flex items-center gap-2">
                    <span>🔍</span> Filter & Urutkan
                    {activeCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{activeCount}</span>
                    )}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Filter Panel */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 lg:sticky lg:top-24 space-y-6 shadow-sm">

                    {/* Category Filter */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <span>📂</span> Kategori Produk
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                            <Link
                                href={{ pathname: '/produk', query: { ...searchParams, category: '' } }}
                                className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${!categorySlug ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                            >
                                Semua Kategori
                            </Link>
                            {categories?.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={{ pathname: '/produk', query: { ...searchParams, category: cat.slug } }}
                                    className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${categorySlug === cat.slug ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="border-t border-slate-100 pt-5">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <span>🔃</span> Urutkan Harga
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                            {[
                                { label: 'Terbaru', value: 'latest' },
                                { label: 'Harga Terendah', value: 'price-asc' },
                                { label: 'Harga Tertinggi', value: 'price-desc' }
                            ].map((opt) => (
                                <Link
                                    key={opt.value}
                                    href={{ pathname: '/produk', query: { ...searchParams, sort: opt.value } }}
                                    className={`text-xs px-3.5 py-2.5 rounded-xl transition font-medium w-full text-left ${sortBy === opt.value ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    {opt.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Stock Filter */}
                    <div className="border-t border-slate-100 pt-5">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <span>📦</span> Ketersediaan
                        </h3>
                        <div>
                            <Link
                                href={{ pathname: '/produk', query: { ...searchParams, in_stock: inStock ? 'false' : 'true' } }}
                                className={`flex items-center gap-2.5 text-xs p-2.5 border rounded-xl transition font-medium ${inStock ? 'bg-blue-50 text-blue-600 border-blue-100 font-bold' : 'text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                            >
                                <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${inStock ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350 bg-white'}`}>
                                    {inStock && '✓'}
                                </span>
                                Hanya Ready Stock
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}