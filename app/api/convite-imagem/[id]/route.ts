import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib'
import fs from 'node:fs/promises'
import path from 'node:path'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

// Ajustado para ficar centralizado verticalmente (50% da altura)
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
    Border: [0, 0, 0], // Mantém a borda da anotação invisível
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
  const textoBotao = "CONFIRME SUA PRESENÇA AQUI" // O texto que vai aparecer no PDF, em caixa alta

  const caminhoImagem = path.join(process.cwd(), 'public', 'convite-base.jpeg')
  const imagemBytes = await fs.readFile(caminhoImagem)

  const pdfDoc = await PDFDocument.create()
  const imagem = await pdfDoc.embedJpg(imagemBytes)
  
  // Alterado para CourierBold para combinar com a fonte monospace do convite
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold) 

  const { width, height } = imagem.size()
  const page = pdfDoc.addPage([width, height])

  page.drawImage(imagem, { x: 0, y: 0, width, height })

  let tamanhoFonte = 22 // Um pouco menor para ficar mais elegante
  const larguraMaxima = width * LINK_MAX_WIDTH_FRACTION
  
  // Calcula o tamanho baseado na frase, não na URL
  while (
    font.widthOfTextAtSize(textoBotao, tamanhoFonte) > larguraMaxima &&
    tamanhoFonte > 6
  ) {
    tamanhoFonte -= 1
  }

  const larguraTexto = font.widthOfTextAtSize(textoBotao, tamanhoFonte)
  
  // Posição centralizada no eixo X e Y (no meio)
  const x = (width - larguraTexto) / 2
  const y = height * LINK_Y_FRACTION

  // Espaçamento (padding) ajustado para não ficar exagerado
  const paddingX = 25
  const paddingY = 20

  // Cor cinza mais suave (0.7, 0.7, 0.7) para combinar com a estética
  const corCinzaSuave = rgb(0.7, 0.7, 0.7)

  

  // Desenha o texto do botão por cima, na cor cinza suave
  page.drawText(textoBotao, {
    x: x,
    y: y,
    size: tamanhoFonte,
    font: font,
    color: corCinzaSuave, // Texto cinza suave
  })

  // Adiciona o link clicável abrangendo o texto + o padding
  adicionarLinkClicavel(
    page,
    [
      x - paddingX, 
      y - paddingY, 
      x + larguraTexto + paddingX, 
      y + tamanhoFonte + paddingY
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