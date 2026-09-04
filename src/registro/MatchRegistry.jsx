import { useMemo, useState } from 'react'
import { useStats } from '../data/StatsContext'
import {
  filterRecords,
  getSortedPlayerKeys,
  getTorneoFromFase,
  TORNEOS,
  uniqueSorted,
} from '../domain/stats'
import { FilterSelect } from '../ui/FilterSelect'

const VISIBLE_LIMIT = 400

export function MatchRegistry() {
  const { profiles, records } = useStats()
  const sortedKeys = useMemo(
    () => getSortedPlayerKeys(profiles),
    [profiles],
  )
  const [torneo, setTorneo] = useState('')
  const [fase, setFase] = useState('')
  const [rival, setRival] = useState('')
  const [player, setPlayer] = useState('')
  const [fund, setFund] = useState('')
  const [query, setQuery] = useState('')

  const fases = useMemo(() => {
    const recs = records.filter((r) => {
      if (!torneo) return true
      return getTorneoFromFase(r.Fa) === torneo
    })
    return uniqueSorted(recs.map((r) => r.Fa))
  }, [records, torneo])

  const rivales = useMemo(() => {
    const recs = records.filter((r) => {
      if (torneo && getTorneoFromFase(r.Fa) !== torneo) return false
      if (fase && r.Fa !== fase) return false
      return true
    })
    return uniqueSorted(recs.map((r) => r.R))
  }, [records, torneo, fase])

  const fundamentos = useMemo(
    () => uniqueSorted(records.map((r) => r.Fu)),
    [records],
  )

  const filtered = useMemo(
    () =>
      filterRecords(records, {
        torneo,
        fase,
        rival,
        player,
        fund,
        query,
      }),
    [records, torneo, fase, rival, player, fund, query],
  )

  const totPts = filtered.reduce((a, b) => a + b.P, 0)
  const totErr = filtered.reduce((a, b) => a + b.Er, 0)
  const rows = filtered.slice(0, VISIBLE_LIMIT)

  return (
    <div className="page">
      <div className="c">
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--red2)' }}>
          HISTORIAL COMPLETO DE PARTIDOS Y EQUIPO
        </h3>
        <small
          style={{
            color: 'var(--text-dim)',
            fontWeight: 'bold',
            display: 'block',
            marginBottom: 12,
          }}
        >
          {filtered.length} registros filtrados
        </small>

        <div className="filtersRow" style={{ marginBottom: 12 }}>
          <FilterSelect
            label="TORNEOS:"
            value={torneo}
            onChange={(v) => {
              setTorneo(v)
              setFase('')
              setRival('')
            }}
            options={[
              { value: '', label: 'Todos los Torneos' },
              ...TORNEOS,
            ]}
          />
          <FilterSelect
            label="FASES DE TORNEO:"
            value={fase}
            onChange={(v) => {
              setFase(v)
              setRival('')
            }}
            options={[
              { value: '', label: 'Todas las Fases' },
              ...fases.map((f) => ({ value: f, label: f })),
            ]}
          />
          <FilterSelect
            label="ELEGIR RIVAL:"
            value={rival}
            onChange={setRival}
            options={[
              { value: '', label: 'Todos los Rivales' },
              ...rivales.map((r) => ({ value: r, label: r })),
            ]}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <select value={player} onChange={(e) => setPlayer(e.target.value)}>
            <option value="">Todos los {sortedKeys.length} jugadores</option>
            {sortedKeys.map((k) => {
              const pr = profiles[k]
              return (
                <option key={k} value={k}>
                  {pr.apellido.toUpperCase()}, {pr.nombreOnly}
                </option>
              )
            })}
          </select>
          <select value={fund} onChange={(e) => setFund(e.target.value)}>
            <option value="">Todos los Fundamentos</option>
            {fundamentos.map((fu) => (
              <option key={fu} value={fu}>
                {fu}
              </option>
            ))}
          </select>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre de rival, jugador o fundamento..."
          style={{ padding: '9px 12px', borderRadius: 8, marginBottom: 10 }}
        />

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Rival</th>
                <th>Fase</th>
                <th>Jug</th>
                <th>Fund</th>
                <th>Tot</th>
                <th>Pts</th>
                <th>Err</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.F}-${r.R}-${r.J}-${r.Fu}-${i}`}>
                  <td>{r.F}</td>
                  <td>{r.R}</td>
                  <td style={{ fontSize: 9 }}>{r.Fa}</td>
                  <td>{r.J}</td>
                  <td>{r.Fu}</td>
                  <td>{r.T}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                    {r.P}
                  </td>
                  <td style={{ color: 'var(--red2)', fontWeight: 'bold' }}>
                    {r.Er}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="c">
            <b>{filtered.length} REGISTROS ENCONTRADOS</b> • Pts Totales:{' '}
            {totPts} • Err Totales: {totErr}
          </div>
        </div>
      </div>
    </div>
  )
}
