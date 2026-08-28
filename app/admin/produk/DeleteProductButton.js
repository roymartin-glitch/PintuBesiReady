'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteProductButton({ productId }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline">
      Hapus
    </button>
  )
}
