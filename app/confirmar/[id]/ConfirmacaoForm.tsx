'use client'

import { useState, useTransition } from 'react'
import { confirmarPresenca } from './actions' 

type Convidado = {
  id: string
  nome: string
  email: string | null
  confirmado: boolean
  limite_acompanhantes: number
}

export function ConfirmacaoForm({ convidado }: { convidado: Convidado }) {
  const [email, setEmail] = useState(convidado.email ?? '')
  const [erroEmail, setErroEmail] = useState('')
  const [quantidade, setQuantidade] = useState(0)
  const [nomes, setNomes] = useState<string[]>([])
  const [enviado, setEnviado] = useState(convidado.confirmado)
  const [isPending, startTransition] = useTransition()

  function ajustarQuantidade(delta: number) {
    const nova = Math.min(
      Math.max(quantidade + delta, 0),
      convidado.limite_acompanhantes
    )
    setQuantidade(nova)
    setNomes((atual) => {
      const copia = atual.slice(0, nova)
      while (copia.length < nova) copia.push('')
      return copia
    })
  }

  function atualizarNome(index: number, valor: string) {
    setNomes((atual) => {
      const copia = [...atual]
      copia[index] = valor
      return copia
    })
  }

  function confirmar() {
    if (!email.trim() || !email.includes('@')) {
      setErroEmail('Informe um e-mail válido para receber os convites.')
      return
    }
    setErroEmail('')

    startTransition(async () => {
      await confirmarPresenca(convidado.id, email.trim(), nomes.filter(Boolean))
      setEnviado(true)
    })
  }

  const primeiroNome = convidado.nome.split(' ')[0]

  if (enviado) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
        <Spotlight />
        <div className="relative z-10 flex w-full max-w-xs flex-col items-center">

          <p
            className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            PRESENÇA REGISTRADA
          </p>
          <h1
            className="mt-4 text-xl uppercase tracking-wide text-[#EDEEF2]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Obrigado pela confirmação, {primeiroNome}
          </h1>
          <div className="my-6 h-px w-10 bg-[#8B8F9C]/40" />
          <p className="text-sm leading-relaxed text-[#8B8F9C]">
            Seus convites com QR code foram enviados para
            <br />
            {convidado.email ?? email}
          </p>
          <a
            href={`/api/convite-pdf/${convidado.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 text-sm uppercase tracking-[0.15em] text-[#C9A227] underline underline-offset-4 transition hover:text-[#E8C766]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Baixar convites em PDF
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-black px-6 py-16">
      <Spotlight />
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center text-center">
        <img src="/simbolo.png" alt="simbolo" />
        

        <div className="my-6 h-px w-10 bg-[#8B8F9C]/40" />

    

        <h1
          className="mt-10 text-2xl uppercase tracking-wide text-[#EDEEF2]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Olá, {primeiroNome}
        </h1>
        <br />
        <p
          className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          VOCÊ FOI CONVIDADO(A) PARA OS 50 ANOS DO BATMAN
        </p>

        <div className="mt-8 w-full text-left">
          <label
            className="text-[11px] tracking-[0.2em] text-[#8B8F9C]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            SEU E-MAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mt-2 w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none"
          />
          {erroEmail && (
            <p className="mt-1 text-xs text-[#D85A30]">{erroEmail}</p>
          )}

          {convidado.limite_acompanhantes > 0 && (
            <div className="mt-8">
              <p
                className="text-[11px] tracking-[0.2em] text-[#8B8F9C]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ACOMPANHANTES {convidado.limite_acompanhantes}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => ajustarQuantidade(-1)}
                  aria-label="Diminuir acompanhantes"
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#EDEEF2] transition hover:border-[#C9A227] hover:text-[#C9A227] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227]"
                >
                  −
                </button>
                <span
                  className="w-6 text-center text-lg text-[#EDEEF2]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => ajustarQuantidade(1)}
                  aria-label="Aumentar acompanhantes"
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#EDEEF2] transition hover:border-[#C9A227] hover:text-[#C9A227] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227]"
                >
                  +
                </button>
              </div>

              {nomes.length > 0 && (
                <div className="mt-4 space-y-3">
                  {nomes.map((nome, i) => (
                    <input
                      key={i}
                      value={nome}
                      onChange={(e) => atualizarNome(i, e.target.value)}
                      placeholder={`Nome do aliado ${i + 1}`}
                      className="w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={confirmar}
          disabled={isPending}
          className="mt-10 text-sm uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 transition hover:text-[#E8C766] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {isPending ? 'Confirmando…' : 'Confirmar presença'}
        </button>
      </div>
    </main>
  )
}

function Spotlight() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full motion-safe:animate-pulse"
      style={{
        background:
          'radial-gradient(closest-side, rgba(184,188,196,0.10), transparent)',
      }}
    />
  )
}
