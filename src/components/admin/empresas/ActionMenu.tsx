'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Eye, Edit2, Power, Trash2 } from 'lucide-react'
import { Empresa } from './types'

interface ActionMenuProps {
  empresa: Empresa
  onView: (empresa: Empresa) => void
  onEdit: (empresa: Empresa) => void
  onToggleStatus: (empresa: Empresa) => void
  onDelete: (empresa: Empresa) => void
}

export function ActionMenu({
  empresa,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[#1e2a5e]/50 text-gray-400 hover:text-white transition-colors focus:outline-none"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Abrir menu</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[#1e2a5e] bg-[#0A0E27] backdrop-blur-md shadow-lg shadow-[#00D4FF]/5 animate-in fade-in zoom-in-95 duration-200">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onView(empresa)
              }}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#111633] hover:text-white transition-colors"
            >
              <Eye className="mr-2 h-4 w-4 text-gray-400 group-hover:text-[#00D4FF]" />
              Ver detalhes
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onEdit(empresa)
              }}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#111633] hover:text-white transition-colors"
            >
              <Edit2 className="mr-2 h-4 w-4 text-gray-400 group-hover:text-[#00D4FF]" />
              Editar
            </button>
            
            <div className="my-1 border-t border-[#1e2a5e]/50" />
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onToggleStatus(empresa)
              }}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#111633] hover:text-white transition-colors"
            >
              <Power className="mr-2 h-4 w-4 text-gray-400 group-hover:text-[#00D4FF]" />
              {empresa.status === 'ativa' ? 'Desativar' : 'Ativar'}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onDelete(empresa)
              }}
              className="group flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
