import { OKLCH } from '../utils'

export function calculateCurvatureFromColors(
  peakColor: OKLCH,
  curveColor: OKLCH
) {
  // Normailze the point on curve
  const x = (1 - curveColor.l) / (1 - peakColor.l)
  const y = curveColor.c / peakColor.c

  if (x === y) return 0 // straight line
  const origin: Point = { x: 0, y: 0 }
  const fixedPoint: Point = { x: 1, y: 1 }

  // Calculate the perpendicular bisectors
  const bisector1 = perpendicularBisector(origin, { x, y })
  const bisector2 = perpendicularBisector(origin, fixedPoint)
  const center = intersection(bisector1, bisector2)
  const radius = Math.sqrt(center.x ** 2 + center.y ** 2)
  const curvature = 1 / radius
  if (center.x < center.y) return -curvature
  return curvature
}

type Point = { x: number; y: number }

function perpendicularBisector(p1: Point, p2: Point) {
  return {
    // The slope of the perpendicular bisector
    slope: -1 / ((p2.y - p1.y) / (p2.x - p1.x)),
    // The mid point of the line segment
    point: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } as Point,
  }
}

// Function to find the intersection of two lines
function intersection(
  line1: { slope: number; point: Point },
  line2: { slope: number; point: Point }
): Point {
  // Using the equations y - y1 = m(x - x1) for each line
  const { slope: m1, point: p1 } = line1
  const { slope: m2, point: p2 } = line2

  const x = (m1 * p1.x - m2 * p2.x + p2.y - p1.y) / (m1 - m2)
  const y = m1 * (x - p1.x) + p1.y

  return { x, y }
}
