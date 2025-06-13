import './style.css'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')

// Add min-width to the root app element
document.getElementById('app').style.minWidth = '60vw'
