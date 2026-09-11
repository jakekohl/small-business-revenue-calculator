import { monthLabel } from './format.js'
import { uid } from './ids.js'
import { MONTH_COUNT, clampMonthIndex, normalizeExpenseFrequency } from './projectionMath.js'

export const EXPENSE_CATEGORIES = [
  { label: 'Rent & utilities', value: 'rent' },
  { label: 'Software & tools', value: 'software' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Payroll', value: 'payroll' },
  { label: 'Taxes', value: 'taxes' },
  { label: 'Other', value: 'other' },
]

export const EXPENSE_FREQUENCIES = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Every 3 months', value: 'quarterly' },
  { label: 'Once a year', value: 'annually' },
  { label: 'One-time', value: 'once' },
]

export const EXPENSE_DUE_MONTHS = Array.from({ length: MONTH_COUNT }, (_, index) => ({
  label: monthLabel(index),
  value: index,
}))

export function categoryLabel(value) {
  return EXPENSE_CATEGORIES.find((item) => item.value === value)?.label || 'Other'
}

export function createRevenue(overrides = {}) {
  return {
    id: uid(),
    name: '',
    unitPrice: 0,
    unitsPerMonth: 0,
    costPerUnit: 0,
    enabled: true,
    upsells: [],
    ...overrides,
  }
}

export function createUpsell(overrides = {}) {
  return {
    id: uid(),
    name: '',
    extraPrice: 0,
    attachRatePct: 0,
    enabled: true,
    ...overrides,
  }
}

export function createExpense(overrides = {}) {
  return {
    id: uid(),
    name: '',
    amount: 0,
    category: 'other',
    frequency: 'monthly',
    startMonth: 0,
    enabled: true,
    ...overrides,
  }
}

export function createEmptyProjection() {
  return {
    settings: {
      currency: 'USD',
      growthRatePct: 0,
      isSampleData: false,
    },
    revenues: [],
    expenses: [],
  }
}

export function createSampleProjection() {
  return {
    settings: {
      currency: 'USD',
      growthRatePct: 0,
      isSampleData: true,
    },
    revenues: [
      createRevenue({
        name: 'Signature service',
        unitPrice: 85,
        unitsPerMonth: 40,
        costPerUnit: 12,
        upsells: [
          createUpsell({
            name: 'Add-on treatment',
            extraPrice: 25,
            attachRatePct: 30,
          }),
        ],
      }),
      createRevenue({
        name: 'Premium package',
        unitPrice: 150,
        unitsPerMonth: 12,
        costPerUnit: 20,
        upsells: [
          createUpsell({
            name: 'Express add-on',
            extraPrice: 35,
            attachRatePct: 20,
          }),
        ],
      }),
    ],
    expenses: [
      createExpense({ name: 'Studio rent', amount: 1800, category: 'rent' }),
      createExpense({ name: 'Software & tools', amount: 79, category: 'software' }),
      createExpense({ name: 'Supplies', amount: 250, category: 'supplies' }),
      createExpense({ name: 'Insurance', amount: 140, category: 'insurance' }),
      createExpense({ name: 'Marketing', amount: 200, category: 'marketing' }),
      createExpense({
        name: 'Year-end taxes',
        amount: 1200,
        category: 'taxes',
        frequency: 'annually',
        startMonth: 11,
      }),
    ],
  }
}

function normalizeRevenue(item = {}) {
  return createRevenue({
    id: item.id || uid(),
    name: item.name ?? '',
    unitPrice: Number(item.unitPrice) || 0,
    unitsPerMonth: Number(item.unitsPerMonth) || 0,
    costPerUnit: Number(item.costPerUnit) || 0,
    enabled: item.enabled !== false,
    upsells: Array.isArray(item.upsells) ? item.upsells.map(normalizeUpsell) : [],
  })
}

function normalizeUpsell(item = {}) {
  return createUpsell({
    id: item.id || uid(),
    name: item.name ?? '',
    extraPrice: Number(item.extraPrice) || 0,
    attachRatePct: Number(item.attachRatePct) || 0,
    enabled: item.enabled !== false,
  })
}

function normalizeExpense(item = {}) {
  return createExpense({
    id: item.id || uid(),
    name: item.name ?? '',
    amount: Number(item.amount) || 0,
    category: item.category || 'other',
    frequency: normalizeExpenseFrequency(item.frequency),
    startMonth: clampMonthIndex(item.startMonth),
    enabled: item.enabled !== false,
  })
}

/** Map any saved/imported shape onto the current model. Older files must still load. */
export function normalizeProjection(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('That file is not a projection backup.')
  }
  if (!Array.isArray(data.revenues) || !Array.isArray(data.expenses)) {
    throw new Error('That file is missing revenue or expense lists.')
  }

  return {
    settings: {
      currency: data.settings?.currency || 'USD',
      growthRatePct: Number(data.settings?.growthRatePct) || 0,
      isSampleData: Boolean(data.settings?.isSampleData),
    },
    revenues: data.revenues.map(normalizeRevenue),
    expenses: data.expenses.map(normalizeExpense),
  }
}
