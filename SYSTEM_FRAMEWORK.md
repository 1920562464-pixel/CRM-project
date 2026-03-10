# 惯能健康 CRM 系统框架文档

## 📋 项目概述

**项目名称**: 惯能健康 CRM (Health Management CRM)
**技术栈**: Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia
**版本**: 1.0.0
**描述**: 基于Vue 3的现代化健康管理系统，提供客户管理、财务管理、风险预测、ERP等全方位功能

---

## 🏗️ 系统架构

### 技术架构图
```
┌─────────────────────────────────────────────────────────────┐
│                         前端应用层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 工作台   │ │ 客户管理 │ │ 财务管理 │ │  ERP模块  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 智能辅助 │ │ 预警中心 │ │ 结算管理 │ │ 系统管理  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                       业务逻辑层 (Composables)               │
│  useRole │ useTheme │ useToast │ useSalary │ useCommission  │
│  useFinancialData │ useRiskPrediction │ useRichBiscuit      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                       组件层 (Components)                    │
│  shared/ │ settlement/ │ knowledge/ │ 业务组件              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                       数据层 (Types + Data)                  │
│  types/ │ data/ │ utils/                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 目录结构

```
CRM-project/
├── src-vue/                          # Vue 3 源代码目录
│   ├── main.ts                       # 应用入口
│   ├── App.vue                       # 根组件（包含侧边栏和主布局）
│   ├── router/                       # 路由配置
│   │   └── index.ts                  # 路由定义
│   │
│   ├── views/                        # 页面视图组件
│   │   ├── Dashboard.vue             # 旧版工作台
│   │   ├── SalesMonitor.vue          # 客情管理（大屏监控）
│   │   ├── ClientList.vue            # 客户列表
│   │   ├── ClientProfile.vue         # 客户档案
│   │   ├── LeadManagement.vue        # 潜客管理
│   │   ├── BatchTaskProcessor.vue    # 批量化任务处理
│   │   │
│   │   ├── FinanceCenter.vue         # 财务中心主页
│   │   ├── FinanceOverview.vue       # 财务概览
│   │   ├── IncomeManagement.vue      # 收入管理
│   │   ├── AccountReceivable.vue     # 应收账款
│   │   ├── AccountPayable.vue        # 应付账款
│   │   ├── FundsManagement.vue       # 资金管理
│   │   ├── BudgetManagement.vue      # 预算管理
│   │   ├── CostAccounting.vue        # 成本核算
│   │   ├── FinancialReports.vue      # 财务报表
│   │   ├── Reimbursement.vue         # 报销管理
│   │   ├── ReimbursementCreate.vue   # 报销创建/编辑
│   │   │
│   │   ├── SettlementOverview.vue    # 结算概览（新版）
│   │   ├── SettlementManagement.vue  # 结算管理（旧版）
│   │   ├── CoachReimbursement.vue    # 教练报销
│   │   │
│   │   ├── InventoryManagement.vue   # 库存管理
│   │   ├── AssetManagement.vue       # 资产管理
│   │   │
│   │   ├── AIChat.vue                # AI 智能助手
│   │   ├── KnowledgeBase.vue         # 知识库
│   │   ├── AlertCenter.vue           # 预警中心
│   │   ├── RiskPredictionCenter.vue  # 风险预测中心
│   │   ├── SystemManagement.vue      # 系统管理
│   │   │
│   │   └── ...                       # 其他视图组件
│   │
│   ├── components/                   # 业务组件
│   │   ├── RoleBasedDashboard.vue    # 基于角色的仪表盘
│   │   ├── CommissionManager.vue     # 佣金管理
│   │   ├── RichBiscuitManager.vue    # 富贵饼管理
│   │   ├── SalarySlipManager.vue     # 工资条管理
│   │   ├── OnlineServiceManager.vue  # 在线服务管理
│   │   ├── ServiceBindingManager.vue # 服务绑定管理
│   │   ├── BaseSalaryManager.vue     # 基础工资管理
│   │   ├── AllowanceManager.vue      # 津贴管理
│   │   ├── SocialInsuranceManager.vue # 社保管理
│   │   ├── CoachSettlement.vue       # 教练结算
│   │   ├── CommissionSettlement.vue  # 佣金结算
│   │   ├── DoctorSettlement.vue      # 医生结算
│   │   ├── ManagementFeeManager.vue  # 管理费管理
│   │   ├── UnifiedCommissionManager.vue # 统一佣金管理
│   │   ├── SalaryOverview.vue        # 薪酬概览
│   │   ├── RiskPredictionPanel.vue   # 风险预测面板
│   │   │
│   │   ├── shared/                   # 共享组件
│   │   │   ├── Modal.vue             # 模态框组件
│   │   │   ├── Toast.vue             # 提示组件
│   │   │   ├── ConfirmDialog.vue     # 确认对话框
│   │   │   ├── DatePicker.vue        # 日期选择器
│   │   │   └── DatePickerButton.vue  # 日期选择按钮
│   │   │
│   │   ├── settlement/               # 结算相关子组件
│   │   │   ├── CoachSettlementsTab.vue
│   │   │   ├── DoctorSettlementsTab.vue
│   │   │   ├── DoctorSettlementDetailModal.vue
│   │   │   ├── SettlementDetailModal.vue
│   │   │   ├── CommissionRulesTab.vue
│   │   │   ├── CommissionSettlementsTab.vue
│   │   │   ├── CommissionRecordsTab.vue
│   │   │   ├── CommissionReportsTab.vue
│   │   │   ├── DoctorRulesTab.vue
│   │   │   ├── DoctorOnlineTab.vue
│   │   │   ├── DoctorPaymentsTab.vue
│   │   │   └── ...                   # 其他结算子组件
│   │   │
│   │   ├── knowledge/                # 知识库相关组件
│   │   │   ├── FileCard.vue          # 文件卡片
│   │   │   ├── FileListItem.vue      # 文件列表项
│   │   │   ├── FolderCard.vue        # 文件夹卡片
│   │   │   ├── FolderListItem.vue    # 文件夹列表项
│   │   │   ├── FolderSelectItem.vue  # 文件夹选择项
│   │   │   └── FolderTreeItem.vue    # 文件夹树项
│   │   │
│   │   └── ...                       # 其他业务组件
│   │
│   ├── composables/                  # 组合式函数（业务逻辑）
│   │   ├── useRole.ts                # 角色管理
│   │   ├── useTheme.ts               # 主题管理
│   │   ├── useToast.ts               # 消息提示
│   │   ├── useSalary.ts              # 薪酬管理
│   │   ├── useCommission.ts          # 佣金管理
│   │   ├── useFinancialData.ts       # 财务数据
│   │   ├── useRiskPrediction.ts      # 风险预测
│   │   └── useRichBiscuit.ts         # 富贵饼管理
│   │
│   ├── types/                        # TypeScript 类型定义
│   │   ├── index.ts                  # 通用类型
│   │   ├── salary.ts                 # 薪酬相关类型
│   │   ├── commission.ts             # 佣金相关类型
│   │   └── risk.ts                   # 风险预测类型
│   │
│   ├── data/                         # 静态数据和Mock数据
│   │   ├── index.ts                  # 数据入口
│   │   ├── mockUsers.ts              # 模拟用户数据
│   │   ├── systemDepartments.ts      # 系统部门数据
│   │   └── systemRoles.ts            # 系统角色数据
│   │
│   ├── utils/                        # 工具函数
│   │   ├── index.ts                  # 通用工具
│   │   └── roleHelpers.ts            # 角色相关工具
│   │
│   └── styles/                       # 样式文件
│       └── index.css                 # 全局样式（Tailwind）
│
├── package.json                      # 项目依赖配置
├── vite.config.vue.ts                # Vite 配置
├── tailwind.config.js                # Tailwind CSS 配置
├── tsconfig.json                     # TypeScript 配置
└── index.html                        # HTML 入口模板
```

---

## 🎯 核心功能模块

### 1. 工作台 (Dashboard)
- **路径**: `/dashboard`
- **组件**: `RoleBasedDashboard.vue`
- **功能**:
  - 基于角色的个性化仪表盘
  - 关键指标展示
  - 快速操作入口
  - 数据概览卡片

### 2. 客户管理模块
#### 2.1 客情管理（大屏监控）
- **路径**: `/sales-monitor`
- **组件**: `SalesMonitor.vue`
- **功能**:
  - 实时监控等待分配用户
  - 教练列表和负载状态
  - 预约管理
  - 用户与教练分配（单个/批量）
  - 风险预测展示
  - 关键指标监控

#### 2.2 客户列表
- **路径**: `/client-list`
- **组件**: `ClientList.vue`
- **功能**: 客户列表查询和管理

#### 2.3 客户档案
- **路径**: `/client-profile/:id`
- **组件**: `ClientProfile.vue`
- **功能**: 客户详细信息查看

#### 2.4 潜客管理
- **路径**: `/lead-management`, `/potential-clients`
- **组件**: `LeadManagement.vue`
- **功能**: 潜在客户管理

### 3. 财务管理模块
#### 3.1 财务中心
- **路径**: `/finance-center`
- **组件**: `FinanceCenter.vue`
- **功能**: 财务管理主页

#### 3.2 财务概览
- **路径**: `/finance-overview`
- **组件**: `FinanceOverview.vue`
- **功能**:
  - 收入支出概览
  - 财务指标展示
  - 图表可视化

#### 3.3 收入管理
- **路径**: `/income-management`
- **组件**: `IncomeManagement.vue`
- **功能**:
  - 收入记录管理
  - 收入分类统计

#### 3.4 应收账款
- **路径**: `/account-receivable`
- **组件**: `AccountReceivable.vue`
- **功能**:
  - 应收账款跟踪
  - 账期管理
  - 逾期提醒

#### 3.5 应付账款
- **路径**: `/account-payable`
- **组件**: `AccountPayable.vue`
- **功能**:
  - 应付账款管理
  - 付款计划

#### 3.6 资金管理
- **路径**: `/funds-management`
- **组件**: `FundsManagement.vue`
- **功能**:
  - 资金流水
  - 资金调拨

#### 3.7 预算管理
- **路径**: `/budget-management`
- **组件**: `BudgetManagement.vue`
- **功能**:
  - 预算编制
  - 预算执行跟踪

#### 3.8 成本核算
- **路径**: `/cost-accounting`
- **组件**: `CostAccounting.vue`
- **功能**:
  - 成本归集
  - 成本分析

#### 3.9 财务报表
- **路径**: `/financial-reports`
- **组件**: `FinancialReports.vue`
- **功能**:
  - 资产负债表
  - 利润表
  - 现金流量表

#### 3.10 报销管理
- **路径**: `/reimbursement`, `/reimbursement/create`, `/reimbursement/edit/:id`
- **组件**: `Reimbursement.vue`, `ReimbursementCreate.vue`
- **功能**:
  - 报销申请
  - 报销审批
  - 报销统计

### 4. 结算管理模块
#### 4.1 结算概览
- **路径**: `/settlement-management`
- **组件**: `SettlementOverview.vue`
- **功能**:
  - 教练结算管理
  - 医生结算管理
  - 佣金结算管理
  - 结算统计

#### 4.2 教练报销
- **路径**: `/coach-reimbursement`
- **组件**: `CoachReimbursement.vue`
- **功能**: 教练报销管理

#### 4.3 薪酬管理组件
- **组件**:
  - `SalaryOverview.vue` - 薪酬概览
  - `SalarySlipManager.vue` - 工资条管理
  - `BaseSalaryManager.vue` - 基础工资管理
  - `AllowanceManager.vue` - 津贴管理
  - `SocialInsuranceManager.vue` - 社保管理

#### 4.4 结算组件
- **组件**:
  - `CoachSettlement.vue` - 教练结算
  - `DoctorSettlement.vue` - 医生结算
  - `CommissionSettlement.vue` - 佣金结算
  - `ManagementFeeManager.vue` - 管理费管理
  - `UnifiedCommissionManager.vue` - 统一佣金管理

### 5. ERP 模块
#### 5.1 库存管理
- **路径**: `/inventory-management`
- **组件**: `InventoryManagement.vue`
- **功能**:
  - 库存查询
  - 入库出库管理
  - 库存预警

#### 5.2 资产管理
- **路径**: `/asset-management`
- **组件**: `AssetManagement.vue`
- **功能**:
  - 固定资产登记
  - 资产折旧
  - 资产调拨

### 6. 智能辅助模块
#### 6.1 AI 智能助手
- **路径**: `/ai-chat`
- **组件**: `AIChat.vue`
- **功能**:
  - 智能对话
  - 业务咨询
  - 数据分析

#### 6.2 知识库
- **路径**: `/knowledge-base`
- **组件**: `KnowledgeBase.vue`
- **功能**:
  - 文件管理
  - 文件夹管理
  - 文档分类
  - 文档搜索

### 7. 预警和风险预测模块
#### 7.1 预警中心
- **路径**: `/alert-center`
- **组件**: `AlertCenter.vue`
- **功能**:
  - 财务预警
  - 业务预警
  - 风险提醒

#### 7.2 风险预测中心
- **路径**: `/risk-prediction`
- **组件**: `RiskPredictionCenter.vue`
- **功能**:
  - 多维度风险评估
  - 风险等级分类（高/中/低）
  - 风险因子分析
  - 干预建议
  - 健康指标异常趋势
  - 预测数据刷新和导出

### 8. 系统管理
- **路径**: `/system-management`
- **组件**: `SystemManagement.vue`
- **功能**:
  - 系统配置
  - 权限管理
  - 数据管理

### 9. 批量化任务处理
- **路径**: `/batch-task-processor`
- **组件**: `BatchTaskProcessor.vue`
- **功能**:
  - 批量任务创建
  - 任务分配
  - 任务执行跟踪

---

## 🧩 核心组件库

### Shared Components (共享组件)
位于 `src-vue/components/shared/`

| 组件名 | 文件 | 功能 |
|--------|------|------|
| Modal | Modal.vue | 通用模态框，支持 v-model:show 绑定，多种尺寸 |
| Toast | Toast.vue | 消息提示组件，支持 success/error/info/warning |
| ConfirmDialog | ConfirmDialog.vue | 确认对话框 |
| DatePicker | DatePicker.vue | 日期选择器 |
| DatePickerButton | DatePickerButton.vue | 日期选择按钮 |

### Settlement Components (结算组件)
位于 `src-vue/components/settlement/`

| 组件名 | 功能 |
|--------|------|
| CoachSettlementsTab | 教练结算标签页 |
| DoctorSettlementsTab | 医生结算标签页 |
| DoctorSettlementDetailModal | 医生结算详情弹窗 |
| SettlementDetailModal | 结算详情弹窗 |
| CommissionRulesTab | 佣金规则标签页 |
| CommissionSettlementsTab | 佣金结算标签页 |
| CommissionRecordsTab | 佣金记录标签页 |
| CommissionReportsTab | 佣金报表标签页 |
| CommissionConsultantsTab | 顾问标签页 |
| CommissionPaymentsTab | 支付标签页 |
| DoctorRulesTab | 医生规则标签页 |
| DoctorOnlineTab | 医生在线标签页 |
| DoctorPaymentsTab | 医生支付标签页 |
| DoctorReportsTab | 医生报表标签页 |
| EmployeesTab | 员工标签页 |
| PaymentsTab | 支付标签页 |
| ReportsTab | 报表标签页 |
| RulesTab | 规则标签页 |

### Knowledge Components (知识库组件)
位于 `src-vue/components/knowledge/`

| 组件名 | 功能 |
|--------|------|
| FileCard | 文件卡片展示 |
| FileListItem | 文件列表项 |
| FolderCard | 文件夹卡片 |
| FolderListItem | 文件夹列表项 |
| FolderSelectItem | 文件夹选择项 |
| FolderTreeItem | 文件夹树形结构 |

### Business Components (业务组件)
位于 `src-vue/components/`

| 组件名 | 功能 |
|--------|------|
| RoleBasedDashboard | 基于角色的仪表盘 |
| DashboardCard | 仪表盘卡片 |
| StatCard | 统计卡片 |
| CommissionManager | 佣金管理器 |
| RichBiscuitManager | 富贵饼管理器 |
| SalaryOverview | 薪酬概览 |
| SalarySlipManager | 工资条管理器 |
| BaseSalaryManager | 基础工资管理器 |
| AllowanceManager | 津贴管理器 |
| SocialInsuranceManager | 社保管理器 |
| CoachSettlement | 教练结算 |
| CommissionSettlement | 佣金结算 |
| DoctorSettlement | 医生结算 |
| ManagementFeeManager | 管理费管理器 |
| UnifiedCommissionManager | 统一佣金管理器 |
| OnlineServiceManager | 在线服务管理器 |
| ServiceBindingManager | 服务绑定管理器 |
| RiskPredictionPanel | 风险预测面板 |
| QuickActionButton | 快速操作按钮 |
| TaskItem | 任务项 |
| ActivityItem | 活动项 |
| PersonDetailModal | 人员详情弹窗 |
| HealthData | 健康数据 |
| HealthBarItem | 健康指标条 |
| HealthDataPreview | 健康数据预览 |
| InterventionManager | 干预管理器 |
| NutrientIntervention | 营养干预 |
| ConversationLabeling | 对话标注 |
| ContentConfig | 内容配置 |
| DataCenter | 数据中心 |
| DepartmentSection | 部门区块 |

---

## 🔧 Composables (组合式函数)

位于 `src-vue/composables/`

| Composable | 功能 | 主要接口 |
|------------|------|----------|
| useRole | 角色管理 | currentRole, roleConfig, switchRole, updateRoleConfig |
| useTheme | 主题管理 | currentTheme, themeConfig, setTheme, sidebar管理 |
| useToast | 消息提示 | success, error, info, warning |
| useSalary | 薪酬管理 | salaryData, calculateSalary, generateSalarySlip |
| useCommission | 佣金管理 | commissionData, calculateCommission, commissionRecords |
| useFinancialData | 财务数据 | financialData, incomeData, expenseData, alerts |
| useRiskPrediction | 风险预测 | riskPredictions, predictRisk, getRiskStats, refreshPredictions |
| useRichBiscuit | 富贵饼管理 | richBiscuitData, calculateRichBiscuit |

---

## 📊 数据模型 (Types)

位于 `src-vue/types/`

### salary.ts - 薪酬相关类型
```typescript
- SalarySlip: 工资条
- SalaryRecord: 薪酬记录
- BaseSalary: 基础工资
- Allowance: 津贴
- SocialInsurance: 社保
```

### commission.ts - 佣金相关类型
```typescript
- CommissionRule: 佣金规则
- CommissionRecord: 佣金记录
- CommissionSettlement: 佣金结算
```

### risk.ts - 风险预测类型
```typescript
- RiskPrediction: 风险预测
- RiskLevel: 风险等级 ('high' | 'medium' | 'low')
- RiskFactor: 风险因子
- Intervention: 干预措施
- KeyIndicators: 关键指标
```

---

## 🎨 主题系统

### 支持的主题
1. **Classic Blue (经典蓝)** - 默认主题
2. **Black Gold (黑金)** - 高端商务风格
3. **Warm Yellow (暖黄)** - 温暖舒适风格

### 主题相关 API
```typescript
// useTheme composable
const { currentTheme, setTheme, themeConfig } = useTheme()

