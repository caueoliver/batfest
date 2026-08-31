'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sairAdmin, gerarConvite } from './actions-admin'
import { NovoConvidadoModal } from './NovoConvidadoModal'
import { ConfirmarExclusaoModal } from './ConfirmarExclusaoModal'

type ConvidadoComContagem = {
  id: string
  nome: string
  email: string | null
  confirmado: boolean
  convidado: boolean
  limite_acompanhantes: number
  acompanhantesConfirmados: number
  checkinsRealizados: number
}

type Props = {
  convidados: ConvidadoComContagem[]
  totalConvidados: number
  totalJaConvidados: number
  totalConfirmados: number
  totalAcompanhantes: number
  totalCheckins: number
  totalCapacidadeAcompanhantes: number
}

const ITENS_POR_PAGINA = 10

export function AdminDashboard({
  convidados,
  totalConvidados,
  totalConfirmados,
  totalJaConvidados,
  totalAcompanhantes,
  totalCheckins,
  totalCapacidadeAcompanhantes,
}: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroConvidado, setFiltroConvidado] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [filtroConfirmado, setFiltroConfirmado] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [filtroCheckin, setFiltroCheckin] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null)
  const router = useRouter()
  const [excluindo, setExcluindo] = useState<{ id: string; nome: string } | null>(null)

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

      const bateCheckin =
        filtroCheckin === 'todos' ||
        (filtroCheckin === 'sim' && c.checkinsRealizados > 0) ||
        (filtroCheckin === 'nao' && c.checkinsRealizados === 0)

      return bateNome && bateConvidado && bateConfirmado && bateCheckin
    })
  }, [busca, filtroConvidado, filtroConfirmado, filtroCheckin, convidados])

  const capacidadeAjustada = useMemo(() => {
  return convidados.reduce((soma, c) => {
    const acompanhantesEsperados = c.confirmado
      ? c.acompanhantesConfirmados 
      : c.limite_acompanhantes 
    return soma + acompanhantesEsperados
  }, 0)
  }, [convidados])

  const totalPaginas = Math.max(1, Math.ceil(convidadosFiltrados.length / ITENS_POR_PAGINA))

  const convidadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    return convidadosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)
  }, [convidadosFiltrados, paginaAtual])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca, filtroConvidado, filtroConfirmado, filtroCheckin])

  function sair() {
    startTransition(async () => {
      await sairAdmin()
      router.refresh()
    })
  }

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

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <CardDetalhavel
            titulo="Pessoas na lista"
            valorTotal={totalConvidados + capacidadeAjustada}
            detalhes={[
              { label: 'Convidados (titulares)', valor: totalConvidados },
              { label: 'Acompanhantes em aberto', valor: capacidadeAjustada - totalAcompanhantes },
            ]}
          />
          <Card titulo="Receberam convite" valor={totalJaConvidados}/>
          <CardDetalhavel
            titulo="Total confirmado"
            valorTotal={totalConfirmados + totalAcompanhantes}
            cor="amarelo"
            detalhes={[
              { label: 'Titulares confirmados', valor: totalConfirmados },
              { label: 'Acompanhantes confirmados', valor: totalAcompanhantes },
            ]}
          />
          <Card titulo="Check-ins realizados" valor={totalCheckins} cor="verde" />
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
            <FiltroSelect
              label="Check-in"
              valor={filtroCheckin}
              aoMudar={setFiltroCheckin}
            />
          </div>
        </div>

        <div className="mt-6 divide-y divide-white/10 border-t border-white/10">
          {convidadosFiltrados.length === 0 && (
            <p className="py-6 text-sm text-[#8B8F9C]">Nenhum convidado encontrado.</p>
          )}
          {convidadosPaginados.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#EDEEF2]">{c.nome}</p>
                <p className="truncate text-xs text-[#8B8F9C]">{c.email ?? 'sem e-mail'}</p>
                <p className="mt-1 text-xs text-[#8B8F9C]">
                  {c.convidado ? 'Convite enviado' : 'Convite não enviado'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
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
                  <button
                    type="button"
                    onClick={() => setExcluindo({ id: c.id, nome: c.nome })}
                    aria-label={`Excluir ${c.nome}`}
                    className="text-[#8B8F9C] hover:text-[#D85A30]"
                  >
                    🗑
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

        {convidadosFiltrados.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="text-xs uppercase tracking-[0.2em] text-[#8B8F9C] underline underline-offset-4 hover:text-[#C9A227] disabled:opacity-30 disabled:no-underline"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ← Anterior
            </button>

            <p className="text-xs text-[#8B8F9C]" style={{ fontFamily: 'var(--font-mono)' }}>
              Página {paginaAtual} de {totalPaginas}
            </p>

            <button
              type="button"
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="text-xs uppercase tracking-[0.2em] text-[#8B8F9C] underline underline-offset-4 hover:text-[#C9A227] disabled:opacity-30 disabled:no-underline"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {modalAberto && <NovoConvidadoModal onFechar={() => setModalAberto(false)} />}

      {excluindo && (
        <ConfirmarExclusaoModal
          convidadoId={excluindo.id}
          nomeConvidado={excluindo.nome}
          onFechar={() => setExcluindo(null)}
        />
      )}
    </main>
  )
}

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string
  valor: number
  cor?: 'amarelo' | 'verde'
}) {
  const corClasse =
    cor === 'amarelo' ? 'text-yellow-400' : cor === 'verde' ? 'text-green-400' : 'text-[#EDEEF2]'

  return (
    <div className="border border-white/10 p-4">
      <p
        className="text-[11px] text-[#8B8F9C]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {titulo.toUpperCase()}
      </p>
      <p className={`mt-2 text-2xl ${corClasse}`} style={{ fontFamily: 'var(--font-display)' }}>
        {valor}
      </p>
    </div>
  )
}

function CardDetalhavel({
  titulo,
  valorTotal,
  cor,
  detalhes,
}: {
  titulo: string
  valorTotal: number
  cor?: 'amarelo' | 'verde'
  detalhes: { label: string; valor: number }[]
}) {
  const [aberto, setAberto] = useState(false)
  const corClasse =
    cor === 'amarelo' ? 'text-yellow-400' : cor === 'verde' ? 'text-green-400' : 'text-[#EDEEF2]'

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="border border-white/10 p-4 text-left transition hover:border-[#C9A227]/40"
      >
        <p
          className="text-[11px] text-[#8B8F9C]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {titulo.toUpperCase()}
        </p>
        <p className={`mt-2 text-2xl ${corClasse}`} style={{ fontFamily: 'var(--font-display)' }}>
          {valorTotal}
        </p>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-xs border border-white/10 bg-black p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {titulo.toUpperCase()}
            </p>
            <p className={`mt-2 text-3xl ${corClasse}`} style={{ fontFamily: 'var(--font-display)' }}>
              {valorTotal}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
              {detalhes.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-sm">
                  <span className="text-[#8B8F9C]">{d.label}</span>
                  <span className="text-[#EDEEF2]">{d.valor}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="mt-6 w-full text-xs uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 hover:text-[#E8C766]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
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