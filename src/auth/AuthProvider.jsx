import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getProfile, getSession, onAuthStateChange } from '../data/db.js'

const AuthContext = createContext(null)

// loading is true until the first session check finishes, so protected routes never flash.
// profile is loaded separately and stays null until it arrives (or if it fails).
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getSession()
      .then(({ data }) => {
        if (active) setSession(data?.session ?? null)
      })
      .catch(() => {
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Only set state in this callback; calling Supabase from it can deadlock the auth client.
    const unsubscribe = onAuthStateChange((_event, next) => {
      if (!active) return
      setSession(next ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return undefined
    }
    let active = true
    getProfile(userId)
      .then(({ data }) => {
        if (active) setProfile(data ?? null)
      })
      .catch(() => {
        if (active) setProfile(null)
      })
    return () => {
      active = false
    }
  }, [userId])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
