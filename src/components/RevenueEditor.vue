<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()
const confirm = useConfirm()

function monthlyPreview(revenue) {
  const row = store.month0.byRevenue[revenue.id]
  return store.money(row?.revenue || 0)
}

function onDelete(revenue) {
  confirm.require({
    header: 'Remove this service?',
    message: `"${revenue.name || 'Untitled service'}" and its upsells will be removed from the plan.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Keep it', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Remove', severity: 'danger' },
    accept: () => store.removeRevenue(revenue.id),
  })
}
</script>

<template>
  <Card class="editor">
    <template #title>Revenue opportunities</template>
    <template #subtitle>Price, estimated units, and optional upsells</template>
    <template #content>
      <div v-if="!store.revenues.length" class="empty">
        <p>Add a service or product to start projecting revenue.</p>
        <Button label="Add a service" icon="pi pi-plus" @click="store.addRevenue" />
      </div>

      <article v-for="revenue in store.revenues" :key="revenue.id" class="opportunity" :class="{ 'opportunity--off': !revenue.enabled }">
        <header class="opportunity__head">
          <ToggleSwitch
            :model-value="revenue.enabled"
            :input-id="`rev-on-${revenue.id}`"
            @update:model-value="store.updateRevenue(revenue.id, { enabled: $event })"
          />
          <InputText
            :model-value="revenue.name"
            class="opportunity__name"
            placeholder="Service name"
            aria-label="Service name"
            @update:model-value="store.updateRevenue(revenue.id, { name: $event })"
          />
          <span class="opportunity__preview">{{ monthlyPreview(revenue) }}/mo</span>
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Remove service"
            @click="onDelete(revenue)"
          />
        </header>

        <div class="field-grid">
          <label>
            Price
            <InputNumber
              :model-value="revenue.unitPrice"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              fluid
              @update:model-value="store.updateRevenue(revenue.id, { unitPrice: $event ?? 0 })"
            />
          </label>
          <label>
            Units / month
            <InputNumber
              :model-value="revenue.unitsPerMonth"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              fluid
              @update:model-value="store.updateRevenue(revenue.id, { unitsPerMonth: $event ?? 0 })"
            />
          </label>
          <label>
            Cost per unit
            <InputNumber
              :model-value="revenue.costPerUnit"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              fluid
              @update:model-value="store.updateRevenue(revenue.id, { costPerUnit: $event ?? 0 })"
            />
          </label>
        </div>

        <div class="upsells">
          <p class="upsells__label">Upsells</p>
          <div v-for="upsell in revenue.upsells" :key="upsell.id" class="upsell">
            <ToggleSwitch
              :model-value="upsell.enabled"
              :input-id="`up-on-${upsell.id}`"
              @update:model-value="store.updateUpsell(revenue.id, upsell.id, { enabled: $event })"
            />
            <InputText
              :model-value="upsell.name"
              placeholder="Upsell name"
              aria-label="Upsell name"
              @update:model-value="store.updateUpsell(revenue.id, upsell.id, { name: $event })"
            />
            <InputNumber
              :model-value="upsell.extraPrice"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              input-id=""
              aria-label="Upsell price"
              @update:model-value="store.updateUpsell(revenue.id, upsell.id, { extraPrice: $event ?? 0 })"
            />
            <InputNumber
              :model-value="upsell.attachRatePct"
              suffix="%"
              :min="0"
              :max="100"
              :min-fraction-digits="0"
              :max-fraction-digits="1"
              aria-label="Attach rate"
              @update:model-value="store.updateUpsell(revenue.id, upsell.id, { attachRatePct: $event ?? 0 })"
            />
            <Button
              icon="pi pi-times"
              severity="secondary"
              text
              rounded
              aria-label="Remove upsell"
              @click="store.removeUpsell(revenue.id, upsell.id)"
            />
          </div>
          <Button
            label="Add upsell"
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            outlined
            @click="store.addUpsell(revenue.id)"
          />
        </div>
      </article>

      <Button
        v-if="store.revenues.length"
        label="Add another service"
        icon="pi pi-plus"
        class="add-more"
        outlined
        @click="store.addRevenue"
      />
    </template>
  </Card>
</template>

<style scoped>
.editor {
  border: 0;
  box-shadow: 0 10px 24px rgba(28, 43, 39, 0.06);
  height: 100%;
}

.editor :deep(.p-card-title) {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.2rem;
}

.editor :deep(.p-card-subtitle) {
  color: #5b6b66;
  font-weight: 400;
}

.empty {
  text-align: center;
  padding: 1.5rem 0.5rem;
  color: #5b6b66;
}

.opportunity {
  border: 1px solid #e4ece8;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 0.9rem;
  background: #fbfdfc;
}

.opportunity--off {
  opacity: 0.55;
}

.opportunity__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 0.85rem;
}

.opportunity__name {
  width: 100%;
  font-weight: 600;
}

.opportunity__preview {
  font-size: 0.85rem;
  color: #0f766e;
  font-weight: 600;
  white-space: nowrap;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.field-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #5b6b66;
}

.upsells {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px dashed #d5e0db;
}

.upsells__label {
  margin: 0 0 0.55rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5b6b66;
}

.upsell {
  display: grid;
  grid-template-columns: auto minmax(0, 1.3fr) minmax(7rem, 0.8fr) minmax(5.5rem, 0.6fr) auto;
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 0.45rem;
}

.add-more {
  width: 100%;
}

@media (max-width: 700px) {
  .field-grid,
  .upsell {
    grid-template-columns: 1fr;
  }

  .opportunity__head {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .opportunity__preview {
    grid-column: 2;
  }
}
</style>
