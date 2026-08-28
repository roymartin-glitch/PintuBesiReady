export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 mt-4 text-xs font-bold uppercase tracking-widest">Memuat Halaman...</p>
    </div>
  )
}
