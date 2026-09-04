const USERNAME_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeUsername(username) {
  return username
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeUsernamePart(value) {
  return normalizeUsername(value).replace(/[^a-z0-9]/g, '')
}

export function usernameFromProfile(profile) {
  const firstName = normalizeUsernamePart(profile.nombreOnly.split(/\s+/)[0])
  const lastName = normalizeUsernamePart(profile.apellido)
  return `${firstName}.${lastName}`
}

export function initialPasswordFromProfile(profile) {
  return String(profile.dni || '').replace(/\D/g, '')
}

export function isValidUsername(username) {
  const normalized = normalizeUsername(username)
  return USERNAME_PATTERN.test(normalized) || EMAIL_PATTERN.test(normalized)
}

export function usernameToAuthEmail(username) {
  const normalized = normalizeUsername(username)
  if (normalized.includes('@')) return normalized
  const domain = import.meta.env.VITE_FIREBASE_AUTH_EMAIL_DOMAIN ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
  return `${normalized}@${domain}`
}
