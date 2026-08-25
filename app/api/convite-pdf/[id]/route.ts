import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'

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

  const pdfDoc = await PDFDocument.create()
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (const convite of convites) {
    const nomeExibido = convite.nome_convidado ?? convidado.nome

    const qrDataUrl = await QRCode.toDataURL(convite.id, {
      margin: 1,
      width: 400,
      color: { dark: '#06070a', light: '#ffffff' },
    })
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
    const qrImage = await pdfDoc.embedPng(qrImageBytes)

    const page = pdfDoc.addPage([300, 420])
    const { width, height } = page.getSize()

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.02, 0.03, 0.04),
    })

    page.drawText('CONVITE', {
      x: 40,
      y: height - 50,
      size: 11,
      font: fontBold,
      color: rgb(0.79, 0.64, 0.15),
    })

    page.drawText(nomeExibido, {
      x: 40,
      y: height - 78,
      size: 16,
      font: fontBold,
      color: rgb(0.93, 0.93, 0.95),
    })

    const qrSize = 220
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: height - 330,
      width: qrSize,
      height: qrSize,
    })

    page.drawText('APRESENTE ESTE QR CODE NA ENTRADA', {
      x: 40,
      y: 40,
      size: 8,
      font: fontRegular,
      color: rgb(0.55, 0.56, 0.61),
    })
  }

  const pdfBytes = await pdfDoc.save()
  const nomeArquivo = convidado.nome.replace(/\s+/g, '-').toLowerCase()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="convite-${nomeArquivo}.pdf"`,
    },
  })
}