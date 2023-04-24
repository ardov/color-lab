/** Finds lowest number in a given range  that returns true */
export function findLowest(
  checker: (n: number) => boolean,
  range: [number, number] = [0, 1],
  threshold: number = 0.0001
): number {
  if (checker(range[0])) return range[0]
  let start = range[0]
  let end = range[1]
  let midle = (start + end) / 2

  while (end - start > threshold) {
    if (checker(midle)) end = midle
    else start = midle
    midle = (start + end) / 2
  }
  return end
}

/** Finds highest number in a given range that returns true */
export function findHighest(
  checker: (n: number) => boolean,
  range: [number, number] = [0, 1],
  threshold: number = 0.0001
): number {
  if (checker(range[1])) return range[1]
  let start = range[0]
  let end = range[1]
  let midle = (start + end) / 2

  while (end - start > threshold) {
    if (checker(midle)) start = midle
    else end = midle
    midle = (start + end) / 2
  }
  return start
}
