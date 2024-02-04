import { getMaxChroma as fnBinary } from '@/shared/lib/huelab/oklch/getMaxChroma'
import { culoriClamp } from './algoCuloriClamp'
import { getMaxChroma } from './algoOkhsl'
import {
  getMaxChroma2 as fnLUT,
  getMaxChromaHybrid2 as fnLUTHybrid,
} from './algoLUT'

export const algos = {
  okhsl: getMaxChroma,
  culoriClamp,
  lut: fnLUT,
  lutHybrid: fnLUTHybrid,
  binary: fnBinary,
}
