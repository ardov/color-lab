import { getMaxChroma as fnBinary } from '@/shared/lib/huelab/oklch/getMaxChroma'
import { culoriClamp } from './algoCuloriClamp'
import { getMaxChroma } from './algoOkhsl'
import { getEdge } from '@/shared/lib/huelab/gamut-mapping'

export const algos = {
  okhsl: getMaxChroma,
  culoriClamp,
  binary: fnBinary,
  wrappedAlgorithm: getEdge,
}
