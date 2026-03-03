# Dashboard 模块 React → Vue 转换对比

## 📄 文件结构对比

### React 版本
```
src/
└── Dashboard.tsx (690 行，单一文件)
    - 主组件
    - StatCard 子组件
    - TaskItem 子组件
    - ActivityItem 子组件
    - QuickActionButton 子组件
    - HealthBarItem 子组件
```

### Vue 版本
```
src-vue/
├── views/
│   └── Dashboard.vue (491 行)         # 主页面
├── components/
│   ├── StatCard.vue (62 行)          # 统计卡片
│   ├── TaskItem.vue (96 行)          # 任务项
│   ├── ActivityItem.vue (23 行)      # 活动项
│   ├── QuickActionButton.vue (50 行) # 快捷按钮
│   └── HealthBarItem.vue (48 行)     # 健康条
└── types/
    └── index.ts                       # 共用类型定义
```

## 🔍 关键代码对比

### 1. 组件定义

#### React
```tsx
// Dashboard.tsx
import React, { useState } from 'react'

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])

  return <div>...</div>
}
```

#### Vue
```vue
<!-- Dashboard.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const tasks = ref<Task[]>([])
</script>

<template>
  <div>...</div>
</template>
```

**差异**:
- ✅ Vue 的 `<script setup>` 更简洁
- ✅ 无需 `return` 语句，模板可直接访问变量
- ✅ `ref()` 替代 `useState()`

---

### 2. 状态管理

#### React
```tsx
const [tasks, setTasks] = useState<Task[]>([
  { id: '1', title: 'Task 1', completed: false }
])

const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('all')

// 更新状态
setTasks(tasks.map(t =>
  t.id === taskId ? { ...t, completed: !t.completed } : t
))
```

#### Vue
```ts
const tasks = ref<Task[]>([
  { id: '1', title: 'Task 1', completed: false }
])

const filterStatus = ref<'all' | 'pending'>('all')

// 更新状态
const task = tasks.value.find(t => t.id === taskId)
if (task) {
  task.completed = !task.completed  // Vue 3 可直接修改
}
```

**差异**:
- ✅ Vue 3 的 ref 是响应式的，可以直接修改属性
- ✅ React 需要调用 setter 来更新状态
- ⚠️ Vue 使用 `.value` 访问值（模板中自动解包）

---

### 3. 计算属性

#### React
```tsx
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'completed' && task.completed)
    return matchesSearch && matchesStatus
  })
}, [tasks, searchQuery, filterStatus])

const completedCount = useMemo(() =>
  tasks.filter(t => t.completed).length,
  [tasks]
)
```

#### Vue
```ts
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' ||
                         (filterStatus.value === 'completed' && task.completed)
    return matchesSearch && matchesStatus
  })
})

const completedCount = computed(() =>
  tasks.value.filter(t => t.completed).length
)
```

**差异**:
- ✅ Vue 的 `computed` 自动追踪依赖，无需手动声明依赖数组
- ✅ 写法更简洁，代码更少

---

### 4. 列表渲染

#### React
```tsx
<div className="space-y-4">
  {filteredTasks.map((task) => (
    <TaskItem
      key={task.id}
      title={task.title}
      desc={task.desc}
      completed={task.completed}
      onToggle={() => toggleTaskComplete(task.id)}
      onDelete={() => deleteTask(task.id)}
    />
  ))}
</div>
```

#### Vue
```vue
<div class="space-y-4">
  <TaskItem
    v-for="task in filteredTasks"
    :key="task.id"
    v-bind="task"
    @toggle="toggleTaskComplete(task.id)"
    @delete="deleteTask(task.id)"
  />
</div>
```

**差异**:
- ✅ Vue 的 `v-for` 更简洁
- ✅ `v-bind="task"` 展开所有属性（类似 React 的 `{...task}`）
- ✅ 事件用 `@event` 语法（更直观）

---

### 5. 条件渲染

#### React
```tsx
{filteredTasks.length > 0 ? (
  filteredTasks.map(task => <TaskItem key={task.id} {...task} />)
) : (
  <div className="text-center py-12">
    <CheckCircle2 size={48} className="text-slate-300 mx-auto mb-4" />
    <p className="text-slate-500">没有找到匹配的任务</p>
  </div>
)}
```

#### Vue
```vue
<template v-if="filteredTasks.length > 0">
  <TaskItem
    v-for="task in filteredTasks"
    :key="task.id"
    v-bind="task"
  />
</template>

<div v-else class="text-center py-12">
  <CheckCircle2 :size="48" class="text-slate-300 mx-auto mb-4" />
  <p class="text-slate-500">没有找到匹配的任务</p>
</div>
```

**差异**:
- ✅ Vue 的指令语法更明确
- ✅ `v-if` / `v-else` 逻辑更清晰

---

### 6. 表单输入

#### React
```tsx
<input
  type="text"
  placeholder="搜索任务..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full px-4 py-2"
/>

<select
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
>
  <option value="all">全部</option>
  <option value="pending">待完成</option>
</select>
```

