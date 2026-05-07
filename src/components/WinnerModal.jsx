// src/components/WinnerModal.jsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { useWheelStore } from '../hooks/useWheelStore'

export function WinnerModal() {
  const { winner, showWinnerModal, hideModal } = useWheelStore()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handler = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (showWinnerModal) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showWinnerModal])

  const handleClose = () => {
    setShowConfetti(false)
    hideModal()
  }

  return (
    <AnimatePresence>
      {showWinnerModal && (
        <>
          {showConfetti && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={220}
              gravity={0.22}
              colors={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#22d3ee', '#f43f5e']}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
            />
          )}

          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl p-8 text-center overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16162a 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.18) 0%, transparent 70%)',
                }}
              />

              {/* Trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
                className="text-5xl mb-4 relative z-10"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.5))' }}
              >
                🏆
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2 relative z-10"
              >
                We have a winner
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 250, damping: 20 }}
                className="text-3xl font-bold relative z-10 break-words"
                style={{
                  background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {winner}
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-16 h-0.5 mx-auto mt-4 mb-6 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }}
              />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 justify-center relative z-10"
              >
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Close
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleClose()
                    setTimeout(() => {
                      document.querySelector('[data-spin-btn]')?.click()
                    }, 400)
                  }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  }}
                >
                  Spin Again
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
