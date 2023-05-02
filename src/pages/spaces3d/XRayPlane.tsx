import { useMemo } from 'react'
import * as THREE from 'three'
import { spaces } from './spaces'

const matInGamut = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  vertexShader: `
    attribute vec3 vertColor;
    varying vec3 vColor;
    void main() {
      vColor = vertColor;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main(){
      if (vColor.r < 0.0 || vColor.r > 1.0 ||
          vColor.g < 0.0 || vColor.g > 1.0 ||
          vColor.b < 0.0 || vColor.b > 1.0) {
         gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.2 );
      }
      else {
        gl_FragColor = vec4( vColor.rgb, 1.0 );
      }
    }
  `,
})

function makePlaneGeometry(space: number, angle = 0, resolution = 80) {
  const curSpace = spaces[space]
  const geometry = new THREE.PlaneGeometry(1, 1, resolution, resolution)
  geometry.translate(0.5, 0.5, 0)
  geometry.rotateY(rad(angle))

  // geometry.translate(0, 0, -1 + angle / 100)
  // geometry.rotateZ(1)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const colors = [] as number[]

  const mx = curSpace.mx?.clone().invert()

  for (let i = 0; i < pos.count; i++) {
    const start = i * pos.itemSize
    const x = pos.array[start]
    const y = pos.array[start + 1]
    const z = pos.array[start + 2]
    const vec = new THREE.Vector4(x, y, z)

    if (mx) {
      vec.applyMatrix4(mx)
    }

    const { r, g, b } = curSpace.fromPosition(vec.x, vec.y, vec.z)

    colors.push(r, g, b)
  }

  const colorAttribute = new THREE.Float32BufferAttribute(colors, 3)
  geometry.setAttribute('vertColor', colorAttribute)
  return geometry
}

export function GamutPlane(props: { space: number; angle: number }) {
  const geometry = useMemo(
    () => makePlaneGeometry(props.space, props.angle),
    [props.angle, props.space]
  )
  return <mesh geometry={geometry} material={matInGamut} />
}

function rad(deg: number) {
  return (deg * Math.PI) / 180
}
