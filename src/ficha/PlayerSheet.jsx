import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useStats } from '../data/StatsContext'
import {
  getCalculatedStats,
  getPlayerKpis,
  getSortedPlayerKeys,
  getTorneoFromFase,
  pieChartData,
  TORNEOS,
  uniqueSorted,
} from '../domain/stats'
import { DoughnutChart } from '../charts/DoughnutChart'
import { FilterSelect } from '../ui/FilterSelect'
import { FundCard } from '../ui/FundCard'
import { KpiCard } from '../ui/KpiCard'
import { PlayerCompareModal } from '../comparador/PlayerCompareModal'

export function PlayerSheet() {
  const { profiles, records } = useStats()
  const sortedKeys = useMemo(
    () => getSortedPlayerKeys(profiles),
    [profiles],
  )
  const [playerKey, setPlayerKey] = useState(sortedKeys[0] || '')
  const [torneo, setTorneo] = useState('TODOS')
  const [fase, setFase] = useState('')
  const [rival, setRival] = useState('')
  const [fund, setFund] = useState('')
  const [compareOpen, setCompareOpen] = useState(false)
  const sheetRef = useRef(null)

  const p = profiles[playerKey]

  const playerRecs = useMemo(
    () => records.filter((r) => r.J === playerKey),
    [records, playerKey],
  )

  const fases = useMemo(() => {
    let recs = playerRecs
    if (torneo && torneo !== 'TODOS') {
      recs = recs.filter((r) => getTorneoFromFase(r.Fa) === torneo)
    }
    return uniqueSorted(recs.map((r) => r.Fa))
  }, [playerRecs, torneo])

  const rivales = useMemo(() => {
    let recs = playerRecs
    if (torneo && torneo !== 'TODOS') {
      recs = recs.filter((r) => getTorneoFromFase(r.Fa) === torneo)
    }
    if (fase) recs = recs.filter((r) => r.Fa === fase)
    return uniqueSorted(recs.map((r) => r.R))
  }, [playerRecs, torneo, fase])

  const stats = useMemo(
    () => getCalculatedStats(records, profiles, torneo, fase, rival),
    [records, profiles, torneo, fase, rival],
  )
  const d = useMemo(
    () => stats[playerKey] || {},
    [stats, playerKey],
  )
  const kpis = useMemo(() => getPlayerKpis(d), [d])
  const pie = useMemo(() => pieChartData(d), [d])

  const visibleFunds = fund
    ? kpis.fundKeys.filter((fn) => fn === fund)
    : kpis.fundKeys

  const onPlayerChange = (key) => {
    setPlayerKey(key)
    setTorneo('TODOS')
    setFase('')
    setRival('')
    setFund('')
  }

  const onTorneoChange = (value) => {
    setTorneo(value)
    setFase('')
    setRival('')
  }

  const onFaseChange = (value) => {
    setFase(value)
    setRival('')
  }

  const exportPng = () => {
    const element = sheetRef.current
    if (!element || !p) return
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#070e1e',
    }).then((canvas) => {
      const link = document.createElement('a')
      link.download = `Ficha_Tecnica_${p.nombre.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
  }

  if (!p) return <p className="muted">Sin jugadores cargados.</p>

  const netSign = kpis.totalBalance > 0 ? '+' : ''
  const netColor =
    kpis.totalBalance > 0
      ? 'var(--green)'
      : kpis.totalBalance < 0
        ? 'var(--red2)'
        : 'var(--yellow)'

  return (
    <div className="page">
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        >
          SELECCIONAR JUGADOR (ORDENADO POR APELLIDO):
        </label>
        <select
          value={playerKey}
          onChange={(e) => onPlayerChange(e.target.value)}
          style={{ marginTop: 4, fontWeight: 'bold' }}
        >
          {sortedKeys.map((k) => {
            const pr = profiles[k]
            return (
              <option key={k} value={k}>
                {pr.apellido.toUpperCase()}, {pr.nombreOnly} ({pr.pos})
              </option>
            )
          })}
        </select>
      </div>

      <div ref={sheetRef}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div className="jugTitle" style={{ margin: 0, flex: 1 }}>
            {p.apellido.toUpperCase()}, {p.nombreOnly.toUpperCase()}
          </div>
          <button type="button" className="btnExport" onClick={exportPng}>
            EXPORTAR PNG
          </button>
        </div>

        <div className="cardPerfil">
          <div className="fotoJugador" aria-hidden>
            {playerKey.split(' ')[0].slice(0, 3)}
          </div>
          <div className="gridData">
            <div className="dataItem">
              <span>Posición</span>
              <b>{p.pos}</b>
            </div>
            <div className="dataItem">
              <span>Edad</span>
              <b>{p.edad} años</b>
            </div>
            <div className="dataItem">
              <span>Mano Hábil</span>
              <b>{p.mano}</b>
            </div>
            <div className="dataItem">
              <span>F. Nacimiento</span>
              <b>{p.nac}</b>
            </div>
            <div className="dataItem">
              <span>DNI</span>
              <b>{p.dni}</b>
            </div>
            <div className="dataItem">
              <span>Código ID</span>
              <b>{playerKey}</b>
            </div>
          </div>
        </div>

        <div className="sectionContainer">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div className="sectionHeaderTitle">
              DESGLOSE POR TORNEOS Y FASES:
            </div>
            <button
              type="button"
              className="btnCompare"
              onClick={() => setCompareOpen(true)}
            >
              COMPARAR CARA A CARA
            </button>
          </div>

          <div className="filtersRow">
            <FilterSelect
              label="TORNEOS:"
              value={torneo}
              onChange={onTorneoChange}
              options={[
                { value: 'TODOS', label: 'Todos los Torneos' },
                ...TORNEOS,
              ]}
            />
            <FilterSelect
              label="FASES DE TORNEO:"
              value={fase}
              onChange={onFaseChange}
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

          <div className="kpiGrid">
            {kpis.fundKeys.length === 0 ? (
              <KpiCard style={{ gridColumn: '1 / -1' }}>
                <span className="kpiSubText">
                  Sin datos para los filtros seleccionados
                </span>
              </KpiCard>
            ) : (
              <>
                <KpiCard label="BALANCE NETO PUNTOS">
                  <div className="kpiBigNum" style={{ color: netColor }}>
                    {netSign}
                    {kpis.totalBalance}
                  </div>
                  <div className="kpiSubText">
                    {kpis.totPuntos} Pts -{' '}
                    <span style={{ color: 'var(--red2)', fontWeight: 'bold' }}>
                      {kpis.totErrores} Err
                    </span>
                  </div>
                </KpiCard>
                <KpiCard label="FORTALEZA" labelClass="greenText" borderClass="greenBorder">
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      color: '#fff',
                      margin: '2px 0',
                    }}
                  >
                    {kpis.bestFund.name}
                  </div>
                  <div className="kpiSubText">
                    {kpis.bestFund.pts} Pts /{' '}
                    <span style={{ color: 'var(--red2)', fontWeight: 'bold' }}>
                      {kpis.bestFund.err} Err
                    </span>{' '}
                    ({kpis.bestFund.tot} Acc)
                  </div>
                </KpiCard>
                <KpiCard label="A MEJORAR" labelClass="redText" borderClass="redBorder">
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      color: '#fff',
                      margin: '2px 0',
                    }}
                  >
                    {kpis.worstFund.name}
                  </div>
                  <div className="kpiSubText">
                    <span style={{ color: 'var(--red2)', fontWeight: 'bold' }}>
                      {kpis.worstFund.err} Err
                    </span>{' '}
                    / {kpis.worstFund.pts} Pts ({kpis.worstFund.tot} Acc)
                  </div>
                </KpiCard>
              </>
            )}
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

          <div className="fundHeaderRow">
            <div className="fundTitleText">DETALLE DE FUNDAMENTOS</div>
            <select
              value={fund}
              onChange={(e) => setFund(e.target.value)}
              style={{
                width: 'auto',
                padding: '6px 12px',
                background: 'var(--card2)',
                color: '#4eff8a',
                fontWeight: 'bold',
                borderRadius: 8,
                border: '1px solid var(--border-light)',
              }}
            >
              <option value="">Todos los Fundamentos</option>
              {kpis.fundKeys.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </select>
          </div>

          <div className="fundGrid">
            {visibleFunds.length === 0 ? (
              <p className="muted">
                Sin registros para los filtros seleccionados.
              </p>
            ) : (
              visibleFunds.map((fn) => (
                <FundCard
                  key={fn}
                  name={fn}
                  tot={d[fn].tot}
                  pts={d[fn].pts}
                  err={d[fn].err}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {compareOpen ? (
        <PlayerCompareModal
          defaultJ1={playerKey}
          onClose={() => setCompareOpen(false)}
        />
      ) : null}
    </div>
  )
}
