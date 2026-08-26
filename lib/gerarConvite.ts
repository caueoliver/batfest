import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

type Convidado = {
  id: string
  nome: string
}

type Convite = {
  id: string
  nome_convidado: string | null
}

export async function gerarConvitePdf(
  convidado: Convidado,
  convites: Convite[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // lê e embute o símbolo uma única vez (reaproveitado em todas as páginas)
  const logoPath = path.join(process.cwd(), 'public', 'simbolo.png')
  const logoBytes = await readFile(logoPath)
  const logoImage = await pdfDoc.embedPng(logoBytes)
  const logoProporcao = logoImage.height / logoImage.width

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

    // símbolo centralizado no topo
    const logoLargura = 128
    const logoAltura = logoLargura * logoProporcao
    page.drawImage(logoImage, {
      x: (width - logoLargura) / 2,
      y: height - 40 - logoAltura,
      width: logoLargura,
      height: logoAltura,
    })

    page.drawText('CONVITE', {
      x: 40,
      y: height - 40 - logoAltura - 24,
      size: 11,
      font: fontBold,
      color: rgb(0.79, 0.64, 0.15),
    })

    page.drawText(nomeExibido, {
      x: 40,
      y: height - 40 - logoAltura - 52,
      size: 16,
      font: fontBold,
      color: rgb(0.93, 0.93, 0.95),
    })

    const qrSize = 180
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: 70,
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
  return pdfBytes
}