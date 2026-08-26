import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib'
import fs from 'node:fs/promises'
import path from 'node:path'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const LINK_Y_FRACTION = 0.150 
const LINK_MAX_WIDTH_FRACTION = 0.8

function adicionarLinkClicavel(
  page: any,
  rect: [number, number, number, number],
  url: string
) {
  const doc = page.doc
  const anotacao = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: rect,
    Border: [0, 0, 0], 
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(url),
    },
  })
  const ref = doc.context.register(anotacao)
  const existentes = page.node.Annots()
  if (existentes) {
    existentes.push(ref)
  } else {
    page.node.set(PDFName.of('Annots'), doc.context.obj([ref]))
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: convidado, error } = await supabase
    .from('convidados')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !convidado) {
    return NextResponse.json(
      { error: 'Convidado não encontrado' },
      { status: 404 }
    )
  }

  const link = `${request.nextUrl.origin}/confirmar/${id}`
  const textoBotao = "CONFIRME SUA PRESENÇA AQUI" 

  const caminhoImagem = path.join(process.cwd(), 'public', 'convite-base.jpeg')
  const imagemBytes = await fs.readFile(caminhoImagem)

  const pdfDoc = await PDFDocument.create()
  const imagem = await pdfDoc.embedJpg(imagemBytes)
  
  
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold) 

  const { width, height } = imagem.size()
  const page = pdfDoc.addPage([width, height])

  page.drawImage(imagem, { x: 0, y: 0, width, height })

  let tamanhoFonte = 40 
const larguraMaxima = width * LINK_MAX_WIDTH_FRACTION

while (
  font.widthOfTextAtSize(textoBotao, tamanhoFonte) > larguraMaxima &&
  tamanhoFonte > 6
) {
  tamanhoFonte -= 1
}

const larguraTexto = font.widthOfTextAtSize(textoBotao, tamanhoFonte)

const x = (width - larguraTexto) / 2
const y = height * LINK_Y_FRACTION

const paddingX = 50
const paddingY = 45

const corCinzaSuave = rgb(0.7, 0.7, 0.7)


page.drawText(textoBotao, {
  x: x,
  y: y,
  size: tamanhoFonte,
  font: font,
  color: corCinzaSuave,
})

const espessuraLinha = tamanhoFonte * 0.05 
const distanciaAbaixoTexto = tamanhoFonte * 0.15

page.drawLine({
  start: { x: x, y: y - distanciaAbaixoTexto },
  end: { x: x + larguraTexto, y: y - distanciaAbaixoTexto },
  thickness: espessuraLinha,
  color: corCinzaSuave,
})

adicionarLinkClicavel(
  page,
  [
    x - paddingX,
    y - paddingY - distanciaAbaixoTexto,
    x + larguraTexto + paddingX,
    y + tamanhoFonte + paddingY,
  ],
  link
)

  const pdfBytes = await pdfDoc.save()
  const nomeArquivo = convidado.nome.replace(/\s+/g, '-').toLowerCase()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="convite-${nomeArquivo}.pdf"`,
    },
  })
}