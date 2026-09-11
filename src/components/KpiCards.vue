<script setup>
import Card from 'primevue/card'
import { computed } from 'vue'
import { formatNumber } from '../utils/format.js'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()

const cards = computed(() => {
  const kpis = store.kpis
  const breakEven =
    kpis.breakEvenUnits == null
      ? '—'
      : `${formatNumber(kpis.breakEvenUnits, 0)} units`

  return [
    {
      key: 'rev',
      test: 'kpi-monthly-revenue',
      label: 'This month’s revenue',
      value: store.money(kpis.monthlyRevenue),
      hint: 'Services + upsells',
      icon: 'pi pi-arrow-up-right',
      tone: 'teal',
    },
    {
      key: 'exp',
      test: 'kpi-monthly-expenses',
      label: 'This month’s expenses',
      value: store.money(kpis.monthlyExpenses),
      hint: 'Due this month',
      icon: 'pi pi-wallet',
      tone: 'amber',
    },
    {
      key: 'profit',
      test: 'kpi-monthly-profit',
      label: 'This month’s profit',
      value: store.money(kpis.monthlyProfit),
      hint: 'After service costs & expenses',
      icon: 'pi pi-chart-line',
      tone: kpis.monthlyProfit >= 0 ? 'teal' : 'rose',
    },
    {
      key: 'year',
      test: 'kpi-year-profit',
      label: 'Year profit',
      value: store.money(kpis.annualProfit),
      hint: '12-month projection',
      icon: 'pi pi-calendar',
      tone: kpis.annualProfit >= 0 ? 'indigo' : 'rose',
    },
    {
      key: 'be',
      test: 'kpi-break-even',
      label: 'Break-even',
      value: breakEven,
      hint: 'Blended units to cover expenses',
      icon: 'pi pi-flag',
      tone: 'slate',
    },
  ]
})
</script>

<template>
  <section class="kpi-grid" aria-label="Snapshot" data-test="kpi-grid">
    <Card
      v-for="card in cards"
      :key="card.key"
      class="kpi-card"
      :class="`kpi-card--${card.tone}`"
      :data-test="card.test"
    >
      <template #content>
        <div class="kpi-card__icon" aria-hidden="true">
          <i :class="card.icon" />
        </div>
        <p class="kpi-card__label" data-test="kpi-label">{{ card.label }}</p>
        <p class="kpi-card__value" data-test="kpi-value">{{ card.value }}</p>
        <p class="kpi-card__hint" data-test="kpi-hint">{{ card.hint }}</p>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
}

.kpi-card {
  border: 0;
  box-shadow: 0 10px 24px rgba(28, 43, 39, 0.06);
}

.kpi-card :deep(.p-card-body) {
  padding: 1rem 1.1rem 1.15rem;
}

.kpi-card :deep(.p-card-content) {
  padding: 0;
}

.kpi-card__icon {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.7rem;
  display: grid;
  place-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.kpi-card--teal .kpi-card__icon {
  background: #d1fae5;
  color: #0f766e;
}

.kpi-card--amber .kpi-card__icon {
  background: #ffedd5;
  color: #c2410c;
}

.kpi-card--indigo .kpi-card__icon {
  background: #e0e7ff;
  color: #4338ca;
}

.kpi-card--rose .kpi-card__icon {
  background: #ffe4e6;
  color: #be123c;
}

.kpi-card--slate .kpi-card__icon {
  background: #e2e8f0;
  color: #334155;
}

.kpi-card__label,
.kpi-card__hint {
  margin: 0;
}

.kpi-card__label {
  font-size: 0.82rem;
  color: #5b6b66;
}

.kpi-card__value {
  margin: 0.35rem 0 0.2rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #14241f;
}

.kpi-card__hint {
  font-size: 0.75rem;
  color: #7a8a85;
}

@media (max-width: 700px) {
  .kpi-card__value {
    font-size: 1.25rem;
  }
}
</style>
