import { weddingConfig } from '../data/wedding'

const dateOnly = weddingConfig.dateISO.slice(0, 10)
const calendarDate = dateOnly.replace(/-/g, '')

function addOneDay(dateISO: string) {
  const [year, month, day] = dateISO.split('-').map(Number)

  const nextDate = new Date(
    Date.UTC(year, month - 1, day + 1)
  )

  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, '0'),
    String(nextDate.getUTCDate()).padStart(2, '0'),
  ].join('')
}

const calendarEndDate = addOneDay(dateOnly)

const title =
  'Pernikahan ' +
  weddingConfig.couple.groom.shortName +
  ' & ' +
  weddingConfig.couple.bride.shortName

const location =
  weddingConfig.venue + ', ' + weddingConfig.address

const description = [
  'Pernikahan ' +
    weddingConfig.couple.groom.name +
    ' & ' +
    weddingConfig.couple.bride.name,
  'Tanggal: ' + weddingConfig.dateLabel,
  'Lokasi: ' + weddingConfig.venue,
  weddingConfig.address,
  'Peta lokasi: ' + weddingConfig.mapUrl,
].join('\n')

function toCalendarUtcDate(date: Date) {
  return (
    date.toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, '') + 'Z'
  )
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function getGoogleCalendarUrl() {
  const url = new URL(
    'https://calendar.google.com/calendar/render'
  )

  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', title)

  // Acara sepanjang hari: tanggal mulai / tanggal akhir eksklusif.
  url.searchParams.set(
    'dates',
    `${calendarDate}/${calendarEndDate}`
  )

  url.searchParams.set('details', description)
  url.searchParams.set('location', location)

  return url.toString()
}

export function downloadCalendarFile() {
  const calendarContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lotus and Willow//Wedding Invitation//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:konan-nilo-wedding-' +
      calendarDate +
      '@wedding-invitation',
    'DTSTAMP:' + toCalendarUtcDate(new Date()),

    // VALUE=DATE membuat acara tanpa waktu mulai dan selesai.
    `DTSTART;VALUE=DATE:${calendarDate}`,
    `DTEND;VALUE=DATE:${calendarEndDate}`,

    'SUMMARY:' + escapeCalendarText(title),
    'LOCATION:' + escapeCalendarText(location),
    'DESCRIPTION:' + escapeCalendarText(description),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')

  const file = new Blob([calendarContent], {
    type: 'text/calendar;charset=utf-8',
  })

  const fileUrl = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = fileUrl
  link.download = 'pernikahan-konan-nilo.ics'

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(fileUrl)
  }, 1000)
}