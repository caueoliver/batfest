'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sairAdmin } from './actions-admin'

type ConvidadoComContagem = {
  id: string
  nome: string
  email: string | null
  confirmado: boolean
  limite_acompanhantes: number
  acompanhantesConfirmados: number
}

type Props = {
  convidados: ConvidadoComContagem[]
  totalConvidados: number
  totalConfirmados: number
  totalAcompanhantes: number
}

export function AdminDashboard({
  convidados,
  totalConvidados,
  totalConfirmados,
  totalAcompanhantes,
}: Props) {
  const [busca, setBusca] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const convidadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return convidados
    return convidados.filter((c) => c.nome.toLowerCase().includes(termo))
  }, [busca, convidados])

  function sair() {
    startTransition(async () => {
      await sairAdmin()
      router.refresh()
    })
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1
            className="text-xl uppercase tracking-wide text-[#EDEEF2]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Painel administrativo
          </h1>
          <button
            type="button"
            onClick={sair}
            disabled={isPending}
            className="text-xs uppercase tracking-[0.2em] text-[#8B8F9C] underline underline-offset-4 hover:text-[#C9A227]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Sair
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card titulo="Convidados" valor={totalConvidados} />
          <Card titulo="Confirmados" valor={totalConfirmados} />
          <Card titulo="Acompanhantes extras" valor={totalAcompanhantes} />
        </div>

        <div className="mt-10">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none"
          />
        </div>

        <div className="mt-6 divide-y divide-white/10 border-t border-white/10">
          {convidadosFiltrados.length === 0 && (
            <p className="py-6 text-sm text-[#8B8F9C]">Nenhum convidado encontrado.</p>
          )}
          {convidadosFiltrados.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm text-[#EDEEF2]">{c.nome}</p>
                <p className="text-xs text-[#8B8F9C]">{c.email ?? 'sem e-mail'}</p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs uppercase tracking-wide ${
                    c.confirmado ? 'text-[#C9A227]' : 'text-[#8B8F9C]'
                  }`}
                >
                  {c.confirmado ? 'Confirmado' : 'Pendente'}
                </span>
                <p className="text-xs text-[#8B8F9C]">
                  {c.acompanhantesConfirmados}/{c.limite_acompanhantes} acompanhantes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="border border-white/10 p-4">
      <p
        className="text-[11px] tracking-[0.2em] text-[#8B8F9C]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {titulo.toUpperCase()}
      </p>
      <p
        className="mt-2 text-2xl text-[#EDEEF2]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {valor}
      </p>
    </div>
  )
}