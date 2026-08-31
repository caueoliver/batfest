'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { excluirConvidado } from './actions-admin'

type Props = {
  convidadoId: string
  nomeConvidado: string
  onFechar: () => void
}

export function ConfirmarExclusaoModal({ convidadoId, nomeConvidado, onFechar }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function confirmar() {
    startTransition(async () => {
      await excluirConvidado(convidadoId)
      router.refresh()
      onFechar()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm border border-white/10 bg-black p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-[11px] tracking-[0.35em] text-[#D85A30]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          EXCLUIR CONVIDADO
        </p>

        <p className="mt-4 text-sm text-[#EDEEF2]">
          Quer mesmo excluir <span className="font-bold">{nomeConvidado}</span> da lista?
        </p>
        <p className="mt-2 text-xs text-[#8B8F9C]">
          Essa ação não pode ser desfeita — o histórico de convites e check-ins também será apagado.
        </p>

        <div className="mt-8 flex justify-center gap-6">
          <button
            type="button"
            onClick={onFechar}
            disabled={isPending}
            className="text-xs uppercase tracking-[0.2em] text-[#8B8F9C] hover:text-[#EDEEF2]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={isPending}
            className="text-xs uppercase tracking-[0.2em] text-[#D85A30] underline underline-offset-4 hover:text-red-400 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {isPending ? 'Excluindo…' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}