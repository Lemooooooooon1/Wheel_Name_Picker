// src/components/WinnerModal.jsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { useWheelStore } from '../hooks/useWheelStore'

export function WinnerModal() {
  const { winner, showWinnerModal, hideModal, removeWinner, entries } = useWheelStore()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handler = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (showWinnerModal) {
      setRemoving(false)
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4500)
      return () => clearTimeout(t)
    }
  }, [showWinnerModal])

  const handleClose = () => {
    setShowConfetti(false)
    hideModal()
  }

  const handleSpinAgain = () => {
    handleClose()
    setTimeout(() => {
      document.querySelector('[data-spin-btn]')?.click()
    }, 400)
  }

  const handleRemoveAndSpin = () => {
    setRemoving(true)
    setTimeout(() => {
      removeWinner()
      handleClose()
      setTimeout(() => {
        document.querySelector('[data-spin-btn]')?.click()
      }, 500)
    }, 350)
  }

  const canRemove = entries.length > 2

  return (
    <AnimatePresence>
      {showWinnerModal && (
        <>
          {showConfetti && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={280}
              gravity={0.18}
              initialVelocityY={12}
              colors={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#22d3ee', '#f43f5e', '#fff']}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
            />
          )}

          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          >
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.65, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl p-8 text-center overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16162a 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 28px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(99,102,241,0.15)',
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 20%, rgba(99,102,241,0.22) 0%, transparent 65%)',
                }}
              />

              {/* Trophy with pop entrance */}
              <motion.div
                initial={{ scale: 0, rotate: -25, y: 10 }}
                animate={removing
                  ? { scale: 0.7, opacity: 0.4 }
                  : { scale: [0, 1.25, 0.9, 1.05, 1], rotate: [0, 8, -5, 3, 0] }
                }
                transition={removing
                  ? { duration: 0.3 }
                  : { duration: 0.7, delay: 0.15, times: [0, 0.4, 0.65, 0.82, 1] }
                }
                className="text-5xl mb-4 relative z-10"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(245,158,11,0.6))' }}
              >
                🏆
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2 relative z-10"
              >
                We have a winner
              </motion.p>

              {/* Winner name with shimmer highlight */}
              <motion.div className="relative z-10 mb-1">
                <motion.h2
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={removing
                    ? { opacity: 0, x: -20, scale: 0.85 }
                    : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={removing
                    ? { duration: 0.3 }
                    : { delay: 0.35, type: 'spring', stiffness: 240, damping: 18 }
                  }
                  className="text-3xl font-bold break-words"
                  style={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 45%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {winner}
                </motion.h2>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.48, duration: 0.55 }}
                className="w-20 h-0.5 mx-auto mt-4 mb-6 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)' }}
              />

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-col gap-2.5 relative z-10"
              >
                {/* Remove & Spin Again — primary CTA */}
                {canRemove && (
                  <motion.button
                    onClick={handleRemoveAndSpin}
                    disabled={removing}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)',
                      boxShadow: '0 4px 18px rgba(244,63,94,0.4)',
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <TrashIcon />
                      Remove &amp; Spin Again
                    </span>
                  </motion.button>
                )}

                <div className="flex gap-2.5">
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/75 transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={handleSpinAgain}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                    }}
                  >
                    Spin Again
                  </motion.button>
                </div>

                {!canRemove && entries.length === 2 && (
                  <p className="text-xs text-white/30 mt-1">
                    Need &gt;2 entries to remove and spin again
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,3.5 13,3.5" />
      <path d="M11.5 3.5V12a1 1 0 01-1 1h-7a1 1 0 01-1-1V3.5" />
      <path d="M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1" />
    </svg>
  )
}
