import { supabase } from '@/lib/supabase'
import { ConfirmacaoForm } from './ConfirmacaoForm'

export default async function ConfirmarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: convidado, error } = await supabase
    .from('convidados')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !convidado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06070a] px-6 text-center">
        <p
          className="text-sm tracking-wide text-[#8B8F9C]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          CONVITE NÃO ENCONTRADO NOS ARQUIVOS DE GOTHAM.
        </p>
      </main>
    )
  }

  return <ConfirmacaoForm convidado={convidado} />
}