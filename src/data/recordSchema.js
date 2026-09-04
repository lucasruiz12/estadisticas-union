function numberValue(value) {
  if (value === '' || value == null) return 0
  const number = Number(value)
  if (Number.isNaN(number)) throw new Error(`Valor numerico invalido: ${value}`)
  return number
}

function valueFrom(record, ...keys) {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key]
  }
  return ''
}

const DEFAULT_TEAM_ID =
  import.meta.env.VITE_DEFAULT_TEAM_ID || 'QB33c7kBNrkBpPEE33AA'

export function normalizeRecord(record, defaultTeamId = '') {
  const igual = numberValue(valueFrom(record, 'igual', '=', 'resultadoIgual'))
  const numeral = numberValue(
    valueFrom(record, 'numeral', '#', 'resultadoNumeral'),
  )
  return {
    id: valueFrom(record, 'id'),
    matchId: valueFrom(record, 'matchId', 'ID_Partido'),
    fecha: valueFrom(record, 'fecha', 'Fecha', 'F'),
    equipoPropio: valueFrom(record, 'equipoPropio', 'Equipo_Propio'),
    rival: valueFrom(record, 'rival', 'R'),
    fase: valueFrom(record, 'fase', 'Fase_Torneo', 'Fa'),
    playerId: valueFrom(record, 'playerId', 'Jugador', 'J'),
    fundamento: valueFrom(record, 'fundamento', 'Fundamento', 'Fu'),
    indice: valueFrom(record, 'indice', 'Indice'),
    eficiencia: valueFrom(record, 'eficiencia', '*E%', 'E%', 'E'),
    totalAcciones: numberValue(valueFrom(record, 'totalAcciones', 'Tot', 'T')),
    igual,
    barra: numberValue(valueFrom(record, 'barra', '/', 'resultadoBarra')),
    menos: numberValue(valueFrom(record, 'menos', '-', 'resultadoMenos')),
    exclamacion: numberValue(
      valueFrom(record, 'exclamacion', '!', 'resultadoExclamacion'),
    ),
    mas: numberValue(valueFrom(record, 'mas', '+', 'resultadoMas')),
    numeral,
    numeroJugador: valueFrom(record, 'numeroJugador', 'Nro_Jugador'),
    igualPorcentaje: numberValue(valueFrom(record, 'igualPorcentaje', '=%')),
    menosPorcentaje: numberValue(valueFrom(record, 'menosPorcentaje', '-%')),
    barraPorcentaje: numberValue(valueFrom(record, 'barraPorcentaje', '/%')),
    exclamacionPorcentaje: numberValue(
      valueFrom(record, 'exclamacionPorcentaje', '!%'),
    ),
    masPorcentaje: numberValue(valueFrom(record, 'masPorcentaje', '+%')),
    numeralPorcentaje: numberValue(valueFrom(record, 'numeralPorcentaje', '#%')),
    puntos: valueFrom(record, 'puntos', 'P') === ''
      ? numeral
      : numberValue(valueFrom(record, 'puntos', 'P')),
    errores: valueFrom(record, 'errores', 'Er') === ''
      ? igual
      : numberValue(valueFrom(record, 'errores', 'Er')),
    teamId: valueFrom(record, 'teamId') || defaultTeamId || DEFAULT_TEAM_ID,
  }
}
