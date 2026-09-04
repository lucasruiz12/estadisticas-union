/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { auth, db, firebaseEnabled } from '../firebase'
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
  const [userProfile, setUserProfile] = useState(
    firebaseEnabled ? null : { rol: 'profesor', teamIds: [] },
  )
  const [profileError, setProfileError] = useState(null)
  const authEventRef = useRef(0)

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    let active = true
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const eventId = ++authEventRef.current
      const isCurrent = () => active && eventId === authEventRef.current

      setAuthLoading(true)
      setSession(user)
      setUserProfile(null)
      setProfileError(null)
      if (!user) {
        if (isCurrent()) setAuthLoading(false)
        return
      }
      try {
        const profileSnapshot = await getDoc(doc(db, 'usuarios', user.uid))
        if (!isCurrent()) return
        if (!profileSnapshot.exists()) {
          const missingProfileError = new Error(
            'No existe un perfil para este usuario.',
          )
          missingProfileError.code = 'profile-not-found'
          setProfileError(missingProfileError)
        } else {
          setUserProfile(profileSnapshot.data())
        }
      } catch (error) {
        if (isCurrent()) setProfileError(error)
      } finally {
        if (isCurrent()) setAuthLoading(false)
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
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
    <AuthContext.Provider
      value={{ session, userProfile, profileError, authLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
