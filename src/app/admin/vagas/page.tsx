"use client"

import { ListarVagas } from "@/components/admin/vagas/ListarVagas"

export default function VagasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Gestão de Vagas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e visualize as vagas abertas, pausadas e encerradas de todas as empresas do sistema.
        </p>
      </div>

      <ListarVagas />
    </div>
  )
}
