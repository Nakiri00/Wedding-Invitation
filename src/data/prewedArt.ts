// Ilustrasi sementara. Nantinya src dapat diganti dengan foto asli.
const asset = (filename: string) =>
  `${import.meta.env.BASE_URL}images/prewed/${filename}`
const flower = (x: number, y: number, size = 1) => `
  <g transform="translate(${x} ${y}) scale(${size})">
    <g fill="#e7b8b5">
      <ellipse cy="-9" rx="8" ry="11"/>
      <ellipse cx="9" cy="-2" rx="11" ry="8"/>
      <ellipse cx="6" cy="9" rx="8" ry="10"/>
      <ellipse cx="-7" cy="8" rx="8" ry="10"/>
      <ellipse cx="-10" cy="-3" rx="10" ry="8"/>
    </g>
    <circle r="5" fill="#b49359"/>
  </g>
`

const sprig = (x: number, y: number, scale = 1) => `
  <g transform="translate(${x} ${y}) scale(${scale})" fill="#91a28a">
    <path
      d="M0 0 Q-18-84 6-164"
      fill="none"
      stroke="#788b70"
      stroke-width="3"
    />
    ${[-25, -60, -95, -130].map((cy, i) => `
      <ellipse
        cx="${i % 2 ? 13 : -18}"
        cy="${cy}"
        rx="11"
        ry="25"
        transform="rotate(
          ${i % 2 ? 38 : -38}
          ${i % 2 ? 13 : -18}
          ${cy}
        )"
      />
    `).join('')}
  </g>
`

const face = `
  <ellipse cy="2" rx="23" ry="30" fill="#d9ad94"/>
  <path
    d="M-12 2h3 M9 2h3"
    stroke="#594138"
    stroke-width="2.5"
    stroke-linecap="round"
  />
  <path
    d="M1 5l-2 7h4 M-6 18q6 4 12 0"
    fill="none"
    stroke="#a56f5c"
    stroke-width="1.5"
    stroke-linecap="round"
  />
`

const groom = `
  <g>
    <path
      d="M-40 191h80l5 152H9L0 237-9 343h-36z"
      fill="#414c45"
    />
    <path
      d="M-45 333h36v19h-49q-3-12 13-19
         M9 333h36q16 7 13 19H9z"
      fill="#342f2b"
    />
    <path d="M-9 25h18v29H-9z" fill="#c9957c"/>
    <path
      d="M-18 44L-57 61-47 203q47 13 94 0L57 61 18 44z"
      fill="#63786a"
    />
    <path
      d="M-57 61q-11 50-7 107l15 20 12-14-8-105
         M57 61q11 50 7 107l-15 20-12-14 8-105"
      fill="#758878"
    />
    <ellipse cx="-55" cy="183" rx="9" ry="13" fill="#d9ad94"/>
    <ellipse cx="55" cy="183" rx="9" ry="13" fill="#d9ad94"/>
    <path d="M-16 43L0 122 16 43z" fill="#fffaf2"/>
    <path
      d="M-17 43L-34 71-16 82-25 96 0 135
         M17 43L34 71 16 82 25 96 0 135"
      fill="#4f6457"
    />
    <path
      d="M0 56l-11-6v14z M0 56l11-6v14z"
      fill="#4f3533"
    />
    <path d="M0 136v67" stroke="#495c50" stroke-width="2"/>
    <circle cy="151" r="2.5" fill="#ddd0b6"/>
    ${face}
    <path
      d="M-24 4q-12-47 24-40 33-1 25 40L15-16Q-2-7-15-19z"
      fill="#40352f"
    />
    ${flower(28, 82, 0.36)}
  </g>
`

const bride = `
  <g>
    <path
      d="M-31-21q-50 70-55 245 86 34 174 0Q80 50 30-21z"
      fill="#fffaf4"
      opacity=".65"
    />
    <path
      d="M-27-18q-16 37-4 99h64q14-64-6-99z"
      fill="#4a3831"
    />
    <path d="M-9 25h18v29H-9z" fill="#c9957c"/>
    <path
      d="M-19 44q-30 4-31 28l18 49-64 220q96 31 192 0
         L32 121 50 72q-1-24-31-28L0 60z"
      fill="#fffdf7"
      stroke="#e3d4c4"
      stroke-width="2"
    />
    <path
      d="M-32 122q32 9 64 0
         M-19 141l-37 194 M19 141l37 194 M0 147v194"
      fill="none"
      stroke="#e7dbce"
      stroke-width="2"
    />
    <path
      d="M-43 66l-17 79 40 17 M43 66l17 79-40 17"
      fill="none"
      stroke="#d9ad94"
      stroke-width="12"
      stroke-linecap="round"
    />
    ${face}
    <path
      d="M-24 4q-13-39 6-44 39-12 45 27L23 10
         12-18Q-4-7-21-15z"
      fill="#4a3831"
    />
    <path
      d="M-21-24q20-15 43 0"
      fill="none"
      stroke="#e9d6b6"
      stroke-width="4"
    />
    ${flower(23, -19, 0.48)}
    <path
      d="M-15 147L4 181 17 147 M0 146v35"
      stroke="#728366"
      stroke-width="5"
    />
    <ellipse
      cx="-23" cy="145" rx="10" ry="20"
      fill="#899a7e" transform="rotate(-40 -23 145)"
    />
    <ellipse
      cx="24" cy="145" rx="10" ry="20"
      fill="#899a7e" transform="rotate(40 24 145)"
    />
    ${flower(-16, 133, 0.8)}
    ${flower(15, 132, 0.8)}
    ${flower(0, 147, 0.9)}
  </g>
`

