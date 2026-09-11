<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { EXPENSE_CATEGORIES, EXPENSE_DUE_MONTHS, EXPENSE_FREQUENCIES } from '../utils/sampleData.js'
import { useProjectionStore } from '../stores/projection.js'

const store = useProjectionStore()
const confirm = useConfirm()

function dueMonthLabel(expense) {
  return expense.frequency === 'quarterly' ? 'First due month' : 'Due month'
}

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
  <Card class="editor" data-test="expense-editor">
    <template #title>Expenses</template>
    <template #subtitle>What it costs to keep the business running</template>
    <template #content>
      <div v-if="!store.expenses.length" class="empty" data-test="expense-empty">
        <p>Add rent, software, quarterly taxes, and anything else the business pays.</p>
        <Button label="Add an expense" icon="pi pi-plus" data-test="expense-add" @click="store.addExpense" />
      </div>

      <article
        v-for="expense in store.expenses"
        :key="expense.id"
        class="expense"
        :class="{ 'expense--off': !expense.enabled }"
        data-test="expense-row"
      >
        <ToggleSwitch
          class="expense__toggle"
          :model-value="expense.enabled"
          :input-id="`exp-on-${expense.id}`"
          data-test="expense-enabled"
          @update:model-value="store.updateExpense(expense.id, { enabled: $event })"
        />
        <InputText
          class="expense__name"
          :model-value="expense.name"
          placeholder="Expense name"
          aria-label="Expense name"
          data-test="expense-name"
          @update:model-value="store.updateExpense(expense.id, { name: $event })"
        />
        <Select
          class="expense__category"
          :model-value="expense.category"
          :options="EXPENSE_CATEGORIES"
          option-label="label"
          option-value="value"
          aria-label="Category"
          data-test="expense-category"
          :pt="{ overlay: { 'data-test': 'expense-category-overlay' } }"
          @update:model-value="store.updateExpense(expense.id, { category: $event })"
        />
        <InputNumber
          class="expense__amount"
          :model-value="expense.amount"
          mode="currency"
          currency="USD"
          locale="en-US"
          :min="0"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          aria-label="Amount"
          data-test="expense-amount"
          @update:model-value="store.updateExpense(expense.id, { amount: $event ?? 0 })"
        />
        <Button
          class="expense__delete"
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          aria-label="Remove expense"
          data-test="expense-delete"
          @click="onDelete(expense)"
        />
        <div class="expense__cadence">
          <Select
            :model-value="expense.frequency"
            :options="EXPENSE_FREQUENCIES"
            option-label="label"
            option-value="value"
            aria-label="Frequency"
            data-test="expense-frequency"
            :pt="{ overlay: { 'data-test': 'expense-frequency-overlay' } }"
            @update:model-value="store.updateExpense(expense.id, { frequency: $event })"
          />
          <Select
            v-if="expense.frequency !== 'monthly'"
            :model-value="expense.startMonth"
            :options="EXPENSE_DUE_MONTHS"
            option-label="label"
            option-value="value"
            :aria-label="dueMonthLabel(expense)"
            data-test="expense-due-month"
            :pt="{ overlay: { 'data-test': 'expense-due-month-overlay' } }"
            @update:model-value="store.updateExpense(expense.id, { startMonth: $event ?? 0 })"
          />
        </div>
      </article>

      <Button
        v-if="store.expenses.length"
        label="Add another expense"
        icon="pi pi-plus"
        class="add-more"
        outlined
        data-test="expense-add"
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
  grid-template-areas:
    'toggle name category amount delete'
    '. cadence cadence cadence .';
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.65rem;
  padding: 0.65rem 0.7rem;
  border: 1px solid #e4ece8;
  border-radius: 0.9rem;
  background: #fbfdfc;
}

.expense__toggle {
  grid-area: toggle;
}

.expense__name {
  grid-area: name;
}

.expense__category {
  grid-area: category;
}

.expense__amount {
  grid-area: amount;
}

.expense__delete {
  grid-area: delete;
}

.expense__cadence {
  grid-area: cadence;
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) minmax(9rem, 1fr);
  gap: 0.5rem;
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
    grid-template-areas:
      'toggle name delete'
      'category category category'
      'amount amount amount'
      'cadence cadence cadence';
  }

  .expense__cadence {
    grid-template-columns: 1fr;
  }
}
</style>