// 主题配置包括：
// - 颜色变量
// - 侧边栏样式
// - 卡片样式
// - 文字颜色
// - 边框颜色
```

---

## 👥 角色系统

### 支持的角色
1. **admin** - 系统管理员
2. **manager** - 管理者
3. **coach** - 教练
4. **doctor** - 医生
5. **consultant** - 顾问
6. **finance** - 财务

### 角色相关 API
```typescript
// useRole composable
const { currentRole, roleConfig, switchRole } = useRole()

// 角色配置包括：
// - 角色名称
// - 角色描述
// - 权限配置
// - 菜单配置
// - 数据权限
```

---

## 🚀 路由系统

### 路由结构
```typescript
/                          → 重定向到 /dashboard
/dashboard                 → 工作台
/sales-monitor             → 客情管理（大屏监控）
/client-list               → 客户列表
/client-profile/:id        → 客户档案
/lead-management           → 潜客管理
/batch-task-processor      → 批量化任务处理

/finance-center            → 财务中心
/finance-overview          → 财务概览
/income-management         → 收入管理
/account-receivable        → 应收账款
/account-payable           → 应付账款
/funds-management          → 资金管理
/budget-management         → 预算管理
/cost-accounting           → 成本核算
/financial-reports         → 财务报表
/reimbursement             → 报销管理

