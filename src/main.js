import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import i18n from './locales'

const app = createApp(App)
const pinia = createPinia() 

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(Antd)

app.mount('#app')