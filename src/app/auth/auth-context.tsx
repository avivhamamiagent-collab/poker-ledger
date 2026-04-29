import * as React from 'react'

export type LocalUser = {
  id: string
  email: string
  displayName: string
  createdAt: string
}

type AuthState = {
  enabled: boolean
  user: LocalUser | null
  loading: boolean
  error?: string
}

const AuthContext = React.createContext<AuthState | null>(null)

const STORAGE_KEY = 'poker_ledger_user'
const USERS_KEY = 'poker_ledger_users'

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length
}

function getStoredUsers(): Record<string, { passwordHash: string; user: LocalUser }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveStoredUsers(users: Record<string, { passwordHash: string; user: LocalUser }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getCurrentUser(): LocalUser | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function setCurrentUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Global setter so signUp/signIn can update React state
let _setAuthState: React.Dispatch<React.SetStateAction<AuthState>> | null = null

export function signUp(email: string, password: string, displayName: string): LocalUser {
  const users = getStoredUsers()
  const key = email.toLowerCase().trim()

  if (users[key]) {
    throw new Error('כתובת האימייל כבר רשומה. נסה להתחבר.')
  }

  const user: LocalUser = {
    id: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    email: key,
    displayName: displayName || key.split('@')[0],
    createdAt: new Date().toISOString(),
  }

  users[key] = { passwordHash: hashPassword(password), user }
  saveStoredUsers(users)
  setCurrentUser(user)

  // Update React state
  if (_setAuthState) {
    _setAuthState({ enabled: true, user, loading: false })
  }

  return user
}

export function signIn(email: string, password: string): LocalUser {
  const users = getStoredUsers()
  const key = email.toLowerCase().trim()
  const entry = users[key]

  if (!entry) {
    throw new Error('אימייל לא נמצא. נסה להירשם.')
  }

  if (entry.passwordHash !== hashPassword(password)) {
    throw new Error('סיסמה שגויה.')
  }

  setCurrentUser(entry.user)

  // Update React state
  if (_setAuthState) {
    _setAuthState({ enabled: true, user: entry.user, loading: false })
  }

  return entry.user
}

export function signOut() {
  setCurrentUser(null)
  if (_setAuthState) {
    _setAuthState({ enabled: true, user: null, loading: false })
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    enabled: true,
    user: null,
    loading: true,
  })

  React.useEffect(() => {
    _setAuthState = setState
    const existing = getCurrentUser()
    setState({ enabled: true, user: existing, loading: false })
    return () => { _setAuthState = null }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
