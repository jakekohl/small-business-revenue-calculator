export const MONTH_COUNT = 12

const EXPENSE_FREQUENCY_VALUES = new Set(['monthly', 'quarterly', 'annually', 'once'])

export function clampMonthIndex(value) {
  const month = Math.trunc(Number(value) || 0)
  if (month < 0) return 0
  if (month > MONTH_COUNT - 1) return MONTH_COUNT - 1
  return month
}

export function normalizeExpenseFrequency(value) {
  return EXPENSE_FREQUENCY_VALUES.has(value) ? value : 'monthly'
}

export function expenseAmountForMonth(expense, monthIndex) {
  if (!expense?.enabled) return 0
  const amount = Number(expense.amount) || 0
  const frequency = normalizeExpenseFrequency(expense.frequency)
  const startMonth = clampMonthIndex(expense.startMonth)

  if (frequency === 'monthly') return amount
  if (frequency === 'annually' || frequency === 'once') {
    return monthIndex === startMonth ? amount : 0
  }
  if (((monthIndex - startMonth) % 3 + 3) % 3 === 0) return amount
  return 0
}

export function unitsForMonth(unitsPerMonth, growthRatePct, monthIndex) {
  const units = Number(unitsPerMonth) || 0
  const rate = (Number(growthRatePct) || 0) / 100
  return Math.max(0, units * (1 + rate) ** monthIndex)
}

export function opportunityForMonth(revenue, growthRatePct, monthIndex) {
  const disabled = !revenue?.enabled
  const units = disabled ? 0 : unitsForMonth(revenue.unitsPerMonth, growthRatePct, monthIndex)
  const unitPrice = Number(revenue.unitPrice) || 0
  const costPerUnit = Number(revenue.costPerUnit) || 0
  const baseRevenue = unitPrice * units
  const cogs = costPerUnit * units

  const upsells = (revenue.upsells || []).map((upsell) => {
    const on = !disabled && upsell.enabled
    const attach = on ? (Number(upsell.attachRatePct) || 0) / 100 : 0
    const upsellUnits = units * Math.max(0, attach)
    const extraPrice = Number(upsell.extraPrice) || 0
    return {
      id: upsell.id,
      units: upsellUnits,
      revenue: extraPrice * upsellUnits,
    }
  })

  const upsellRevenue = upsells.reduce((sum, item) => sum + item.revenue, 0)
  const totalRevenue = baseRevenue + upsellRevenue

  return {
    units,
    baseRevenue,
    upsellRevenue,
    revenue: totalRevenue,
    cogs,
    contribution: totalRevenue - cogs,
    upsells,
  }
}

export function buildProjection({ revenues = [], expenses = [], growthRatePct = 0 } = {}) {
  const months = Array.from({ length: MONTH_COUNT }, (_, monthIndex) => {
    const byRevenue = {}
    let revenue = 0
    let cogs = 0

    for (const item of revenues) {
      const row = opportunityForMonth(item, growthRatePct, monthIndex)
      byRevenue[item.id] = row
      revenue += row.revenue
      cogs += row.cogs
    }

    const byExpense = {}
    let expenseTotal = 0
    for (const item of expenses) {
      const amount = expenseAmountForMonth(item, monthIndex)
      byExpense[item.id] = amount
      expenseTotal += amount
    }

    const contribution = revenue - cogs

    return {
      monthIndex,
      revenue,
      cogs,
      expenses: expenseTotal,
      contribution,
      profit: contribution - expenseTotal,
      byRevenue,
      byExpense,
    }
  })

  const annual = months.reduce(
    (acc, month) => ({
      revenue: acc.revenue + month.revenue,
      cogs: acc.cogs + month.cogs,
      expenses: acc.expenses + month.expenses,
      contribution: acc.contribution + month.contribution,
      profit: acc.profit + month.profit,
    }),
    { revenue: 0, cogs: 0, expenses: 0, contribution: 0, profit: 0 },
  )

  return { months, annual }
}

export function breakEvenUnits(month, revenues) {
  if (!month) return null

  const totalUnits = revenues
    .filter((item) => item.enabled)
    .reduce((sum, item) => sum + (month.byRevenue[item.id]?.units || 0), 0)

  if (totalUnits <= 0) return null

  const contributionPerUnit = month.contribution / totalUnits
  if (contributionPerUnit <= 0) return null

  return month.expenses / contributionPerUnit
}
