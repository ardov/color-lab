import { getMaxChroma as fnBinary } from '@/shared/lib/huelab/oklch/getMaxChroma'
import { culoriClamp } from './algoCuloriClamp'
import { getMaxChroma } from './algoOkhsl'
import { algoLUT } from './algoLUT'
import { algoLUTHybrid } from './algoLUTHybrid'
import { algoExtendedLUT } from './algoExtendedLUT'
import { algoArcLUT } from './algoArcLUT'
import { algoCurvLUT } from './curvature/algoCurvLUT'

export const algos = {
  okhsl: getMaxChroma,
  culoriClamp,
  lut: algoLUT,
  lutHybrid: algoLUTHybrid,
  binary: fnBinary,
  algoExtendedLUT,
  algoArcLUT,
  algoCurvLUT,
}
