import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { gerarConvitePdf } from '@/lib/gerarConvite'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: convidado, error: erroConvidado } = await supabase
    .from('convidados')
    .select('*')
    .eq('id', id)
    .single()

  if (erroConvidado || !convidado) {
    return NextResponse.json(
      { error: 'Convidado não encontrado' },
      { status: 404 }
    )
  }

  const { data: convites, error: erroConvites } = await supabase
    .from('convite')
    .select('*')
    .eq('convidado_id', id)

  if (erroConvites || !convites || convites.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum convite encontrado para esse convidado' },
      { status: 404 }
    )
  }

  const pdfBuffer = await gerarConvitePdf(convidado, convites)
  const nomeArquivo = convidado.nome.replace(/\s+/g, '-').toLowerCase()

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="convite-${nomeArquivo}.pdf"`,
    },
  })
}