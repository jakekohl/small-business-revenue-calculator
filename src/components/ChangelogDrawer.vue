<script setup>
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Tag from 'primevue/tag'
import { ref } from 'vue'
import { CHANGELOG, changelogEntryUrl } from '../data/changelog.js'
import { GITHUB_MERGED_PRS_URL } from '../data/github.js'

const visible = ref(false)

function formatEntryDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`))
}

function typeLabel(type) {
  return type === 'bug' ? 'Fix' : 'New'
}

function typeSeverity(type) {
  return type === 'bug' ? 'warn' : 'success'
}
</script>

<template>
  <div v-show="!visible" class="changelog-launch">
    <Button
      icon="pi pi-star-fill"
      aria-label="What’s new"
      aria-haspopup="dialog"
      aria-controls="changelog-drawer"
      :aria-expanded="visible"
      data-test="changelog-open"
      @click="visible = true"
    />
  </div>

  <Drawer
    id="changelog-drawer"
    v-model:visible="visible"
    position="right"
    class="changelog-panel"
    :pt="{
      root: { 'data-test': 'changelog-drawer' },
      header: { 'data-test': 'changelog-header' },
      content: { 'data-test': 'changelog-content' },
      footer: { 'data-test': 'changelog-footer' },
      pcCloseButton: { root: { 'data-test': 'changelog-close' } },
    }"
  >
    <template #header>
      <div class="changelog-heading">
        <i class="pi pi-star-fill" aria-hidden="true" />
        <span data-test="changelog-title">What’s new</span>
      </div>
    </template>

    <ol class="changelog-list">
      <li v-for="entry in CHANGELOG" :key="`${entry.date}-${entry.title}`" class="changelog-entry" data-test="changelog-entry">
        <div class="changelog-entry__meta">
          <Tag :value="typeLabel(entry.type)" :severity="typeSeverity(entry.type)" data-test="changelog-entry-type" />
          <time :datetime="entry.date" data-test="changelog-entry-date">{{ formatEntryDate(entry.date) }}</time>
        </div>
        <h3 data-test="changelog-entry-title">{{ entry.title }}</h3>
        <p data-test="changelog-entry-summary">{{ entry.summary }}</p>
        <Button
          v-if="changelogEntryUrl(entry)"
          as="a"
          :href="changelogEntryUrl(entry)"
          label="Details on GitHub"
          icon="pi pi-github"
          link
          target="_blank"
          rel="noopener noreferrer"
          data-test="changelog-entry-link"
        />
      </li>
    </ol>

    <template #footer>
      <Button
        as="a"
        :href="GITHUB_MERGED_PRS_URL"
        label="See updates on GitHub"
        icon="pi pi-github"
        severity="secondary"
        outlined
        target="_blank"
        rel="noopener noreferrer"
        data-test="changelog-github"
      />
    </template>
  </Drawer>
</template>

<style scoped>
.changelog-launch {
  position: fixed;
  top: 38%;
  right: 0;
  z-index: 20;
}

.changelog-launch :deep(.p-button) {
  width: 2.65rem;
  height: 3.15rem;
  border-radius: 0.85rem 0 0 0.85rem;
  box-shadow: -4px 6px 18px rgba(20, 36, 31, 0.14);
}

.changelog-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 650;
  color: #14241f;
}

.changelog-heading i {
  color: #0f766e;
}

.changelog-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.changelog-entry {
  padding-bottom: 1.15rem;
  border-bottom: 1px solid #d7e4df;
}

.changelog-entry:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.changelog-entry__meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.4rem;
}

.changelog-entry time {
  color: #7a8a85;
  font-size: 0.78rem;
}

.changelog-entry h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
  color: #14241f;
}

.changelog-entry p {
  margin: 0.35rem 0 0;
  color: #5b6b66;
  font-size: 0.9rem;
  line-height: 1.45;
}

.changelog-entry :deep(.p-button) {
  padding-inline: 0;
  margin-top: 0.35rem;
  font-size: 0.85rem;
}
</style>

<style>
.changelog-panel.p-drawer {
  width: min(24rem, 100vw);
}

.changelog-panel .p-drawer-footer {
  justify-content: stretch;
}

.changelog-panel .p-drawer-footer .p-button {
  width: 100%;
  justify-content: center;
}
</style>
