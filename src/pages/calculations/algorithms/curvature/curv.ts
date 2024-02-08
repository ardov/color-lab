// Define a point type
type Point = { x: number; y: number }

// Function to calculate midpoint
function midpoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

// Function to calculate slope
function slope(p1: Point, p2: Point): number {
  return (p2.y - p1.y) / (p2.x - p1.x)
}

// Function to find the perpendicular bisector
function perpendicularBisector(
  p1: Point,
  p2: Point
): { slope: number; point: Point } {
  const m = midpoint(p1, p2)
  const s = slope(p1, p2)

  // The slope of the perpendicular bisector
  const perpendicularSlope = -1 / s

  return { slope: perpendicularSlope, point: m }
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

// Function to define the arc given three points
function defineArc(point: Point) {
  const origin: Point = { x: 0, y: 0 }
  const fixedPoint: Point = { x: 1, y: 1 }

  // Calculate the perpendicular bisectors
  const bisector1 = perpendicularBisector(origin, point)
  const bisector2 = perpendicularBisector(origin, fixedPoint)

  // Find the intersection of the bisectors to get the circle center
  const center = intersection(bisector1, bisector2)

  return center
}

export function calculateCurvature(x: number, y: number): number {
  if (x === y) return 0
  const center = defineArc({ x, y })
  const radius = Math.sqrt(center.x ** 2 + center.y ** 2)
  const isPositive = center.x > center.y
  // Calculate the curvature as the inverse of the radius
  const curvature = (isPositive ? 1 : -1) / radius
  return curvature
}

export function findYForGivenX(x: number, curvature: number): number {
  if (curvature === 0) return x
  const radius = 1 / Math.abs(curvature)
  // Midpoint of the line segment from (0,0) to (1,1)
  const midpoint = { x: 0.5, y: 0.5 }

  // Distance from midpoint to any of the points (0,0) or (1,1)
  const halfDiagonal = Math.sqrt(
    Math.pow(midpoint.x, 2) + Math.pow(midpoint.y, 2)
  )

  // Distance from midpoint to the center (using Pythagorean theorem)
  const distanceToCenter = Math.sqrt(
    Math.pow(radius, 2) - Math.pow(halfDiagonal, 2)
  )

  // Since the bisector's slope is -1, the line is at 45 degrees, so the offsets for h and k are equal
  const offset = distanceToCenter / Math.sqrt(2)

  // Possible centers of the circle
  const h = (curvature > 0 ? offset : -offset) + midpoint.x
  const k = (curvature > 0 ? -offset : offset) + midpoint.y

  // Calculate y for given x for each possible center
  const underRoot = radius * radius - (x - h) * (x - h)

  // If the value under the square root is negative, no solution exists for this center
  if (underRoot < 0) {
    return 0
  }
  const sqrtVal = Math.sqrt(underRoot)
  const res1 = k + sqrtVal
  if (res1 >= 0 && res1 <= 1) {
    return res1
  } else {
    return k - sqrtVal
  }
}

// console.clear()
// const p = { x: 0.44, y: 0.6 }
// const curvature = calculateCurvature(p.x, p.y)
// const y = findYForGivenX(p.x, curvature)
// console.log('Curvature:', curvature)
// console.log('y:', y, 'Expected:', p.y)
