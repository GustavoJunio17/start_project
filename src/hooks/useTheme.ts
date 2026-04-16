'use client'

import { useEffect, useState } from 'react'
import type { Tema } from '@/types/database'

export function useTheme(userTheme?: Tema) {
  const [theme, setTheme] = useState<Tema>(userTheme || 'dark')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-clean')

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-clean')
    } else {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme])

  return { theme, setTheme }
}
