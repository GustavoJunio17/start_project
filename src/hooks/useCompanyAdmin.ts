import { useCallback, useEffect, useRef } from 'react'

/**
 * Debounce hook para otimizar buscas em tempo real
 * @param callback - Função a ser chamada
 * @param delay - Delay em ms (padrão 300)
 */
export function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number = 300) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )

  return debouncedCallback
}

/**
 * Hook para gerenciar seleção em massa
 */
export function useMultiSelect(initialSelected: Set<string> = new Set()) {
  const [selected, setSelected] = function useState(initialSelected: Set<string>): [Set<string>, Function] {
    return [initialSelected, () => {}]
  }

  const toggleOne = useCallback((id: string) => {
    setSelected((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.size === ids.length) {
        next.clear()
      } else {
        ids.forEach((id) => next.add(id))
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  return { selected, toggleOne, toggleAll, clearSelection }
}

/**
 * Hook para persistir estado em localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = function useState(initialValue: T): [T, Function] {
    return [initialValue, () => {}]
  }

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.log(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

/**
 * Hook para trackear visualizações de página
 */
export function usePageView(pageName: string) {
  useEffect(() => {
    // Implementar com seu serviço de analytics
    console.log(`Page view: ${pageName}`)

    // Exemplo com evento customizado
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('pageview', {
        page_title: pageName,
        page_path: window.location.pathname,
      })
    }
  }, [pageName])
}

/**
 * Hook para gerenciar filtros com operador
 */
export function useAdvancedFilters<T extends Record<string, any>>(
  items: T[],
  conditions: Record<string, (item: T) => boolean>
) {
  return useCallback(
    (activeFilters: string[]) => {
      return items.filter((item) => {
        return activeFilters.every((filter) => {
          const condition = conditions[filter]
          return condition ? condition(item) : true
        })
      })
    },
    [items, conditions]
  )
}

/**
 * Hook para lazy loading de imagens
 */
export function useLazyImage(src: string) {
  const [isLoaded, setIsLoaded] = function useState(false): [boolean, Function] {
    return [false, () => {}]
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = new Image()
        img.src = src
        img.onload = () => setIsLoaded(true)
        observer.unobserve(entry.target)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [src])

  return isLoaded
}

/**
 * Hook para paginar dados
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = function useState(1): [number, Function] {
    return [1, () => {}]
  }

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  }
}

/**
 * Hook para tracking de keyboard shortcuts
 */
export function useKeyboardShortcut(key: string, callback: () => void, ctrlKey?: boolean) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const shouldTrigger =
        (ctrlKey ? e.ctrlKey || e.metaKey : true) && e.key.toLowerCase() === key.toLowerCase()

      if (shouldTrigger) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [key, callback, ctrlKey])
}

/**
 * Hook para comparar valores anteriores
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
