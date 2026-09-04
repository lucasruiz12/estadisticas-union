import { useMemo, useState } from 'react'
import { useStats } from '../data/StatsContext'
import { getCalculatedStats, getSortedPlayerKeys } from '../domain/stats'
import { RadarChart } from '../charts/RadarChart'

export function PlayerCompareModal({ defaultJ1, onClose }) {
  const { profiles, records } = useStats()
  const sortedKeys = useMemo(
    () => getSortedPlayerKeys(profiles),
    [profiles],
  )
  const [j1, setJ1] = useState(defaultJ1)
  const [j2, setJ2] = useState(
    () => sortedKeys.find((k) => k !== defaultJ1) || sortedKeys[0],
  )

  const { allFunds, tableRows, datasets } = useMemo(() => {
    const stats = getCalculatedStats(records, profiles, 'TODOS', '', '')
    const d1 = stats[j1] || {}
    const d2 = stats[j2] || {}
    const funds = Array.from(
      new Set([...Object.keys(d1), ...Object.keys(d2)]),
    ).sort()
    const p1Data = funds.map((fu) => (d1[fu] || { pts: 0 }).pts)
    const p2Data = funds.map((fu) => (d2[fu] || { pts: 0 }).pts)
    return {
      allFunds: funds,
      tableRows: funds.map((fu) => ({
        fu,
        o1: d1[fu] || { tot: 0, pts: 0, err: 0 },
        o2: d2[fu] || { tot: 0, pts: 0, err: 0 },
      })),
      datasets: [
        {
          label: profiles[j1]?.nombre || j1,
          data: p1Data,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.25)',
          borderWidth: 2,
          pointRadius: 4,
        },
        {
          label: profiles[j2]?.nombre || j2,
          data: p2Data,
          borderColor: '#3a86ff',
          backgroundColor: 'rgba(58, 134, 255, 0.25)',
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    }
  }, [records, profiles, j1, j2])

  const optionLabel = (k) => {
    const p = profiles[k]
    return `${p.apellido.toUpperCase()}, ${p.nombreOnly} (${p.pos})`
  }

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalBox">
        <button type="button" className="btnCloseModal" onClick={onClose}>
          ✕
        </button>
        <h3
          style={{
            marginTop: 0,
            color: 'var(--red2)',
            textAlign: 'center',
          }}
        >
          COMPARADOR CARA A CARA DE JUGADORES
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <label style={{ fontSize: 11, opacity: 0.8 }}>
              JUGADOR 1 (ROJO):
            </label>
            <select value={j1} onChange={(e) => setJ1(e.target.value)}>
              {sortedKeys.map((k) => (
                <option key={k} value={k}>
                  {optionLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, opacity: 0.8 }}>
              JUGADOR 2 (AZUL):
            </label>
            <select value={j2} onChange={(e) => setJ2(e.target.value)}>
              {sortedKeys.map((k) => (
                <option key={k} value={k}>
                  {optionLabel(k)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="chartContainer" style={{ height: 320 }}>
          <RadarChart labels={allFunds} datasets={datasets} />
        </div>
        <div style={{ marginTop: 16, overflowX: 'auto' }}>
          <table style={{ fontSize: 11, textAlign: 'center' }}>
            <thead>
              <tr style={{ background: 'var(--card2)', color: 'var(--red2)' }}>
                <th style={{ padding: 8 }}>Fundamento</th>
                <th style={{ padding: 8, color: '#ff6b6b' }}>
                  {profiles[j1]?.apellido} ({profiles[j1]?.nombreOnly})
                </th>
                <th style={{ padding: 8, color: '#3a86ff' }}>
                  {profiles[j2]?.apellido} ({profiles[j2]?.nombreOnly})
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.fu}>
                  <td style={{ fontWeight: 'bold', padding: 8 }}>{row.fu}</td>
                  <td style={{ padding: 8 }}>
                    {row.o1.pts} Pts /{' '}
                    <span style={{ color: 'var(--red2)' }}>
                      {row.o1.err} Err
                    </span>{' '}
                    ({row.o1.tot} Acc)
                  </td>
                  <td style={{ padding: 8 }}>
                    {row.o2.pts} Pts /{' '}
                    <span style={{ color: 'var(--red2)' }}>
                      {row.o2.err} Err
                    </span>{' '}
                    ({row.o2.tot} Acc)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
