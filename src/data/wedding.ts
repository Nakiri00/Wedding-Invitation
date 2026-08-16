import type { MessageItem } from '../types/wedding'

export const weddingConfig = {
  couple: {
    groom: {
      name: 'Aditya Pratama',
      shortName: 'Aditya',
      parents: 'Putra dari Bapak Budi Pratama & Ibu Sari Pratama',
    },
    bride: {
      name: 'Alya Maharani',
      shortName: 'Alya',
      parents: 'Putri dari Bapak Hendra Maharani & Ibu Ratna Maharani',
    },
  },
  dateISO: '2026-11-22T10:00:00+07:00',
  dateLabel: 'Minggu, 22 November 2026',
  timeLabel: '10.00 WIB — selesai',
  venue: 'The Garden House',
  address: 'Jl. Kemang Raya No. 18, Jakarta Selatan',
  invitedGuest: 'Keluarga Bapak Ahmad',
  mapUrl: 'https://maps.google.com/?q=The+Garden+House+Jakarta',
  photoUrl: 'https://photos.google.com/',
}

export const initialMessages: MessageItem[] = [
  {
    id: "1",
    name: 'Nadia & Fajar',
    message: 'Semoga menjadi keluarga yang selalu dipenuhi cinta, ketenangan, dan kebahagiaan.',
    createdAt: '2 hari lalu',
    status: 'published',
  },
  {
    id: "2",
    name: 'Rizky',
    message: 'Selamat menempuh hidup baru! Sampai bertemu di hari bahagia.',
    createdAt: '3 hari lalu',
    status: 'published',
  },
]
