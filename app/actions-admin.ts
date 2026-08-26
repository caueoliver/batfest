'use server'

import { cookies } from 'next/headers'
import { createHash } from 'node:crypto'
import { supabase } from '@/lib/supabase'

const SENHA_ADMIN = process.env.ADMIN_PASSWORD || 'batman2026'
const NOME_COOKIE = 'admin_session'

// gera um token derivado da senha em vez de guardar um valor fixo/adivinhável no cookie
function gerarToken() {
  return createHash('sha256').update(SENHA_ADMIN + 'batfest-salt').digest('hex')
}

export async function autenticarAdmin(senha: string) {
  if (senha !== SENHA_ADMIN) {
    return { sucesso: false }
  }

  const cookieStore = await cookies()
  cookieStore.set(NOME_COOKIE, gerarToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  })

  return { sucesso: true }
}

export async function sairAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(NOME_COOKIE)
}

export async function estaAutenticado() {
  const cookieStore = await cookies()
  return cookieStore.get(NOME_COOKIE)?.value === gerarToken()
}

export async function buscarDadosAdmin() {
  const { data: convidados, error: erroConvidados } = await supabase
    .from('convidados')
    .select('*')
    .order('nome')

  if (erroConvidados || !convidados) {
    throw new Error('Não foi possível carregar os convidados.')
  }

  const { data: convites, error: erroConvites } = await supabase
    .from('convite')
    .select('*')

  if (erroConvites || !convites) {
    throw new Error('Não foi possível carregar os convites.')
  }

  const acompanhantesPorConvidado = new Map<string, number>()
  for (const convite of convites) {
    if (convite.nome_convidado) {
      acompanhantesPorConvidado.set(
        convite.convidado_id,
        (acompanhantesPorConvidado.get(convite.convidado_id) ?? 0) + 1
      )
    }
  }

  const convidadosComContagem = convidados.map((c) => ({
    ...c,
    acompanhantesConfirmados: acompanhantesPorConvidado.get(c.id) ?? 0,
  }))

  return {
    convidados: convidadosComContagem,
    totalConvidados: convidados.length,
    totalJaConvidados: convidados.filter((c) => c.convidado).length, 
    totalConfirmados: convidados.filter((c) => c.confirmado).length,
    totalAcompanhantes: convites.filter((c) => c.nome_convidado).length,
    totalCheckins: convites.filter((c) => c.data_checkin).length,
    }
}

export async function gerarConvite(convidadoId: string) {
  const { error } = await supabase
    .from('convidados')
    .update({ convidado: true })
    .eq('id', convidadoId)

  if (error) {
    console.error('Erro do Supabase ao gerar convite:', error)
    throw new Error('Não foi possível marcar o convidado.')
  }
}

export async function criarConvidado(nome: string, limiteAcompanhantes: number) {
  const { error } = await supabase
    .from('convidados')
    .insert({
      nome,
      limite_acompanhantes: limiteAcompanhantes,
      confirmado: false,
      convidado: false,
      email: null,
    })

  if (error) {
    console.error('Erro do Supabase ao criar convidado:', error)
    throw new Error('Não foi possível cadastrar o convidado.')
  }
}

export async function validarConvite(conviteId: string) {
  const { data: convite, error } = await supabase
    .from('convite')
    .select('*, convidados(nome)')
    .eq('id', conviteId)
    .single()

  if (error || !convite) {
    return { status: 'invalido' as const }
  }

  const nomeExibido = convite.nome_convidado ?? convite.convidados?.nome ?? 'Convidado'

  if (convite.data_checkin) {
    return {
      status: 'ja_usado' as const,
      nome: nomeExibido,
    }
  }

  const { error: erroUpdate } = await supabase
    .from('convite')
    .update({ data_checkin: new Date().toISOString() })
    .eq('id', conviteId)

  if (erroUpdate) {
    console.error('Erro ao marcar checkin:', erroUpdate)
    return { status: 'invalido' as const }
  }

  return {
    status: 'valido' as const,
    nome: nomeExibido,
  }
}
   

