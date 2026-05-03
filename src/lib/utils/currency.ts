// Formats raw digit string (centavos) to BRL: "231459" → "R$ 2.314,59"
export function formatBRL(cents: string): string {
  const digits = cents.replace(/\D/g, '')
  if (!digits) return ''
  const value = parseInt(digits, 10) / 100
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Convert centavos string to float for API: "231459" → 2314.59
export function centsToFloat(cents: string): number | null {
  const digits = cents.replace(/\D/g, '')
  if (!digits) return null
  return parseInt(digits, 10) / 100
}

// Convert float from DB to centavos string for form init: 2314.59 → "231459"
export function floatToCents(value: number | string | null | undefined): string {
  if (!value) return ''
  return Math.round(parseFloat(String(value)) * 100).toString()
}
