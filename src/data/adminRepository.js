import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { db, firebaseEnabled, provisioningAuth } from '../firebase'
import { normalizeRecord } from './recordSchema'
import { usernameToAuthEmail } from '../auth/authIdentity'

const MAX_BATCH_SIZE = 450

export const ADMIN_COLLECTIONS = ['equipos', 'jugadores', 'registros', 'usuarios']

function normalizeDocument(collectionName, document) {
  if (collectionName === 'registros') return normalizeRecord(document)
  const normalized = { ...document }
  if (collectionName === 'jugadores' && normalized.edad !== undefined) {
    const age = Number(normalized.edad)
    if (Number.isNaN(age)) throw new Error(`Edad invalida: ${normalized.edad}`)
    normalized.edad = age
  }
  if (collectionName === 'usuarios' && typeof normalized.teamIds === 'string') {
    normalized.teamIds = normalized.teamIds
      .split(',')
      .map((teamId) => teamId.trim())
      .filter(Boolean)
  }
  return normalized
}

export async function importDocuments(collectionName, documents) {
  if (!firebaseEnabled) {
    throw new Error('Firebase no esta configurado.')
  }
  if (!ADMIN_COLLECTIONS.includes(collectionName)) {
    throw new Error('Coleccion no permitida.')
  }
  if (!documents.length) {
    throw new Error('No hay documentos para importar.')
  }

  let imported = 0
  for (let index = 0; index < documents.length; index += MAX_BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = documents.slice(index, index + MAX_BATCH_SIZE)
    chunk.forEach((document) => {
      const { id, ...rawData } = document
      const data = normalizeDocument(collectionName, rawData)
      const reference = id
        ? doc(db, collectionName, String(id))
        : doc(collection(db, collectionName))
      batch.set(reference, data, { merge: true })
    })
    await batch.commit()
    imported += chunk.length
  }

  return imported
}

export async function getAdminDocuments(collectionName) {
  if (!firebaseEnabled) throw new Error('Firebase no esta configurado.')
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function saveAdminDocument(collectionName, id, data) {
  if (!firebaseEnabled) throw new Error('Firebase no esta configurado.')
  if (!ADMIN_COLLECTIONS.includes(collectionName)) {
    throw new Error('Coleccion no permitida.')
  }
  if (!id?.trim()) throw new Error('El ID es obligatorio.')
  await setDoc(doc(db, collectionName, id.trim()), data, { merge: true })
}

export async function softDeleteAdminDocument(collectionName, id) {
  return saveAdminDocument(collectionName, id, { activo: false })
}

export async function createPlayerWithAuth({ playerId, player, username, password, teamId }) {
  if (!firebaseEnabled || !provisioningAuth) {
    throw new Error('Firebase no esta configurado.')
  }
  const credential = await createUserWithEmailAndPassword(
    provisioningAuth,
    usernameToAuthEmail(username),
    password,
  )
  const batch = writeBatch(db)
  batch.set(doc(db, 'jugadores', playerId), { ...player, activo: true, teamId }, { merge: true })
  batch.set(doc(db, 'usuarios', credential.user.uid), {
    activo: true,
    nombre: player.nombre,
    playerId,
    rol: 'jugador',
    teamIds: [teamId],
    username,
  }, { merge: true })
  await batch.commit()
  return credential.user.uid
}
