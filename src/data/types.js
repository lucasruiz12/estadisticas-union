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
 */

/**
 * Registro estadístico de un fundamento en un partido.
 * @typedef {object} StatRecord
 * @property {string} F  Fecha ISO
 * @property {string} R  Rival
 * @property {string} Fa Fase
 * @property {string} J  Código de jugador
 * @property {string} Fu Fundamento
 * @property {number} T  Total de acciones
 * @property {string} E  Eficiencia (texto, p.ej. "50%")
 * @property {number} P  Puntos
 * @property {number} Er Errores
 */

/**
 * Agregado por fundamento.
 * @typedef {object} FundStats
 * @property {number} tot
 * @property {number} pts
 * @property {number} err
 */

export {}