const palettes = [
  ['#f4ede1', '#dedfcb'],
  ['#eaf0e7', '#c9d8c4'],
  ['#f6e7e3', '#e7c8bd'],
  ['#ece7dd', '#d3dbcf'],
  ['#f3eadf', '#e1d3bb'],
  ['#e8eeea', '#bed0c7'],
]

function illustration(
  index: number,
  portrait?: 'groom' | 'bride',
) {
  const [paper, accent] = palettes[index % palettes.length]

  const background = index % 2 === 0
    ? `
      <path
        d="M99 723V292a201 201 0 0 1 402 0v431z"
        fill="${accent}"
      />
      <path
        d="M125 710V292a175 175 0 0 1 350 0v418"
        fill="none"
        stroke="${paper}"
        stroke-width="3"
      />
    `
    : `
      <circle cx="427" cy="192" r="86" fill="#f8e2ce"/>
      <path
        d="M0 532q151-137 310 0t290-8v276H0z"
        fill="${accent}"
      />
      <path
        d="M0 638q190-103 340 0t260 0v162H0z"
        fill="#afbea7"
        opacity=".6"
      />
    `

  const people = portrait
    ? `
      <g transform="translate(300 238) scale(2.15)">
        ${portrait === 'groom' ? groom : bride}
      </g>
    `
    : `
      <g transform="
        translate(${index % 2 ? 234 : 222} 322)
        rotate(${index % 2 ? -4 : 0})
      ">
        ${groom}
      </g>
      <g transform="
        translate(${index % 2 ? 358 : 374} 330)
        rotate(${index % 2 ? 3 : 0})
      ">
        ${bride}
      </g>
    `

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="600"
      height="800"
      viewBox="0 0 600 800"
    >
      <rect width="600" height="800" fill="${paper}"/>
      ${background}
      ${sprig(86, 409, 1.6)}
      ${sprig(527, 401, -1.25)}
      ${flower(95, 224, 1.5)}
      ${flower(498, 263, 1.1)}
      <ellipse
        cx="300" cy="701" rx="184" ry="25"
        fill="#60705a" opacity=".1"
      />
      ${people}
      ${sprig(71, 792, 1.1)}
      ${sprig(529, 792, 1.3)}
      ${flower(104, 754, 1.6)}
      ${flower(487, 775, 1.25)}
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
const fallbackArt = {
  home: illustration(0),
  story: illustration(1),
  groom: illustration(3, 'groom'),
  bride: illustration(2, 'bride'),
  gallery: Array.from({ length: 6 }, (_, index) => ({
    src: illustration(index),
    alt: `Ilustrasi prewedding pasangan, suasana ${index + 1}`,
  })),
}
export const prewedArt = {
  home: asset('home.webp'),
  story: asset('story.webp'),
  groom: asset('groom.webp'),
  bride: asset('bride.webp'),
  gallery: [
    {
      src: asset('gallery-01.webp'),
      fallbackSrc: fallbackArt.gallery[0].src,
      alt: 'Foto prewedding pasangan di studio',
    },
    {
      src: asset('gallery-02.webp'),
      fallbackSrc: fallbackArt.gallery[1].src,
      alt: 'Potret pasangan dalam sesi prewedding',
    },
    {
      src: asset('gallery-03.webp'),
      fallbackSrc: fallbackArt.gallery[2].src,
      alt: 'Foto pasangan di taman',
    },
    {
      src: asset('gallery-04.webp'),
      fallbackSrc: fallbackArt.gallery[3].src,
      alt: 'Foto prewedding dengan payung renda',
    },
    {
      src: asset('gallery-05.webp'),
      fallbackSrc: fallbackArt.gallery[4].src,
      alt: 'Foto prewedding dengan dekorasi bunga',
    },
    {
      src: asset('gallery-06.webp'),
      fallbackSrc: fallbackArt.gallery[5].src,
      alt: 'Foto pasangan berjalan di taman',
    },
  ],

  fallback: fallbackArt,
}