"use client"

import { ListarVagas } from "@/components/admin/vagas/ListarVagas"

export default function VagasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Vagas</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gerencie e visualize as vagas abertas, pausadas e encerradas de todas as empresas do sistema.
        </p>
      </div>

      <ListarVagas />
    </div>
  )
}
