import { getTorneoFromFase } from "../domain/stats"

const cleanRecord = (record) => ({
  fecha: record.fecha || '',
  rival: record.rival || '',
  fase: record.fase || '',
  fundamento: record.fundamento || '',
  totalAcciones: Number(record.totalAcciones) || 0,
  puntos: Number(record.puntos) || 0,
  errores: Number(record.errores) || 0,
})

export const cleanAIData = (data) => {
  const {
    player = {},
    playerId = '',
    filters = {},
    records = [],
  } = data || {}

  // Aplicamos los mismos filtros que utiliza la ficha
  let filteredRecords = records

  // TORNEO
  if (
    filters.torneo &&
    filters.torneo !== '' &&
    filters.torneo !== 'TODOS'
  ) {
    filteredRecords = filteredRecords.filter(
      (r) => getTorneoFromFase(r.fase) === filters.torneo,
    )
  }

  // FASE
  if (filters.fase) {
    filteredRecords = filteredRecords.filter(
      (r) => r.fase === filters.fase,
    )
  }

  // RIVAL
  if (filters.rival) {
    filteredRecords = filteredRecords.filter(
      (r) => r.rival === filters.rival,
    )
  }

  // FUNDAMENTO
  if (filters.fund) {
    filteredRecords = filteredRecords.filter(
      (r) => r.fundamento === filters.fund,
    )
  }

  // Limpiamos los registros
  const cleanedRecords = filteredRecords.map(cleanRecord)

  // Agrupamos por fundamento
  const fundamentosMap = {}

  cleanedRecords.forEach((record) => {
    const nombre = record.fundamento || 'Sin fundamento'

    if (!fundamentosMap[nombre]) {
      fundamentosMap[nombre] = {
        fundamento: nombre,
        totalAcciones: 0,
        puntos: 0,
        errores: 0,
      }
    }

    fundamentosMap[nombre].totalAcciones += record.totalAcciones
    fundamentosMap[nombre].puntos += record.puntos
    fundamentosMap[nombre].errores += record.errores
  })

  const fundamentos = Object.values(fundamentosMap).map((fundamento) => ({
    ...fundamento,
    balance: fundamento.puntos - fundamento.errores,
  }))

  // Resumen general
  const totalAcciones = cleanedRecords.reduce(
    (total, record) => total + record.totalAcciones,
    0,
  )

  const totalPuntos = cleanedRecords.reduce(
    (total, record) => total + record.puntos,
    0,
  )

  const totalErrores = cleanedRecords.reduce(
    (total, record) => total + record.errores,
    0,
  )

  return {
    player: {
      id: playerId,
      nombre: player.nombre || '',
      apellido: player.apellido || '',
      edad: player.edad ?? null,
      posicion: player.pos || '',
      mano: player.mano || '',
    },

    filters: {
      torneo: filters.torneo || 'TODOS',
      fase: filters.fase || '',
      rival: filters.rival || '',
      fundamento: filters.fund || '',
    },

    resumen: {
      registros: cleanedRecords.length,
      totalAcciones,
      totalPuntos,
      totalErrores,
      totalBalance: totalPuntos - totalErrores,
    },

    fundamentos,

    registros: cleanedRecords,
  }
}