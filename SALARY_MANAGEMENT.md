# 薪酬管理系统 - 详细文档

## 📋 目录

1. [系统概述](#系统概述)
2. [核心业务流程](#核心业务流程)
3. [数据模型](#数据模型)
4. [功能模块](#功能模块)
5. [薪资方案](#薪资方案)
6. [计算规则](#计算规则)
7. [API 接口](#api-接口)
8. [组件说明](#组件说明)
9. [使用示例](#使用示例)

---

## 系统概述

### 功能定位

薪酬管理系统是惯能健康 CRM 的核心模块之一，负责处理员工的薪资计算、发放、管理和统计工作。系统支持多种角色（教练、医生、顾问）的差异化薪资方案，提供完整的薪资发放流程管理。

### 核心特性

- ✅ **多角色薪资方案** - 支持教练、医生、顾问等不同角色的薪资方案
- ✅ **灵活薪资计算** - 底薪 + 提成 + 津贴 + 奖金 + 上线服务 + 富贵饼
- ✅ **动态餐补计算** - 根据工作日天数自动计算餐补
- ✅ **社保公积金** - 自动计算个人承担的社保和公积金
- ✅ **个税计算** - 采用累进税率计算个人所得税
- ✅ **完整审批流程** - 草稿 → 待审核 → 已审核 → 已发放
- ✅ **批量操作** - 支持批量审核和批量发放
- ✅ **数据导出** - 支持导出 Excel 格式工资条
- ✅ **统计分析** - 提供薪资统计和汇总功能

### 业务流程图

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  创建薪资方案 │ ──→ │  生成工资条   │ ──→ │  审核工资条  │ ──→ │  发放工资    │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                           │                     │                    │
                           ↓                     ↓                    ↓
                    ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  编辑工资条   │     │  批量审核    │     │  批量发放    │
                    └──────────────┘     └─────────────┘     └─────────────┘
```

---

## 核心业务流程

### 1. 薪资方案配置

```
薪资方案 (SalaryScheme)
├── 方案基本信息
│   ├── 方案ID
│   ├── 方案名称
│   └── 适用角色 (coach/doctor/consultant)
├── 底薪设置
│   └── baseSalary
├── 佣金规则
│   ├── 新用户提成 (newUserRate)
│   ├── 老用户提成 (oldUserRate)
│   ├── 医生上线提成 (doctorOnlineRate)
│   └── 产品销售提成 (productCommission)
├── 津贴补贴
│   ├── 交通补贴 (traffic)
│   ├── 通讯补贴 (communication)
│   ├── 餐补 (meal) - 按工作日计算
│   └── 房补 (housing)
└── 社保公积金
    ├── 养老保险 (pension: 8%)
    ├── 医疗保险 (medical: 2%)
    ├── 失业保险 (unemployment: 0.5%)
    └── 住房公积金 (housingFund: 12%)
```

### 2. 工资条生成流程

```typescript
// 生成工资条的完整流程
1. 获取员工信息和薪资方案
2. 计算工作日天数 (用于餐补)
3. 获取员工绑定的用户数据
4. 统计新用户和老用户数量
5. 获取上线服务记录
6. 获取富贵饼发放记录
7. 计算收入总额
8. 计算社保公积金
9. 计算个人所得税
10. 计算实发工资
11. 生成工资条记录
```

### 3. 审批和发放流程

```
工资条状态流转:
draft (草稿) → pending (待审核) → approved (已审核) → paid (已发放)
     │              │                  │                │
     │              ↓                  ↓                ↓
     │         审核通过            发放完成          完成
     │
     └─→ cancelled (取消)
```

---

## 数据模型

### 1. 工资条 (SalarySlip)

```typescript
interface SalarySlip {
  // 基本信息
  id: string                      // 工资条ID
  employeeId: string              // 员工ID
  employeeName: string            // 员工姓名
  department: string              // 部门
  position: string                // 职位
  month: string                   // 月份 (YYYY-MM)
  schemeId: string                // 薪资方案ID

  // 收入部分
  income: {
    baseSalary: number            // 底薪
    positionSalary: number        // 岗位工资
    performanceSalary: number     // 绩效工资
    senioritySalary: number       // 工龄工资
    commission: {
      newUserCount: number        // 新用户数量
      newUserAmount: number       // 新用户提成金额
      oldUserCount: number        // 老用户数量
      oldUserAmount: number       // 老用户提成金额
      totalAmount: number         // 佣金总额
      onlineServices: {
        count: number             // 上线次数
        normalRate: number        // 正常上线费率
        nightRate: number         // 夜间上线费率
        weekendRate: number       // 周末上线费率
        urgentRate: number        // 紧急上线费率
        totalAmount: number       // 上线服务总额
      }
      richBiscuits: {
        amount: number            // 富贵饼数量
        value: number             // 富贵饼金额
        details: Array<{          // 富贵饼明细
          id: string
          amount: number
          reason: string
          category: string
          issuedAt: Date
        }>
      }
      productSales: number        // 产品销售额
      productCommission: number   // 产品提成
    }
    allowances: {
      traffic: number             // 交通补贴
      communication: number       // 通讯补贴
      meal: {
        amount: number            // 餐补总额
        workdays: number          // 工作日天数
        dailyRate: number         // 每日标准 (40元/天)
      }
      housing: number             // 房补
    }
    bonus: {
      monthly: number             // 月度奖金
      quarterly: number           // 季度奖金
      yearly: number              // 年度奖金
      special: number             // 特殊奖金
    }
  }

  // 扣款部分
  deductions: {
    socialInsurance: {
      pension: number             // 养老保险
      medical: number             // 医疗保险
      unemployment: number        // 失业保险
      housingFund: number         // 住房公积金
    }
    attendance: {
      late: number                // 迟到扣款
      earlyLeave: number          // 早退扣款
      personalLeave: number       // 事假扣款
      sickLeave: number           // 病假扣款
    }
    tax: number                   // 个人所得税
  }

  // 汇总信息
  summary: {
    grossSalary: number           // 应发工资
    totalDeductions: number       // 扣款总额
    netSalary: number             // 实发工资
  }

  // 状态和备注
  status: SalaryStatus            // 状态
  notes: string                   // 备注
  attachments: string[]           // 附件

  // 时间戳
  createdAt: Date                 // 创建时间
  approvedAt?: Date               // 审核时间
  paidAt?: Date                   // 发放时间

  // 审批信息
  approvedBy?: string             // 审核人
  paidBy?: string                 // 发放人
}
```

### 2. 薪资方案 (SalaryScheme)

```typescript
interface SalaryScheme {
  id: string                      // 方案ID
  name: string                    // 方案名称
  type: 'coach' | 'doctor' | 'consultant'  // 适用角色
  baseSalary?: number             // 底薪
  commissionRules: {
    newUserRate: number           // 新用户提成费率
    oldUserRate: number           // 老用户提成费率
    doctorOnlineRate: number      // 医生上线费率
    productCommission: number     // 产品提成比例
  }
  allowances: {
    traffic?: number              // 交通补贴
    communication?: number        // 通讯补贴
    meal?: number                 // 餐补 (0表示按工作日计算)
    housing?: number              // 房补
  }
  socialInsurance: {
    pension: number               // 养老保险比例
    medical: number               // 医疗保险比例
    unemployment: number          // 失业保险比例
    housingFund: number           // 住房公积金比例
  }
  performanceBonus?: {
    enabled: boolean
    levels: Array<{
      name: string
      minScore: number
      maxScore: number
      bonus: number
    }>
  }
  yearEndBonus?: {
    enabled: boolean
    months: number
  }
}
```

### 3. 考勤记录 (AttendanceRecord)

```typescript
interface AttendanceRecord {
  id: string                      // 记录ID
  employeeId: string              // 员工ID
  month: string                   // 月份
  lateDays: number                // 迟到天数
  lateDeduction: number           // 迟到扣款
  earlyLeaveDays: number          // 早退天数
  earlyLeaveDeduction: number     // 早退扣款
  personalLeaveDays: number       // 事假天数
  personalLeaveDeduction: number  // 事假扣款
  sickLeaveDays: number           // 病假天数
  sickLeaveDeduction: number      // 病假扣款
}
```

---

## 功能模块

### 1. 薪酬概览 (SalaryOverview)

**文件位置**: `src-vue/components/SalaryOverview.vue`

**功能**:
- 📊 薪资统计概览
  - 本月薪资总额
  - 已发放金额
  - 待发放金额
  - 平均薪资
- 📈 薪资趋势图表
- 📋 薪资发放状态分布
- 🔗 快速操作入口

**主要数据**:
```typescript
{
  totalSalary: number         // 薪资总额
  paidAmount: number          // 已发放
  pendingAmount: number       // 待发放
  averageSalary: number       // 平均薪资
  trendData: Array<{          // 趋势数据
    month: string
    amount: number
  }>
}
```

---

### 2. 工资条管理 (SalarySlipManager)

**文件位置**: `src-vue/components/SalarySlipManager.vue`

**功能**:
- 📋 工资条列表展示
  - 支持按月份、部门、职位筛选
  - 支持按状态筛选（草稿/待审核/已审核/已发放）
- 📝 创建工资条
  - 选择员工
  - 选择薪资方案
  - 自动计算薪资
- ✏️ 编辑工资条
  - 修改各项收入
  - 调整扣款
  - 添加备注
- 📄 查看工资条详情
  - 完整的收入明细
  - 扣款明细
  - 计算过程
- 🔄 复制工资条
  - 基于现有工资条创建新版本
- 🗑️ 删除工资条
  - 仅草稿状态可删除
- ✅ 审批工资条
  - 单个审批
  - 批量审批
- 💰 发放工资
  - 单个发放
  - 批量发放
- 📊 导出功能
  - 导出为 Excel
  - 包含完整薪资信息

**主要方法**:
```typescript
// 生成工资条
generateSalarySlip(employeeId: string, month: string, schemeId: string): SalarySlip

// 获取员工工资条
getEmployeeSalarySlips(employeeId: string, month?: string): SalarySlip[]

// 获取月份工资条
getMonthSalarySlips(month: string): SalarySlip[]

// 审批工资条
approveSalarySlip(id: string, approverId: string): boolean

// 发放工资
paySalarySlip(id: string, payerId: string): boolean

// 批量审批
batchApproveSalarySlips(ids: string[], approverId: string): number

// 批量发放
batchPaySalarySlips(ids: string[], payerId: string): number

// 导出Excel
exportSalarySlipsToExcel(month: string): any[]
```

---

### 3. 基础工资管理 (BaseSalaryManager)

**文件位置**: `src-vue/components/BaseSalaryManager.vue`

**功能**:
- 💵 底薪设置
  - 按角色设置底薪
  - 按职级设置底薪
- 📈 岗位工资
  - 岗位工资等级
  - 岗位工资标准
- 📊 工龄工资
  - 工龄计算规则
  - 工龄工资标准
- 🎯 绩效工资
  - 绩效考核标准
  - 绩效工资计算

---

### 4. 津贴管理 (AllowanceManager)

**文件位置**: `src-vue/components/AllowanceManager.vue`

**功能**:
- 🚗 交通补贴管理
  - 按岗位设置标准
  - 按地区设置标准
- 📱 通讯补贴管理
  - 话费补贴标准
  - 网络补贴标准
- 🍽️ 餐补管理
  - 工作日计算
  - 每日标准设置（40元/天）
  - 月度餐补计算
- 🏠 房补管理
  - 房补标准设置
  - 特殊情况房补

**餐补动态计算示例**:
```typescript
// 计算某月工作日天数
const calculateWorkdays = (year: number, month: number): number => {
  let workdays = 0
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    // 只计算周一到周五（1-5）
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workdays++
    }
  }

  return workdays
}

// 计算餐补
const workdays = calculateWorkdays(2025, 3)  // 2025年3月
const mealAllowance = workdays * 40  // 工作日天数 × 40元/天
```

---

### 5. 社保管理 (SocialInsuranceManager)

**文件位置**: `src-vue/components/SocialInsuranceManager.vue`

**功能**:
- 👴 养老保险
  - 缴费比例设置（个人8%）
  - 缴费基数管理
- 🏥 医疗保险
  - 缴费比例设置（个人2%）
  - 缴费基数管理
- 💼 失业保险
  - 缴费比例设置（个人0.5%）
  - 缴费基数管理
- 🏠 住房公积金
  - 缴费比例设置（个人12%）
  - 缴费基数管理

**社保计算示例**:
```typescript
// 社保公积金总额计算
const grossSalary = 10000  // 应发工资
const socialInsurance = grossSalary * (
  0.08 +  // 养老保险
  0.02 +  // 医疗保险
  0.005 + // 失业保险
  0.12    // 住房公积金
)
// 社保公积金总额 = 10000 × 0.225 = 2250元
```

---

## 薪资方案

### 方案一：教练方案A - 底薪+提成

```typescript
{
  id: 'coach-a',
  name: '教练方案A - 底薪+提成',
  type: 'coach',
  baseSalary: 3000,                    // 底薪 3000元
  commissionRules: {
    newUserRate: 400,                  // 新用户 400元/人
    oldUserRate: 100,                  // 老用户 100元/人
    doctorOnlineRate: 200,             // 医生上线 200元/次
    productCommission: 0.05            // 产品提成 5%
  },
  allowances: {
    traffic: 500,                      // 交通补贴 500元
    communication: 200,                // 通讯补贴 200元
    meal: 0                            // 餐补按工作日计算
  },
  socialInsurance: {
    pension: 0.08,                     // 养老 8%
    medical: 0.02,                     // 医疗 2%
    unemployment: 0.005,               // 失业 0.5%
    housingFund: 0.12                  // 公积金 12%
  }
}
```

**适用场景**: 新入职教练，主要依靠服务用户获取提成

---

### 方案二：医生方案A - 基础薪资+上线

```typescript
{
  id: 'doctor-a',
  name: '医生方案A - 基础薪资+上线',
  type: 'doctor',
  baseSalary: 5000,                    // 底薪 5000元
  commissionRules: {
    newUserRate: 100,                  // 新用户 100元/人
    oldUserRate: 50,                   // 老用户 50元/人
    doctorOnlineRate: 200,             // 医生上线 200元/次
    productCommission: 0.03            // 产品提成 3%
  },
  allowances: {
    traffic: 300,                      // 交通补贴 300元
    communication: 200,                // 通讯补贴 200元
    meal: 0                            // 餐补按工作日计算
  },
  socialInsurance: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.12
  }
}
```

**适用场景**: 专业医生，提供线上咨询服务

---

### 方案三：顾问方案A - 底薪+提成

```typescript
{
  id: 'consultant-a',
  name: '顾问方案A - 底薪+提成',
  type: 'consultant',
  baseSalary: 4000,                    // 底薪 4000元
  commissionRules: {
    newUserRate: 200,                  // 新用户 200元/人
    oldUserRate: 50,                   // 老用户 50元/人
    doctorOnlineRate: 100,             // 医生上线 100元/次
    productCommission: 0.04            // 产品提成 4%
  },
  allowances: {
    traffic: 400,                      // 交通补贴 400元
    communication: 200,                // 通讯补贴 200元
    meal: 300                          // 餐补 300元（固定）
  },
  socialInsurance: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.12
  }
}
```

**适用场景**: 咨询顾问，平衡底薪和提成

---

## 计算规则

### 1. 收入计算

```
应发工资 = 底薪 + 岗位工资 + 绩效工资 + 工龄工资
        + 新用户提成 + 老用户提成
        + 上线服务费 + 富贵饼金额
        + 产品提成
        + 交通补贴 + 通讯补贴 + 餐补 + 房补
        + 月度奖金 + 季度奖金 + 年度奖金 + 特殊奖金
```

**计算示例**:
```typescript
// 假设某教练 2025年3月的业绩数据
const baseSalary = 3000           // 底薪
const newUserCount = 5            // 新增5个用户
const oldUserCount = 20           // 老用户20个
const onlineServices = 3          // 上线服务3次
const richBiscuits = 2.5          // 富贵饼2.5个

// 收入计算
const grossSalary = baseSalary
  + (newUserCount * 400)          // 新用户提成: 5 × 400 = 2000
  + (oldUserCount * 100)          // 老用户提成: 20 × 100 = 2000
  + (onlineServices * 200)        // 上线服务: 3 × 200 = 600
  + (richBiscuits * 100)          // 富贵饼: 2.5 × 100 = 250
  + 500                           // 交通补贴
  + 200                           // 通讯补贴
  + 880                           // 餐补 (22工作日 × 40)
  // 总计: 3000 + 2000 + 2000 + 600 + 250 + 500 + 200 + 880 = 9430元
```

---

### 2. 社保公积金计算

```
社保公积金 = 应发工资 × (养老8% + 医疗2% + 失业0.5% + 公积金12%)
          = 应发工资 × 22.5%
```

**计算示例**:
```typescript
const grossSalary = 9430
const socialInsurance = 9430 × 0.225 = 2121.75元

// 其中:
// 养老保险: 9430 × 0.08 = 754.4元
// 医疗保险: 9430 × 0.02 = 188.6元
// 失业保险: 9430 × 0.005 = 47.15元
// 住房公积金: 9430 × 0.12 = 1131.6元
```

---

### 3. 个人所得税计算

采用累进税率，起征点 5000 元：

```
应纳税所得额 = 应发工资 - 社保公积金 - 5000
个人所得税 = 按累进税率计算
```

**税率表**:
| 级数 | 应纳税所得额 | 税率 |
|------|-------------|------|
| 1 | 不超过3000元 | 3% |
| 2 | 超过3000-12000元 | 10% |
| 3 | 超过12000-25000元 | 20% |
| 4 | 超过25000-35000元 | 25% |
| 5 | 超过35000-55000元 | 30% |
| 6 | 超过55000-80000元 | 35% |
| 7 | 超过80000元 | 45% |

**计算示例**:
```typescript
const grossSalary = 9430
const socialInsurance = 2121.75
const taxableIncome = 9430 - 2121.75 - 5000 = 2308.25元

// 个税计算: 2308.25 × 3% = 69.25元
const tax = 69.25
```

---

### 4. 实发工资计算

```
实发工资 = 应发工资 - 社保公积金 - 个人所得税 - 其他扣款
```

**计算示例**:
```typescript
const netSalary = 9430 - 2121.75 - 69.25 = 7239元
```

---

### 5. 餐补动态计算

```
工作日天数 = 排除周六、日的天数
餐补金额 = 工作日天数 × 40元/天
```

**2025年3月示例**:
```
总天数: 31天
周末: 3月1-2日、8-9日、15-16日、22-23日、29-30日 (共10天)
工作日: 31 - 10 = 21天
餐补: 21 × 40 = 840元
```

---

## API 接口

### useSalary Composable

**文件位置**: `src-vue/composables/useSalary.ts`

**导入方式**:
```typescript
import { useSalary } from '@/composables/useSalary'

const {
  salarySlips,                    // 工资条列表
  generateSalarySlip,             // 生成工资条
  getEmployeeSalarySlips,         // 获取员工工资条
  getMonthSalarySlips,            // 获取月份工资条
  approveSalarySlip,              // 审批工资条
  paySalarySlip,                  // 发放工资
  getSalarySchemes,               // 获取薪资方案
  getSalaryStats,                 // 获取薪资统计
  updateSalarySlip,               // 更新工资条
  deleteSalarySlip,               // 删除工资条
  copySalarySlip,                 // 复制工资条
  batchApproveSalarySlips,        // 批量审批
  batchPaySalarySlips,            // 批量发放
  exportSalarySlipsToExcel        // 导出Excel
} = useSalary()
```

**完整 API 说明**:

#### 1. generateSalarySlip

生成新的工资条

```typescript
generateSalarySlip(
  employeeId: string,    // 员工ID
  month: string,         // 月份 (YYYY-MM)
  schemeId: string       // 薪资方案ID
): SalarySlip
```

**使用示例**:
```typescript
const slip = generateSalarySlip('1', '2025-03', 'coach-a')
```

---

#### 2. getEmployeeSalarySlips

获取员工的工资条列表

```typescript
getEmployeeSalarySlips(
  employeeId: string,    // 员工ID
  month?: string         // 可选：筛选月份
): SalarySlip[]
```

**使用示例**:
```typescript
// 获取员工所有工资条
const allSlips = getEmployeeSalarySlips('1')

// 获取员工2025年3月的工资条
const marchSlip = getEmployeeSalarySlips('1', '2025-03')
```

---

#### 3. getMonthSalarySlips

获取某月的所有工资条

```typescript
getMonthSalarySlips(
  month: string          // 月份 (YYYY-MM)
): SalarySlip[]
```

**使用示例**:
```typescript
const marchSlips = getMonthSalarySlips('2025-03')
```

---

#### 4. approveSalarySlip

审批工资条

```typescript
approveSalarySlip(
  id: string,            // 工资条ID
  approverId: string     // 审批人ID
): boolean               // 是否成功
```

**使用示例**:
```typescript
const success = approveSalarySlip('slip123', 'admin1')
if (success) {
  toast.success('审批成功')
}
```

---

#### 5. paySalarySlip

发放工资

```typescript
paySalarySlip(
  id: string,            // 工资条ID
  payerId: string        // 发放人ID
): boolean               // 是否成功
```

**使用示例**:
```typescript
const success = paySalarySlip('slip123', 'finance1')
if (success) {
  toast.success('发放成功')
}
```

---

#### 6. getSalaryStats

获取薪资统计数据

```typescript
getSalaryStats(
  month: string          // 月份 (YYYY-MM)
): {
  total: number                    // 工资条总数
  draft: number                   // 草稿数量
  pending: number                 // 待审核数量
  approved: number                // 已审核数量
  paid: number                    // 已发放数量
  totalGrossSalary: number        // 应发总额
  totalNetSalary: number          // 实发总额
}
```

**使用示例**:
```typescript
const stats = getSalaryStats('2025-03')
console.log(`应发总额: ${stats.totalGrossSalary}`)
console.log(`实发总额: ${stats.totalNetSalary}`)
```

---

#### 7. updateSalarySlip

更新工资条

```typescript
updateSalarySlip(
  id: string,                    // 工资条ID
  updates: Partial<SalarySlip>    // 更新内容
): boolean                       // 是否成功
```

**使用示例**:
```typescript
const success = updateSalarySlip('slip123', {
  notes: '调整了绩效工资',
  'income.performanceSalary': 500
})
```

---

#### 8. deleteSalarySlip

删除工资条

```typescript
deleteSalarySlip(
  id: string             // 工资条ID
): boolean              // 是否成功
```

**使用示例**:
```typescript
const success = deleteSalarySlip('slip123')
if (success) {
  toast.success('删除成功')
}
```

---

#### 9. copySalarySlip

复制工资条

```typescript
copySalarySlip(
  id: string             // 要复制的工资条ID
): SalarySlip | null     // 新工资条
```

**使用示例**:
```typescript
const newSlip = copySalarySlip('slip123')
if (newSlip) {
  console.log('复制成功:', newSlip.id)
}
```

---

#### 10. batchApproveSalarySlips

批量审批工资条

```typescript
batchApproveSalarySlips(
  ids: string[],         // 工资条ID数组
  approverId: string     // 审批人ID
): number               // 成功审批的数量
```

**使用示例**:
```typescript
const count = batchApproveSalarySlips(
  ['slip1', 'slip2', 'slip3'],
  'admin1'
)
console.log(`成功审批 ${count} 条工资条`)
```

---

#### 11. batchPaySalarySlips

批量发放工资

```typescript
batchPaySalarySlips(
  ids: string[],         // 工资条ID数组
  payerId: string        // 发放人ID
): number               // 成功发放的数量
```

**使用示例**:
```typescript
const count = batchPaySalarySlips(
  ['slip1', 'slip2', 'slip3'],
  'finance1'
)
console.log(`成功发放 ${count} 条工资条`)
```

---

#### 12. exportSalarySlipsToExcel

导出工资条为 Excel 格式

```typescript
exportSalarySlipsToExcel(
  month: string          // 月份 (YYYY-MM)
): any[]                // Excel 数据
```

**使用示例**:
```typescript
const excelData = exportSalarySlipsToExcel('2025-03')
// 使用 XLSX 库导出
import * as XLSX from 'xlsx'
const ws = XLSX.utils.json_to_sheet(excelData)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, '工资条')
XLSX.writeFile(wb, `工资条_${month}.xlsx`)
```

---

## 组件说明

### 组件列表

| 组件名 | 文件路径 | 功能描述 |
|--------|---------|---------|
| **SalaryOverview** | `src-vue/components/SalaryOverview.vue` | 薪酬概览 |
| **SalarySlipManager** | `src-vue/components/SalarySlipManager.vue` | 工资条管理 |
| **BaseSalaryManager** | `src-vue/components/BaseSalaryManager.vue` | 基础工资管理 |
| **AllowanceManager** | `src-vue/components/AllowanceManager.vue` | 津贴管理 |
| **SocialInsuranceManager** | `src-vue/components/SocialInsuranceManager.vue` | 社保管理 |

### 组件关系图

```
┌─────────────────┐
│ SalaryOverview  │  (薪酬概览)
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ↓              ↓              ↓              ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│SalarySlip   │ │ BaseSalary  │ │ Allowance   │ │SocialInsurance│
│Manager      │ │ Manager     │ │ Manager     │ │ Manager      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 使用示例

### 示例1: 创建工资条

```vue
<template>
  <div>
    <button @click="handleGenerate">生成工资条</button>
  </div>
</template>

<script setup lang="ts">
import { useSalary } from '@/composables/useSalary'
import { useToast } from '@/composables/useToast'

const { generateSalarySlip } = useSalary()
const toast = useToast()

const handleGenerate = () => {
  try {
    const slip = generateSalarySlip('1', '2025-03', 'coach-a')
    toast.success('生成成功', `已生成 ${slip.employeeName} 的工资条`)
  } catch (error) {
    toast.error('生成失败', error.message)
  }
}
</script>
```

---

### 示例2: 批量审批

```vue
<template>
  <div>
    <button @click="handleBatchApprove">批量审批</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSalary } from '@/composables/useSalary'
import { useToast } from '@/composables/useToast'

const { getMonthSalarySlips, batchApproveSalarySlips } = useSalary()
const toast = useToast()

const selectedSlips = ref<string[]>([])

const handleBatchApprove = () => {
  const count = batchApproveSalarySlips(selectedSlips.value, 'admin1')
  toast.success('批量审批', `成功审批 ${count} 条工资条`)
  selectedSlips.value = []
}
</script>
```

---

### 示例3: 导出Excel

```vue
<template>
  <div>
    <button @click="handleExport">导出Excel</button>
  </div>
</template>

<script setup lang="ts">
import { useSalary } from '@/composables/useSalary'
import { useToast } from '@/composables/useToast'
import * as XLSX from 'xlsx'

const { exportSalarySlipsToExcel } = useSalary()
const toast = useToast()

const handleExport = () => {
  const month = '2025-03'
  const excelData = exportSalarySlipsToExcel(month)

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '工资条')

  // 导出文件
  XLSX.writeFile(wb, `工资条_${month}.xlsx`)
  toast.success('导出成功', `已导出 ${excelData.length} 条记录`)
}
</script>
```

---

### 示例4: 薪资统计

```vue
<template>
  <div>
    <div class="stat-card">
      <h3>本月应发总额</h3>
      <p>¥{{ stats.totalGrossSalary.toLocaleString() }}</p>
    </div>
    <div class="stat-card">
      <h3>本月实发总额</h3>
      <p>¥{{ stats.totalNetSalary.toLocaleString() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSalary } from '@/composables/useSalary'

const { getSalaryStats } = useSalary()

const stats = computed(() => {
  return getSalaryStats('2025-03')
})

onMounted(() => {
  console.log('薪资统计:', stats.value)
})
</script>
```

---

## 常见问题

### Q1: 如何添加新的薪资方案？

在 `useSalary.ts` 的 `SALARY_SCHEMES` 数组中添加新方案：

```typescript
const SALARY_SCHEMES: SalaryScheme[] = [
  // ... 现有方案
  {
    id: 'new-scheme',
    name: '新方案名称',
    type: 'coach',
    baseSalary: 4000,
    commissionRules: { ... },
    allowances: { ... },
    socialInsurance: { ... }
  }
]
```

---

### Q2: 如何修改餐补标准？

修改 `useSalary.ts` 中的常量：

```typescript
const MEAL_ALLOWANCE_DAILY_RATE = 40  // 改为其他金额
```

---

### Q3: 如何调整个税起征点？

修改 `generateSalarySlip` 函数中的计算：

```typescript
const taxableIncome = grossSalary - socialInsurance - 5000  // 修改起征点
```

---

### Q4: 如何批量导入工资数据？

可以通过以下方式实现：

1. **CSV 导入**:
```typescript
import Papa from 'papaparse'

const importFromCSV = (file: File) => {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      results.data.forEach((row: any) => {
        generateSalarySlip(row.employeeId, row.month, row.schemeId)
      })
    }
  })
}
```

2. **Excel 导入**:
```typescript
import * as XLSX from 'xlsx'

const importFromExcel = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    jsonData.forEach((row: any) => {
      generateSalarySlip(row.员工ID, row.月份, row.薪资方案)
    })
  }
  reader.readAsArrayBuffer(file)
}
```

---

## 最佳实践

### 1. 数据验证

生成工资条前验证数据：

```typescript
const validateSalaryData = (employeeId: string, month: string) => {
  // 检查员工是否存在
  const employee = getEmployee(employeeId)
  if (!employee) {
    throw new Error('员工不存在')
  }

  // 检查月份格式
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('月份格式错误，应为 YYYY-MM')
  }

  // 检查薪资方案
  const bindings = getEmployeeBindings(employeeId, month)
  if (bindings.length === 0) {
    console.warn(`员工 ${employeeId} 在 ${month} 没有绑定的用户`)
  }

  return true
}
```

---

### 2. 权限控制

添加权限检查：

```typescript
const approveSalarySlip = (id: string, approverId: string): boolean => {
  const slip = salarySlips.value.find(s => s.id === id)
  if (!slip) return false

  // 检查审批权限
  const approver = getUser(approverId)
  if (!approver.roles.includes('finance')) {
    throw new Error('无权审批工资条')
  }

  // 审批逻辑
  slip.status = 'approved'
  slip.approvedBy = approverId
  slip.approvedAt = new Date()

  return true
}
```

---

### 3. 数据持久化

将数据保存到后端：

```typescript
// 保存到服务器
const saveSalarySlipToServer = async (slip: SalarySlip) => {
  try {
    const response = await fetch('/api/salary-slips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slip)
    })
    return await response.json()
  } catch (error) {
    console.error('保存失败:', error)
    throw error
  }
}

// 从服务器加载
const loadSalarySlipsFromServer = async (month: string) => {
  try {
    const response = await fetch(`/api/salary-slips?month=${month}`)
    return await response.json()
  } catch (error) {
    console.error('加载失败:', error)
    throw error
  }
}
```

---

## 扩展功能建议

### 1. 薪资历史对比

```typescript
const compareSalaryHistory = (employeeId: string, months: string[]) => {
  return months.map(month => {
    const slip = getEmployeeSalarySlips(employeeId, month)[0]
    return {
      month,
      grossSalary: slip?.summary.grossSalary || 0,
      netSalary: slip?.summary.netSalary || 0
    }
  })
}
```

---

### 2. 薪资预测

```typescript
const predictSalary = (employeeId: string, month: string) => {
  const history = getEmployeeSalarySlips(employeeId)
  const avgGrowth = calculateAverageGrowth(history)
  const lastMonth = history[history.length - 1]

  return {
    predictedSalary: lastMonth.summary.grossSalary * (1 + avgGrowth),
    confidence: 0.85
  }
}
```

---

### 3. 绩效关联

```typescript
const calculatePerformanceBonus = (
  performanceScore: number,
  scheme: SalaryScheme
): number => {
  if (!scheme.performanceBonus?.enabled) return 0

  const level = scheme.performanceBonus.levels.find(
    l => performanceScore >= l.minScore && performanceScore <= l.maxScore
  )

  return level?.bonus || 0
}
```

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-08
**维护者**: 惯能健康技术团队
