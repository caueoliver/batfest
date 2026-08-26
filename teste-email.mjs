import { readFile } from 'node:fs/promises'

// gera um PDF de teste bem pequeno só pra isolar o problema
const pdfFalso = Buffer.from('%PDF-1.4 conteudo de teste').toString('base64')

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer re_NGKwgdrQ_3yXay2pKhZDNom3rruwZ9WSg',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'onboarding@resend.dev',
    to: 'caue.ooliver@gmail.com',
    subject: 'teste com anexo',
    html: '<p>teste</p>',
    attachments: [
      {
        filename: 'teste.pdf',
        content: pdfFalso, // string em base64
      },
    ],
  }),
})

console.log('status:', res.status)
console.log('resposta:', await res.text())