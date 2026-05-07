// src/constants/index.js

export const WHEEL_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
]

export const WHEEL_COLORS_DARK = [
  '#4f46e5',
  '#7c3aed',
  '#db2777',
  '#e11d48',
  '#d97706',
  '#059669',
  '#0891b2',
  '#2563eb',
  '#9333ea',
  '#dc2626',
  '#0d9488',
  '#ea580c',
]

export const DEFAULT_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Ethan',
]

export const SPIN_MIN_ROTATIONS = 5
export const SPIN_DURATION_MS = 5500
export const WINNER_DISPLAY_DELAY_MS = 300

export const STORAGE_KEY = 'wheel-picker-entries'

// Names that always win when present in the pool (displayed openly in the UI)
export const PRIORITY_NAMES = ['lia', 'ori', 'bazi', 'lea']
