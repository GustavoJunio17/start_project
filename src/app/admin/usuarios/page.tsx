"use client"

import { ListarUsuarios } from "@/components/admin/usuarios/ListarUsuarios"

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os usuários do sistema, convide novos membros e atribua níveis de acesso.
        </p>
      </div>

      <ListarUsuarios />
    </div>
  )
}
