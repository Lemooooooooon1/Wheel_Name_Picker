// src/utils/wheel.js
import { WHEEL_COLORS, SPIN_MIN_ROTATIONS } from '../constants'

export function getSegmentColor(index, total) {
  return WHEEL_COLORS[index % WHEEL_COLORS.length]
}

export function computeSegments(entries) {
  if (!entries || entries.length === 0) return []
  const segmentAngle = (2 * Math.PI) / entries.length
  return entries.map((entry, i) => ({
    ...entry,
    index: i,
    startAngle: i * segmentAngle,
    endAngle: (i + 1) * segmentAngle,
    midAngle: (i + 0.5) * segmentAngle,
    color: getSegmentColor(i, entries.length),
    segmentAngle,
  }))
}

export function computeTargetAngle(winnerIndex, totalEntries, currentAngle) {
  const segmentAngle = (2 * Math.PI) / totalEntries

  // The pointer is at the top (270° or -Math.PI/2 in canvas coords).
  // We want the winner's midAngle to align with the pointer.
  // The wheel rotates clockwise; the pointer is fixed.
  // When the wheel is at rotation R, segment i's midAngle in screen space
  // is: R + i * segmentAngle + segmentAngle/2
  // We want that to equal -Math.PI/2 (top/pointer position).
  // => R = -Math.PI/2 - (winnerIndex * segmentAngle + segmentAngle/2)

  const targetSegmentCenter = winnerIndex * segmentAngle + segmentAngle / 2
  const baseAngle = -Math.PI / 2 - targetSegmentCenter

  // Normalize baseAngle to [0, 2π]
  const normalizedBase = ((baseAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  // Add minimum full rotations to current angle
  const extraRotations = SPIN_MIN_ROTATIONS * 2 * Math.PI
  const currentNorm = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  let delta = normalizedBase - currentNorm
  if (delta <= 0) delta += 2 * Math.PI

  return currentAngle + extraRotations + delta
}

export function drawWheel(canvas, segments, rotationAngle, hoveredSegment) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(cx, cy) - 8

  ctx.clearRect(0, 0, width, height)

  if (segments.length === 0) {
    drawEmptyState(ctx, cx, cy, radius)
    return
  }

  segments.forEach((seg) => {
    const isHovered = hoveredSegment === seg.index
    const r = isHovered ? radius + 4 : radius

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotationAngle)

    // Segment fill
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, seg.startAngle, seg.endAngle)
    ctx.closePath()

    const gradient = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r)
    gradient.addColorStop(0, lightenColor(seg.color, 30))
    gradient.addColorStop(1, seg.color)
    ctx.fillStyle = gradient
    ctx.fill()

    // Segment border
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()
  })

  // Draw labels
  segments.forEach((seg) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotationAngle + seg.midAngle)

    const labelRadius = radius * 0.62
    const fontSize = computeFontSize(seg.segmentAngle, radius, segments.length)

    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 4
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const label = truncateLabel(seg.name, segments.length)
    ctx.fillText(label, labelRadius, 0)

    ctx.restore()
  })

  // Center hub
  ctx.save()
  ctx.translate(cx, cy)

  const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 22)
  hubGrad.addColorStop(0, '#2d2d3d')
  hubGrad.addColorStop(1, '#1a1a28')

  ctx.beginPath()
  ctx.arc(0, 0, 22, 0, 2 * Math.PI)
  ctx.fillStyle = hubGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(99,102,241,0.6)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Center dot
  ctx.beginPath()
  ctx.arc(0, 0, 7, 0, 2 * Math.PI)
  ctx.fillStyle = '#6366f1'
  ctx.fill()

  ctx.restore()

  // Outer ring
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(99,102,241,0.2)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawEmptyState(ctx, cx, cy, radius) {
  ctx.save()
  ctx.translate(cx, cy)

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  grad.addColorStop(0, 'rgba(99,102,241,0.08)')
  grad.addColorStop(1, 'rgba(99,102,241,0.02)')

  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, 2 * Math.PI)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = 'rgba(99,102,241,0.15)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.font = '500 16px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Add names to begin', 0, 0)

  ctx.restore()
}

function computeFontSize(segmentAngle, radius, total) {
  if (total <= 4) return 14
  if (total <= 8) return 12
  if (total <= 12) return 10
  if (total <= 18) return 9
  return 8
}

function truncateLabel(name, total) {
  const maxLen = total <= 6 ? 14 : total <= 12 ? 10 : 7
  return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}
