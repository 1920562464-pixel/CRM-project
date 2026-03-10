import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入 Tailwind CSS
import './styles/index.css'

// 抑制Teleport组件的属性继承警告（这是Vue 3使用Teleport时的已知行为，不影响功能）
const app = createApp(App, {
  // 在生产环境中可以配置警告过滤器
  devtools: {
    // 保留Vue DevTools
  }
})

// 可选：在开发环境中抑制特定的警告
if (import.meta.env.DEV) {
  const originalWarn = console.warn
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Extraneous non-props attributes')) {
      return // 忽略这个特定警告
    }
    originalWarn.apply(console, args)
  }
}

app.use(createPinia())
app.use(router)

app.mount('#vue-app')
