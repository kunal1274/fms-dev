import { useMemo, useCallback, useRef, useEffect } from 'react'

// Memoization hook for expensive calculations
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps)
}

// Memoized callback hook
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps)
}

// Debounced value hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttled value hook
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [value, delay])

  return throttledValue
}

// Memoized selector hook for Redux-like state
export const useMemoizedSelector = <TState, TSelected>(
  selector: (state: TState) => TSelected,
  state: TState,
  equalityFn?: (a: TSelected, b: TSelected) => boolean
): TSelected => {
  const ref = useRef<TSelected>()
  const prevState = useRef<TState>()

  if (prevState.current !== state) {
    const selected = selector(state)
    
    if (equalityFn) {
      if (!ref.current || !equalityFn(ref.current, selected)) {
        ref.current = selected
      }
    } else {
      ref.current = selected
    }
    
    prevState.current = state
  }

  return ref.current!
}

// Memoized API call hook
export const useMemoizedApiCall = <T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())
  const lastCallRef = useRef<number>(0)

  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options || {}

  const cacheKey = JSON.stringify(deps)

  const execute = useCallback(async () => {
    if (!enabled) return

    const now = Date.now()
    const cached = cacheRef.current.get(cacheKey)

    // Check if we have cached data that's still fresh
    if (cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data)
      return
    }

    // Check if we're already loading
    if (loading) return

    // Check if we've called this recently
    if (now - lastCallRef.current < 1000) return

    setLoading(true)
    setError(null)
    lastCallRef.current = now

    try {
      const result = await apiCall()
      setData(result)
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: now
      })

      // Clean up old cache entries
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > cacheTime) {
          cacheRef.current.delete(key)
        }
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [apiCall, deps, enabled, staleTime, cacheTime, cacheKey, loading])

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// Memoized form validation hook
export const useMemoizedValidation = <T>(
  validationFn: (value: T) => string | null,
  value: T,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return validationFn(value)
  }, [value, ...deps])
}

// Memoized search hook
export const useMemoizedSearch = <T>(
  items: T[],
  searchTerm: string,
  searchFn: (item: T, term: string) => boolean,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items
    
    return items.filter(item => searchFn(item, searchTerm.toLowerCase()))
  }, [items, searchTerm, ...deps])
}

// Memoized filter hook
export const useMemoizedFilter = <T>(
  items: T[],
  filters: Record<string, any>,
  filterFn: (item: T, filters: Record<string, any>) => boolean,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
    
    if (activeFilters.length === 0) return items
    
    return items.filter(item => filterFn(item, filters))
  }, [items, filters, ...deps])
}

// Memoized sort hook
export const useMemoizedSort = <T>(
  items: T[],
  sortKey: keyof T | null,
  sortDirection: 'asc' | 'desc' = 'asc',
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    if (!sortKey) return items
    
    return [...items].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [items, sortKey, sortDirection, ...deps])
}

// Memoized pagination hook
export const useMemoizedPagination = <T>(
  items: T[],
  page: number,
  pageSize: number,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = items.slice(startIndex, endIndex)
    const totalPages = Math.ceil(items.length / pageSize)
    
    return {
      items: paginatedItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalItems: items.length
    }
  }, [items, page, pageSize, ...deps])
}

// Memoized expensive computation hook
export const useExpensiveComputation = <T, R>(
  computation: (input: T) => R,
  input: T,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return computation(input)
  }, [input, ...deps])
}

// Memoized API response hook
export const useMemoizedApiResponse = <T>(
  apiResponse: T,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return apiResponse
  }, [apiResponse, ...deps])
}

// Memoized component props hook
export const useMemoizedProps = <T extends Record<string, any>>(
  props: T,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return props
  }, [props, ...deps])
}

// Memoized event handler hook
export const useMemoizedEventHandler = <T extends (...args: any[]) => any>(
  handler: T,
  deps: React.DependencyList
) => {
  return useCallback(handler, deps)
}

// Memoized ref hook
export const useMemoizedRef = <T>(value: T) => {
  const ref = useRef<T>(value)
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref
}

// Memoized intersection observer hook
export const useMemoizedIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  return useMemo(() => {
    if (typeof IntersectionObserver === 'undefined') return null
    
    return new IntersectionObserver(callback, options)
  }, [callback, options])
}

// Memoized resize observer hook
export const useMemoizedResizeObserver = (
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
) => {
  return useMemo(() => {
    if (typeof ResizeObserver === 'undefined') return null
    
    return new ResizeObserver(callback, options)
  }, [callback, options])
}

export default {
  useMemoizedValue,
  useMemoizedCallback,
  useDebounce,
  useThrottle,
  useMemoizedSelector,
  useMemoizedApiCall,
  useMemoizedValidation,
  useMemoizedSearch,
  useMemoizedFilter,
  useMemoizedSort,
  useMemoizedPagination,
  useExpensiveComputation,
  useMemoizedApiResponse,
  useMemoizedProps,
  useMemoizedEventHandler,
  useMemoizedRef,
  useMemoizedIntersectionObserver,
  useMemoizedResizeObserver,
}
