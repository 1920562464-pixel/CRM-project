# 惯能健康 CRM - 文件清单

## 📚 完整文件列表

### 📄 根目录文件

| 文件名 | 说明 |
|--------|------|
| `README.md` | 项目说明文档 |
| `SYSTEM_FRAMEWORK.md` | 系统框架详细文档 |
| `ARCHITECTURE.md` | 系统架构图文档 |
| `QUICK_REFERENCE.md` | 快速参考手册 |
| `FILE_MANIFEST.md` | 本文件 - 文件清单 |
| `package.json` | 项目依赖配置 |
| `vite.config.vue.ts` | Vite 构建配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `index.html` | HTML 入口模板 |
| `.env.vue` | 环境变量配置 |

---

## 📂 src-vue/ 目录

### 核心文件

| 文件路径 | 说明 |
|---------|------|
| `src-vue/main.ts` | 应用入口文件 |
| `src-vue/App.vue` | 根组件（侧边栏 + 主布局） |

---

## 🗂️ src-vue/router/ - 路由配置

| 文件名 | 说明 |
|--------|------|
| `index.ts` | 路由定义和配置 |

**路由数量**: 30+ 个页面路由

---

## 👁️ src-vue/views/ - 页面视图组件 (58 个文件)

### 工作台和客户管理
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `Dashboard.vue` | `/dashboard-old` | 旧版工作台 |
| `SalesMonitor.vue` | `/sales-monitor` | 客情管理（大屏监控） |
| `ClientList.vue` | `/client-list` | 客户列表 |
| `ClientProfile.vue` | `/client-profile/:id` | 客户档案 |
| `LeadManagement.vue` | `/lead-management` | 潜客管理 |
| `BatchTaskProcessor.vue` | `/batch-task-processor` | 批量化任务处理 |

### 财务管理
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `FinanceCenter.vue` | `/finance-center` | 财务中心主页 |
| `FinanceOverview.vue` | `/finance-overview` | 财务概览 |
| `IncomeManagement.vue` | `/income-management` | 收入管理 |
| `AccountReceivable.vue` | `/account-receivable` | 应收账款 |
| `AccountPayable.vue` | `/account-payable` | 应付账款 |
| `FundsManagement.vue` | `/funds-management` | 资金管理 |
| `BudgetManagement.vue` | `/budget-management` | 预算管理 |
| `CostAccounting.vue` | `/cost-accounting` | 成本核算 |
| `FinancialReports.vue` | `/financial-reports` | 财务报表 |
| `Reimbursement.vue` | `/reimbursement` | 报销管理 |
| `ReimbursementCreate.vue` | `/reimbursement/create` | 报销创建/编辑 |

### 结算管理
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `SettlementOverview.vue` | `/settlement-management` | 结算概览（新版） |
| `SettlementManagement.vue` | `/settlement-management-old` | 结算管理（旧版） |
| `CoachReimbursement.vue` | `/coach-reimbursement` | 教练报销 |

### ERP 模块
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `InventoryManagement.vue` | `/inventory-management` | 库存管理 |
| `AssetManagement.vue` | `/asset-management` | 资产管理 |

### 智能辅助
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `AIChat.vue` | `/ai-chat` | AI 智能助手 |
| `KnowledgeBase.vue` | `/knowledge-base` | 知识库 |

### 预警和风险预测
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `AlertCenter.vue` | `/alert-center` | 预警中心 |
| `RiskPredictionCenter.vue` | `/risk-prediction` | 风险预测中心 |

### 系统管理
| 文件名 | 路由路径 | 功能 |
|--------|---------|------|
| `SystemManagement.vue` | `/system-management` | 系统管理 |

---

## 🧩 src-vue/components/ - 业务组件 (40 个文件)

### 核心业务组件
| 文件名 | 功能 |
|--------|------|
| `RoleBasedDashboard.vue` | 基于角色的仪表盘（新版工作台） |
| `CommissionManager.vue` | 佣金管理器 |
| `RichBiscuitManager.vue` | 富贵饼管理器 |
| `SalaryOverview.vue` | 薪酬概览 |
| `SalarySlipManager.vue` | 工资条管理器 |
| `BaseSalaryManager.vue` | 基础工资管理器 |
| `AllowanceManager.vue` | 津贴管理器 |
| `SocialInsuranceManager.vue` | 社保管理器 |
| `OnlineServiceManager.vue` | 在线服务管理器 |
| `ServiceBindingManager.vue` | 服务绑定管理器 |
| `UnifiedCommissionManager.vue` | 统一佣金管理器 |

