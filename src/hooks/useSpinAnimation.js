// src/hooks/useSpinAnimation.js
import { useRef, useCallback } from 'react'
import { computeTargetAngle } from '../utils/wheel'
import { playTick } from '../utils/sound'

// Fast start → sustain → dramatic crawl to stop
// t in [0,1], returns eased progress in [0,1]
function easeOutDramatic(t) {
  if (t < 0.6) {
    // First 60% of time: covers ~85% of distance with quartic ease-in start
    const s = t / 0.6
    return 0.85 * (1 - Math.pow(1 - s, 2.2))
  } else {
    // Last 40% of time: crawls through remaining 15% — very steep deceleration
    const s = (t - 0.6) / 0.4
    return 0.85 + 0.15 * (1 - Math.pow(1 - s, 5))
  }
}

export function useSpinAnimation({ onComplete, soundEnabled }) {
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const startAngleRef = useRef(0)
  const targetAngleRef = useRef(0)
  const durationRef = useRef(5500)
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
    (winnerIndex, totalEntries, onFrame, duration = 5500) => {
      cancel()

      const startAngle = currentAngleRef.current
      const targetAngle = computeTargetAngle(winnerIndex, totalEntries, startAngle)

      startAngleRef.current = startAngle
      targetAngleRef.current = targetAngle
      durationRef.current = duration
      startTimeRef.current = null
      lastTickAngleRef.current = startAngle

      tickIntervalRef.current = totalEntries > 10 ? Math.PI / 14 : Math.PI / 9

      function frame(timestamp) {
        if (!startTimeRef.current) startTimeRef.current = timestamp

        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / durationRef.current, 1)
        const eased = easeOutDramatic(progress)

        const angle =
          startAngleRef.current +
          (targetAngleRef.current - startAngleRef.current) * eased

        currentAngleRef.current = angle

        // Tick sound — slow down tick rate near the end to match wheel speed
        const normalizedAngle = angle % (2 * Math.PI)
        const tickDelta = normalizedAngle - (lastTickAngleRef.current % (2 * Math.PI))
        const dynamicInterval = progress > 0.75
          ? tickIntervalRef.current * (1 + (progress - 0.75) * 8)
          : tickIntervalRef.current
        if (Math.abs(tickDelta) >= dynamicInterval) {
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
