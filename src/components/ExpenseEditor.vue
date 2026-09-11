<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { EXPENSE_CATEGORIES } from '../utils/sampleData.js'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()
const confirm = useConfirm()

function onDelete(expense) {
  confirm.require({
    header: 'Remove this expense?',
    message: `"${expense.name || 'Untitled expense'}" will be removed from the plan.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Keep it', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Remove', severity: 'danger' },
    accept: () => store.removeExpense(expense.id),
  })
}
</script>

<template>
  <Card class="editor">
    <template #title>Monthly expenses</template>
    <template #subtitle>What it costs to keep the business running</template>
    <template #content>
      <div v-if="!store.expenses.length" class="empty">
        <p>Add rent, software, supplies, and anything else that repeats each month.</p>
        <Button label="Add an expense" icon="pi pi-plus" @click="store.addExpense" />
      </div>

      <article v-for="expense in store.expenses" :key="expense.id" class="expense" :class="{ 'expense--off': !expense.enabled }">
        <ToggleSwitch
          :model-value="expense.enabled"
          :input-id="`exp-on-${expense.id}`"
          @update:model-value="store.updateExpense(expense.id, { enabled: $event })"
        />
        <InputText
          :model-value="expense.name"
          placeholder="Expense name"
          aria-label="Expense name"
          @update:model-value="store.updateExpense(expense.id, { name: $event })"
        />
        <Select
          :model-value="expense.category"
          :options="EXPENSE_CATEGORIES"
          option-label="label"
          option-value="value"
          aria-label="Category"
          @update:model-value="store.updateExpense(expense.id, { category: $event })"
        />
        <InputNumber
          :model-value="expense.amount"
          mode="currency"
          currency="USD"
          locale="en-US"
          :min="0"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          aria-label="Monthly amount"
          @update:model-value="store.updateExpense(expense.id, { amount: $event ?? 0 })"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          aria-label="Remove expense"
          @click="onDelete(expense)"
        />
      </article>

      <Button
        v-if="store.expenses.length"
        label="Add another expense"
        icon="pi pi-plus"
        class="add-more"
        outlined
        @click="store.addExpense"
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

.expense {
  display: grid;
  grid-template-columns: auto minmax(0, 1.2fr) minmax(9rem, 0.9fr) minmax(7.5rem, 0.7fr) auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.65rem;
  padding: 0.65rem 0.7rem;
  border: 1px solid #e4ece8;
  border-radius: 0.9rem;
  background: #fbfdfc;
}

.expense--off {
  opacity: 0.55;
}

.add-more {
  width: 100%;
  margin-top: 0.35rem;
}

@media (max-width: 700px) {
  .expense {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .expense :deep(.p-select),
  .expense :deep(.p-inputnumber) {
    grid-column: 1 / -1;
  }
}
</style>