#### Vue
```vue
<input
  v-model="searchQuery"
  type="text"
  placeholder="搜索任务..."
  class="w-full px-4 py-2"
/>

<select v-model="filterStatus">
  <option value="all">全部</option>
  <option value="pending">待完成</option>
</select>
```

**差异**:
- ✅ Vue 的 `v-model` 实现双向绑定，代码更少
- ✅ React 需要手动管理 value 和 onChange
- ✅ `v-model` 自动处理不同类型的输入

---

### 7. 事件处理

#### React
```tsx
<button
  onClick={() => handleQuickAction('发起首通电话')}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
>
  点击
</button>
```

#### Vue
```vue
<button
  @click="handleQuickAction('发起首通电话')"
  class="px-4 py-2 bg-indigo-600 text-white rounded-lg"
>
  点击
</button>
```

**差异**:
- ✅ Vue 的 `@click` 更简洁直观
- ✅ 参数传递语法更清晰
- ✅ 多个事件用 `@click`、`@submit` 等，一目了然

---

### 8. 组件 Props

#### React
```tsx
interface TaskItemProps {
  title: string
  desc: string
  completed: boolean
  onToggle: () => void
  onDelete: () => void
}

function TaskItem({ title, desc, completed, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={completed ? 'opacity-60' : ''}>
      <h4>{title}</h4>
      <button onClick={onToggle}>切换</button>
      <button onClick={onDelete}>删除</button>
    </div>
  )
}
```

#### Vue
```vue
<!-- TaskItem.vue -->
<script setup lang="ts">
interface Props {
  title: string
  desc: string
  completed: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  delete: []
}>()
</script>

<template>
  <div :class="completed ? 'opacity-60' : ''">
    <h4>{{ title }}</h4>
    <button @click="$emit('toggle')">切换</button>
    <button @click="$emit('delete')">删除</button>
  </div>
</template>
```

**差异**:
- ✅ Vue 的类型定义更简洁
- ✅ 事件用 `defineEmits` 声明，类型安全
- ✅ 模板中用 `{{ }}` 插值，更直观

---

### 9. 样式绑定

#### React
```tsx
<div className={`flex items-center gap-4 p-4 rounded-xl border ${
  priorityColors[priority] || 'border-l-slate-300'
} ${completed ? 'opacity-60' : ''}`}>
  内容
</div>
```

#### Vue
```vue
<div :class="`flex items-center gap-4 p-4 rounded-xl border ${
  priorityColors[priority] || 'border-l-slate-300'
} ${completed ? 'opacity-60' : ''}`">
  内容
</div>
```

**差异**:
- ⚠️ 基本相同（都支持模板字符串）
- ✅ Vue 还支持对象/数组语法：
```vue
<div :class="{ active: isActive, 'text-red': hasError }"></div>
```

---

### 10. 图标使用

#### React
```tsx
import { Search, Calendar, Plus } from 'lucide-react'

<Search size={16} />
<Calendar :size={18} className="text-indigo-600" />
<Plus size={18} />
```

#### Vue
```vue
<script setup>
import { Search, Calendar, Plus } from 'lucide-vue-next'
</script>

<template>
  <Search :size="16" />
  <Calendar :size="18" class="text-indigo-600" />
  <Plus :size="18" />
</template>
```

**差异**:
- ✅ 基本相同，只需更换图标库包名
- ✅ `lucide-vue-next` 是 Vue 3 版本
- ✅ 属性传递方式相同

---

## 📊 代码量对比

| 指标 | React | Vue | 差异 |
|------|-------|-----|------|
| 主文件行数 | 690 | 491 | -29% |
| 组件总数 | 1 (内嵌) | 6 (独立) | 更模块化 |
| 模板代码 | JSX | Template | - |
| 状态管理 | useState | ref | - |
| 计算属性 | useMemo | computed | 更简洁 |
| 事件处理 | onClick/@change | @click/@change | 更简洁 |

---

## ✅ 转换优势总结

### Vue 的优势
1. **更简洁的语法** - `<script setup>` 无需 return
2. **模板更直观** - HTML 模板 vs JSX
3. **双向绑定** - `v-model` 比 `onChange` 更简单
4. **指令系统** - `v-if`、`v-for` 更明确
5. **自动依赖追踪** - computed 无需声明依赖

### 保持不变
1. **TypeScript** - 类型定义完全复用
2. **Tailwind CSS** - 样式类名完全相同
3. **业务逻辑** - 算法和逻辑代码可直接复用
4. **图标库** - lucide-vue-next 与 lucide-react 用法相同

---

## 🎯 下一步

继续转换其他模块：
- 财务中心 (FinanceCenter)
- 会员管理 (MemberManagement)
- 课程管理 (CourseManagement)
- 人力结算 (SettlementManagement)

每个模块转换预计节省 **20-30%** 代码量，同时保持完全相同的功能和视觉效果。
