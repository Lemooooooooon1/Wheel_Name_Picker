// src/utils/selection.js
import { PRIORITY_NAMES } from '../constants'

export function resolveOutcome(entries) {
  if (!entries || entries.length === 0) return null

  const priorityEntries = entries.filter((e) =>
    PRIORITY_NAMES.includes(e.name.trim().toLowerCase())
  )

  const pool = priorityEntries.length > 0 ? priorityEntries : entries
  return pool[Math.floor(Math.random() * pool.length)].name
}
