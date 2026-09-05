import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AppHeader, LoadingScreen, TabBar } from '../layout/AppShell'
import { useStats } from '../data/StatsContext'
import { PlayerSheet } from '../ficha/PlayerSheet'
import { TeamStats } from '../equipo/TeamStats'
import { MatchRegistry } from '../registro/MatchRegistry'
import { AdminPanel } from '../admin/AdminPanel'

export function Dashboard() {
  const { loading, error } = useStats()
  const { userProfile } = useAuth()
  const [tab, setTab] = useState(1)

  if (loading) {
    return <LoadingScreen message="Cargando estadísticas..." />
  }

  if (error) {
    return (
      <div className="loginWrap">
        <div className="box">
          <p className="errMsg">No se pudieron cargar las estadísticas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="appShell">
      <AppHeader />
      <TabBar tab={tab} onTab={setTab} role={userProfile?.rol} />
      {tab === 1 ? <PlayerSheet playerId={userProfile?.playerId} role={userProfile?.rol} /> : null}
      {tab === 2 && userProfile?.rol === 'profesor' ? <TeamStats /> : null}
      {tab === 3 && userProfile?.rol === 'profesor' ? <MatchRegistry /> : null}
      {tab === 4 && userProfile?.rol === 'profesor' ? <AdminPanel /> : null}
    </div>
  )
}
