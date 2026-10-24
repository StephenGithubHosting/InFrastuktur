import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, ThemeContext } from './theme.js'

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(THEME_STORAGE_KEY) || 'light',
  )

  useEffect(() => {
    function syncTheme(event) {
      if (event.key === THEME_STORAGE_KEY) {
        setTheme(event.newValue === 'dark' ? 'dark' : 'light')
      }
    }

    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider
      value={{ isDarkTheme: theme === 'dark', toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