/settlement-management     → 结算管理
/coach-reimbursement       → 教练报销

/inventory-management      → 库存管理
/asset-management          → 资产管理

/ai-chat                   → AI 智能助手
/knowledge-base            → 知识库

/alert-center              → 预警中心
/risk-prediction          → 风险预测中心

/system-management         → 系统管理
```

---

## 🛠️ 开发规范

### 组件命名规范
- 页面组件：PascalCase (如 `SalesMonitor.vue`)
- 业务组件：PascalCase (如 `CommissionManager.vue`)
- 共享组件：PascalCase (如 `Modal.vue`)

### 文件组织规范
```
views/           # 页面级组件（路由组件）
components/      # 可复用业务组件
  shared/        # 通用共享组件
  settlement/    # 结算模块组件
  knowledge/     # 知识库模块组件
composables/     # 组合式函数（业务逻辑）
types/           # TypeScript 类型定义
data/            # 静态数据和 Mock 数据
utils/           # 工具函数
```

### 代码风格
- 使用 TypeScript 进行类型检查
- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法糖
- 使用 Tailwind CSS 进行样式开发
- 使用 Pinia 进行状态管理（如果需要）

---

## 📦 依赖包说明

### 核心依赖
```json
{
  "vue": "^3.5.28",                    # Vue 3 框架
  "vue-router": "^4.6.4",              # 路由管理
  "pinia": "^3.0.4",                   # 状态管理
  "typescript": "^5.9.3",              # TypeScript
  "vite": "^7.3.1",                    # 构建工具
  "tailwindcss": "^3.4.19",            # CSS 框架
  "lucide-vue-next": "^0.564.0",      # 图标库
  "papaparse": "^5.5.3",               # CSV 解析
  "xlsx": "^0.18.5"                    # Excel 处理
}
```

### 开发依赖
```json
{
  "@vitejs/plugin-vue": "^6.0.4",     # Vite Vue 插件
  "autoprefixer": "^10.4.24",          # CSS 自动前缀
  "postcss": "^8.5.6",                 # CSS 处理
  "vue-tsc": "^3.2.4"                  # Vue TypeScript 编译器
}
```

---

## 🎯 系统特色功能

### 1. 多主题支持
- 支持动态切换主题
- CSS 变量管理主题样式
- 侧边栏和卡片样式随主题变化

### 2. 基于角色的权限管理
- 不同角色看到不同的菜单和功能
- 可配置的角色权限系统
- 动态菜单渲染

### 3. 风险预测系统
- 多维度健康风险评估
- 实时风险因子监控
- 智能干预建议
- 风险等级可视化

### 4. 财务管理
- 完整的财务流程管理
- 应收应付账款跟踪
- 财务报表自动生成
- 预算执行分析

### 5. 结算管理
- 教练/医生/顾问多角色结算
- 佣金自动计算
- 结算详情追踪
- 支付管理

### 6. 大屏监控
- 实时业务监控
- 关键指标展示
- 快速操作入口
- 数据可视化

---

## 📝 待办事项

### 功能优化
- [ ] 添加数据持久化（后端 API 对接）
- [ ] 完善权限控制逻辑
- [ ] 增加数据导出功能
- [ ] 优化性能和加载速度

### 用户体验
- [ ] 添加更多交互动画
- [ ] 优化移动端适配
- [ ] 增加快捷键支持
- [ ] 完善错误提示

### 测试
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 性能测试

---

## 📞 技术支持

如有问题或建议，请联系开发团队。

---

**文档更新时间**: 2026-03-08
**系统版本**: 1.0.0
**维护者**: 惯能健康技术团队
