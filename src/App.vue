<script setup>
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import ExpenseEditor from './components/ExpenseEditor.vue'
import KpiCards from './components/KpiCards.vue'
import ProjectionCharts from './components/ProjectionCharts.vue'
import ProjectionSpreadsheet from './components/ProjectionSpreadsheet.vue'
import RevenueEditor from './components/RevenueEditor.vue'
import { useProjectionStore } from './stores/projection.js'

const store = useProjectionStore()
const confirm = useConfirm()
const toast = useToast()
const fileInput = ref(null)

function onGrowthChange(value) {
  store.setGrowthRate(value ?? 0)
}

function startBlank() {
  confirm.require({
    header: 'Start with a blank plan?',
    message: 'This clears the sample numbers so you can enter your own. You can import a backup later.',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Keep sample', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Clear and start fresh', severity: 'danger' },
    accept: () => {
      store.resetToEmpty()
      toast.add({ severity: 'success', summary: 'Blank plan ready', life: 2500 })
    },
  })
}

function restoreSample() {
  confirm.require({
    header: 'Load sample numbers?',
    message: 'This replaces what you have now with the example services and expenses.',
    icon: 'pi pi-info-circle',
    rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Load sample' },
    accept: () => {
      store.loadSample()
      toast.add({ severity: 'success', summary: 'Sample plan loaded', life: 2500 })
    },
  })
}

function onImportClick() {
  fileInput.value?.click()
}

function onImportFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result))
      confirm.require({
        header: 'Import this file?',
        message: 'Your current numbers will be replaced with the backup.',
        icon: 'pi pi-upload',
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Import' },
        accept: () => {
          store.importData(data)
          toast.add({ severity: 'success', summary: 'Projection imported', life: 2500 })
        },
      })
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Could not read that file',
        detail: 'Choose a JSON backup exported from this app.',
        life: 4000,
      })
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <Toast />
  <ConfirmDialog />

  <div class="app">
    <header class="hero">
      <div class="hero__brand">
        <span class="hero__mark" aria-hidden="true">
          <i class="pi pi-chart-bar" />
        </span>
        <div>
          <p class="hero__eyebrow">For your small business</p>
          <h1>Business Projector</h1>
          <p class="hero__lede">
            Try a price change, an upsell, or a new expense and watch the year update as you type.
          </p>
        </div>
      </div>

      <div class="hero__actions">
        <label class="growth">
          Monthly growth
          <InputNumber
            :model-value="store.settings.growthRatePct"
            suffix="%"
            :min="-20"
            :max="20"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            aria-label="Monthly growth rate"
            @update:model-value="onGrowthChange"
          />
        </label>
        <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="store.exportJson" />
        <Button label="Import" icon="pi pi-upload" severity="secondary" outlined @click="onImportClick" />
        <Button
          v-if="store.settings.isSampleData"
          label="Start with a blank plan"
          icon="pi pi-eraser"
          severity="danger"
          outlined
          @click="startBlank"
        />
        <Button v-else label="Load sample" icon="pi pi-replay" severity="secondary" text @click="restoreSample" />
        <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="onImportFile" />
      </div>
    </header>

    <Message v-if="store.settings.isSampleData" severity="info" :closable="false" class="sample-banner">
      You’re looking at sample numbers so you can see how the planner works. Change anything — or start with a
      blank plan when you’re ready.
    </Message>

    <KpiCards />
    <ProjectionCharts />

    <section class="editors">
      <RevenueEditor />
      <ExpenseEditor />
    </section>

    <ProjectionSpreadsheet />

    <p class="save-note">Saved automatically in this browser. Export a JSON backup if you want a copy on another computer.</p>
  </div>
</template>

<style scoped>
.app {
  width: min(1280px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 0.4rem 0 0.2rem;
}

.hero__brand {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.hero__mark {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  background: #0f766e;
  color: #ecfdf5;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.hero__eyebrow {
  margin: 0 0 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 600;
  color: #0f766e;
}

h1 {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 650;
  letter-spacing: -0.03em;
  color: #14241f;
}

.hero__lede {
  margin: 0.4rem 0 0;
  max-width: 38rem;
  color: #5b6b66;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;
  align-items: flex-end;
}

.growth {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #5b6b66;
}

.growth :deep(.p-inputnumber) {
  width: 10.5rem;
}

.editors {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 1rem;
  align-items: start;
}

.save-note {
  margin: 0;
  text-align: center;
  color: #7a8a85;
  font-size: 0.85rem;
}

.sample-banner {
  margin: 0;
  background: #ccfbf1 !important;
  border: 1px solid #5eead4 !important;
  color: #115e59 !important;
}

.sample-banner :deep(.p-message-text) {
  color: #115e59;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 960px) {
  .hero,
  .editors {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero__actions {
    justify-content: flex-start;
  }
}
</style>
