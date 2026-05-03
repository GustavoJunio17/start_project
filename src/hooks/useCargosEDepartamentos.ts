import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'

export interface CargoOuDepartamento {
  id: string
  nome: string
  descricao: string | null
  tipo?: 'cargo' | 'departamento'
  departamento_id?: string | null
}

export function useCargosEDepartamentos(
  empresaId: string | null | undefined,
  userRole?: string,
  userId?: string,
) {
  const [cargos, setCargos] = useState<CargoOuDepartamento[]>([])
  const [departamentos, setDepartamentos] = useState<CargoOuDepartamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!empresaId) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      let allowedDeptIds: string[] | null = null

      if (userRole === 'gestor_rh' && userId) {
        const { data: setores } = await supabase
          .from('gestor_rh_setores')
          .select('cargos_departamento_id')
          .eq('user_id', userId)
          .eq('empresa_id', empresaId)

        allowedDeptIds = (setores || []).map(s => s.cargos_departamento_id)
      }

      const { data } = await supabase
        .from('cargos_departamentos')
        .select('id, nome, descricao, tipo, departamento_id')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')

      if (data) {
        let allDepts = data.filter(d => d.tipo === 'departamento') as CargoOuDepartamento[]
        let allCargos = data.filter(d => d.tipo === 'cargo') as CargoOuDepartamento[]

        if (allowedDeptIds !== null) {
          allDepts = allDepts.filter(d => allowedDeptIds!.includes(d.id))
          allCargos = allCargos.filter(c => c.departamento_id != null && allowedDeptIds!.includes(c.departamento_id))
        }

        setDepartamentos(allDepts)
        setCargos(allCargos)
      }
      setLoading(false)
    }

    fetch()
  }, [empresaId, userRole, userId])

  return { cargos, departamentos, loading }
}
