# React 到 Vue 迁移指南

## 📋 已完成转换的模块

### ✅ 仪表盘模块 (Dashboard)
- **原文件**: `src/Dashboard.tsx`
- **Vue文件**: `src-vue/views/Dashboard.vue`
- **子组件**:
  - `StatCard.vue` - 统计卡片组件
  - `TaskItem.vue` - 任务项组件
  - `ActivityItem.vue` - 活动项组件
  - `QuickActionButton.vue` - 快捷操作按钮组件
  - `HealthBarItem.vue` - 健康状态条组件

### ✅ 大屏监控模块 (SalesMonitor)
- **原文件**: `src/SalesMonitor.tsx`
- **Vue文件**: `src-vue/views/SalesMonitor.vue`
- **子组件**:
  - `Modal.vue` - 通用模态框组件
- **功能特性**:
  - 三种视图切换：预约管理、用户分配、教练状态
  - 动态表格，不同视图显示不同数据
  - 教练负载监控（带进度条）
  - 用户分配功能
  - 手动添加预约功能
  - 搜索和筛选功能

## 🔄 React → Vue 转换对照表

### 1. 导入语句
```typescript
// React
import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'

// Vue
import { ref, onMounted } from 'vue'
import { Users, Search } from 'lucide-vue-next'
```

### 2. 状态管理
```typescript
// React
const [count, setCount] = useState(0)
const [items, setItems] = useState([])

// Vue
const count = ref(0)
const items = ref([])
```

### 3. 计算属性
```typescript
// React
const filtered = useMemo(() => {
  return items.filter(item => item.active)
}, [items])

// Vue
const filtered = computed(() => {
  return items.value.filter(item => item.active)
})
```

### 4. 事件处理
```tsx
// React
<input value={val} onChange={e => setVal(e.target.value)} />
<button onClick={handleClick}>点击</button>

<!-- Vue -->
<input v-model="val" />
<button @click="handleClick">点击</button>
```

### 5. 条件渲染
```tsx
// React
{condition && <Component />}
{isActive ? <Active /> : <Inactive />}

<!-- Vue -->
<Component v-if="condition" />
<Active v-if="isActive" />
<Inactive v-else />
```

### 6. 列表渲染
```tsx
// React
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

<!-- Vue -->
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
```

### 7. 组件定义
```tsx
// React
function MyComponent({ prop1, prop2 }: Props) {
  return <div>...</div>
}

<!-- Vue -->
<script setup lang="ts">
interface Props {
  prop1: string
  prop2: number
}
defineProps<Props>()
</script>

<template>
  <div>...</div>
</template>
```

## 📁 Vue 项目结构

```
src-vue/
├── views/              # 页面组件
│   └── Dashboard.vue   # 仪表盘
├── components/         # 可复用组件
│   ├── StatCard.vue
│   ├── TaskItem.vue
│   ├── ActivityItem.vue
│   ├── QuickActionButton.vue
│   └── HealthBarItem.vue
├── router/            # 路由配置
│   └── index.ts
├── stores/            # Pinia 状态管理
│   └── index.ts
├── composables/       # 组合式函数
│   └── useTasks.ts
└── types/            # TypeScript 类型定义
    └── index.ts
```

## 🚀 如何集成到现有项目

### 方案一：微前端（推荐）

使用 qiankun 或 micro-app 实现 React 和 Vue 共存：

```javascript
// 主应用 (React) - 注册 Vue 子应用
import { registerMicroApps } from 'qiankun'

registerMicroApps([
  {
    name: 'vue-dashboard',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/dashboard',
  }
])
```

### 方案二：渐进式替换

1. 在 `src` 目录下创建 `vue` 文件夹
2. 逐步替换页面组件
3. 保持路由和状态管理兼容

## 📦 依赖安装

```bash
# Vue 3 核心
npm install vue@latest

# Vue Router
npm install vue-router@4

# Pinia 状态管理
npm install pinia

# 图标库
npm install lucide-vue-next

# TypeScript 支持
npm install -D vue-tsc
```

## 🎯 下一步迁移计划

### 高优先级 (1-2个月)
- [x] 仪表盘模块 ✅
- [x] 大屏监控模块 ✅
- [ ] 财务中心模块 (刚完成增强)
- [ ] 会员管理模块
- [ ] 课程管理模块
- [ ] 报表统计模块

### 中优先级 (3-6个月)
- [ ] 人力结算模块
- [ ] 库存管理模块
- [ ] 预约管理模块
- [ ] 健康档案模块

### 低优先级 (6个月后)
- [ ] 系统设置
- [ ] 基础组件库
- [ ] 工具函数

## 💡 迁移最佳实践

### 1. 保持类型安全
```typescript
// types/index.ts - 可在 React 和 Vue 中共用
interface Task {
  id: string
  title: string
  completed: boolean
}

export type { Task }
```

### 2. 业务逻辑复用
```typescript
// composables/useTaskFilter.ts
import { computed } from 'vue'
import type { Task } from '@/types'

export function useTaskFilter(tasks: Ref<Task[]>) {
  const filterStatus = ref<'all' | 'active' | 'completed'>('all')

  const filtered = computed(() => {
    // 筛选逻辑
  })

  return { filterStatus, filtered }
}
```

### 3. 样式系统复用
```html
<!-- Tailwind CSS 类名完全相同 -->
<div class="bg-white rounded-xl p-4 shadow-sm">
  <!-- 内容 -->
</div>
```

## ⚠️ 注意事项

### React 特有 → Vue 替代

| React | Vue | 说明 |
|-------|-----|------|
| `className` | `class` | 类名属性 |
| `htmlFor` | `for` | 表单标签 |
| `onChange` | `@change` / `v-model` | 事件处理 |
| `useEffect` | `onMounted` / `watch` | 生命周期 |
| `useContext` | `inject` | 上下文 |
| `React.memo` | `defineProps` | 组件优化 |

### Vue 3 特性

1. **Composition API** - 更好的逻辑复用
2. **`<script setup>`** - 更简洁的语法
3. **响应式系统** - 基于 Proxy，性能更好
4. **单文件组件** - 模板、逻辑、样式一体化

## 📚 学习资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Composition API 手册](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)

## 🔧 开发工具

```bash
# 安装 Vue DevTools
npm install -D @vue/devtools

# Volar (VSCode 插件)
# 替代 Vetur，提供更好的 TypeScript 支持
```

## 📝 转换检查清单

- [ ] 组件语法转换
- [ ] 状态管理重构
- [ ] 事件绑定更新
- [ ] 路由配置迁移
- [ ] 类型定义复用
- [ ] 样式系统验证
- [ ] 功能测试
- [ ] 性能对比

---

**迁移进度**: 2/10 模块完成 (20%)

**下次更新**: 继续转换财务中心或其他模块
