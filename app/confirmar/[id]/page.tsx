import { supabase } from '@/lib/supabase'

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
    return <p>Convidado não encontrado.</p>
  }

  return (
    <div>
      <h1>Olá, {convidado.nome}!</h1>
      <p>ID: {convidado.id}</p>
      <p>Confirmado: {convidado.confirmado ? 'Sim' : 'Não'}</p>
      <p>Limite de acompanhantes: {convidado.limite_acompanhantes}</p>
    </div>
  )
}