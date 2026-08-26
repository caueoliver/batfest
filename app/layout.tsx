import type { Metadata } from 'next'
import { Oswald, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const oswald = Oswald({ subsets: ['latin'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: 'Confirmação de presença',
  description: 'Confirme sua presença nos 50 anos do Batman 🦇',
  openGraph: {
    title: 'Você foi convidado(a)',
    description: 'Confirme sua presença e receba seu convite com QR code',
    images: ['/simbolo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${inter.variable} ${mono.variable}`}
    >
      <body
        className="bg-[#06070a] antialiased"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {children}
      </body>
    </html>
  )
}