export type QrMatrix = boolean[][]

export interface GardenBox {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  color: number
}

/** Read the module grid of the axis-aligned PNG produced by our qrcode backend. */
export function readQrMatrix(pixels: ArrayLike<number>, width: number, height: number): QrMatrix {
  const dark = (x: number, y: number) => {
    const i = (y * width + x) * 4
    return pixels[i + 3] > 127 && pixels[i] + pixels[i + 1] + pixels[i + 2] < 384
  }
  let left = width, top = height, right = -1, bottom = -1
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (dark(x, y)) {
      left = Math.min(left, x); right = Math.max(right, x)
      top = Math.min(top, y); bottom = Math.max(bottom, y)
    }
  }
  if (right < left || bottom < top) throw new Error('QR tidak berisi modul yang dapat dibaca.')
  let finderWidth = 0
  while (left + finderWidth <= right && dark(left + finderWidth, top)) finderWidth++
  const estimate = 7 * (right - left + 1) / finderWidth
  const sizes = Array.from({ length: 15 }, (_, i) => 21 + i * 4)
    .sort((a, b) => Math.abs(a - estimate) - Math.abs(b - estimate))
  for (const size of sizes) {
    if (Math.abs(size - estimate) > 6 || width / size < 2) continue
    const grid = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) =>
      dark(Math.floor(left + (col + .5) * (right - left + 1) / size),
        Math.floor(top + (row + .5) * (bottom - top + 1) / size))))
    const finders = [[0, 0], [size - 7, 0], [0, size - 7]]
    const validFinders = finders.every(([ox, oy]) => {
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
        if (ox + x < 0 || oy + y < 0 || ox + x >= size || oy + y >= size) continue
        const expected = x >= 0 && x <= 6 && y >= 0 && y <= 6 &&
          (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4))
        if (grid[oy + y][ox + x] !== expected) return false
      }
      return true
    })
    const validTiming = grid.every((row, i) => i < 8 || i >= size - 8 ||
      (row[6] === (i % 2 === 0) && grid[6][i] === (i % 2 === 0)))
    if (validFinders && validTiming && grid.every((row) => row.some(Boolean))) return grid
  }
  throw new Error('Format QR tidak mendukung proyeksi 3D ini.')
}

const clusters = [
  [.49, .14, .16, .14], [.32, .23, .16, .14], [.65, .23, .17, .15],
  [.21, .36, .13, .12], [.79, .36, .12, .12], [.38, .38, .18, .15],
  [.59, .37, .18, .15], [.28, .47, .12, .09], [.70, .47, .12, .09],
]
const branches = [
  [.5, .86, .48, .56, .025], [.48, .60, .30, .40, .014],
  [.48, .68, .72, .43, .014], [.48, .58, .56, .29, .011],
]
const grass = Array.from({ length: 34 }, (_, i) => {
  const x = .065 + i * .026
  return [x, .935 + Math.sin(i * 2.3) * .018, x + Math.sin(i * 3.1) * .025, .81 + (i % 5) * .02]
})

function onBranch(x: number, y: number, ax: number, ay: number, bx: number, by: number, radius: number) {
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) < radius
}

function rgb(r: number, g: number, b: number) {
  // A small palette lets adjacent columns share one prism.
  const channel = (v: number) => Math.max(0, Math.min(255, Math.round(v / 12) * 12))
  return (channel(r) << 16) | (channel(g) << 8) | channel(b)
}

export function gardenColor(x: number, y: number): number | null {
  let color: number | null = null
  if (((x - .5) / .46) ** 2 + ((y - .946) / .054) ** 2 <= 1) {
    color = y > .954 ? rgb(111, 87, 66) : rgb(130 - x * 32, 162 - x * 30, 96 - x * 24)
  }
  if (branches.some(([ax, ay, bx, by, r]) => onBranch(x, y, ax, ay, bx, by, r)) ||
      (y >= .72 && y <= .95 && Math.abs(x - (.50 + .025 * Math.sin(y * 9))) < .023)) {
    color = rgb(116 + (x % .018) * 2200, 78 + (x % .018) * 1200, 60)
  }
  for (const [cx, cy, rx, ry] of clusters) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry
    if (dx * dx + dy * dy < 1) {
      const light = .80 + .19 * Math.sqrt(1 - dx * dx - dy * dy) - .10 * dx - .09 * dy
      color = rgb(255 * light, 184 * light, 207 * light)
      const cellX = Math.floor(x * 20), cellY = Math.floor(y * 20)
      const noise = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453
      const jitter = noise - Math.floor(noise)
      const px = x * 20 - cellX - .2 - jitter * .6
      const py = y * 20 - cellY - .2 - ((jitter * 7) % 1) * .6
      const radius = .23 + .08 * Math.cos(5 * Math.atan2(py, px) + jitter * 6)
      if (jitter > .22 && Math.hypot(px, py) < radius) color = rgb(255, 225, 234)
      if (jitter > .22 && Math.hypot(px, py) < .07) color = rgb(210, 165, 100)
    }
  }
  for (const [ax, ay, bx, by] of grass) {
    if (onBranch(x, y, ax, ay, bx, by, .0045)) color = rgb(74 + ax * 42, 119 + ax * 38, 63)
  }
  return color
}

/**
 * Fixed solid = front garden silhouette extruded along Z ∩ QR black rows extruded along X.
 * At 0° the XY projection is the garden. At +90° the ZY projection is the QR.
 * Neither instance positions nor colors change when the object rotates.
 */
export function buildGardenBoxes(qr: QrMatrix): GardenBox[] {
  const n = qr.length
  if (n < 21 || n > 77 || qr.some((row) => row.length !== n || !row.some(Boolean))) {
    throw new Error('Matriks QR tidak sesuai untuk taman 3D.')
  }
  const detail = n <= 41 ? 3 : n <= 57 ? 2 : 1
  const resolution = n * detail
  const boxes: GardenBox[] = []
  for (let row = 0; row < resolution; row++) {
    const qrRow = qr[Math.floor(row / detail)]
    const colors = Array.from({ length: resolution }, (_, col) => gardenColor((col + .5) / resolution, (row + .5) / resolution))
    if (colors.every((color) => color === null)) throw new Error('Siluet taman memiliki baris kosong.')
    for (let x = 0; x < resolution;) {
      const color = colors[x]
      const startX = x++
      while (x < resolution && colors[x] === color) x++
      if (color === null) continue
      for (let z = 0; z < n;) {
        if (!qrRow[z]) { z++; continue }
        const startZ = z++
        while (z < n && qrRow[z]) z++
        boxes.push({
          x: ((startX + x) / (2 * resolution) - .5) * n,
          y: n / 2 - (row + .5) / detail,
          z: (startZ + z) / 2 - n / 2,
          width: (x - startX) / detail, height: 1 / detail, depth: z - startZ, color,
        })
      }
    }
  }
  return boxes
}
