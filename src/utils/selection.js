// src/utils/selection.js
import { PRIORITY_POOL } from '../constants'

function weightedDraw(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function buildSelectionPool(entries) {
  const names = entries.map((e) => e.name)
  const qualifiedPool = names.filter((n) =>
    PRIORITY_POOL.includes(n.trim().toLowerCase())
  )
  return qualifiedPool.length > 0 ? qualifiedPool : names
}

export function resolveOutcome(entries) {
  if (!entries || entries.length === 0) return null
  const selectionPool = buildSelectionPool(entries)
  return weightedDraw(selectionPool)
}
