/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, firebaseEnabled } from '../firebase'
import { usernameToAuthEmail } from './authIdentity'

const SESSION_KEY = 'clubActive'
const LOCAL_USER = 'union'
const LOCAL_PASS = 'union2024'

const AuthContext = createContext(null)

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [authLoading, setAuthLoading] = useState(firebaseEnabled)

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    return onAuthStateChanged(auth, (user) => {
      setSession(user)
      setAuthLoading(false)
    })
  }, [])

  const login = async ({ user, pass }) => {
    if (firebaseEnabled) {
      await signInWithEmailAndPassword(auth, usernameToAuthEmail(user), pass)
      return true
    }
    if (user.toLowerCase().trim() === LOCAL_USER && pass.trim() === LOCAL_PASS) {
      localStorage.setItem(SESSION_KEY, 'UNION')
      setSession('UNION')
      return true
    }
    return false
  }

  const logout = async () => {
    if (firebaseEnabled) {
      await signOut(auth)
      return
    }
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
