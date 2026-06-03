import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(request, { params }) {
  const { id } = params
  await supabaseAdmin.from('product_images').delete().eq('product_id', id)
  await supabaseAdmin.from('product_variants').delete().eq('product_id', id)
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
