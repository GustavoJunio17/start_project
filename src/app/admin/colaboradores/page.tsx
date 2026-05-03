"use client"

import { ListarColaboradores } from "@/components/admin/colaboradores/ListarColaboradores"

export default function ColaboradoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Colaboradores</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gerencie e visualize todos os colaboradores das empresas cadastradas no sistema.
        </p>
      </div>

      <ListarColaboradores />
    </div>
  )
}
