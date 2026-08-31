'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/admin', icon: '📊', label: 'Dashboard', exact: true },
    { href: '/admin/produk', icon: '🚪', label: 'Produk' },
    { href: '/admin/kategori', icon: '📂', label: 'Kategori' },
    { href: '/admin/pesanan', icon: '📋', label: 'Pesanan' },
    { href: '/admin/pengaturan', icon: '⚙️', label: 'Setting' },
]

export default function AdminBottomNav() {
    const pathname = usePathname()

    const isActive = (item) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href)

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/70 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-5">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-smooth ${active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-semibold ${active ? 'text-blue-400' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                            {active && <span className="w-1 h-1 rounded-full bg-blue-400"></span>}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}