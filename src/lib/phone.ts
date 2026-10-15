import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

export function isValidIndonesianPhone(value: string): boolean {
  const digits = value.trim().replace(/\D/g, '')

  if (!digits) return true
  const candidate = digits.startsWith('62')
    ? `+${digits}`
    : digits

  const phone = parsePhoneNumberFromString(candidate, {
    defaultCountry: 'ID',
    extract: false,
  })

  return Boolean(
    phone &&
    phone.country === 'ID' &&
    phone.isValid(),
  )
}