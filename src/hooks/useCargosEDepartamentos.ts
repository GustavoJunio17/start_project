import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'

interface CargoOuDepartamento {
  id: string
  nome: string
  descricao: string | null
  tipo?: 'cargo' | 'departamento'
}

export function useCargosEDepartamentos(empresaId: string | null | undefined) {
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
      const { data } = await supabase
        .from('cargos_departamentos')
        .select('id, nome, descricao, tipo')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')

      if (data) {
        setCargos(data.filter(d => d.tipo === 'cargo') as CargoOuDepartamento[])
        setDepartamentos(data.filter(d => d.tipo === 'departamento') as CargoOuDepartamento[])
      }
      setLoading(false)
    }

    fetch()
  }, [empresaId])

  return { cargos, departamentos, loading }
}
