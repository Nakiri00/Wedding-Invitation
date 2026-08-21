import type { MessageItem } from '../types/wedding'

export const weddingConfig = {
  couple: {
    groom: {
      name: 'Rayhan Konan Ferdion',
      shortName: 'Konan',
      parents: '',
    },
    bride: {
      name: 'Ainy Nilover',
      shortName: 'Nilo',
      parents: '',
    },
  },
  dateISO: '2026-11-14T10:00:00+07:00',
  dateLabel: 'Sabtu, 14 November 2026',
  dateParts: { day: '14', month: 'NOV', year: '2026' },
  timeLabel: '10.00 WIB — selesai',
  venue: 'The Garden House',
  address: 'Jl. Kemang Raya No. 18, Jakarta Selatan',
  invitedGuest: 'Keluarga Bapak Ahmad',
  mapUrl: 'https://maps.google.com/?q=The+Garden+House+Jakarta',
  photoUrl: 'https://photos.google.com/',
  music: {
     src: `${import.meta.env.BASE_URL}audio/wedding-music.mp3`,
    volume: 0.45,
  },
  gallery: [
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template1.png`,
    alt: 'Konan dan Nilo dalam sesi prewedding',
  },
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template2.png`,
    alt: 'Potret kebersamaan Konan dan Nilo',
  },
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template3.png`,
    alt: 'Momen bahagia Konan dan Nilo',
  },
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template4.png`,
    alt: 'Foto prewedding Konan dan Nilo',
  },
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template5.png`,
    alt: 'Kisah cinta Konan dan Nilo',
  },
  {
    src: `${import.meta.env.BASE_URL}images/gallery/template6.png`,
    alt: 'Perjalanan menuju hari bahagia',
  },
  ],
}

export const initialMessages: MessageItem[] = [
  // {
  //   id: "1",
  //   name: 'Nadia & Fajar',
  //   message: 'Semoga menjadi keluarga yang selalu dipenuhi cinta, ketenangan, dan kebahagiaan.',
  //   createdAt: '2 hari lalu',
  //   status: 'published',
  // },
  // {
  //   id: "2",
  //   name: 'Rizky',
  //   message: 'Selamat menempuh hidup baru! Sampai bertemu di hari bahagia.',
  //   createdAt: '3 hari lalu',
  //   status: 'published',
  // },
]
