// src/components/WheelCanvas.jsx
import React, { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
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
  const [isGlowing, setIsGlowing] = useState(false)

  const {
    entries,
    isSpinning,
    soundEnabled,
    setSpinning,
    setWinner,
    showModal,
  } = useWheelStore()

  const segmentsRef = useRef([])

  const handleSpinComplete = useCallback(() => {
    const seg = segmentsRef.current.find((s) => s.name === winnerNameRef.current)
    setSpinning(false)
    setIsGlowing(true)
    if (soundEnabled) playWinnerSound()
    setTimeout(() => {
      showModal()
      setIsGlowing(false)
    }, 350)
  }, [setSpinning, showModal, soundEnabled])

  const winnerNameRef = useRef(null)

  const { spin, currentAngleRef } = useSpinAnimation({
    onComplete: handleSpinComplete,
    soundEnabled,
  })

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
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
    setWinner(winner)
    setSpinning(true)

    const winnerIndex = entries.findIndex(
      (e) => e.name.toLowerCase() === winner.toLowerCase()
    )

    spin(
      winnerIndex,
      entries.length,
      (angle) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const segments = computeSegments(entries)
        drawWheel(canvas, segments, angle, null)
      },
      SPIN_DURATION_MS
    )
  }, [isSpinning, entries, spin, setSpinning, setWinner])

  const canSpin = entries.length >= 2 && !isSpinning

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <motion.div
          animate={{
            opacity: isSpinning ? [0.3, 0.7, 0.3] : isGlowing ? 1 : 0,
            scale: isGlowing ? [1, 1.04, 1] : 1,
          }}
          transition={{
            duration: isSpinning ? 1.5 : 0.5,
            repeat: isSpinning ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: isGlowing
              ? '0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(99,102,241,0.3)'
              : '0 0 40px rgba(99,102,241,0.2)',
            borderRadius: '50%',
            width: size + 20,
            height: size + 20,
            left: -10,
            top: -10,
          }}
        />

        {/* Pointer */}
        <div
          className="absolute z-10 no-select"
          style={{
            top: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 2px 8px rgba(244,63,94,0.8))',
          }}
        >
          <svg width="24" height="36" viewBox="0 0 24 36">
            <polygon
              points="12,2 22,18 12,30 2,18"
              fill="#f43f5e"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="18" r="4" fill="white" fillOpacity="0.9" />
          </svg>
        </div>

        {/* Canvas */}
        <motion.canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="rounded-full cursor-pointer"
          whileHover={canSpin ? { scale: 1.01 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={!isSpinning ? handleSpin : undefined}
        />
      </div>

      {/* Spin Button */}
      <SpinButton onSpin={handleSpin} canSpin={canSpin} isSpinning={isSpinning} />
    </div>
  )
}

function SpinButton({ onSpin, canSpin, isSpinning }) {
  return (
    <motion.button
      onClick={onSpin}
      disabled={!canSpin}
      whileHover={canSpin ? { scale: 1.04, y: -2 } : {}}
      whileTap={canSpin ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative overflow-hidden px-10 py-3.5 rounded-2xl font-semibold text-base tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 no-select"
      style={{
        background: canSpin
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          : 'rgba(99,102,241,0.3)',
        boxShadow: canSpin
          ? '0 4px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.3)'
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
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
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
