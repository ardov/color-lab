import type { BoundaryType } from './spaces'
import * as THREE from 'three'
import { Box, Cylinder } from '@react-three/drei'
import { useEffect, useRef } from 'react'

type BoundaryProps = {
  type?: BoundaryType
  mx?: THREE.Matrix4
}

const boundaryMaterial = new THREE.MeshBasicMaterial({
  color: 'red',
  wireframe: true,
})

export function Boundary(props: BoundaryProps) {
  const { type, mx } = props
  const mesh = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (mesh.current && mx) {
      mesh.current.applyMatrix4(mx)
    }
  }, [mesh, mx, type])

  if (!type) return null
  if (type === 'unitBox') {
    return (
      <Box
        args={[1, 1, 1]}
        position={[0.5, 0.5, 0.5]}
        material={boundaryMaterial}
        ref={mesh}
      />
    )
  }
  if (type === 'cylinder') {
    return (
      <Cylinder
        args={[1, 1, 1, 32]}
        position={[0, 0.1, 0]}
        material={boundaryMaterial}
        ref={mesh}
      />
    )
  }
  return null
}
