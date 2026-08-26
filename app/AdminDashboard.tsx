'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sairAdmin, gerarConvite } from './actions-admin'
import { NovoConvidadoModal } from './NovoConvidadoModal'


type ConvidadoComContagem = {
  id: string
  nome: string
  email: string | null
  confirmado: boolean
  convidado: boolean
  limite_acompanhantes: number
  acompanhantesConfirmados: number
}

type Props = {
  convidados: ConvidadoComContagem[]
  totalConvidados: number
  totalJaConvidados: number
  totalConfirmados: number
  totalAcompanhantes: number
}

export function AdminDashboard({
  convidados,
  totalConvidados,
  totalConfirmados,
  totalJaConvidados,
  totalAcompanhantes,
}: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroConvidado, setFiltroConvidado] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [filtroConfirmado, setFiltroConfirmado] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const convidadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return convidados.filter((c) => {
      const bateNome = !termo || c.nome.toLowerCase().includes(termo)

      const bateConvidado =
        filtroConvidado === 'todos' ||
        (filtroConvidado === 'sim' && c.convidado) ||
        (filtroConvidado === 'nao' && !c.convidado)

      const bateConfirmado =
        filtroConfirmado === 'todos' ||
        (filtroConfirmado === 'sim' && c.confirmado) ||
        (filtroConfirmado === 'nao' && !c.confirmado)

      return bateNome && bateConvidado && bateConfirmado
    })
  }, [busca, filtroConvidado, filtroConfirmado, convidados])

  function sair() {
    startTransition(async () => {
      await sairAdmin()
      router.refresh()
    })
  }

  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null)

  function handleGerarConvite(convidadoId: string) {
    const link = `${window.location.origin}/confirmar/${convidadoId}`

    startTransition(async () => {
      await gerarConvite(convidadoId)
      await navigator.clipboard.writeText(link)
      setLinkCopiadoId(convidadoId)
      router.refresh()
      setTimeout(() => setLinkCopiadoId(null), 2000)
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
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="text-xs uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 hover:text-[#E8C766]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              + Novo convidado
            </button>
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
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card titulo="Convidados" valor={totalConvidados} />
          <Card titulo="Aguardando convite" valor={totalConvidados - totalJaConvidados} />
          <Card titulo="Confirmados" valor={totalConfirmados} />
          <Card titulo="Acompanhantes extras" valor={totalAcompanhantes} />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none sm:max-w-xs"
          />

          <div className="flex gap-4">
            <FiltroSelect
              label="Convite"
              valor={filtroConvidado}
              aoMudar={setFiltroConvidado}
            />
            <FiltroSelect
              label="Confirmação"
              valor={filtroConfirmado}
              aoMudar={setFiltroConfirmado}
            />
          </div>
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
                <p className="mt-1 text-xs text-[#8B8F9C]">
                  {c.convidado ? 'Convite enviado' : 'Convite não enviado'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span
                    className={`text-xs uppercase tracking-wide ${c.confirmado ? 'text-[#C9A227]' : 'text-[#8B8F9C]'
                      }`}
                  >
                    {c.confirmado ? 'Confirmado' : 'Pendente'}
                  </span>
                  <p className="text-xs text-[#8B8F9C]">
                    {c.acompanhantesConfirmados}/{c.limite_acompanhantes} acompanhantes
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleGerarConvite(c.id)}
                    disabled={isPending}
                    className="whitespace-nowrap text-xs uppercase tracking-[0.15em] text-[#C9A227] underline underline-offset-4 hover:text-[#E8C766] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {linkCopiadoId === c.id
                      ? 'Link copiado!'
                      : c.convidado
                        ? 'Copiar link'
                        : 'Gerar convite'}
                  </button>
                  {c.convidado && (
                    <a
                      href={`/api/convite-imagem/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-xs uppercase tracking-[0.15em] text-[#8B8F9C] underline underline-offset-4 hover:text-[#C9A227]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Baixar convite
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modalAberto && (
        <NovoConvidadoModal onFechar={() => setModalAberto(false)} />
      )}

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

function FiltroSelect({
  label,
  valor,
  aoMudar,
}: {
  label: string
  valor: 'todos' | 'sim' | 'nao'
  aoMudar: (v: 'todos' | 'sim' | 'nao') => void
}) {
  return (
    <div>
      <label
        className="block text-[10px] tracking-[0.2em] text-[#8B8F9C]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label.toUpperCase()}
      </label>
      <select
        value={valor}
        onChange={(e) => aoMudar(e.target.value as 'todos' | 'sim' | 'nao')}
        className="mt-1 border-b border-white/15 bg-transparent py-1 text-sm text-[#EDEEF2] focus-visible:border-[#C9A227] focus-visible:outline-none"
      >
        <option value="todos" className="bg-black">Todos</option>
        <option value="sim" className="bg-black">Sim</option>
        <option value="nao" className="bg-black">Não</option>
      </select>
    </div>
  )
}