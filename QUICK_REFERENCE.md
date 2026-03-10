# 惯能健康 CRM - 快速参考手册

## 🎯 路由映射表

| 路径 | 页面名称 | 组件文件 | 功能描述 |
|------|---------|---------|---------|
| `/` | 首页 | - | 重定向到 /dashboard |
| `/dashboard` | 工作台 | `RoleBasedDashboard.vue` | 基于角色的仪表盘 |
| `/sales-monitor` | 客情管理 | `SalesMonitor.vue` | 大屏监控、用户分配、教练管理 |
| `/client-list` | 客户列表 | `ClientList.vue` | 客户查询和管理 |
| `/client-profile/:id` | 客户档案 | `ClientProfile.vue` | 客户详细信息 |
| `/lead-management` | 潜客管理 | `LeadManagement.vue` | 潜在客户管理 |
| `/batch-task-processor` | 批量任务 | `BatchTaskProcessor.vue` | 批量化任务处理 |
| `/finance-center` | 财务中心 | `FinanceCenter.vue` | 财务管理主页 |
| `/finance-overview` | 财务概览 | `FinanceOverview.vue` | 财务数据概览 |
| `/income-management` | 收入管理 | `IncomeManagement.vue` | 收入记录和统计 |
| `/account-receivable` | 应收账款 | `AccountReceivable.vue` | 应收账款管理 |
| `/account-payable` | 应付账款 | `AccountPayable.vue` | 应付账款管理 |
| `/funds-management` | 资金管理 | `FundsManagement.vue` | 资金流水管理 |
| `/budget-management` | 预算管理 | `BudgetManagement.vue` | 预算编制和执行 |
| `/cost-accounting` | 成本核算 | `CostAccounting.vue` | 成本归集和分析 |
| `/financial-reports` | 财务报表 | `FinancialReports.vue` | 各类财务报表 |
| `/reimbursement` | 报销管理 | `Reimbursement.vue` | 报销申请和审批 |
| `/settlement-management` | 结算管理 | `SettlementOverview.vue` | 结算概览（新版） |
| `/coach-reimbursement` | 教练报销 | `CoachReimbursement.vue` | 教练报销管理 |
| `/inventory-management` | 库存管理 | `InventoryManagement.vue` | 库存管理 |
| `/asset-management` | 资产管理 | `AssetManagement.vue` | 固定资产管理 |
| `/ai-chat` | AI助手 | `AIChat.vue` | 智能对话助手 |
| `/knowledge-base` | 知识库 | `KnowledgeBase.vue` | 文档和知识管理 |
| `/alert-center` | 预警中心 | `AlertCenter.vue` | 预警信息管理 |
| `/risk-prediction` | 风险预测 | `RiskPredictionCenter.vue` | 健康风险评估 |
| `/system-management` | 系统管理 | `SystemManagement.vue` | 系统配置 |

## 🧩 Composables 快速参考

### useRole - 角色管理
```typescript
import { useRole } from '@/composables/useRole'

const {
  currentRole,              // 当前角色
  roleConfig,               // 角色配置
  switchRole,               // 切换角色
  updateRoleConfig          // 更新角色配置
} = useRole()

// 使用示例
switchRole('coach')         // 切换到教练角色
```

### useTheme - 主题管理
```typescript
import { useTheme } from '@/composables/useTheme'

const {
  currentTheme,             // 当前主题
  themeConfig,              // 主题配置
  setTheme,                 // 设置主题
  sidebarWidth,             // 侧边栏宽度
  isSidebarCollapsed        // 侧边栏是否收起
} = useTheme()

// 使用示例
setTheme('black-gold')      // 切换到黑金主题
```

### useToast - 消息提示
```typescript
import { useToast } from '@/composables/useToast'

const toast = useToast()

// 使用示例
toast.success('成功', '操作完成')
toast.error('错误', '操作失败')
toast.info('提示', '这是一条信息')
toast.warning('警告', '请注意')
```

### useRiskPrediction - 风险预测
```typescript
import { useRiskPrediction } from '@/composables/useRiskPrediction'

const {
  riskPredictions,          // 风险预测列表
  loading,                  // 加载状态
  getRiskStats,             // 获取风险统计
  getPredictionsByLevel,    // 按等级获取预测
  refreshPredictions,       // 刷新预测数据
  predictRisk               // 预测风险
} = useRiskPrediction()

// 使用示例
const stats = getRiskStats.value  // { high, medium, low, total }
```

### useSalary - 薪酬管理
```typescript
import { useSalary } from '@/composables/useSalary'

const {
  salaryData,                // 薪酬数据
  calculateSalary,           // 计算薪酬
  generateSalarySlip         // 生成工资条
} = useSalary()
```

### useCommission - 佣金管理
```typescript
import { useCommission } from '@/composables/useCommission'

const {
  commissionData,            // 佣金数据
  calculateCommission,       // 计算佣金
  commissionRecords          // 佣金记录
} = useCommission()
```

## 🎨 主题配置

