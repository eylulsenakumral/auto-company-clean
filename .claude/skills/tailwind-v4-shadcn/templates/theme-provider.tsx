import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme ***REMOVED*** 'dark' | 'light' | 'system'

type ThemeProviderProps ***REMOVED*** {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState ***REMOVED*** {
  theme: Theme
  setTheme: (theme: Theme) ***REMOVED***> void
}

const initialState: ThemeProviderState ***REMOVED*** {
  theme: 'system',
  setTheme: () ***REMOVED***> null,
}

const ThemeProviderContext ***REMOVED*** createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme ***REMOVED*** 'system',
  storageKey ***REMOVED*** 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] ***REMOVED*** useState<Theme>(() ***REMOVED***> {
    // Try localStorage first, fall back to sessionStorage, then default
    try {
      return (localStorage.getItem(storageKey) as Theme) ||
             (sessionStorage.getItem(storageKey) as Theme) ||
             defaultTheme
    } catch (e) {
      // Storage unavailable (incognito/privacy mode) - use default
      return defaultTheme
    }
  })

  useEffect(() ***REMOVED***> {
    const root ***REMOVED*** window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme ***REMOVED******REMOVED******REMOVED*** 'system') {
      const systemTheme ***REMOVED*** window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value ***REMOVED*** {
    theme,
    setTheme: (theme: Theme) ***REMOVED***> {
      // Try to persist to localStorage, fall back to sessionStorage
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        // localStorage unavailable (incognito) - use sessionStorage
        try {
          sessionStorage.setItem(storageKey, theme)
        } catch (err) {
          // Both unavailable - just update state without persistence
          console.warn('Storage unavailable, theme preference will not persist')
        }
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value***REMOVED***{value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme ***REMOVED*** () ***REMOVED***> {
  const context ***REMOVED*** useContext(ThemeProviderContext)

  if (context ***REMOVED******REMOVED******REMOVED*** undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
