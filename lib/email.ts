import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarConvitePorEmail(
  destinatario: string,
  nomeConvidado: string,
  pdfBuffer: Buffer,
  tentativas = 3
) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    const { error } = await resend.emails.send({
      from: 'Convites <onboarding@resend.dev>', // troque pelo seu domínio verificado em produção
      to: destinatario,
      subject: 'Seu convite chegou 🦇',
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #06070a; color: #EDEEF2;">
          <p style="font-size: 12px; letter-spacing: 3px; color: #8B8F9C;">PRESENÇA CONFIRMADA</p>
          <h2 style="color: #C9A227;">Olá, ${nomeConvidado}</h2>
          <p>Seu convite e QR code de entrada estão em anexo neste e-mail.</p>
          <p style="font-size: 12px; color: #8B8F9C;">Apresente o QR code na entrada.</p>
        </div>
      `,
      attachments: [
        {
          filename: `convite-${nomeConvidado.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    })

    if (!error) return // sucesso, encerra a função

    console.error(`Tentativa ${tentativa} falhou:`, error)

    const ultimaTentativa = tentativa === tentativas
    if (ultimaTentativa) {
      throw new Error('Não foi possível enviar o e-mail com os convites.')
    }

    // espera um pouco antes de tentar de novo (500ms, 1s, 1.5s...)
    await new Promise((resolve) => setTimeout(resolve, 500 * tentativa))
  }
}