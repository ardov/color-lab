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
export function defineArc(point: Point) {
  const origin: Point = { x: 0, y: 0 }
  const fixedPoint: Point = { x: 1, y: 1 }

  // Calculate the perpendicular bisectors
  const bisector1 = perpendicularBisector(origin, point)
  const bisector2 = perpendicularBisector(origin, fixedPoint)

  // Find the intersection of the bisectors to get the circle center
  const center = intersection(bisector1, bisector2)

  return center
}

// This function calculates the corresponding y-coordinate on the arc for a given x-coordinate.
export function findYOnArc(
  centerX: number,
  centerY: number,
  x: number
): number | null {
  const radius = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))

  // Check if the x is within the circle's bounds
  if (x < centerX - radius || x > centerX + radius) {
    console.log('The given x-coordinate is not within the bounds of the arc.')
    return null
  }

  // Calculate the corresponding y-coordinate using the circle equation (x-h)^2 + (y-k)^2 = r^2
  // We solve for y: y = k ± √(r^2 - (x-h)^2)
  // Since we want the arc leading towards (1,1), we use the positive square root
  const y =
    centerY < 0
      ? centerY + Math.sqrt(radius * radius - (x - centerX) * (x - centerX))
      : centerY - Math.sqrt(radius * radius - (x - centerX) * (x - centerX))

  // Check if the calculated y is valid (it must be between 0 and 1 for our case)
  if (y < 0 || y > 1) {
    console.log(
      'The calculated y-coordinate is not within the bounds of the arc.'
    )
    return null
  }

  return y
}
