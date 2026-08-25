'use server'

import { supabase } from '@/lib/supabase'

export async function confirmarPresenca(
  convidadoId: string,
  email: string,
  nomesAcompanhantes: string[]
) {
  const { error: erroConfirmacao } = await supabase
    .from('convidados')
    .update({ confirmado: true, email })
    .eq('id', convidadoId)

  if (erroConfirmacao) {
    throw new Error('Não foi possível confirmar a presença.')
  }

  const convites = [
    { convidado_id: convidadoId, nome_convidado: null },
    ...nomesAcompanhantes.map((nome) => ({
      convidado_id: convidadoId,
      nome_convidado: nome,
    })),
  ]

  const { error: erroConvites } = await supabase
    .from('convite')
    .insert(convites)

  if (erroConvites) {
    throw new Error('Não foi possível gerar os convites.')
  }
}