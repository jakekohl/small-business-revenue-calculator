<script setup>
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import { computed } from 'vue'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()

const moneyTick = (value) => store.money(value)

const trendOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
    },
    tooltip: {
      callbacks: {
        label(context) {
          return ` ${context.dataset.label}: ${moneyTick(context.parsed.y)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#5b6b66' },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#5b6b66',
        callback: moneyTick,
      },
      grid: { color: 'rgba(20, 36, 31, 0.06)' },
    },
  },
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, padding: 12, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label(context) {
          return ` ${context.label}: ${moneyTick(context.parsed)}`
        },
      },
    },
  },
}))

const hasRevenueMix = computed(() => store.revenueMixChart.labels.length > 0)
const hasExpenseMix = computed(() => store.expenseMixChart.labels.length > 0)
</script>

<template>
  <section class="charts" aria-label="Charts" data-test="charts">
    <Card class="charts__trend" data-test="chart-trend">
      <template #title>12-month outlook</template>
      <template #subtitle>Revenue, expenses, and profit as you change the numbers</template>
      <template #content>
        <div class="chart-frame chart-frame--trend" data-test="chart-trend-canvas">
          <Chart type="line" :data="store.trendChart" :options="trendOptions" :height="280" />
        </div>
      </template>
    </Card>

    <Card class="charts__mix" data-test="chart-revenue-mix">
      <template #title>Revenue mix</template>
      <template #subtitle>Share of yearly revenue</template>
      <template #content>
        <div v-if="hasRevenueMix" class="chart-frame" data-test="chart-revenue-mix-canvas">
          <Chart type="doughnut" :data="store.revenueMixChart" :options="doughnutOptions" :height="220" />
        </div>
        <p v-else class="empty" data-test="chart-revenue-mix-empty">Add a service to see the mix.</p>
      </template>
    </Card>

    <Card class="charts__mix" data-test="chart-expense-mix">
      <template #title>Expense mix</template>
      <template #subtitle>Share of yearly expenses</template>
      <template #content>
        <div v-if="hasExpenseMix" class="chart-frame" data-test="chart-expense-mix-canvas">
          <Chart type="doughnut" :data="store.expenseMixChart" :options="doughnutOptions" :height="220" />
        </div>
        <p v-else class="empty" data-test="chart-expense-mix-empty">Add an expense to see the mix.</p>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.charts {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.7fr) minmax(0, 0.7fr);
  gap: 1rem;
}

.charts :deep(.p-card) {
  border: 0;
  box-shadow: 0 10px 24px rgba(28, 43, 39, 0.06);
  height: 100%;
}

.charts :deep(.p-card-title) {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
}

.charts :deep(.p-card-subtitle) {
  color: #5b6b66;
  font-weight: 400;
}

.chart-frame {
  height: 220px;
  position: relative;
}

.chart-frame--trend {
  height: 280px;
}

.chart-frame :deep(.p-chart),
.chart-frame :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.empty {
  margin: 2.5rem 0;
  text-align: center;
  color: #7a8a85;
}

@media (max-width: 1100px) {
  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
