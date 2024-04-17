import { lazy } from 'react'

export const paths: {
  name: string
  description: string
  path: string
  component: React.LazyExoticComponent<React.ComponentType<any>>
  hidden?: boolean
}[] = [
  {
    name: 'Themer',
    description: 'Theme generator',
    path: '/themer',
    component: lazy(() => import('@/pages/themer')),
  },
  {
    name: 'P3 Space',
    description: 'A canvas to play with a slice of P3 color space',
    path: '/p3-space',
    component: lazy(() => import('@/pages/p3-space')),
  },
  {
    name: 'Splitter',
    description: 'Experiments with images',
    path: '/splitter',
    component: lazy(() => import('@/pages/splitter')),
  },
  {
    name: 'Harmony',
    description: 'Generator of color hues for errors, warnings, and successes',
    path: '/harmony',
    component: lazy(() => import('@/pages/harmony')),
  },
  {
    name: 'Spaces (divs)',
    description: 'Color space visualizations made with divs and CSS transforms',
    path: '/spaces',
    component: lazy(() => import('@/pages/space')),
  },
  {
    name: 'Spaces (3D)',
    description: 'Color space visualizations made with WebGL',
    path: '/spaces-3d',
    component: lazy(() => import('@/pages/spaces3d')),
  },
  {
    name: 'Sliders',
    description: 'Slider controls',
    path: '/sliders',
    component: lazy(() => import('@/pages/controls')),
  },
  {
    name: 'Picker',
    description: 'Color picker',
    path: '/picker',
    component: lazy(() => import('@/pages/picker')),
  },
  {
    name: 'Gamut mapping',
    description: 'A playground to test differrent gamut mapping algorithms',
    path: '/gamut-mapping',
    component: lazy(() => import('@/pages/calculations')),
    // hidden: true,
  },
  {
    name: 'Resizer',
    description: 'A playground to test differrent gamut mapping algorithms',
    path: '/resizer',
    component: lazy(() => import('@/pages/resizer')),
    hidden: true,
  },
  // {
  //   name: 'HDR',
  //   description: 'Experiments with HDR color spaces',
  //   path: '/hdr',
  //   component: lazy(() => import('@/pages/hdr')),
  // },
]
