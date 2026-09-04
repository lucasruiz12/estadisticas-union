const USERNAME_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeUsername(username) {
  return username
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
