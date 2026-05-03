"use client"

import { ListarCandidatos } from "@/components/admin/candidatos/ListarCandidatos"

export default function CandidatosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Candidatos</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gerencie os candidatos cadastrados na plataforma.
        </p>
      </div>

      <ListarCandidatos />
    </div>
  )
}
