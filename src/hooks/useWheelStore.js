// src/hooks/useWheelStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_NAMES, STORAGE_KEY } from '../constants'

let idCounter = 100

function makeId() {
  return `entry-${Date.now()}-${idCounter++}`
}

function makeEntry(name) {
  return { id: makeId(), name: name.trim() }
}

export const useWheelStore = create(
  persist(
    (set, get) => ({
      entries: DEFAULT_NAMES.map(makeEntry),
      isSpinning: false,
      winner: null,
      winnerId: null,
      showWinnerModal: false,
      soundEnabled: true,

      addEntry: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return false
        const exists = get().entries.some(
          (e) => e.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (exists) return false
        set((s) => ({ entries: [...s.entries, makeEntry(trimmed)] }))
        return true
      },

      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
      },

      updateEntry: (id, name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, name: trimmed } : e)),
        }))
      },

      shuffleEntries: () => {
        set((s) => {
          const arr = [...s.entries]
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
          }
          return { entries: arr }
        })
      },

      clearEntries: () => {
        set({ entries: [], winner: null })
      },

      setSpinning: (v) => set({ isSpinning: v }),

      setWinner: (name) => {
        const entry = get().entries.find(
          (e) => e.name.toLowerCase() === name.toLowerCase()
        )
        set({ winner: name, winnerId: entry ? entry.id : null })
      },

      removeWinner: () => {
        const { winnerId } = get()
        if (winnerId) {
          set((s) => ({ entries: s.entries.filter((e) => e.id !== winnerId), winnerId: null }))
        }
      },

      showModal: () => set({ showWinnerModal: true }),

      hideModal: () => set({ showWinnerModal: false }),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ entries: s.entries, soundEnabled: s.soundEnabled }),
    }
  )
)
