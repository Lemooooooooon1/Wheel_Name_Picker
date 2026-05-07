// src/App.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Header } from './components/Header'
import { WheelCanvas } from './components/WheelCanvas'
import { EntryPanel } from './components/EntryPanel'
import { WinnerModal } from './components/WinnerModal'
import { useWheelStore } from './hooks/useWheelStore'

export default function App() {
  const { winner } = useWheelStore()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Ambient background blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            top: '-200px',
            left: '-200px',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-150px',
            right: '-100px',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            top: '40%',
            right: '20%',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Left: Wheel area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                className="flex-1 flex flex-col items-center gap-6 w-full"
              >
                {/* Winner banner (when not modal) */}
                <WinnerBanner />

                <WheelCanvas />
              </motion.div>

              {/* Right: Side panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="w-full lg:w-80 xl:w-96 flex-shrink-0"
              >
                <div
                  className="rounded-2xl p-5 h-full"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(8px)',
                    minHeight: '500px',
                  }}
                >
                  <EntryPanel />
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="py-4 px-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-xs text-white/15">
            Add names · Spin the wheel · Discover your winner
          </p>
        </footer>
      </div>

      <WinnerModal />
    </div>
  )
}

function WinnerBanner() {
  const { winner, showWinnerModal } = useWheelStore()

  if (!winner || showWinnerModal) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <span className="text-sm">🏆</span>
      <span className="text-xs font-medium text-white/50">Last winner:</span>
      <span className="text-xs font-semibold text-indigo-300">{winner}</span>
    </motion.div>
  )
}
