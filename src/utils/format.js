export function formatMoney(value, currency = 'USD') {
  const amount = Number(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function formatNumber(value, digits = 1) {
  const amount = Number(value)
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function monthLabel(monthIndex) {
  return `Month ${monthIndex + 1}`
}
