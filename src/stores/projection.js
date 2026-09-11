import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { formatMoney, monthLabel } from '../utils/format.js'
import { breakEvenUnits, buildProjection, MONTH_COUNT } from '../utils/projectionMath.js'
import {
  categoryLabel,
  createEmptyProjection,
  createExpense,
  createRevenue,
  createSampleProjection,
  createUpsell,
  normalizeProjection,
} from '../utils/sampleData.js'

const STORAGE_KEY = 'inc-exp-calc-projection'
const SAVE_DELAY_MS = 250

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSampleProjection()
    return normalizeProjection(JSON.parse(raw))
  } catch {
    return createSampleProjection()
  }
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

export const useProjectionStore = defineStore('projection', () => {
  const initial = loadStored()
  const settings = ref(initial.settings)
  const revenues = ref(initial.revenues)
  const expenses = ref(initial.expenses)

  const projection = computed(() =>
    buildProjection({
      revenues: revenues.value,
      expenses: expenses.value,
      growthRatePct: settings.value.growthRatePct,
    }),
  )

  const month0 = computed(() => projection.value.months[0])
  const annual = computed(() => projection.value.annual)

  const kpis = computed(() => {
    const first = month0.value
    const year = annual.value
    const units = breakEvenUnits(first, revenues.value)

    return {
      monthlyRevenue: first.revenue,
      monthlyExpenses: first.expenses,
      monthlyProfit: first.profit,
      annualProfit: year.profit,
      breakEvenUnits: units,
      profitClass: first.profit >= 0 ? 'positive' : 'negative',
      annualProfitClass: year.profit >= 0 ? 'positive' : 'negative',
    }
  })

  const sheetRows = computed(() => {
    const { months, annual: year } = projection.value
    const rows = []

    rows.push({
      key: 'sec-rev',
      kind: 'section',
      label: 'Revenue',
      months: Array(MONTH_COUNT).fill(null),
      year: null,
    })

    for (const revenue of revenues.value) {
      const monthValues = months.map((month) => month.byRevenue[revenue.id]?.baseRevenue ?? 0)
      rows.push({
        key: `rev-${revenue.id}`,
        kind: 'revenue',
        label: revenue.name || 'Untitled service',
        revenueId: revenue.id,
        muted: !revenue.enabled,
        price: revenue.unitPrice,
        qty: revenue.unitsPerMonth,
        months: monthValues,
        year: sum(monthValues),
      })

      for (const upsell of revenue.upsells || []) {
        const upsellMonths = months.map((month) => {
          const match = month.byRevenue[revenue.id]?.upsells.find((item) => item.id === upsell.id)
          return match?.revenue ?? 0
        })
        rows.push({
          key: `upsell-${revenue.id}-${upsell.id}`,
          kind: 'upsell',
          label: upsell.name || 'Untitled upsell',
          revenueId: revenue.id,
          upsellId: upsell.id,
          muted: !revenue.enabled || !upsell.enabled,
          price: upsell.extraPrice,
          qty: upsell.attachRatePct,
          months: upsellMonths,
          year: sum(upsellMonths),
        })
      }
    }

    rows.push({
      key: 'total-rev',
      kind: 'total',
      label: 'Total revenue',
      months: months.map((month) => month.revenue),
      year: year.revenue,
    })

    rows.push({
      key: 'sec-cogs',
      kind: 'section',
      label: 'Cost of services',
      months: Array(MONTH_COUNT).fill(null),
      year: null,
    })

    rows.push({
      key: 'total-cogs',
      kind: 'total',
      label: 'Materials / labor',
      months: months.map((month) => month.cogs),
      year: year.cogs,
    })

    rows.push({
      key: 'contribution',
      kind: 'total',
      label: 'After service costs',
      months: months.map((month) => month.contribution),
      year: year.contribution,
    })

    rows.push({
      key: 'sec-exp',
      kind: 'section',
      label: 'Expenses',
      months: Array(MONTH_COUNT).fill(null),
      year: null,
    })

    for (const expense of expenses.value) {
      const monthValues = months.map((month) => month.byExpense[expense.id] ?? 0)
      rows.push({
        key: `exp-${expense.id}`,
        kind: 'expense',
        label: expense.name || 'Untitled expense',
        expenseId: expense.id,
        muted: !expense.enabled,
        price: expense.amount,
        months: monthValues,
        year: sum(monthValues),
      })
    }

    rows.push({
      key: 'total-exp',
      kind: 'total',
      label: 'Total expenses',
      months: months.map((month) => month.expenses),
      year: year.expenses,
    })

    rows.push({
      key: 'profit',
      kind: 'profit',
      label: 'Net profit',
      months: months.map((month) => month.profit),
      year: year.profit,
    })

    return rows
  })

  const monthLabels = Array.from({ length: MONTH_COUNT }, (_, index) => monthLabel(index))

  const trendChart = computed(() => ({
    labels: monthLabels,
    datasets: [
      {
        label: 'Revenue',
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.16)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        data: projection.value.months.map((month) => Math.round(month.revenue)),
      },
      {
        label: 'Expenses',
        borderColor: '#c2410c',
        backgroundColor: 'rgba(194, 65, 12, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        data: projection.value.months.map((month) => Math.round(month.expenses)),
      },
      {
        label: 'Profit',
        borderColor: '#4338ca',
        backgroundColor: 'rgba(67, 56, 202, 0.08)',
        fill: false,
        tension: 0.35,
        pointRadius: 3,
        borderWidth: 2,
        data: projection.value.months.map((month) => Math.round(month.profit)),
      },
    ],
  }))

  const revenueMixChart = computed(() => {
    const active = revenues.value.filter((item) => item.enabled)
    return {
      labels: active.map((item) => item.name || 'Untitled'),
      datasets: [
        {
          data: active.map((item) =>
            Math.round(
              projection.value.months.reduce(
                (total, month) => total + (month.byRevenue[item.id]?.revenue || 0),
                0,
              ),
            ),
          ),
          backgroundColor: ['#0f766e', '#0369a1', '#7c3aed', '#c2410c', '#0e7490', '#a16207'],
        },
      ],
    }
  })

  const expenseMixChart = computed(() => {
    const totals = new Map()
    const months = projection.value.months
    for (const expense of expenses.value) {
      if (!expense.enabled) continue
      const key = categoryLabel(expense.category)
      const yearly = months.reduce((total, month) => total + (month.byExpense[expense.id] || 0), 0)
      totals.set(key, (totals.get(key) || 0) + yearly)
    }

    return {
      labels: [...totals.keys()],
      datasets: [
        {
          data: [...totals.values()].map((value) => Math.round(value)),
          backgroundColor: ['#c2410c', '#b45309', '#0369a1', '#0f766e', '#7c3aed', '#be123c', '#57534e', '#0e7490'],
        },
      ],
    }
  })

  function snapshot() {
    return {
      settings: settings.value,
      revenues: revenues.value,
      expenses: expenses.value,
    }
  }

  function applySnapshot(data) {
    const next = normalizeProjection(data)
    settings.value = next.settings
    revenues.value = next.revenues
    expenses.value = next.expenses
  }

  function findRevenue(id) {
    return revenues.value.find((item) => item.id === id)
  }

  function addRevenue() {
    revenues.value.push(
      createRevenue({
        name: 'New service',
        unitPrice: 0,
        unitsPerMonth: 0,
      }),
    )
  }

  function updateRevenue(id, patch) {
    const item = findRevenue(id)
    if (item) Object.assign(item, patch)
  }

  function removeRevenue(id) {
    revenues.value = revenues.value.filter((item) => item.id !== id)
  }

  function addUpsell(revenueId) {
    const item = findRevenue(revenueId)
    if (!item) return
    item.upsells.push(
      createUpsell({
        name: 'New upsell',
      }),
    )
  }

  function updateUpsell(revenueId, upsellId, patch) {
    const item = findRevenue(revenueId)
    const upsell = item?.upsells.find((entry) => entry.id === upsellId)
    if (upsell) Object.assign(upsell, patch)
  }

  function removeUpsell(revenueId, upsellId) {
    const item = findRevenue(revenueId)
    if (!item) return
    item.upsells = item.upsells.filter((entry) => entry.id !== upsellId)
  }

  function addExpense() {
    expenses.value.push(
      createExpense({
        name: 'New expense',
        amount: 0,
      }),
    )
  }

  function updateExpense(id, patch) {
    const item = expenses.value.find((entry) => entry.id === id)
    if (item) Object.assign(item, patch)
  }

  function removeExpense(id) {
    expenses.value = expenses.value.filter((item) => item.id !== id)
  }

  function setGrowthRate(value) {
    settings.value.growthRatePct = Number(value) || 0
  }

  function resetToEmpty() {
    applySnapshot(createEmptyProjection())
  }

  function loadSample() {
    applySnapshot(createSampleProjection())
  }

  function importData(data) {
    const next = normalizeProjection(data)
    next.settings.isSampleData = false
    applySnapshot(next)
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'business-projection.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function money(value) {
    return formatMoney(value, settings.value.currency)
  }

  let saveTimer
  watch(
    [settings, revenues, expenses],
    () => {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()))
        } catch {
          // Ignore quota / private-mode failures; the live model still works.
        }
      }, SAVE_DELAY_MS)
    },
    { deep: true },
  )

  return {
    settings,
    revenues,
    expenses,
    projection,
    month0,
    annual,
    kpis,
    sheetRows,
    monthLabels,
    trendChart,
    revenueMixChart,
    expenseMixChart,
    addRevenue,
    updateRevenue,
    removeRevenue,
    addUpsell,
    updateUpsell,
    removeUpsell,
    addExpense,
    updateExpense,
    removeExpense,
    setGrowthRate,
    resetToEmpty,
    loadSample,
    importData,
    exportJson,
    money,
  }
})
