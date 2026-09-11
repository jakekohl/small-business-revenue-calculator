import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { createApp } from 'vue'
import App from './App.vue'
import 'primeicons/primeicons.css'
import './style.css'

const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{teal.50}',
      100: '{teal.100}',
      200: '{teal.200}',
      300: '{teal.300}',
      400: '{teal.400}',
      500: '{teal.500}',
      600: '{teal.600}',
      700: '{teal.700}',
      800: '{teal.800}',
      900: '{teal.900}',
      950: '{teal.950}',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: AppPreset,
    options: {
      darkModeSelector: 'none',
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)
app.mount('#app')
