# 惯能健康 CRM 系统

> 基于 Vue 3 + TypeScript 的现代化健康管理系统

## 📖 项目简介

惯能健康 CRM 是一个功能完善的健康管理系统，提供客户管理、财务管理、风险预测、ERP 等全方位功能。系统采用现代化的前端技术栈，支持多角色、多主题，并具备强大的数据分析和预测能力。

### 核心特性

- 🎨 **多主题支持** - 经典蓝、黑金、暖黄三种主题风格
- 👥 **角色权限管理** - 支持管理员、教练、医生、顾问等多种角色
- 📊 **数据可视化** - 丰富的图表和统计数据展示
- 🚨 **风险预测** - 多维度健康风险评估和预警
- 💰 **财务管理** - 完整的财务流程管理
- 🎯 **结算管理** - 教练、医生、佣金等多角色结算
- 🤖 **AI 智能助手** - 智能对话和业务咨询
- 📚 **知识库** - 文档和知识管理系统

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 7.x 或 pnpm >= 6.x

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目文档

我们为您准备了详细的文档：

| 文档 | 说明 | 链接 |
|------|------|------|
| **系统框架文档** | 完整的系统架构和功能说明 | [SYSTEM_FRAMEWORK.md](./SYSTEM_FRAMEWORK.md) |
| **架构图文档** | 可视化系统架构和数据流 | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **快速参考手册** | 常用 API 和开发规范 | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |

## 🏗️ 技术栈

### 核心框架
- **Vue 3.5** - 渐进式 JavaScript 框架
- **TypeScript 5.9** - 类型安全的 JavaScript 超集
- **Vite 7.3** - 下一代前端构建工具

### 路由和状态管理
- **Vue Router 4.6** - 官方路由管理器
- **Pinia 3.0** - Vue 官方状态管理库

### UI 框架
- **Tailwind CSS 3.4** - 实用优先的 CSS 框架
- **Lucide Vue 0.56** - 现代化图标库

### 工具库
- **PapaParse 5.5** - CSV 解析
- **XLSX 0.18** - Excel 处理

## 📦 项目结构

```
CRM-project/
├── src-vue/                    # Vue 3 源代码
│   ├── main.ts                # 应用入口
│   ├── App.vue                # 根组件
│   ├── router/                # 路由配置
│   ├── views/                 # 页面组件
│   ├── components/            # 业务组件
│   │   ├── shared/           # 共享组件
│   │   ├── settlement/       # 结算组件
│   │   └── knowledge/        # 知识库组件
│   ├── composables/          # 组合式函数
│   ├── types/                # 类型定义
│   ├── data/                 # 静态数据
│   ├── utils/                # 工具函数
│   └── styles/               # 样式文件
├── package.json               # 项目配置
├── vite.config.vue.ts        # Vite 配置
├── tailwind.config.js        # Tailwind 配置
└── tsconfig.json             # TypeScript 配置
```

## 🎯 主要功能模块

### 1️⃣ 工作台
- 基于角色的个性化仪表盘
- 关键指标展示
- 快速操作入口

### 2️⃣ 客户管理
- **客情管理** - 大屏监控、用户分配、教练管理
- **客户列表** - 客户查询和管理
- **客户档案** - 客户详细信息
- **潜客管理** - 潜在客户管理

### 3️⃣ 财务管理
- 财务概览
- 收入管理
- 应收/应付账款
- 资金管理
- 预算管理
- 成本核算
- 财务报表
- 报销管理

### 4️⃣ 结算管理
- **教练结算** - 教练薪酬和报销结算
- **医生结算** - 医生在线服务结算
- **佣金结算** - 顾问佣金结算
- 薪酬管理
- 佣金管理

### 5️⃣ ERP 模块
- 库存管理
- 资产管理

### 6️⃣ 智能辅助
- **AI 智能助手** - 智能对话和咨询
- **知识库** - 文档和知识管理

### 7️⃣ 预警与风险预测
- **预警中心** - 财务和业务预警
- **风险预测中心** - 健康风险评估和干预建议

## 🎨 主题系统

系统支持三种主题风格：

- **Classic Blue (经典蓝)** - 专业、清新的蓝色主题
- **Black Gold (黑金)** - 高端、商务的黑金风格
- **Warm Yellow (暖黄)** - 温暖、舒适的黄色主题

主题切换通过 `useTheme` composable 实现：

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()
setTheme('black-gold')  // 切换到黑金主题
```

## 👥 角色系统

系统支持多种角色，每个角色有不同的权限和菜单配置：

- **admin** - 系统管理员
- **manager** - 管理者
- **coach** - 教练
- **doctor** - 医生
- **consultant** - 顾问
- **finance** - 财务

角色切换通过 `useRole` composable 实现：

```typescript
import { useRole } from '@/composables/useRole'

const { switchRole } = useRole()
switchRole('coach')  // 切换到教练角色
```

## 🔧 开发指南

### 添加新页面

1. 在 `src-vue/views/` 创建 Vue 组件
2. 在 `src-vue/router/index.ts` 添加路由
3. 在 `App.vue` 添加菜单项

### 添加新组件

- 业务组件放在 `src-vue/components/`
- 共享组件放在 `src-vue/components/shared/`

### 使用 Composable

```typescript
import { useToast } from '@/composables/useToast'

const toast = useToast()
toast.success('成功', '操作完成')
```

### 类型定义

在 `src-vue/types/` 中定义 TypeScript 类型：

```typescript
export interface User {
  id: string
  name: string
  email: string
}
```

## 📝 代码规范

- 使用 TypeScript 进行类型检查
- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法糖
- 使用 Tailwind CSS 进行样式开发
- 组件命名使用 PascalCase
- 文件组织遵循约定目录结构

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证

## 👨‍💻 作者

惯能健康技术团队

## 📮 联系方式

如有问题或建议，请联系开发团队。

---

**版本**: 1.0.0
**最后更新**: 2026-03-08
