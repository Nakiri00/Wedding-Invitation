import {
  BoxGeometry, Color, Float32BufferAttribute, InstancedMesh, MeshBasicMaterial,
  Object3D, OrthographicCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three'
import { buildGardenBoxes, readQrMatrix } from './sakuraQrGeometry'

export interface SakuraQrScene {
  rotateTo: (degrees: number) => void
  dispose: () => void
}

export function createSakuraQrScene(canvas: HTMLCanvasElement, image: HTMLImageElement, onRest: () => void): SakuraQrScene {
  const sample = document.createElement('canvas')
  sample.width = image.naturalWidth
  sample.height = image.naturalHeight
  const context = sample.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas tidak tersedia.')
  context.drawImage(image, 0, 0)
  const qr = readQrMatrix(context.getImageData(0, 0, sample.width, sample.height).data, sample.width, sample.height)
  const boxes = buildGardenBoxes(qr)
  const n = qr.length
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0xffffff, 1)
  const geometry = new BoxGeometry(1, 1, 1)
  const normals = geometry.getAttribute('normal')
  const faceColors: number[] = []
  const qrSideShade = 0.3

  for (let i = 0; i < normals.count; i++) {
    const isQrFace = Math.abs(normals.getX(i)) > 0.5
    const isHorizontalFace = Math.abs(normals.getY(i)) > 0.5

    const shade = isQrFace
      ? qrSideShade
      : isHorizontalFace
        ? 0.65
        : 1

    faceColors.push(shade, shade, shade)
  }

  geometry.setAttribute(
    'color',
    new Float32BufferAttribute(faceColors, 3),
  )
  const material = new MeshBasicMaterial({ vertexColors: true })
  const sculpture = new InstancedMesh(geometry, material, boxes.length)
  const transform = new Object3D()
  const color = new Color()
  boxes.forEach((box, i) => {
    transform.position.set(box.x, box.y, box.z)
    transform.scale.set(box.width, box.height, box.depth)
    transform.updateMatrix()
    sculpture.setMatrixAt(i, transform.matrix)
    sculpture.setColorAt(i, color.setHex(box.color))
  })
  sculpture.instanceMatrix.needsUpdate = true
  if (sculpture.instanceColor) sculpture.instanceColor.needsUpdate = true
  sculpture.computeBoundingSphere()
  const scene = new Scene()
  scene.add(sculpture)
  const camera = new OrthographicCamera(-n, n, n, -n, .1, n * 8)
  camera.position.set(0, 0, n * 3)
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let angle = 0, frame = 0, disposed = false

  const draw = () => {
    if (disposed) return
    const radians = angle * Math.PI / 180
    sculpture.rotation.y = radians
    // Fit the rotated volume, preserving at least four white modules on each edge.
    const half = (n * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) + 8) / 2
    camera.left = -half; camera.right = half; camera.top = half; camera.bottom = -half
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  const resize = () => {
    const size = Math.max(1, Math.round(canvas.getBoundingClientRect().width))
    renderer.setSize(size, size, false)
    draw()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  return {
    rotateTo(degrees) {
      cancelAnimationFrame(frame)
      const target = Math.max(0, Math.min(90, degrees))
      if (motion.matches || Math.abs(target - angle) < .01) {
        angle = target; draw(); onRest(); return
      }
      const startAngle = angle
      const started = performance.now()
      const duration = 850 * Math.abs(target - startAngle) / 90
      const tick = (now: number) => {
        if (disposed) return
        const progress = Math.min(1, (now - started) / duration)
        const eased = progress * progress * (3 - 2 * progress)
        angle = progress === 1 ? target : startAngle + (target - startAngle) * eased
        draw()
        if (progress < 1) frame = requestAnimationFrame(tick)
        else onRest()
      }
      frame = requestAnimationFrame(tick)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      sculpture.dispose(); geometry.dispose(); material.dispose(); renderer.dispose()
    },
  }
}
