import profiles from './profiles.json'
import records from './records.json'
import { collection, getDocs } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'

const COLLECTIONS = {
  teams: 'equipos',
  players: 'jugadores',
  records: 'registros',
}

/**
 * Capa de datos intercambiable. Hoy lee JSON local;
 * más adelante puede resolver a Firestore sin cambiar la UI.
 */
export async function getProfiles() {
  if (firebaseEnabled) {
    const snapshot = await getDocs(collection(db, COLLECTIONS.players))
    return Object.fromEntries(
      snapshot.docs.map((doc) => [doc.id, { ...doc.data(), id: doc.id }]),
    )
  }
  return profiles
}

export async function getRecords() {
  if (firebaseEnabled) {
    const snapshot = await getDocs(collection(db, COLLECTIONS.records))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
  return records
}
