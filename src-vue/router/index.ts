import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 导入页面组件 - 使用相对路径
import Dashboard from '../views/Dashboard.vue'
import DashboardNew from '../components/RoleBasedDashboard.vue'
import SalesMonitor from '../views/SalesMonitor.vue'
import ClientList from '../views/ClientList.vue'
import ClientProfile from '../views/ClientProfile.vue'
import LeadManagement from '../views/LeadManagement.vue'
import BatchTaskProcessor from '../views/BatchTaskProcessor.vue'

// 财务管理模块
import FinanceCenter from '../views/FinanceCenter.vue'
import FinanceOverview from '../views/FinanceOverview.vue'
import IncomeManagement from '../views/IncomeManagement.vue'
import AccountReceivable from '../views/AccountReceivable.vue'
import AccountPayable from '../views/AccountPayable.vue'
import FundsManagement from '../views/FundsManagement.vue'
import BudgetManagement from '../views/BudgetManagement.vue'
import CostAccounting from '../views/CostAccounting.vue'
import FinancialReports from '../views/FinancialReports.vue'
import Reimbursement from '../views/Reimbursement.vue'
import ReimbursementCreate from '../views/ReimbursementCreate.vue'

// 佣金和富贵饼管理
import CommissionManager from '../components/CommissionManager.vue'
import RichBiscuitManager from '../components/RichBiscuitManager.vue'

// ERP 模块
import InventoryManagement from '../views/InventoryManagement.vue'
import SettlementManagement from '../views/SettlementManagement.vue'
import AssetManagement from '../views/AssetManagement.vue'

// 智能辅助模块
import AIChat from '../views/AIChat.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'

// 系统管理
import SystemManagement from '../views/SystemManagement.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  // 工作台
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardNew
  },
  {
    path: '/dashboard-old',
    name: 'DashboardOld',
    component: Dashboard
  },
  // 批量化任务处理
  {
    path: '/batch-task-processor',
    name: 'BatchTaskProcessor',
    component: BatchTaskProcessor
  },
  // 客户管理
  {
    path: '/client-list',
    name: 'ClientList',
    component: ClientList
  },
  {
    path: '/client-profile/:id',
    name: 'ClientProfile',
    component: ClientProfile
  },
  // 客情管理
  {
    path: '/sales-monitor',
    name: 'SalesMonitor',
    component: SalesMonitor
  },
  {
    path: '/lead-management',
    name: 'LeadManagement',
    component: LeadManagement
  },
  {
    path: '/potential-clients',
    name: 'PotentialClients',
    component: LeadManagement
  },
  // 智能辅助
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: AIChat
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase
  },
  // 系统管理
  {
    path: '/system-management',
    name: 'SystemManagement',
    component: SystemManagement
  },
  // ERP 中心
  {
    path: '/inventory-management',
    name: 'InventoryManagement',
    component: InventoryManagement
  },
  {
    path: '/settlement-management',
    name: 'SettlementManagement',
    component: () => import('../views/SettlementOverview.vue')
  },
  {
    path: '/settlement-management-old',
    name: 'SettlementManagementOld',
    component: SettlementManagement
  },
  {
    path: '/coach-reimbursement',
    name: 'CoachReimbursement',
    component: () => import('../views/CoachReimbursement.vue')
  },
  {
    path: '/reimbursement/create',
    name: 'ReimbursementCreate',
    component: ReimbursementCreate
  },
  {
    path: '/reimbursement/edit/:id',
    name: 'ReimbursementEdit',
    component: ReimbursementCreate
  },
  {
    path: '/finance-center',
    name: 'FinanceCenter',
    component: FinanceCenter
  },
  {
    path: '/account-payable',
    name: 'AccountPayable',
    component: AccountPayable
  },
  {
    path: '/asset-management',
    name: 'AssetManagement',
    component: AssetManagement
  },
  {
    path: '/budget-management',
    name: 'BudgetManagement',
    component: BudgetManagement
  },
  {
    path: '/cost-accounting',
    name: 'CostAccounting',
    component: CostAccounting
  },
  {
    path: '/financial-reports',
    name: 'FinancialReports',
    component: FinancialReports
  },
  // 佣金和富贵饼管理
  {
    path: '/commission-management',
    name: 'CommissionManagement',
    component: () => import('../components/CommissionManager.vue')
  },
  {
    path: '/rich-biscuit-management',
    name: 'RichBiscuitManagement',
    component: () => import('../components/RichBiscuitManager.vue')
  },
  {
    path: '/online-service-management',
    name: 'OnlineServiceManagement',
    component: () => import('../components/OnlineServiceManager.vue')
  },
  {
    path: '/service-binding-management',
    name: 'ServiceBindingManagement',
    component: () => import('../components/ServiceBindingManager.vue')
  },
  {
    path: '/salary-slip-management',
    name: 'SalarySlipManagement',
    component: () => import('../components/SalarySlipManager.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
