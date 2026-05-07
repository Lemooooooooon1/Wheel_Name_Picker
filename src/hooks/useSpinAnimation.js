// src/hooks/useSpinAnimation.js
import { useRef, useCallback } from 'react'
import { computeTargetAngle } from '../utils/wheel'
import { playTick } from '../utils/sound'

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4)
}

export function useSpinAnimation({ onComplete, soundEnabled }) {
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const startAngleRef = useRef(0)
  const targetAngleRef = useRef(0)
  const durationRef = useRef(4500)
  const lastTickAngleRef = useRef(0)
  const tickIntervalRef = useRef(Math.PI / 8)

  const currentAngleRef = useRef(0)

  const cancel = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const spin = useCallback(
    (winnerIndex, totalEntries, onFrame, duration = 4500) => {
      cancel()

      const startAngle = currentAngleRef.current
      const targetAngle = computeTargetAngle(winnerIndex, totalEntries, startAngle)

      startAngleRef.current = startAngle
      targetAngleRef.current = targetAngle
      durationRef.current = duration
      startTimeRef.current = null
      lastTickAngleRef.current = startAngle

      // Adaptive tick interval based on segment count
      tickIntervalRef.current = totalEntries > 10
        ? Math.PI / 12
        : Math.PI / 8

      function frame(timestamp) {
        if (!startTimeRef.current) startTimeRef.current = timestamp

        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / durationRef.current, 1)
        const eased = easeOut(progress)

        const angle =
          startAngleRef.current +
          (targetAngleRef.current - startAngleRef.current) * eased

        currentAngleRef.current = angle

        // Tick sound on each segment crossing
        const normalizedAngle = angle % (2 * Math.PI)
        const tickDelta = normalizedAngle - (lastTickAngleRef.current % (2 * Math.PI))
        if (Math.abs(tickDelta) >= tickIntervalRef.current) {
          if (soundEnabled) playTick()
          lastTickAngleRef.current = normalizedAngle
        }

        onFrame(angle)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          currentAngleRef.current = targetAngleRef.current
          onFrame(targetAngleRef.current)
          onComplete()
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    },
    [cancel, onComplete, soundEnabled]
  )

  return { spin, cancel, currentAngleRef }
}
