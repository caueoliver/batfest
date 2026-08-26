import { estaAutenticado, buscarDadosAdmin } from './actions-admin'
import { PasswordGate } from './PasswordGate'
import { AdminDashboard } from './AdminDashboard'

export default async function Home() {
  const autenticado = await estaAutenticado()

  if (!autenticado) {
    return <PasswordGate />
  }

  const dados = await buscarDadosAdmin()

  return <AdminDashboard {...dados} />
}