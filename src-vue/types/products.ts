// 产品类型定义和佣金规则
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number // 原价（如有减免）
  subsidy?: number // 补贴金额
  commissionRate: number // 佣金比例
  commissionType: 'none' | 'low' | 'medium' | 'high' | 'premium'
  description: string
  hasCommission: boolean
}

// 产品列表
export const PRODUCTS: Product[] = [
  {
    id: 'P3188',
    name: '3188元基础套餐',
    price: 3188,
    commissionRate: 2, // 2%
    commissionType: 'medium',
    description: '标准产品',
    hasCommission: true
  },
  {
    id: 'P6800',
    name: '6800元标准套餐',
    price: 6800,
    commissionRate: 0, // 无提成
    commissionType: 'none',
    description: '中低客单产品',
    hasCommission: false
  },
  {
    id: 'P7188',
    name: '7188元进阶套餐',
    price: 7188,
    commissionRate: 5, // 5%
    commissionType: 'high',
    description: '高客单产品',
    hasCommission: true
  },
  {
    id: 'P12800',
    name: '12800元高级套餐',
    price: 12800,
    commissionRate: 5, // 5%
    commissionType: 'high',
    description: '高客单产品',
    hasCommission: true
  },
  {
    id: 'P25800',
    name: '25800元尊享套餐',
    price: 25800,
    commissionRate: 5, // 5%
    commissionType: 'high',
    description: '高客单产品',
    hasCommission: true
  },
  {
    id: 'P39800',
    name: '39800元旗舰套餐（补贴）',
    price: 39800,
    originalPrice: 49800,
    subsidy: 10000,
    commissionRate: 5, // 5%
    commissionType: 'premium',
    description: '旗舰套餐（含10000元补贴减免）',
    hasCommission: true
  },
  {
    id: 'P49800',
    name: '49800元至尊套餐',
    price: 49800,
    commissionRate: 5, // 5%
    commissionType: 'premium',
    description: '顶级产品',
    hasCommission: true
  }
]

// 根据价格获取产品
export function getProductByPrice(price: number): Product | undefined {
  return PRODUCTS.find(p => p.price === price)
}

// 根据产品ID获取产品
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

// 计算佣金
export function calculateCommission(product: Product, quantity: number = 1): number {
  if (!product.hasCommission) {
    return 0
  }
  return product.price * product.commissionRate / 100 * quantity
}

// 计算佣金（根据价格）
export function calculateCommissionByPrice(price: number, quantity: number = 1): number {
  const product = getProductByPrice(price)
  if (!product || !product.hasCommission) {
    return 0
  }
  return product.price * product.commissionRate / 100 * quantity
}

// 获取佣金比例
export function getCommissionRate(price: number): number {
  const product = getProductByPrice(price)
  return product ? product.commissionRate : 0
}

// 获取产品类型标签
export function getProductTypeLabel(price: number): string {
  const product = getProductByPrice(price)
  return product ? product.commissionType : 'none'
}

// 获取产品类型显示名称
export function getProductTypeDisplay(type: string): string {
  const labels = {
    'none': '无提成',
    'low': '低提成',
    'medium': '标准提成',
    'high': '高提成',
    'premium': '顶级提成'
  }
  return labels[type as keyof typeof labels] || '未知'
}

// 获取产品类型颜色
export function getProductTypeColor(type: string): string {
  const colors = {
    'none': 'text-slate-600',
    'low': 'text-blue-600',
    'medium': 'text-green-600',
    'high': 'text-orange-600',
    'premium': 'text-red-600'
  }
  return colors[type as keyof typeof colors] || 'text-slate-600'
}

// 判断是否为补贴产品
export function isSubsidizedProduct(price: number): boolean {
  const product = getProductByPrice(price)
  return product ? !!product.subsidy : false
}

// 获取补贴金额
export function getSubsidyAmount(price: number): number {
  const product = getProductByPrice(price)
  return product ? (product.subsidy || 0) : 0
}

// 获取产品原价
export function getOriginalPrice(price: number): number {
  const product = getProductByPrice(price)
  return product ? (product.originalPrice || product.price) : price
}

// 格式化价格显示
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

// 格式化佣金显示
export function formatCommission(commission: number): string {
  return `¥${commission.toLocaleString()}`
}

// 检查是否符合高客单条件（7000元以上）
export function isHighTicketProduct(price: number): boolean {
  return price >= 7000
}

// 检查是否符合提成条件
export function hasCommission(price: number): boolean {
  const product = getProductByPrice(price)
  return product ? product.hasCommission : false
}

// 获取所有可用产品列表
export function getAllProducts(): Product[] {
  return [...PRODUCTS].sort((a, b) => a.price - b.price)
}

// 按佣金类型分组产品
export function getProductsByCommissionType(): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {
    none: [],
    low: [],
    medium: [],
    high: [],
    premium: []
  }

  PRODUCTS.forEach(product => {
    grouped[product.commissionType].push(product)
  })

  return grouped
}

// 产品价格选项（用于下拉选择）
export const PRODUCT_PRICE_OPTIONS = [
  { label: '3188元（2%提成）', value: 3188 },
  { label: '6800元（无提成）', value: 6800 },
  { label: '7188元（5%提成）', value: 7188 },
  { label: '12800元（5%提成）', value: 12800 },
  { label: '25800元（5%提成）', value: 25800 },
  { label: '39800元（5%提成，含10000元补贴）', value: 39800 },
  { label: '49800元（5%提成）', value: 49800 }
]

// 导出产品类型枚举
export enum CommissionType {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  PREMIUM = 'premium'
}

// 导出佣金比例常量
export const COMMISSION_RATES = {
  NONE: 0,      // 999元及以下、6800元
  LOW: 0,       // （未使用）
  STANDARD: 2,  // 3188元
  HIGH: 5       // 7188元及以上
} as const