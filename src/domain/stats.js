export const TORNEOS = [
  { value: 'TORNEO CABP', label: 'Torneo CABP' },
  { value: 'DH FEM 2026', label: 'DH FEM 2026' },
  { value: 'TORNEO SAN JORGE', label: 'Torneo San Jorge' },
]

export const POSICIONES = ['Punta', 'Central', 'Opuesta', 'Armadora', 'Líbero']

export function getLastName(key, profiles) {
  const prof = profiles[key]
  if (!prof) return key
  return prof.apellido || prof.nombre
}

export function getSortedPlayerKeys(profiles) {
  return Object.keys(profiles).sort((a, b) =>
    getLastName(a, profiles).localeCompare(getLastName(b, profiles)),
  )
}

export function getTorneoFromFase(faseStr) {
  if (!faseStr) return 'TORNEO CABP'
  if (faseStr.startsWith('SAN JORGE')) return 'TORNEO SAN JORGE'
  if (faseStr.startsWith('DH FEM')) return 'DH FEM 2026'
  return 'TORNEO CABP'
}

export function getCalculatedStats(
  records,
  profiles,
  filterTorneo,
  filterFase,
  filterRival,
) {
  const stats = {}
  Object.keys(profiles).forEach((j) => {
    stats[j] = {}
  })

  records.forEach((r) => {
    const j = r.playerId
    const fu = r.fundamento
    const torneoName = getTorneoFromFase(r.fase)

    if (
      filterTorneo &&
      filterTorneo !== '' &&
      filterTorneo !== 'TODOS' &&
      torneoName !== filterTorneo
    ) {
      return
    }
    if (filterFase && filterFase !== '' && r.fase !== filterFase) return
    if (filterRival && filterRival !== '' && r.rival !== filterRival) return

    if (!stats[j]) stats[j] = {}
    if (!stats[j][fu]) stats[j][fu] = { tot: 0, pts: 0, err: 0 }
    stats[j][fu].tot += r.totalAcciones
    stats[j][fu].pts += r.puntos
    stats[j][fu].err += r.errores
  })

  return stats
}

export function getTeamStatsByFund(records, profiles, posFilter, torneoFilter) {
  const teamStats = {}
  records.forEach((r) => {
    const j = r.playerId
    const prof = profiles[j]
    if (posFilter && prof && !prof.pos.includes(posFilter)) return

    const torneoName = getTorneoFromFase(r.fase)
    if (
      torneoFilter &&
      torneoFilter !== '' &&
      torneoFilter !== 'TODOS' &&
      torneoName !== torneoFilter
    ) {
      return
    }

    const fu = r.fundamento
    if (!teamStats[fu]) teamStats[fu] = { tot: 0, pts: 0, err: 0 }
    teamStats[fu].tot += r.totalAcciones
    teamStats[fu].pts += r.puntos
    teamStats[fu].err += r.errores
  })
  return teamStats
}

export function filterRecords(
  records,
  { torneo, fase, rival, player, fund, query },
) {
  const q = (query || '').toLowerCase()
  return records.filter((r) => {
    if (torneo && torneo !== '' && getTorneoFromFase(r.fase) !== torneo) return false
    if (fase && fase !== '' && r.fase !== fase) return false
    if (rival && r.rival !== rival) return false
    if (player && r.playerId !== player) return false
    if (fund && r.fundamento !== fund) return false
    if (
      q &&
      !(
        r.rival.toLowerCase().includes(q) ||
        r.playerId.toLowerCase().includes(q) ||
        r.fundamento.toLowerCase().includes(q)
      )
    ) {
      return false
    }
    return true
  })
}

export function uniqueSorted(values) {
  return Array.from(new Set(values)).sort()
}

export function getPlayerKpis(d) {
  const fundKeys = Object.keys(d).sort()
  let totAcciones = 0
  let totPuntos = 0
  let totErrores = 0
  let bestFund = { name: '-', pts: -1, err: 0, tot: 0 }
  let worstFund = { name: '-', err: -1, pts: 0, tot: 0 }

  fundKeys.forEach((fn) => {
    const o = d[fn]
    totAcciones += o.tot
    totPuntos += o.pts
    totErrores += o.err
    if (o.pts > bestFund.pts) {
      bestFund = { name: fn, pts: o.pts, err: o.err, tot: o.tot }
    }
    if (o.err > worstFund.err) {
      worstFund = { name: fn, err: o.err, pts: o.pts, tot: o.tot }
    }
  })

  return {
    fundKeys,
    totAcciones,
    totPuntos,
    totErrores,
    bestFund,
    worstFund,
    totalBalance: totPuntos - totErrores,
  }
}

export function pieChartData(statsData) {
  const labels = Object.keys(statsData).filter(
    (fn) => statsData[fn].pts > 0 || statsData[fn].err > 0,
  )
  return {
    labels,
    pts: labels.map((fn) => statsData[fn].pts),
    err: labels.map((fn) => statsData[fn].err),
  }
}