### 可用主题
- `classic-blue` - 经典蓝（默认）
- `black-gold` - 黑金风格
- `warm-yellow` - 暖黄风格

### 主题相关 CSS 变量
```css
/* 背景色 */
--background-page
--background-card
--fill-light
--fill-hover

/* 文字色 */
--text-primary
--text-secondary
--text-tertiary

/* 侧边栏 */
--sidebar-background
--sidebar-foreground
--sidebar-border
--sidebar-accent

/* 其他 */
--border-color
--shadow-color
```

## 👥 角色配置

### 可用角色
- `admin` - 系统管理员
- `manager` - 管理者
- `coach` - 教练
- `doctor` - 医生
- `consultant` - 顾问
- `finance` - 财务

### 角色配置结构
```typescript
interface RoleConfig {
  name: string              // 角色名称
  description: string       // 角色描述
  icon: Component           // 角色图标
  color: string            // 角色颜色
  permissions: string[]    // 权限列表
  menuItems: MenuItem[]    // 菜单项
}
```

## 📦 共享组件

### Modal - 模态框
```vue
<Modal
  v-model:show="showModal"
  title="标题"
  size="lg"  <!-- sm | md | lg | xl | full -->
>
  <p>内容</p>
  <template #footer>
    <button @click="showModal = false">关闭</button>
  </template>
</Modal>
```

### Toast - 提示消息
```typescript
import Toast from '@/components/shared/Toast.vue'

// 在组件中使用
const toast = useToast()
toast.success('标题', '内容')
```

### ConfirmDialog - 确认对话框
```vue
<ConfirmDialog
  v-model:show="showConfirm"
  title="确认操作"
  message="确定要执行此操作吗？"
  @confirm="handleConfirm"
/>
```

## 🔑 常用工具函数

### 路由导航
```typescript
import { useRouter } from 'vue-router'

const router = useRouter()
router.push('/dashboard')           // 导航到指定路由
router.push({ name: 'Dashboard' }) // 通过路由名称导航
```

### 日期格式化
```typescript
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN').format(date)
}
```

### 数字格式化
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}
```

## 📊 核心业务组件

### 结算组件
- `CoachSettlementsTab` - 教练结算标签页
- `DoctorSettlementsTab` - 医生结算标签页
- `CommissionSettlementsTab` - 佣金结算标签页
- `SettlementDetailModal` - 结算详情弹窗

### 薪酬组件
- `SalaryOverview` - 薪酬概览
- `SalarySlipManager` - 工资条管理
- `BaseSalaryManager` - 基础工资管理
- `AllowanceManager` - 津贴管理
- `SocialInsuranceManager` - 社保管理

### 知识库组件
- `FileCard` - 文件卡片
- `FolderCard` - 文件夹卡片
- `FolderTreeItem` - 文件夹树项

## 🚨 常见问题

### Q: 如何添加新的页面？
1. 在 `src-vue/views/` 创建 Vue 组件
2. 在 `src-vue/router/index.ts` 添加路由配置
3. 在 `App.vue` 的菜单配置中添加菜单项

### Q: 如何添加新的主题？
1. 在 `useTheme.ts` 中添加主题配置
2. 定义对应的 CSS 变量
3. 在主题切换器中添加选项

### Q: 如何添加新的角色？
1. 在 `systemRoles.ts` 中定义角色配置
2. 在 `useRole.ts` 中添加角色逻辑
3. 配置角色的权限和菜单

### Q: 如何使用风险预测功能？
```typescript
import { useRiskPrediction } from '@/composables/useRiskPrediction'

const {
  riskPredictions,
  getRiskStats,
  refreshPredictions
} = useRiskPrediction()

// 获取风险统计
const stats = getRiskStats.value
// { high: 10, medium: 25, low: 50, total: 85 }

// 刷新预测数据
await refreshPredictions()
```

### Q: 如何实现用户与教练分配？
```typescript
// 在 SalesMonitor.vue 中
const handleSingleAssign = (userId: string) => {
  selectedUserForAssign.value = userId
  batchAssignMode.value = false
  showAssignModal.value = true  // 打开分配弹窗
}

const openBatchAssignModal = () => {
  batchAssignMode.value = true
  showAssignModal.value = true  // 打开批量分配弹窗
}
```

## 📝 开发规范

### 组件命名
- 页面组件：PascalCase（如 `SalesMonitor.vue`）
- 业务组件：PascalCase（如 `CommissionManager.vue`）
- 共享组件：PascalCase（如 `Modal.vue`）

### 文件组织
```
views/          # 页面级组件（有路由）
components/     # 可复用组件
  shared/       # 通用共享组件
composables/    # 业务逻辑
types/          # 类型定义
data/           # 静态数据
utils/          # 工具函数
```

### 代码风格
- 使用 TypeScript
- 使用 Composition API
- 使用 `<script setup>`
- 使用 Tailwind CSS
- 组件 Props 使用 TypeScript 接口定义

---

**最后更新**: 2026-03-08
