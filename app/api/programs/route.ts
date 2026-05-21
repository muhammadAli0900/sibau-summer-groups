import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: programs } = await supabase
    .from('programs')
    .select('id, code, name, color')
    .order('name')
  return NextResponse.json({ programs: programs ?? [] })
}
