'use client'

import { useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { validarConvite } from '../actions-admin'

type Resultado =
  | { status: 'valido'; nome: string }
  | { status: 'ja_usado'; nome: string }
  | { status: 'invalido' }

export function Scanner() {
  const [ativo, setAtivo] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processandoRef = useRef(false)

  async function iniciar() {
    setAtivo(true)
    const scanner = new Html5Qrcode('leitor-qr')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (textoLido) => {
          if (processandoRef.current) return
          processandoRef.current = true
          setProcessando(true)

          try {
            const resposta = await validarConvite(textoLido)
            setResultado(resposta)
          } catch {
            setResultado({ status: 'invalido' })
          }

          setProcessando(false)
        },
        () => {} // erro de decodificação por frame — ignorado, acontece o tempo todo sem QR no quadro
      )
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
      setAtivo(false)
    }
  }

  async function parar() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current.clear()
    }
    setAtivo(false)
    setResultado(null)
  }

  function fecharPopup() {
    setResultado(null)
    processandoRef.current = false
  }

  return (
    <div className="flex flex-col items-center">
      <div id="leitor-qr" className="w-full overflow-hidden" />

      {!ativo && (
        <button
          type="button"
          onClick={iniciar}
          className="mt-4 text-sm uppercase tracking-[0.2em] text-[#C9A227] underline underline-offset-4 hover:text-[#E8C766]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Iniciar leitura
        </button>
      )}

      {ativo && (
        <>
          <div
            className="mt-6 w-full border border-white/10 p-4 text-center text-sm text-[#8B8F9C]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {processando ? 'Verificando…' : 'Aponte a câmera para o QR code'}
          </div>
          <button
            type="button"
            onClick={parar}
            className="mt-4 text-xs uppercase tracking-[0.2em] text-[#8B8F9C] underline underline-offset-4 hover:text-[#EDEEF2]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Parar câmera
          </button>
        </>
      )}

      {resultado && (
        <ResultadoPopup resultado={resultado} onFechar={fecharPopup} />
      )}
    </div>
  )
}

function ResultadoPopup({
  resultado,
  onFechar,
}: {
  resultado: Resultado
  onFechar: () => void
}) {
  const estilos = {
    valido: 'border-green-500 text-green-400',
    ja_usado: 'border-yellow-500 text-yellow-400',
    invalido: 'border-red-500 text-red-400',
  }

  const mensagens = {
    valido: resultado.status === 'valido' ? `✓ Entrada liberada` : '',
    ja_usado: resultado.status === 'ja_usado' ? `⚠ Já utilizado` : '',
    invalido: '✕ QR code inválido',
  }

  const nome = 'nome' in resultado ? resultado.nome : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
      <div
        className={`w-full max-w-xs border-2 bg-black p-8 text-center ${estilos[resultado.status]}`}
      >
        <p
          className="text-lg uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {mensagens[resultado.status]}
        </p>
        {nome && (
          <p className="mt-2 text-sm text-[#EDEEF2]">{nome}</p>
        )}

        <button
          type="button"
          onClick={onFechar}
          className={`mt-8 w-full border py-2 text-sm uppercase tracking-[0.2em] transition hover:bg-white/5 ${estilos[resultado.status]}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          OK
        </button>
      </div>
    </div>
  )
}