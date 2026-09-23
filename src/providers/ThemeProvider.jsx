import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Key bumped to v2 so any 'dark' value saved by earlier visits (before
    // light became the default) doesn't override the new default here.
    const saved = localStorage.getItem('theme_v2')
    return saved ? saved === 'dark' : false  // default: light
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme_v2', dark ? 'dark' : 'light')
  }, [dark])

  // Apply on first mount before paint
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
