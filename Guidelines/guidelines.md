# 惯能健康 CRM - 开发规范指南

## 技术栈

- **React 19.2.4** - 使用函数式组件和 Hooks
- **TypeScript 5.9.3** - 所有组件和函数必须定义类型
- **Vite 7.3.1** - 构建工具
- **TailwindCSS** - 样式框架
- **Lucide React** - 图标库
- **Recharts** - 图表库

---

## 代码规范

### 组件定义

- 使用**命名导出**（Named Export），而不是默认导出
- 组件使用 PascalCase 命名
- Props 接口使用 `ComponentNameProps` 格式

```tsx
// ✅ 正确
export function Dashboard() { ... }
interface ClientListProps { onNavigate: (view: View) => void }
export function ClientList({ onNavigate }: ClientListProps) { ... }

// ❌ 错误
export default function Dashboard() { ... }
```

### 常量定义

- Mock 数据和常量使用 `UPPER_SNAKE_CASE`
- 定义在组件内部或文件顶部

```tsx
const MOCK_CLIENTS = [...];
```

---

## 样式规范

### 颜色系统

使用 TailwindCSS 颜色，主要色调：

| 用途 | 颜色 | Tailwind 类 |
|------|------|-------------|
| 主色 | Indigo | `bg-indigo-500`, `text-indigo-600` |
| 危险/错误 | Red | `bg-red-50`, `text-red-600` |
| 警告 | Orange | `bg-orange-50`, `text-orange-600` |
| 成功 | Emerald | `bg-emerald-50`, `text-emerald-600` |
| 中性文本 | Slate | `text-slate-500`, `text-slate-800` |
| 边框 | Slate | `border-slate-200`, `border-slate-100` |

### 布局

- **优先使用 flexbox 和 grid**，避免绝对定位
- 卡片容器：`bg-white rounded-xl shadow-sm border border-slate-200`
- 间距：使用 `space-y-6` 或 `gap-6`
- 页面容器：`space-y-6 animate-in fade-in duration-500`

### 圆角

- 小元素：`rounded-md`
- 卡片：`rounded-xl`
- 圆形（头像等）：`rounded-full`

### 阴影

- 轻微：`shadow-sm`
- 标准：`shadow`
- 强调：`shadow-lg`

### 动画

页面/组件淡入：
```tsx
className="animate-in fade-in duration-500"
```

---

## TypeScript 规范

### 类型定义

- 所有 Props 必须定义接口
- 使用 `View` 类型（定义在 App.tsx）进行导航

```tsx
import { View } from '../App';

interface ComponentProps {
  onNavigate: (view: View, clientId?: string) => void;
  clientId?: string;
}
```

---

## 组件结构

### 文件结构

- 所有组件放在 `src/` 目录下
- 每个组件一个文件
- 组件文件使用 PascalCase 命名（如 `Dashboard.tsx`）

### 组件内部顺序

```tsx
1. Import 语句
2. 常量定义（Mock 数据）
3. 接口定义
4. 子组件定义（如有）
5. 主组件导出
```

---

## 图标使用

统一使用 **Lucide React**：

```tsx
import { Users, Activity, AlertTriangle } from 'lucide-react';

<Users size={20} className="text-indigo-600" />
```

---

## 导航规范

### 导航函数

```tsx
interface ComponentProps {
  onNavigate: (view: View, clientId?: string) => void;
}

// 使用
onClick={() => onNavigate('client-detail-intervention', '1')}
```

### View 类型

定义在 `App.tsx`，包括：
- `'dashboard'` - 仪表盘
- `'client-list'` - 客户列表
- `'client-profile'` - 客户详情
- `'sales-monitor'` - 大屏监控
- `'lead-management'` - 客情概览
- `'ai-chat'` - AI 对话
- `'knowledge-base'` - 知识库
- 等等...

---

## 数据展示

### 数字格式

- 数字大号显示：`text-2xl font-bold`
- 小号单位：`text-xs font-normal`

```tsx
<div className="text-2xl font-bold text-red-600 mt-1">
  12 <span className="text-xs text-red-400 font-normal">人</span>
</div>
```

### 状态标签

使用背景色 + 文字色组合：

```tsx
<span className="bg-red-50 text-red-600 px-2 py-1 rounded">高风险</span>
<span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">首通</span>
```

---

## 按钮规范

### 主按钮

```tsx
<button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
  <Plus size={18} /> 新建任务
</button>
```

### 次要按钮

```tsx
<button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2">
  <Calendar size={18} /> 日程安排
</button>
```

### 文字按钮

```tsx
<button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
  查看全部 <ArrowRight size={16} />
</button>
```

---

## 响应式设计

- 使用 Tailwind 响应式前缀：`md:`, `lg:`
- Grid 布局：`grid-cols-1 md:grid-cols-4`
- 侧边栏：移动端隐藏，桌面端显示

---

## 表单规范

- 输入框：`border border-slate-200 rounded-lg px-3 py-2`
- 标签：`text-sm font-medium text-slate-700`
- 必填项标记：红色星号 `*`

---

## 健康管理业务特定规范

### 客户数据

- **clientId** 作为唯一标识符
- 支持的功能模块：干预管理、健康数据、会话标注、内容配置、数据中心

### CGM（动态血糖监测）

- 数据展示使用图表（Recharts）
- 异常数据用红色标记
- 支持导出和打印

### 风险分级

- **高风险**：红色 (`bg-red-50 text-red-600`)
- **中风险**：橙色 (`bg-orange-50 text-orange-600`)
- **正常**：绿色/蓝色 (`bg-indigo-50 text-indigo-600`)

---

## 注释规范

- 组件顶部添加描述注释
- 复杂逻辑添加行内注释
- 使用中文注释

```tsx
/**
 * 客户列表页面
 * 展示所有客户的健康状态、依从度等信息
 */
export function ClientList({ onNavigate }: ClientListProps) {
  // ...代码
}
```

---

## 禁止事项

- ❌ 不要使用内联样式（除非动态计算）
- ❌ 不要使用默认导出
- ❌ 不要省略 TypeScript 类型定义
- ❌ 不要混用不同的图标库
- ❌ 不要硬编码颜色值（使用 Tailwind 类或 CSS 变量）
- ❌ 不要使用 `any` 类型

---

## 最佳实践

1. **保持组件小而专注** - 单个组件不超过 300 行
2. **提取子组件** - 重复的 UI 元素提取为独立组件
3. **使用常量** - Mock 数据和配置使用常量
4. **语义化 HTML** - 使用正确的 HTML 标签
5. **可访问性** - 按钮和链接要有清晰的文本描述
6. **错误处理** - 加载和错误状态的 UI 提示
