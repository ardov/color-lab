import { getMaxChroma as fnBinary } from '@/shared/lib/huelab/oklch/getMaxChroma'
import { culoriClamp } from './algoCuloriClamp'
import { getMaxChroma } from './algoOkhsl'
import { algoLUT } from './algoLUT'
import { algoCurvLUT } from './curvature/algoCurvLUT'
import { wrappedAlgorithm } from './edgeSeekerWrapper'

export const algos = {
  okhsl: getMaxChroma,
  culoriClamp,
  lut: algoLUT,
  binary: fnBinary,
  algoCurvLUT,
  wrappedAlgorithm,
}
