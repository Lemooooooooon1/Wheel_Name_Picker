// src/utils/selection.js

export function resolveOutcome(entries) {
  if (!entries || entries.length === 0) return null
  const index = Math.floor(Math.random() * entries.length)
  return entries[index].name
}
