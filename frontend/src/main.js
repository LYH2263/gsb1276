import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import { installErrorHandling } from './plugins/errorHandling'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
installErrorHandling(app)

app.mount('#app')
