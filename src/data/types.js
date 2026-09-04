/**
 * Perfil de jugador (clave = código ID, p.ej. "MIGUEL S.").
 * @typedef {object} PlayerProfile
 * @property {string} apellido
 * @property {string} nombreOnly
 * @property {string} nombre
 * @property {string} dni
 * @property {string} pos
 * @property {string} nac
 * @property {number} edad
 * @property {string} mano
 * @property {string} teamId Identificador del equipo
 * @property {string} username Usuario generado para autenticacion
 * @property {string} fotoUrl URL publica de la foto de perfil
 */

/**
 * Registro estadístico de un fundamento en un partido.
 * @typedef {object} StatRecord
 * @property {string} fecha Fecha ISO
 * @property {string} id Identificador del documento
 * @property {string} matchId Identificador del partido
 * @property {string} equipoPropio Equipo que registra la estadistica
 * @property {string} rival Rival
 * @property {string} fase Fase
 * @property {string} playerId Código de jugador
 * @property {string} fundamento Fundamento
 * @property {string|number} indice Indice de la accion
 * @property {number} totalAcciones Total de acciones
 * @property {string} eficiencia Eficiencia (texto, p.ej. "50%")
 * @property {number} igual Cantidad de resultados `=`
 * @property {number} barra Cantidad de resultados `/`
 * @property {number} menos Cantidad de resultados `-`
 * @property {number} exclamacion Cantidad de resultados `!`
 * @property {number} mas Cantidad de resultados `+`
 * @property {number} numeral Cantidad de resultados `#`
 * @property {string|number} numeroJugador Numero de camiseta o jugador
 * @property {number} igualPorcentaje Porcentaje de resultados `=`
 * @property {number} menosPorcentaje Porcentaje de resultados `-`
 * @property {number} barraPorcentaje Porcentaje de resultados `/`
 * @property {number} exclamacionPorcentaje Porcentaje de resultados `!`
 * @property {number} masPorcentaje Porcentaje de resultados `+`
 * @property {number} numeralPorcentaje Porcentaje de resultados `#`
 * @property {number} puntos Puntos
 * @property {number} errores Errores
 * @property {string} teamId Identificador del equipo
 */

/**
 * Agregado por fundamento.
 * @typedef {object} FundStats
 * @property {number} tot
 * @property {number} pts
 * @property {number} err
 */

export {}
