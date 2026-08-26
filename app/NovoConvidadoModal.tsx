'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarConvidado } from './actions-admin'

export function NovoConvidadoModal({ onFechar }: { onFechar: () => void }) {
  const [nome, setNome] = useState('')
  const [limite, setLimite] = useState(0)
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function salvar() {
    if (!nome.trim()) {
      setErro('Informe o nome do convidado.')
      return
    }
    setErro('')

    startTransition(async () => {
      try {
        await criarConvidado(nome.trim(), limite)
        router.refresh()
        onFechar()
      } catch {
        setErro('Não foi possível cadastrar. Tente de novo.')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm border border-white/10 bg-black p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          NOVO CONVIDADO
        </p>

        <div className="mt-6">
          <label
            className="text-[11px] tracking-[0.2em] text-[#8B8F9C]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            NOME
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && salvar()}
            placeholder="Nome completo"
            autoFocus
            className="mt-2 w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] placeholder:text-[#8B8F9C]/50 focus-visible:border-[#C9A227] focus-visible:outline-none"
          />
        </div>

        <div className="mt-6">
          <label
            className="text-[11px] tracking-[0.2em] text-[#8B8F9C]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            LIMITE DE ACOMPANHANTES
          </label>
          <input
            type="number"
            min={0}
            value={limite}
            onChange={(e) => setLimite(Math.max(0, Number(e.target.value)))}
            className="mt-2 w-full border-b border-white/15 bg-transparent px-1 py-2 text-sm text-[#EDEEF2] focus-visible:border-[#C9A227] focus-visible:outline-none"
          />
        </div>

        {erro && <p className="mt-4 text-xs text-[#D85A30]">{erro}</p>}

        <div className="mt-8 flex justify-end gap-6">
          <button
            type="button"
            onClick={onFechar}
            className="text-xs uppercase tracking-[0.2em] text-[#8B8F9C] hover:text-[#EDEEF2]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={isPending}
            className="text-xs uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 hover:text-[#E8C766] disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {isPending ? 'Salvando…' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}