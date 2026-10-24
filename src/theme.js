import { createContext, useContext } from 'react'

export const THEME_STORAGE_KEY = 'infrastuktur-theme'

export const ThemeContext = createContext(null)

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider.')
  }

  return context
}
