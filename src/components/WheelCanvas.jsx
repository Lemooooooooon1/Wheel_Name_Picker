// src/components/WheelCanvas.jsx
import React, { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { computeSegments, drawWheel } from '../utils/wheel'
import { resolveOutcome } from '../utils/selection'
import { useSpinAnimation } from '../hooks/useSpinAnimation'
import { useWheelStore } from '../hooks/useWheelStore'
import { playWinnerSound } from '../utils/sound'
import { SPIN_DURATION_MS } from '../constants'

export function WheelCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [size, setSize] = useState(460)
  const [glowState, setGlowState] = useState('idle') // idle | spinning | winner

  const {
    entries,
    isSpinning,
    soundEnabled,
    setSpinning,
    setWinner,
    clearWinner,
    showModal,
  } = useWheelStore()

  const segmentsRef = useRef([])
  const winnerNameRef = useRef(null)

  const handleSpinComplete = useCallback(() => {
    setSpinning(false)
    setGlowState('winner')
    setWinner(winnerNameRef.current)
    if (soundEnabled) playWinnerSound()
    setTimeout(() => {
      showModal()
      setTimeout(() => setGlowState('idle'), 600)
    }, 400)
  }, [setSpinning, setWinner, showModal, soundEnabled])

  const { spin, currentAngleRef } = useSpinAnimation({
    onComplete: handleSpinComplete,
    soundEnabled,
  })

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver((resizeEntries) => {
      for (const entry of resizeEntries) {
        const w = entry.contentRect.width
        setSize(Math.min(w, 520))
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const segments = computeSegments(entries)
    segmentsRef.current = segments

    drawWheel(canvas, segments, currentAngleRef.current, null)
  }, [entries, size, currentAngleRef])

  const handleSpin = useCallback(() => {
    if (isSpinning || entries.length < 2) return

    const winner = resolveOutcome(entries)
    if (!winner) return

    winnerNameRef.current = winner
    clearWinner()
    setSpinning(true)
    setGlowState('spinning')

    const winnerIndex = entries.findIndex(
      (e) => e.name.toLowerCase() === winner.toLowerCase()
    )

    const segments = computeSegments(entries)
    segmentsRef.current = segments

    spin(
      winnerIndex,
      entries.length,
      (angle) => {
        const canvas = canvasRef.current
        if (!canvas) return
        drawWheel(canvas, segmentsRef.current, angle, null)
      },
      SPIN_DURATION_MS
    )
  }, [isSpinning, entries, spin, setSpinning, clearWinner])

  const canSpin = entries.length >= 2 && !isSpinning

  const glowColor = glowState === 'winner'
    ? '0 0 70px rgba(251,191,36,0.55), 0 0 140px rgba(245,158,11,0.25)'
    : glowState === 'spinning'
    ? '0 0 50px rgba(99,102,241,0.4), 0 0 100px rgba(99,102,241,0.2)'
    : '0 0 24px rgba(99,102,241,0.12)'

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <motion.div
          animate={{
            opacity: glowState === 'spinning' ? [0.4, 0.8, 0.4] : glowState === 'winner' ? [0.8, 1, 0.8] : 0.3,
            scale: glowState === 'winner' ? [1, 1.06, 1] : 1,
          }}
          transition={{
            duration: glowState === 'spinning' ? 1.2 : 0.6,
            repeat: glowState === 'spinning' ? Infinity : glowState === 'winner' ? 3 : 0,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            boxShadow: glowColor,
            borderRadius: '50%',
            width: size + 24,
            height: size + 24,
            left: -12,
            top: -12,
          }}
        />

        {/* Pointer — game-show style arrow pointing down into the wheel */}
        <motion.div
          className="absolute z-10 no-select"
          animate={glowState === 'winner' ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.5, repeat: glowState === 'winner' ? 2 : 0, ease: 'easeInOut' }}
          style={{
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 3px 10px rgba(244,63,94,0.9))',
          }}
        >
          <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
            {/* Outer pin body */}
            <path
              d="M14 2 C14 2 26 14 26 22 C26 30 20 40 14 42 C8 40 2 30 2 22 C2 14 14 2 14 2Z"
              fill="url(#pinGrad)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Highlight */}
            <ellipse cx="10" cy="14" rx="3.5" ry="5.5" fill="rgba(255,255,255,0.25)" transform="rotate(-15 10 14)" />
            {/* Center dot */}
            <circle cx="14" cy="24" r="4" fill="rgba(255,255,255,0.9)" />
            <defs>
              <linearGradient id="pinGrad" x1="14" y1="2" x2="14" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff6b8a" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Canvas */}
        <motion.canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="rounded-full cursor-pointer"
          whileHover={canSpin ? { scale: 1.012 } : {}}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={!isSpinning ? handleSpin : undefined}
        />

        {/* Winner flash overlay */}
        <AnimatePresence>
          {glowState === 'winner' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, times: [0, 0.3, 1] }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Spin Button */}
      <SpinButton onSpin={handleSpin} canSpin={canSpin} isSpinning={isSpinning} />
    </div>
  )
}

function SpinButton({ onSpin, canSpin, isSpinning }) {
  return (
    <motion.button
      data-spin-btn
      onClick={onSpin}
      disabled={!canSpin}
      whileHover={canSpin ? { scale: 1.05, y: -3 } : {}}
      whileTap={canSpin ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
      className="relative overflow-hidden px-10 py-3.5 rounded-2xl font-semibold text-base tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 no-select"
      style={{
        background: canSpin
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          : 'rgba(99,102,241,0.3)',
        boxShadow: canSpin
          ? '0 4px 28px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.3)'
          : 'none',
        color: '#fff',
      }}
    >
      {isSpinning ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Spinning…
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <WheelIcon />
          Spin the Wheel
        </span>
      )}
      {canSpin && (
        <motion.div
          className="absolute inset-0 shimmer"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.button>
  )
}

function SpinnerIcon() {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  )
}

function WheelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill="white" />
      <line x1="8" y1="1" x2="8" y2="5.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="10.5" x2="8" y2="15" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="5.5" y2="8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="8" x2="15" y2="8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
