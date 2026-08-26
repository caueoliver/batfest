'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { autenticarAdmin } from './actions-admin'

export function PasswordGate() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function entrar() {
    startTransition(async () => {
      const { sucesso } = await autenticarAdmin(senha)
      if (!sucesso) {
        setErro('Senha incorreta.')
        return
      }
      setErro('')
      router.refresh()
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-xs text-center">
        <p
          className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          ÁREA RESTRITA
        </p>
        <h1
          className="mt-4 text-xl uppercase tracking-wide text-[#EDEEF2]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Painel administrativo
        </h1>

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
          placeholder="Senha"
          autoFocus
          className="mt-8 w-full border-b border-white/15 bg-transparent px-1 py-2 text-center text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none"
        />
        {erro && <p className="mt-2 text-xs text-[#D85A30]">{erro}</p>}

        <button
          type="button"
          onClick={entrar}
          disabled={isPending}
          className="mt-8 text-sm uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 transition hover:text-[#E8C766] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </main>
  )
}