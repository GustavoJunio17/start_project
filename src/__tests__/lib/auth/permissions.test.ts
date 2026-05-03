import {
  canManageVagas,
  canManageCandidatos,
  canManageUsers,
  canManageEmpresa,
  isSuperValidation,
  isEmpresaAdmin,
  getUnauthorizedMessage,
} from '@/lib/auth/permissions'
import type { Role } from '@/types/database' // eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars

describe('canManageVagas', () => {
  it.each(['super_admin', 'super_gestor', 'admin', 'gestor_rh'] as Role[])(
    '%s pode gerenciar vagas',
    (role) => expect(canManageVagas(role)).toBe(true)
  )

  it.each(['colaborador', 'candidato'] as Role[])(
    '%s não pode gerenciar vagas',
    (role) => expect(canManageVagas(role)).toBe(false)
  )
})

describe('canManageCandidatos', () => {
  it.each(['super_admin', 'super_gestor', 'admin', 'gestor_rh'] as Role[])(
    '%s pode gerenciar candidatos',
    (role) => expect(canManageCandidatos(role)).toBe(true)
  )

  it.each(['colaborador', 'candidato'] as Role[])(
    '%s não pode gerenciar candidatos',
    (role) => expect(canManageCandidatos(role)).toBe(false)
  )
})

describe('canManageUsers', () => {
  it.each(['super_admin', 'super_gestor', 'admin'] as Role[])(
    '%s pode gerenciar usuários',
    (role) => expect(canManageUsers(role)).toBe(true)
  )

  it.each(['gestor_rh', 'colaborador', 'candidato'] as Role[])(
    '%s não pode gerenciar usuários',
    (role) => expect(canManageUsers(role)).toBe(false)
  )
})

describe('canManageEmpresa', () => {
  it.each(['super_admin', 'super_gestor', 'admin'] as Role[])(
    '%s pode gerenciar empresa',
    (role) => expect(canManageEmpresa(role)).toBe(true)
  )

  it.each(['gestor_rh', 'colaborador', 'candidato'] as Role[])(
    '%s não pode gerenciar empresa',
    (role) => expect(canManageEmpresa(role)).toBe(false)
  )
})

describe('isSuperValidation', () => {
  it('super_admin é super', () => expect(isSuperValidation('super_admin')).toBe(true))
  it('super_gestor é super', () => expect(isSuperValidation('super_gestor')).toBe(true))

  it.each(['admin', 'gestor_rh', 'colaborador', 'candidato'] as Role[])(
    '%s não é super',
    (role) => expect(isSuperValidation(role)).toBe(false)
  )
})

describe('isEmpresaAdmin', () => {
  it('admin é empresa admin', () => expect(isEmpresaAdmin('admin')).toBe(true))
  it('gestor_rh é empresa admin', () => expect(isEmpresaAdmin('gestor_rh')).toBe(true))

  it.each(['super_admin', 'super_gestor', 'colaborador', 'candidato'] as Role[])(
    '%s não é empresa admin',
    (role) => expect(isEmpresaAdmin(role)).toBe(false)
  )
})

describe('getUnauthorizedMessage', () => {
  it('retorna string não vazia', () => {
    const msg = getUnauthorizedMessage()
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })
})