### 结算组件
| 文件名 | 功能 |
|--------|------|
| `CoachSettlement.vue` | 教练结算 |
| `CommissionSettlement.vue` | 佣金结算 |
| `DoctorSettlement.vue` | 医生结算 |
| `ManagementFeeManager.vue` | 管理费管理器 |

### 风险预测组件
| 文件名 | 功能 |
|--------|------|
| `RiskPredictionPanel.vue` | 风险预测面板 |

### 数据展示组件
| 文件名 | 功能 |
|--------|------|
| `DashboardCard.vue` | 仪表盘卡片 |
| `StatCard.vue` | 统计卡片 |
| `DataCenter.vue` | 数据中心 |
| `DepartmentSection.vue` | 部门区块 |

### 健康数据组件
| 文件名 | 功能 |
|--------|------|
| `HealthData.vue` | 健康数据 |
| `HealthBarItem.vue` | 健康指标条 |
| `HealthDataPreview.vue` | 健康数据预览 |

### 任务和活动组件
| 文件名 | 功能 |
|--------|------|
| `TaskItem.vue` | 任务项 |
| `ActivityItem.vue` | 活动项 |
| `QuickActionButton.vue` | 快速操作按钮 |

### 干预管理组件
| 文件名 | 功能 |
|--------|------|
| `InterventionManager.vue` | 干预管理器 |
| `NutrientIntervention.vue` | 营养干预 |
| `ConversationLabeling.vue` | 对话标注 |

### 内容管理组件
| 文件名 | 功能 |
|--------|------|
| `ContentConfig.vue` | 内容配置 |

### 弹窗组件
| 文件名 | 功能 |
|--------|------|
| `PersonDetailModal.vue` | 人员详情弹窗 |
| `Modal.vue` | 旧版模态框（建议使用 shared/Modal.vue） |

---

## 📦 src-vue/components/shared/ - 共享组件 (5 个文件)

| 文件名 | 功能 | 使用场景 |
|--------|------|----------|
| `Modal.vue` | 通用模态框 | 需要弹窗的场景 |
| `Toast.vue` | 消息提示组件 | 成功/错误/提示/警告消息 |
| `ConfirmDialog.vue` | 确认对话框 | 需要用户确认的操作 |
| `DatePicker.vue` | 日期选择器 | 选择日期 |
| `DatePickerButton.vue` | 日期选择按钮 | 按钮形式的日期选择器 |

---

## 🧾 src-vue/components/settlement/ - 结算子组件 (18 个文件)

### 教练结算
| 文件名 | 功能 |
|--------|------|
| `CoachSettlementsTab.vue` | 教练结算标签页 |
| `SettlementDetailModal.vue` | 结算详情弹窗 |
| `EmployeesTab.vue` | 员工标签页 |
| `PaymentsTab.vue` | 支付标签页 |
| `ReportsTab.vue` | 报表标签页 |
| `RulesTab.vue` | 规则标签页 |
| `SettlementsTab.vue` | 结算标签页 |

### 医生结算
| 文件名 | 功能 |
|--------|------|
| `DoctorSettlementsTab.vue` | 医生结算标签页 |
| `DoctorSettlementDetailModal.vue` | 医生结算详情弹窗 |
| `DoctorOnlineTab.vue` | 医生在线标签页 |
| `DoctorPaymentsTab.vue` | 医生支付标签页 |
| `DoctorReportsTab.vue` | 医生报表标签页 |
| `DoctorRulesTab.vue` | 医生规则标签页 |
| `DoctorEmployeesTab.vue` | 医生员工标签页 |

### 佣金结算
| 文件名 | 功能 |
|--------|------|
| `CommissionSettlementsTab.vue` | 佣金结算标签页 |
| `CommissionConsultantsTab.vue` | 顾问标签页 |
| `CommissionPaymentsTab.vue` | 支付标签页 |
| `CommissionRecordsTab.vue` | 佣金记录标签页 |
| `CommissionReportsTab.vue` | 佣金报表标签页 |
| `CommissionRulesTab.vue` | 佣金规则标签页 |

---

## 📚 src-vue/components/knowledge/ - 知识库组件 (6 个文件)

| 文件名 | 功能 |
|--------|------|
| `FileCard.vue` | 文件卡片展示 |
| `FileListItem.vue` | 文件列表项 |
| `FolderCard.vue` | 文件夹卡片 |
| `FolderListItem.vue` | 文件夹列表项 |
| `FolderSelectItem.vue` | 文件夹选择项 |
| `FolderTreeItem.vue` | 文件夹树形结构项 |

