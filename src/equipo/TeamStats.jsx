import { useMemo, useState } from 'react'
import { useStats } from '../data/StatsContext'
import {
  getTeamStatsByFund,
  pieChartData,
  POSICIONES,
  TORNEOS,
} from '../domain/stats'
import { DoughnutChart } from '../charts/DoughnutChart'
import { FundCard } from '../ui/FundCard'

export function TeamStats() {
  const { profiles, records } = useStats()
  const [torneo, setTorneo] = useState('')
  const [pos, setPos] = useState('')
  const [fund, setFund] = useState('')

  const teamStats = useMemo(
    () => getTeamStatsByFund(records, profiles, pos, torneo),
    [records, profiles, pos, torneo],
  )
  const fundKeys = useMemo(
    () => Object.keys(teamStats).sort(),
    [teamStats],
  )
  const pie = useMemo(() => pieChartData(teamStats), [teamStats])
  const visible = fund ? fundKeys.filter((fn) => fn === fund) : fundKeys

  return (
    <div className="page">
      <div className="c">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: 'var(--red2)' }}>
              RENDIMIENTO DEL EQUIPO POR FUNDAMENTO
            </h3>
            <small style={{ opacity: 0.7 }}>
              Filtros tácticos por Torneo, Posición y Fundamento
            </small>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              minWidth: 320,
            }}
          >
            <div style={{ flex: 1, minWidth: 140 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--red2)',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  display: 'block',
                }}
              >
                TORNEOS:
              </label>
              <select
                value={torneo}
                onChange={(e) => {
                  setTorneo(e.target.value)
                  setFund('')
                }}
                style={{
                  margin: '4px 0 0 0',
                  padding: '8px 12px',
                  fontWeight: 'bold',
                  color: '#ffe14e',
                }}
              >
                <option value="">Todos los Torneos</option>
                {TORNEOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--red2)',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  display: 'block',
                }}
              >
                FILTRAR POR POSICIÓN:
              </label>
              <select
                value={pos}
                onChange={(e) => {
                  setPos(e.target.value)
                  setFund('')
                }}
                style={{ margin: '4px 0 0 0', padding: '8px 12px' }}
              >
                <option value="">Todas las Posiciones (Plantel)</option>
                {POSICIONES.map((p) => (
                  <option key={p} value={p}>
                    {p === 'Punta'
                      ? 'Puntas'
                      : p === 'Central'
                        ? 'Centrales'
                        : p === 'Opuesta'
                          ? 'Opuestas'
                          : p === 'Armadora'
                            ? 'Armadoras'
                            : 'Líberos'}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--red2)',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  display: 'block',
                }}
              >
                SELECCIONAR FUNDAMENTO:
              </label>
              <select
                value={fund}
                onChange={(e) => setFund(e.target.value)}
                style={{
                  margin: '4px 0 0 0',
                  padding: '8px 12px',
                  background: 'var(--card2)',
                  color: '#4eff8a',
                  fontWeight: 'bold',
                }}
              >
                <option value="">Todos los Fundamentos</option>
                {fundKeys.map((fu) => (
                  <option key={fu} value={fu}>
                    {fu}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pieGridContainer">
        <div className="pieChartCard">
          <DoughnutChart
            labels={pie.labels}
            data={pie.pts}
            title="ORIGEN DE PUNTOS"
            titleColor="#4eff8a"
          />
        </div>
        <div className="pieChartCard">
          <DoughnutChart
            labels={pie.labels}
            data={pie.err}
            title="ORIGEN DE ERRORES"
            titleColor="#ff4d4d"
          />
        </div>
      </div>

      <div className="c fundGrid">
        {visible.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.6 }}>
            Sin datos para el filtro seleccionado.
          </p>
        ) : (
          visible.map((fu) => (
            <FundCard
              key={fu}
              name={fu}
              tot={teamStats[fu].tot}
              pts={teamStats[fu].pts}
              err={teamStats[fu].err}
              totalsLabel="Acciones Totales"
            />
          ))
        )}
      </div>
    </div>
  )
}
