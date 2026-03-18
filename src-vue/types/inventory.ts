// 库存管理类型定义

// 库存商品
export interface InventoryProduct {
  id: string
  sku: string
  name: string
  categoryId?: string
  specification: string
  unit: string
  costPrice: number          // 成本价（采购价）
  salePrice: number          // 销售价
  stockQuantity: number      // 当前库存数量
  minStock: number           // 最低库存预警
  maxStock: number           // 最高库存
  warehouseLocation?: string // 仓库位置
  supplierId?: string        // 默认供应商
  lastPurchaseDate?: string  // 最后采购日期
  lastSaleDate?: string      // 最后销售日期
  remark?: string
  createdAt: string
  updatedAt: string
}

// 库存变动记录
export interface InventoryTransaction {
  id: string
  transactionNo: string      // 流水号
  productId: string
  productName: string
  transactionType: TransactionType
  quantity: number           // 变动数量（正数为入库，负数为出库）
  beforeQuantity: number     // 变动前数量
  afterQuantity: number      // 变动后数量
  referenceType: ReferenceType
  referenceId: string        // 关联单据ID
  referenceNo: string        // 关联单据号
  warehouseLocation?: string
  costPrice?: number         // 成本价（入库时）
  amount?: number            // 金额
  operator: string           // 操作人
  operatorId: string
  remark?: string
  createdAt: string
}

// 库存变动类型
export type TransactionType =
  | 'purchase_in'      // 采购入库
  | 'purchase_return'  // 采购退货
  | 'sale_out'         // 销售出库
  | 'sale_return'      // 销售退货
  | 'transfer_in'      // 调拨入库
  | 'transfer_out'     // 调拨出库
  | 'adjustment'       // 盘点调整
  | 'damage'           // 损坏
  | 'expired'          // 过期
  | 'other'            // 其他

// 关联单据类型
export type ReferenceType =
  | 'purchase_order'
  | 'purchase_return'
  | 'sale_order'
  | 'sale_return'
  | 'transfer_order'
  | 'adjustment_order'
  | 'other'

// 库存预警
export interface InventoryAlert {
  id: string
  productId: string
  productName: string
  alertType: AlertType
  currentQuantity: number
  alertThreshold: number
  alertValue: number           // 预警值
  isResolved: boolean
  resolvedAt?: string
  createdAt: string
}

export type AlertType =
  | 'low_stock'        // 库存不足
  | 'out_of_stock'     // 缺货
  | 'overstock'        // 库存积压
  | 'expired'          // 临期/过期

// 库存盘点单
export interface StockCheckOrder {
  id: string
  checkNo: string
  warehouseLocation?: string
  checkDate: string
  status: 'draft' | 'checking' | 'completed' | 'cancelled'
  items: StockCheckItem[]
  checkedBy: string
  checkedById: string
  reviewedBy?: string
  reviewedById?: string
  reviewedAt?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface StockCheckItem {
  id: string
  productId: string
  productName: string
  bookQuantity: number       // 账面数量
  actualQuantity: number     // 实盘数量
  difference: number         // 差异数量
  differenceReason?: string
  costPrice: number
  lossAmount: number         // 损益金额
}

// 库存统计
export interface InventoryStats {
  totalProducts: number
  totalStock: number
  totalValue: number           // 库存总价值（按成本价）
  lowStockCount: number        // 低库存商品数
  outOfStockCount: number      // 缺货商品数
  overstockCount: number       // 积压商品数
  todayIn: number              // 今日入库数量
  todayOut: number             // 今日出库数量
  todayInAmount: number        // 今日入库金额
  todayOutAmount: number       // 今日出库金额
}

// 库存变动类型标签
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, { label: string; color: string; icon: string }> = {
  purchase_in: { label: '采购入库', color: 'green', icon: 'ArrowDownLeft' },
  purchase_return: { label: '采购退货', color: 'orange', icon: 'ArrowUpRight' },
  sale_out: { label: '销售出库', color: 'blue', icon: 'ArrowUpRight' },
  sale_return: { label: '销售退货', color: 'purple', icon: 'ArrowDownLeft' },
  transfer_in: { label: '调拨入库', color: 'cyan', icon: 'ArrowRightLeft' },
  transfer_out: { label: '调拨出库', color: 'cyan', icon: 'ArrowRightLeft' },
  adjustment: { label: '盘点调整', color: 'yellow', icon: 'RefreshCw' },
  damage: { label: '损坏', color: 'red', icon: 'AlertTriangle' },
  expired: { label: '过期', color: 'red', icon: 'Clock' },
  other: { label: '其他', color: 'gray', icon: 'MoreHorizontal' }
}

// 预警类型标签
export const ALERT_TYPE_LABELS: Record<AlertType, { label: string; color: string }> = {
  low_stock: { label: '库存不足', color: 'yellow' },
  out_of_stock: { label: '缺货', color: 'red' },
  overstock: { label: '库存积压', color: 'orange' },
  expired: { label: '临期/过期', color: 'red' }
}

// 盘点单状态标签
export const STOCK_CHECK_STATUS_LABELS: Record<StockCheckOrder['status'], { label: string; color: string }> = {
  draft: { label: '草稿', color: 'gray' },
  checking: { label: '盘点中', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' }
}

// 生成库存流水号
export function generateTransactionNo(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV${year}${month}${day}${random}`
}

// 生成盘点单号
export function generateStockCheckNo(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CK${year}${month}${day}${random}`
}

// 计算库存价值
export function calculateInventoryValue(product: InventoryProduct): number {
  return product.stockQuantity * product.costPrice
}

// 检查是否需要预警
export function checkInventoryAlert(product: InventoryProduct): AlertType | null {
  if (product.stockQuantity <= 0) {
    return 'out_of_stock'
  } else if (product.stockQuantity <= product.minStock) {
    return 'low_stock'
  } else if (product.stockQuantity >= product.maxStock) {
    return 'overstock'
  }
  return null
}

// 获取库存状态标签
export function getStockStatus(product: InventoryProduct): { label: string; color: string } {
  if (product.stockQuantity <= 0) {
    return { label: '缺货', color: 'red' }
  } else if (product.stockQuantity <= product.minStock) {
    return { label: '库存不足', color: 'yellow' }
  } else if (product.stockQuantity >= product.maxStock) {
    return { label: '库存积压', color: 'orange' }
  }
  return { label: '库存正常', color: 'green' }
}
