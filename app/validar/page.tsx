import { estaAutenticado } from '../actions-admin'
import { PasswordGate } from '../PasswordGate'
import { Scanner } from './Scanner'

export default async function ValidarPage() {
  const autenticado = await estaAutenticado()

  if (!autenticado) {
    return <PasswordGate />
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-black px-6 py-12">
      <p
        className="text-[11px] tracking-[0.35em] text-[#8B8F9C]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        ENTRADA
      </p>
      <h1
        className="mt-2 text-xl uppercase tracking-wide text-[#EDEEF2]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Validar convite
      </h1>

      <div className="mt-10 w-full max-w-sm">
        <Scanner />
      </div>
    </main>
  )
}