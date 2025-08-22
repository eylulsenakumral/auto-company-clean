# Dark Mode Implementation

## Overview

Tailwind v4 + shadcn/ui dark mode requires:
1. `ThemeProvider` component to manage state
2. `.dark` class toggling on `<html>` element
3. localStorage persistence
4. System theme detection

---

## ThemeProvider Component

### Full Implementation

```typescript
// src/components/theme-provider.tsx
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
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch (e) {
      return defaultTheme
    }
  })

  useEffect(() ***REMOVED***> {
    const root ***REMOVED*** window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme ***REMOVED******REMOVED******REMOVED*** 'system') {
      const systemTheme ***REMOVED*** window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value ***REMOVED*** {
    theme,
    setTheme: (theme: Theme) ***REMOVED***> {
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        console.warn('Storage unavailable')
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
```

### Wrap Your App

```typescript
// src/main.tsx
import { ThemeProvider } from '@/components/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme***REMOVED***"dark" storageKey***REMOVED***"vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

---

## Theme Toggle Component

### Using shadcn/ui Dropdown Menu

```bash
pnpm dlx shadcn@latest add dropdown-menu
```