---

## 🔧 src-vue/composables/ - 组合式函数 (8 个文件)

| 文件名 | 功能 | 主要 API |
|--------|------|----------|
| `useRole.ts` | 角色管理 | currentRole, switchRole, roleConfig |
| `useTheme.ts` | 主题管理 | currentTheme, setTheme, themeConfig |
| `useToast.ts` | 消息提示 | success, error, info, warning |
| `useSalary.ts` | 薪酬管理 | salaryData, calculateSalary, generateSalarySlip |
| `useCommission.ts` | 佣金管理 | commissionData, calculateCommission |
| `useFinancialData.ts` | 财务数据 | financialData, incomeData, expenseData, alerts |
| `useRiskPrediction.ts` | 风险预测 | riskPredictions, predictRisk, getRiskStats, refreshPredictions |
| `useRichBiscuit.ts` | 富贵饼管理 | richBiscuitData, calculateRichBiscuit |

---

## 📐 src-vue/types/ - TypeScript 类型定义 (4 个文件)

| 文件名 | 内容 |
|--------|------|
| `index.ts` | 通用类型定义 |
| `salary.ts` | 薪酬相关类型（SalarySlip, SalaryRecord, BaseSalary, Allowance, SocialInsurance） |
| `commission.ts` | 佣金相关类型（CommissionRule, CommissionRecord, CommissionSettlement） |
| `risk.ts` | 风险预测类型（RiskPrediction, RiskLevel, RiskFactor, Intervention, KeyIndicators） |

---

## 📊 src-vue/data/ - 静态数据 (4 个文件)

| 文件名 | 内容 |
|--------|------|
| `index.ts` | 数据入口 |
| `mockUsers.ts` | 模拟用户数据 |
| `systemDepartments.ts` | 系统部门数据 |
| `systemRoles.ts` | 系统角色数据 |

---

## 🛠️ src-vue/utils/ - 工具函数 (2 个文件)

| 文件名 | 内容 |
|--------|------|
| `index.ts` | 通用工具函数 |
| `roleHelpers.ts` | 角色相关工具函数 |

---

## 🎨 src-vue/styles/ - 样式文件 (1 个文件)

| 文件名 | 内容 |
|--------|------|
| `index.css` | 全局样式（Tailwind CSS 导入） |

---

## 📈 统计信息

### 文件总数统计
- **Views (页面)**: 58 个
- **Components (组件)**: 69 个
  - 业务组件: 40 个
  - 共享组件: 5 个
  - 结算组件: 18 个
  - 知识库组件: 6 个
- **Composables (组合函数)**: 8 个
- **Types (类型定义)**: 4 个
- **Data (数据文件)**: 4 个
- **Utils (工具函数)**: 2 个

### 代码行数估算
- Vue 组件: ~15,000 行
- TypeScript: ~5,000 行
- 总计: ~20,000+ 行

### 功能模块统计
- 主要功能模块: 8 个
- 子功能: 50+ 个
- 路由页面: 30+ 个

---

## 🔍 快速查找

### 按功能查找

**查看工作台**
→ `src-vue/components/RoleBasedDashboard.vue`

**客情管理（大屏监控）**
→ `src-vue/views/SalesMonitor.vue`

**风险预测**
→ `src-vue/views/RiskPredictionCenter.vue`
→ `src-vue/components/RiskPredictionPanel.vue`
→ `src-vue/composables/useRiskPrediction.ts`

**财务管理**
→ `src-vue/views/FinanceCenter.vue`
→ `src-vue/composables/useFinancialData.ts`

**结算管理**
→ `src-vue/views/SettlementOverview.vue`
→ `src-vue/components/settlement/` (所有结算组件)

**主题切换**
→ `src-vue/composables/useTheme.ts`

**角色管理**
→ `src-vue/composables/useRole.ts`
→ `src-vue/data/systemRoles.ts`

### 按文件类型查找

**Vue 页面组件**
→ `src-vue/views/`

**业务组件**
→ `src-vue/components/`

**共享组件**
→ `src-vue/components/shared/`

**组合式函数**
→ `src-vue/composables/`

**类型定义**
→ `src-vue/types/`

**静态数据**
→ `src-vue/data/`

**工具函数**
→ `src-vue/utils/`

---

**最后更新**: 2026-03-08
**文件版本**: 1.0.0
