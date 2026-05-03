import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'
import { buildAndRunQuery } from '@/lib/db/query-executor'
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit'
import type { Role } from '@/types/database'

type QueryType = 'select' | 'insert' | 'update' | 'delete'

const SUPER: Role[] = ['super_admin', 'super_gestor']
const ADMIN: Role[] = [...SUPER, 'admin']
const GESTOR: Role[] = [...ADMIN, 'gestor_rh']
const ALL: Role[] = [...GESTOR, 'colaborador', 'candidato']

interface TablePolicy {
  read: Role[]
  write: Role[]
  delete: Role[]
  tenanted: boolean
}

const POLICIES: Record<string, TablePolicy> = {
  empresas:            { read: ADMIN,  write: SUPER,                    delete: SUPER,  tenanted: true  },
  users:               { read: SUPER,  write: SUPER,                    delete: SUPER,  tenanted: false },
  vagas:               { read: ALL,    write: GESTOR,                   delete: GESTOR, tenanted: true  },
  candidatos:          { read: ALL,    write: [...GESTOR, 'candidato'], delete: GESTOR, tenanted: true  },
  colaboradores:       { read: ALL,    write: GESTOR,                   delete: GESTOR, tenanted: true  },
  cargos_departamentos: { read: ALL,    write: GESTOR,                  delete: GESTOR, tenanted: true  },
  gestor_rh_setores:   { read: ALL,    write: ADMIN,                   delete: ADMIN,  tenanted: false },
  questoes_disc:       { read: ALL,    write: ADMIN,                    delete: ADMIN,  tenanted: false },
  templates_testes:    { read: GESTOR, write: GESTOR,                   delete: GESTOR, tenanted: true  },
  respostas_teste:     { read: ALL,    write: ALL,                      delete: ADMIN,  tenanted: false },
  feedbacks:           { read: GESTOR, write: GESTOR,                   delete: GESTOR, tenanted: true  },
  agendamentos:        { read: GESTOR, write: GESTOR,                   delete: GESTOR, tenanted: true  },
  pdis:                { read: GESTOR, write: GESTOR,                   delete: GESTOR, tenanted: true  },
  onboardings:         { read: GESTOR, write: GESTOR,                   delete: GESTOR, tenanted: true  },
  treinamentos_ia:     { read: ALL,    write: GESTOR,                   delete: GESTOR, tenanted: true  },
  notificacoes_vaga:   { read: GESTOR, write: [...GESTOR, 'candidato'], delete: GESTOR, tenanted: true  },
  alertas_automaticos: { read: ADMIN,  write: ADMIN,                    delete: ADMIN,  tenanted: true  },
  convites:            { read: ADMIN,  write: ADMIN,                    delete: ADMIN,  tenanted: true  },
}

function deny(msg: string, status = 403) {
  return NextResponse.json({ data: null, error: { message: msg }, count: null }, { status })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`db:${ip}`, 120, 60_000)) {
    return deny('Muitas requisicoes. Tente novamente.', 429)
  }

  const user = await getServerUser()
  if (!user) return deny('Nao autenticado', 401)

  const desc = await request.json()
  const table: string = desc.table
  const type: QueryType = desc.type
  const role = user.role as Role
  const isSuper = SUPER.includes(role)

  const policy = POLICIES[table]
  if (!policy) return deny(`Tabela nao permitida: ${table}`)

  const allowedRoles: Role[] =
    type === 'select' ? policy.read :
    type === 'delete' ? policy.delete :
    policy.write

  if (!allowedRoles.includes(role)) {
    return deny(`Sem permissao para ${type} em ${table}`)
  }

  // Enforce tenant scoping for non-super roles on tenanted tables
  if (policy.tenanted && !isSuper) {
    const empresaId = user.empresa_id as string | null
    if (!empresaId) return deny('Sem empresa_id na sessao')

    if (type === 'select' || type === 'update' || type === 'delete') {
      desc.filters = [...(desc.filters ?? []), { column: 'empresa_id', op: 'eq', value: empresaId }]
    }

    if (type === 'insert' && desc.body) {
      if (desc.body.empresa_id && desc.body.empresa_id !== empresaId) {
        return deny('Nao e possivel inserir dados de outra empresa')
      }
      desc.body.empresa_id = empresaId
    }
  }

  const result = await buildAndRunQuery(desc)
  return NextResponse.json(result)
}
