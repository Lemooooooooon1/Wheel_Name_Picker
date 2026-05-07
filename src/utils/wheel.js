// src/utils/wheel.js
import { WHEEL_COLORS } from '../constants'

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
  const targetSegmentCenter = winnerIndex * segmentAngle + segmentAngle / 2
  const baseAngle = -Math.PI / 2 - targetSegmentCenter
  const normalizedBase = ((baseAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  const extraRotations = 5 * 2 * Math.PI
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
  const radius = Math.min(cx, cy) - 14

  ctx.clearRect(0, 0, width, height)

  if (segments.length === 0) {
    drawEmptyState(ctx, cx, cy, radius)
    return
  }

  // ── Outer decorative rim ─────────────────────────────────────────────────
  drawOuterRim(ctx, cx, cy, radius)

  // ── Segments ─────────────────────────────────────────────────────────────
  segments.forEach((seg) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotationAngle)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius - 6, seg.startAngle, seg.endAngle)
    ctx.closePath()

    // Radial gradient: lighter at center, richer at edge
    const gradient = ctx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius - 6)
    gradient.addColorStop(0, lightenColor(seg.color, 55))
    gradient.addColorStop(0.45, lightenColor(seg.color, 20))
    gradient.addColorStop(1, seg.color)
    ctx.fillStyle = gradient
    ctx.fill()

    // Segment divider lines (spokes)
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.restore()
  })

  // ── Spokes ───────────────────────────────────────────────────────────────
  drawSpokes(ctx, cx, cy, radius, segments, rotationAngle)

  // ── Inner shadow ring ────────────────────────────────────────────────────
  ctx.save()
  ctx.translate(cx, cy)
  const innerShadow = ctx.createRadialGradient(0, 0, radius - 30, 0, 0, radius - 4)
  innerShadow.addColorStop(0, 'transparent')
  innerShadow.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.beginPath()
  ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI)
  ctx.fillStyle = innerShadow
  ctx.fill()
  ctx.restore()

  // ── Labels ───────────────────────────────────────────────────────────────
  segments.forEach((seg) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotationAngle + seg.midAngle)

    const labelRadius = (radius - 6) * 0.64
    const fontSize = computeFontSize(seg.segmentAngle, radius, segments.length)

    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.97)'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 5
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const label = truncateLabel(seg.name, segments.length)
    ctx.fillText(label, labelRadius, 0)

    ctx.restore()
  })

  // ── Center hub ───────────────────────────────────────────────────────────
  drawCenterHub(ctx, cx, cy)
}

function drawOuterRim(ctx, cx, cy, radius) {
  ctx.save()
  ctx.translate(cx, cy)

  // Outer metallic band
  const rimGrad = ctx.createRadialGradient(0, -radius * 0.1, radius * 0.88, 0, 0, radius + 8)
  rimGrad.addColorStop(0, '#5a5a7a')
  rimGrad.addColorStop(0.4, '#3a3a55')
  rimGrad.addColorStop(0.7, '#2a2a42')
  rimGrad.addColorStop(1, '#1e1e32')

  ctx.beginPath()
  ctx.arc(0, 0, radius + 6, 0, 2 * Math.PI)
  ctx.fillStyle = rimGrad
  ctx.fill()

  // Outer glow ring
  ctx.beginPath()
  ctx.arc(0, 0, radius + 8, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(99,102,241,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Tick marks around the rim
  const tickCount = 72
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * 2 * Math.PI
    const isMajor = i % 9 === 0
    const innerR = isMajor ? radius + 1 : radius + 2
    const outerR = radius + 6
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(cos * innerR, sin * innerR)
    ctx.lineTo(cos * outerR, sin * outerR)
    ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'
    ctx.lineWidth = isMajor ? 2 : 1
    ctx.stroke()
  }

  ctx.restore()
}

function drawSpokes(ctx, cx, cy, radius, segments, rotationAngle) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotationAngle)

  const hubR = 28

  segments.forEach((seg) => {
    const angle = seg.startAngle
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // Spoke shadow
    ctx.beginPath()
    ctx.moveTo(cos * (hubR + 2), sin * (hubR + 2))
    ctx.lineTo(cos * (radius - 7), sin * (radius - 7))
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // Spoke highlight
    ctx.beginPath()
    ctx.moveTo(cos * (hubR + 2), sin * (hubR + 2))
    ctx.lineTo(cos * (radius - 7), sin * (radius - 7))

    const spokeGrad = ctx.createLinearGradient(
      cos * hubR, sin * hubR,
      cos * (radius - 7), sin * (radius - 7)
    )
    spokeGrad.addColorStop(0, 'rgba(180,180,220,0.9)')
    spokeGrad.addColorStop(0.5, 'rgba(120,120,170,0.6)')
    spokeGrad.addColorStop(1, 'rgba(80,80,120,0.4)')

    ctx.strokeStyle = spokeGrad
    ctx.lineWidth = 2.5
    ctx.stroke()
  })

  ctx.restore()
}

function drawCenterHub(ctx, cx, cy) {
  ctx.save()
  ctx.translate(cx, cy)

  const hubR = 28

  // Outer hub ring shadow
  ctx.beginPath()
  ctx.arc(0, 0, hubR + 3, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fill()

  // Hub body - metallic gradient
  const hubGrad = ctx.createRadialGradient(-hubR * 0.3, -hubR * 0.3, 2, 0, 0, hubR)
  hubGrad.addColorStop(0, '#8888bb')
  hubGrad.addColorStop(0.3, '#5555aa')
  hubGrad.addColorStop(0.6, '#3a3a7a')
  hubGrad.addColorStop(1, '#1e1e4a')

  ctx.beginPath()
  ctx.arc(0, 0, hubR, 0, 2 * Math.PI)
  ctx.fillStyle = hubGrad
  ctx.fill()

  // Hub border
  ctx.beginPath()
  ctx.arc(0, 0, hubR, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(150,150,220,0.7)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Inner ring detail
  ctx.beginPath()
  ctx.arc(0, 0, hubR * 0.6, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Center bolt
  const boltGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 9)
  boltGrad.addColorStop(0, '#c0c0ff')
  boltGrad.addColorStop(0.5, '#7070dd')
  boltGrad.addColorStop(1, '#3030aa')

  ctx.beginPath()
  ctx.arc(0, 0, 9, 0, 2 * Math.PI)
  ctx.fillStyle = boltGrad
  ctx.fill()

  ctx.beginPath()
  ctx.arc(0, 0, 9, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1.5
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
