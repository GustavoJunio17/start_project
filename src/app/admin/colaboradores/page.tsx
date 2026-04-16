"use client"

import { ListarColaboradores } from "@/components/admin/colaboradores/ListarColaboradores"

export default function ColaboradoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Gestão de Colaboradores</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e visualize todos os colaboradores das empresas cadastradas no sistema.
        </p>
      </div>

      <ListarColaboradores />
    </div>
  )
}
