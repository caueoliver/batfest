'use server'

import { supabase } from '@/lib/supabase'
import { gerarConvitePdf } from '@/lib/gerarConvite'
import { enviarConvitePorEmail } from '@/lib/email'

export async function confirmarPresenca(
  convidadoId: string,
  email: string,
  nomesAcompanhantes: string[]
) {
  const { data: convidado, error: erroConfirmacao } = await supabase
    .from('convidados')
    .update({ confirmado: true, email })
    .eq('id', convidadoId)
    .select()
    .single()

  if (erroConfirmacao || !convidado) {
    throw new Error('Não foi possível confirmar a presença.')
  }

  const convitesParaInserir = [
    { convidado_id: convidadoId, nome_convidado: null },
    ...nomesAcompanhantes.map((nome) => ({
      convidado_id: convidadoId,
      nome_convidado: nome,
    })),
  ]

  const { data: convites, error: erroConvites } = await supabase
    .from('convite')
    .insert(convitesParaInserir)
    .select()

  if (erroConvites || !convites) {
    throw new Error('Não foi possível gerar os convites.')
  }

  const pdfBuffer = await gerarConvitePdf(convidado, convites)

  await enviarConvitePorEmail(email, convidado.nome, pdfBuffer)
}