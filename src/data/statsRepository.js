import profiles from './profiles.json'
import records from './records.json'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'
import { normalizeRecord } from './recordSchema'

const COLLECTIONS = {
  teams: 'equipos',
  players: 'jugadores',
  records: 'registros',
}

/**
 * Capa de datos intercambiable. Hoy lee JSON local;
 * más adelante puede resolver a Firestore sin cambiar la UI.
 */
export async function getProfiles(userProfile) {
  if (firebaseEnabled) {
    if (userProfile?.rol !== 'profesor' && userProfile?.rol !== 'jugador') {
      return {}
    }
    if (userProfile.rol === 'jugador') {
      if (!userProfile.playerId) return {}
      const playerSnapshot = await getDoc(
        doc(db, COLLECTIONS.players, userProfile.playerId),
      )
      return playerSnapshot.exists() && playerSnapshot.data().activo !== false
        ? { [playerSnapshot.id]: { ...playerSnapshot.data(), id: playerSnapshot.id } }
        : {}
    }
    const snapshot = await getDocs(collection(db, COLLECTIONS.players))
    return Object.fromEntries(
      snapshot.docs
        .filter((document) => document.data().activo !== false)
        .map((document) => [document.id, { ...document.data(), id: document.id }]),
    )
  }
  return profiles
}

export async function getRecords(userProfile) {
  if (firebaseEnabled) {
    if (userProfile?.rol !== 'profesor' && userProfile?.rol !== 'jugador') {
      return []
    }
    if (userProfile.rol === 'jugador') {
      if (!userProfile.playerId) return []
      const recordsQuery = query(
        collection(db, COLLECTIONS.records),
        where('playerId', '==', userProfile.playerId),
      )
      const snapshot = await getDocs(recordsQuery)
      return snapshot.docs
        .filter((document) => document.data().activo !== false)
        .map((document) => normalizeRecord({ id: document.id, ...document.data() }))
    }
    const snapshot = await getDocs(collection(db, COLLECTIONS.records))
    return snapshot.docs
      .filter((document) => document.data().activo !== false)
      .map((document) => normalizeRecord({ id: document.id, ...document.data() }))
  }
  return records.map((record) => normalizeRecord(record))
}
