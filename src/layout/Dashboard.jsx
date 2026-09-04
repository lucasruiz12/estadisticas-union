import { useState } from 'react'
import { AppHeader, TabBar } from '../layout/AppShell'
import { useStats } from '../data/StatsContext'
import { PlayerSheet } from '../ficha/PlayerSheet'
import { TeamStats } from '../equipo/TeamStats'
import { MatchRegistry } from '../registro/MatchRegistry'

export function Dashboard() {
  const { loading, error } = useStats()
  const [tab, setTab] = useState(1)

  if (loading) {
    return (
      <div className="loginWrap">
        <div className="box">
          <p className="muted">Cargando estadísticas...</p>
        </div>
      </div>
    )
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
      <TabBar tab={tab} onTab={setTab} />
      {tab === 1 ? <PlayerSheet /> : null}
      {tab === 2 ? <TeamStats /> : null}
      {tab === 3 ? <MatchRegistry /> : null}
    </div>
  )
}
