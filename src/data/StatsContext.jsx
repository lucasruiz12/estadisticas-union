/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { getProfiles, getRecords } from './statsRepository'

const StatsContext = createContext(null)

export function StatsProvider({ children }) {
  const [profiles, setProfiles] = useState({})
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      try {
        const [p, r] = await Promise.all([getProfiles(), getRecords()])
        await new Promise((resolve) => setTimeout(resolve, 700))
        if (cancelled) return
        setProfiles(p)
        setRecords(r)
        setLoading(false)
      } catch (loadError) {
        if (cancelled) return
        setError(loadError)
        setLoading(false)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <StatsContext.Provider value={{ profiles, records, loading, error }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats debe usarse dentro de StatsProvider')
  return ctx
}
