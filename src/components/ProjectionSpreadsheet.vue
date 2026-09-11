<script setup>
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import { MONTH_COUNT } from '../utils/projectionMath.js'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()
const monthIndexes = Array.from({ length: MONTH_COUNT }, (_, index) => index)

function rowClass(row) {
  return {
    'sheet-section': row.kind === 'section',
    'sheet-upsell': row.kind === 'upsell',
    'sheet-total': row.kind === 'total',
    'sheet-profit': row.kind === 'profit',
    'sheet-muted': row.muted,
    'sheet-profit-neg': row.kind === 'profit' && row.year < 0,
  }
}

function onPriceChange(row, value) {
  const amount = value ?? 0
  if (row.kind === 'revenue') store.updateRevenue(row.revenueId, { unitPrice: amount })
  if (row.kind === 'upsell') store.updateUpsell(row.revenueId, row.upsellId, { extraPrice: amount })
  if (row.kind === 'expense') store.updateExpense(row.expenseId, { amount })
}

function onQtyChange(row, value) {
  const amount = value ?? 0
  if (row.kind === 'revenue') store.updateRevenue(row.revenueId, { unitsPerMonth: amount })
  if (row.kind === 'upsell') store.updateUpsell(row.revenueId, row.upsellId, { attachRatePct: amount })
}

function cellClass(value, kind) {
  if (kind !== 'profit' || value == null) return undefined
  return value < 0 ? 'is-neg' : 'is-pos'
}

const sheetTablePt = {
  root: { 'data-test': 'sheet' },
  bodyRow: ({ instance }) => ({
    'data-test': `sheet-row-${instance?.rowData?.key ?? instance?.$props?.rowData?.key ?? ''}`,
  }),
}
</script>

<template>
  <Card class="sheet-card" data-test="sheet-card">
    <template #title>12-month spreadsheet</template>
    <template #subtitle>
      Edit price, units, attach rate, or expense amount here — the year view updates as you type
    </template>
    <template #content>
      <DataTable
        :value="store.sheetRows"
        :row-class="rowClass"
        :pt="sheetTablePt"
        data-key="key"
        scrollable
        scroll-height="36rem"
        size="small"
        show-gridlines
        table-style="min-width: 78rem"
        class="sheet"
      >
        <Column field="label" header="Line" frozen style="min-width: 15rem">
          <template #body="{ data }">
            <div class="line-name" :data-test="`sheet-line-${data.key}`">
              <span data-test="sheet-line-label">{{ data.label }}</span>
              <Tag v-if="data.kind === 'upsell'" value="Upsell" severity="info" data-test="sheet-upsell-tag" />
            </div>
          </template>
        </Column>

        <Column header="Price" style="min-width: 8.5rem">
          <template #body="{ data }">
            <InputNumber
              v-if="data.kind === 'revenue' || data.kind === 'upsell' || data.kind === 'expense'"
              :model-value="data.price"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              data-test="sheet-price"
              @update:model-value="onPriceChange(data, $event)"
            />
          </template>
        </Column>

        <Column header="Qty / attach" style="min-width: 7.5rem">
          <template #body="{ data }">
            <InputNumber
              v-if="data.kind === 'revenue'"
              :model-value="data.qty"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              data-test="sheet-qty"
              @update:model-value="onQtyChange(data, $event)"
            />
            <InputNumber
              v-else-if="data.kind === 'upsell'"
              :model-value="data.qty"
              suffix="%"
              :min="0"
              :max="100"
              :min-fraction-digits="0"
              :max-fraction-digits="1"
              data-test="sheet-qty"
              @update:model-value="onQtyChange(data, $event)"
            />
          </template>
        </Column>

        <Column
          v-for="index in monthIndexes"
          :key="index"
          :header="`M${index + 1}`"
          style="min-width: 6.1rem"
        >
          <template #body="{ data }">
            <span
              v-if="data.months[index] != null"
              :class="cellClass(data.months[index], data.kind)"
              :data-test="`sheet-month-${index}`"
            >
              {{ store.money(data.months[index]) }}
            </span>
          </template>
        </Column>

        <Column header="Year" frozen align-frozen="right" style="min-width: 7rem">
          <template #body="{ data }">
            <strong v-if="data.year != null" :class="cellClass(data.year, data.kind)" data-test="sheet-year">
              {{ store.money(data.year) }}
            </strong>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<style scoped>
.sheet-card {
  border: 0;
  box-shadow: 0 10px 24px rgba(28, 43, 39, 0.06);
}

.sheet-card :deep(.p-card-title) {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.2rem;
}

.sheet-card :deep(.p-card-subtitle) {
  color: #5b6b66;
  font-weight: 400;
}

.line-name {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.sheet :deep(.sheet-section) td {
  background: #eef5f2;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: #3f5851;
}

.sheet :deep(.sheet-upsell) .line-name span:first-child {
  padding-left: 1rem;
  color: #4b5f59;
}

.sheet :deep(.sheet-total) td {
  font-weight: 650;
  background: #f7faf8;
}

.sheet :deep(.sheet-profit) td {
  font-weight: 700;
  background: #ecfdf5;
}

.sheet :deep(.sheet-profit-neg) td {
  background: #fff1f2;
}

.sheet :deep(.sheet-muted) {
  opacity: 0.5;
}

.is-neg {
  color: #be123c;
}

.is-pos {
  color: #047857;
}

.sheet :deep(.p-inputnumber) {
  width: 7.25rem;
}
</style>
