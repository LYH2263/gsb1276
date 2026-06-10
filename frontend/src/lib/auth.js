const TOKEN_KEY = 'label1276_token'
const USER_KEY = 'label1276_user'
const THEME_KEY = 'label1276_theme'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUser() {
  const text = localStorage.getItem(USER_KEY)
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function setAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('orbit:auth'))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new CustomEvent('orbit:auth'))
}

export function getTheme() {
  const value = localStorage.getItem(THEME_KEY) || 'light'
  applyTheme(value)
  return value
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent('orbit:theme', { detail: { theme } }))
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove('theme-light', 'theme-dark')
  root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
}
