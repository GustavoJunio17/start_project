'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/database'
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  UserCheck,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Database,
  Bell,
  Calendar,
  GraduationCap,
  Target,
  Star,
  FileText,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard CRM', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Empresas', href: '/admin/empresas', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Usuarios', href: '/admin/usuarios', icon: <Users className="w-5 h-5" /> },
    { label: 'Colaboradores', href: '/admin/colaboradores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Vagas', href: '/admin/vagas', icon: <Briefcase className="w-5 h-5" /> },
  ],
  super_gestor: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Empresas', href: '/admin/empresas', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Usuarios', href: '/admin/usuarios', icon: <Users className="w-5 h-5" /> },
    
  ],
  admin: [
    { label: 'Dashboard', href: '/empresa/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Colaboradores', href: '/empresa/colaboradores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Vagas', href: '/empresa/vagas', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidatos', href: '/empresa/candidatos', icon: <Users className="w-5 h-5" /> },
    { label: 'Testes', href: '/empresa/testes', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Feedbacks', href: '/empresa/feedbacks', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  gestor_rh: [
    { label: 'Dashboard', href: '/empresa/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Candidatos', href: '/empresa/candidatos', icon: <Users className="w-5 h-5" /> },
    { label: 'Colaboradores', href: '/empresa/colaboradores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Testes', href: '/empresa/vagas', icon: <ClipboardList className="w-5 h-5" /> },
  ],
  user_empresa: [
    { label: 'Dashboard', href: '/empresa/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Vagas', href: '/empresa/vagas', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidatos', href: '/empresa/candidatos', icon: <Users className="w-5 h-5" /> },
    { label: 'Colaboradores', href: '/empresa/colaboradores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Configuracoes', href: '/empresa/configuracoes', icon: <Shield className="w-5 h-5" /> },
    { label: 'Feedbacks', href: '/empresa/feedbacks', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Relatorios', href: '/empresa/relatorios', icon: <BarChart3 className="w-5 h-5" /> },
  ],
  colaborador: [
    { label: 'Dashboard', href: '/gestor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Candidatos', href: '/gestor/candidatos', icon: <Users className="w-5 h-5" /> },
    { label: 'Colaboradores', href: '/gestor/colaboradores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Testes', href: '/gestor/testes', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Feedbacks', href: '/gestor/feedbacks', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Agendamentos', href: '/gestor/candidatos', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Onboarding', href: '/gestor/onboarding', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Ranking', href: '/gestor/ranking', icon: <Star className="w-5 h-5" /> },
    { label: 'Reavaliacao', href: '/gestor/reavaliacao', icon: <Target className="w-5 h-5" /> },
  ],
  candidato: [
    { label: 'Minha Area', href: '/candidato/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Meus Testes', href: '/candidato/testes', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Agendamentos', href: '/candidato/agendamentos', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Feedbacks', href: '/candidato/feedbacks', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Vagas', href: '/candidato/vagas', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Treinamento', href: '/candidato/treinamento', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Perfil', href: '/candidato/perfil', icon: <FileText className="w-5 h-5" /> },
  ],
}

export function Sidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  const items = NAV_ITEMS[user.role] || []

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300',
          'bg-[#0A0E27] border-r border-[#1e2a5e]',
          'theme-clean:bg-white theme-clean:border-gray-200',
          collapsed ? 'w-16' : 'w-64',
          'max-lg:translate-x-0',
          collapsed ? 'max-lg:-translate-x-full' : ''
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e2a5e]">
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
              START PRO
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-gray-400 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-[#1e2a5e]">
            <p className="text-sm font-medium text-white truncate">{user.nome_completo}</p>
            <p className="text-xs text-gray-400 truncate">{user.role.replace('_', ' ').toUpperCase()}</p>
            {user.empresa_nome && (
              <p className="text-xs text-[#00D4FF] truncate">{user.empresa_nome}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#0066FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                        : 'text-gray-400 hover:text-white hover:bg-[#111633]',
                      collapsed && 'justify-center'
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings & Logout */}
        <div className="p-2 border-t border-[#1e2a5e]">
          <button
            onClick={signOut}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full',
              'text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
