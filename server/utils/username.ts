import { randomInt } from 'node:crypto'

// Accounts can be username + password. Supabase Auth identifies people by email, so a username maps to a
// reserved, never-deliverable address (.invalid is guaranteed not to resolve). The same rule lives in the login page.
export const USERNAME_DOMAIN = 'rall.invalid'

export function isUsername(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9._-]{2,29}$/.test(value)
}

export const usernameToEmail = (username: string) => `${username}@${USERNAME_DOMAIN}`

// readable, no look-alikes (0/O, 1/l/I); shown once to the admin
export function generatePassword(length = 12) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('')
}
