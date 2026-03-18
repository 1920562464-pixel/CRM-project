import { ref, computed } from 'vue'
import type { InventoryProduct, InventoryTransaction, InventoryAlert, InventoryStats, TransactionType, ReferenceType, AlertType } from '../types/inventory'
import { generateTransactionNo, checkInventoryAlert } from '../types/inventory'

// 模拟库存数据
const mockProducts: InventoryProduct[] = [
  {
    id: 'P001',
    sku: 'SKU001',
    name: '血糖仪',
    specification: '家用型',
    unit: '台',
    costPrice: 150,
    salePrice: 298,
    stockQuantity: 120,
    minStock: 20,
    maxStock: 200,
    warehouseLocation: 'A区01架',
    supplierId: '1',
    lastPurchaseDate: '2026-03-15',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-15'
  },
  {
    id: 'P002',
    sku: 'SKU002',
    name: '血压计',
    specification: '电子上臂式',
    unit: '台',
    costPrice: 120,
    salePrice: 258,
    stockQuantity: 15,
    minStock: 20,
    maxStock: 150,
    warehouseLocation: 'A区02架',
    supplierId: '1',
    lastPurchaseDate: '2026-03-10',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-10'
  },
  {
    id: 'P003',
    sku: 'SKU003',
    name: '体检套餐',
    specification: '基础体检',
    unit: '份',
    costPrice: 200,
    salePrice: 680,
    stockQuantity: 50,
    minStock: 10,
    maxStock: 100,
    warehouseLocation: 'B区01架',
    supplierId: '2',
    lastPurchaseDate: '2026-03-12',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-12'
  },
  {
    id: 'P004',
    sku: 'SKU004',
    name: '营养保健品',
    specification: '蛋白粉',
    unit: '罐',
    costPrice: 80,
    salePrice: 168,
    stockQuantity: 0,
    minStock: 15,
    maxStock: 80,
    warehouseLocation: 'B区02架',
    supplierId: '3',
    lastPurchaseDate: '2026-03-01',
    createdAt: '2026-01-01',
    updatedAt: '2026-03-01'
  }
]

// 模拟流水记录
const mockTransactions: InventoryTransaction[] = [
  {
    id: 'T001',
    transactionNo: 'INV2603180001',
    productId: 'P001',
    productName: '血糖仪',
    transactionType: 'purchase_in',
    quantity: 50,
    beforeQuantity: 70,
    afterQuantity: 120,
    referenceType: 'purchase_order',
    referenceId: 'PO001',
    referenceNo: 'PO20260318001',
    warehouseLocation: 'A区01架',
    costPrice: 150,
    amount: 7500,
    operator: '张三',
    operatorId: 'U001',
    createdAt: '2026-03-15 10:30:00'
  },
  {
    id: 'T002',
    transactionNo: 'INV2603180002',
    productId: 'P002',
    productName: '血压计',
    transactionType: 'sale_out',
    quantity: -5,
    beforeQuantity: 20,
    afterQuantity: 15,
    referenceType: 'sale_order',
    referenceId: 'SO001',
    referenceNo: 'SO20260318001',
    warehouseLocation: 'A区02架',
    costPrice: 120,
    amount: 600,
    operator: '李四',
    operatorId: 'U002',
    createdAt: '2026-03-16 14:20:00'
  }
]

export function useInventory() {
  // 状态
  const products = ref<InventoryProduct[]>([...mockProducts])
  const transactions = ref<InventoryTransaction[]>([...mockTransactions])
  const alerts = ref<InventoryAlert[]>([])

  // 计算属性
  const stats = computed((): InventoryStats => {
    const totalStock = products.value.reduce((sum, p) => sum + p.stockQuantity, 0)
    const totalValue = products.value.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0)
    const lowStockCount = products.value.filter(p => p.stockQuantity <= p.minStock && p.stockQuantity > 0).length
    const outOfStockCount = products.value.filter(p => p.stockQuantity <= 0).length
    const overstockCount = products.value.filter(p => p.stockQuantity >= p.maxStock).length

    const today = new Date().toISOString().split('T')[0]
    const todayTrans = transactions.value.filter(t => t.createdAt.startsWith(today))
    const todayIn = todayTrans.filter(t => t.quantity > 0).reduce((sum, t) => sum + t.quantity, 0)
    const todayOut = todayTrans.filter(t => t.quantity < 0).reduce((sum, t) => sum + Math.abs(t.quantity), 0)
    const todayInAmount = todayTrans.filter(t => t.quantity > 0).reduce((sum, t) => sum + (t.amount || 0), 0)
    const todayOutAmount = todayTrans.filter(t => t.quantity < 0).reduce((sum, t) => sum + (t.amount || 0), 0)

    return {
      totalProducts: products.value.length,
      totalStock,
      totalValue,
      lowStockCount,
      outOfStockCount,
      overstockCount,
      todayIn,
      todayOut,
      todayInAmount,
      todayOutAmount
    }
  })

  // 获取商品
  const getProduct = (id: string): InventoryProduct | undefined => {
    return products.value.find(p => p.id === id)
  }

  // 获取商品流水
  const getProductTransactions = (productId: string): InventoryTransaction[] => {
    return transactions.value
      .filter(t => t.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // 库存变动（核心方法）
  const adjustInventory = (
    productId: string,
    quantity: number,
    transactionType: TransactionType,
    referenceType: ReferenceType,
    referenceId: string,
    referenceNo: string,
    operator: string,
    operatorId: string,
    remark?: string
  ): { success: boolean; message?: string; transaction?: InventoryTransaction } => {
    const product = getProduct(productId)
    if (!product) {
      return { success: false, message: '商品不存在' }
    }

    const beforeQuantity = product.stockQuantity
    const afterQuantity = beforeQuantity + quantity

    // 验证库存
    if (afterQuantity < 0) {
      return { success: false, message: '库存不足' }
    }

    // 更新商品库存
    product.stockQuantity = afterQuantity
    product.updatedAt = new Date().toISOString()

    // 更新最后采购/销售日期
    if (transactionType === 'purchase_in') {
      product.lastPurchaseDate = new Date().toISOString().split('T')[0]
    } else if (transactionType === 'sale_out') {
      product.lastSaleDate = new Date().toISOString().split('T')[0]
    }

    // 创建流水记录
    const transaction: InventoryTransaction = {
      id: `T${Date.now()}`,
      transactionNo: generateTransactionNo(),
      productId,
      productName: product.name,
      transactionType,
      quantity,
      beforeQuantity,
      afterQuantity,
      referenceType,
      referenceId,
      referenceNo,
      warehouseLocation: product.warehouseLocation,
      costPrice: product.costPrice,
      amount: Math.abs(quantity) * product.costPrice,
      operator,
      operatorId,
      remark,
      createdAt: new Date().toISOString()
    }
    transactions.value.unshift(transaction)

    // 检查预警
    const alertType = checkInventoryAlert(product)
    if (alertType) {
      const alert: InventoryAlert = {
        id: `A${Date.now()}`,
        productId,
        productName: product.name,
        alertType,
        currentQuantity: afterQuantity,
        alertThreshold: alertType === 'out_of_stock' ? 0 : product.minStock,
        alertValue: afterQuantity,
        isResolved: false,
        createdAt: new Date().toISOString()
      }
      alerts.value.unshift(alert)
    }

    return { success: true, transaction }
  }

  // 采购入库
  const purchaseIn = (
    productId: string,
    quantity: number,
    orderId: string,
    orderNo: string,
    operator: string,
    operatorId: string
  ) => {
    return adjustInventory(
      productId,
      quantity,
      'purchase_in',
      'purchase_order',
      orderId,
      orderNo,
      operator,
      operatorId
    )
  }

  // 采购退货
  const purchaseReturn = (
    productId: string,
    quantity: number,
    returnId: string,
    returnNo: string,
    operator: string,
    operatorId: string
  ) => {
    return adjustInventory(
      productId,
      -quantity,
      'purchase_return',
      'purchase_return',
      returnId,
      returnNo,
      operator,
      operatorId
    )
  }

  // 销售出库
  const saleOut = (
    productId: string,
    quantity: number,
    orderId: string,
    orderNo: string,
    operator: string,
    operatorId: string
  ) => {
    return adjustInventory(
      productId,
      -quantity,
      'sale_out',
      'sale_order',
      orderId,
      orderNo,
      operator,
      operatorId
    )
  }

  // 销售退货
  const saleReturn = (
    productId: string,
    quantity: number,
    returnId: string,
    returnNo: string,
    operator: string,
    operatorId: string
  ) => {
    return adjustInventory(
      productId,
      quantity,
      'sale_return',
      'sale_return',
      returnId,
      returnNo,
      operator,
      operatorId
    )
  }

  // 盘点调整
  const adjustment = (
    productId: string,
    actualQuantity: number,
    reason: string,
    operator: string,
    operatorId: string
  ) => {
    const product = getProduct(productId)
    if (!product) {
      return { success: false, message: '商品不存在' }
    }

    const difference = actualQuantity - product.stockQuantity
    if (difference === 0) {
      return { success: true, message: '无需调整' }
    }

    return adjustInventory(
      productId,
      difference,
      'adjustment',
      'adjustment_order',
      `ADJ${Date.now()}`,
      `ADJ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 10000)}`,
      operator,
      operatorId,
      reason
    )
  }

  // 添加商品
  const addProduct = (product: Omit<InventoryProduct, 'id' | 'createdAt' | 'updatedAt'>): InventoryProduct => {
    const newProduct: InventoryProduct = {
      ...product,
      id: `P${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    products.value.push(newProduct)
    return newProduct
  }

  // 更新商品
  const updateProduct = (id: string, updates: Partial<InventoryProduct>): boolean => {
    const product = getProduct(id)
    if (!product) return false
    Object.assign(product, updates, { updatedAt: new Date().toISOString() })
    return true
  }

  // 获取预警列表
  const getActiveAlerts = (): InventoryAlert[] => {
    return alerts.value.filter(a => !a.isResolved)
  }

  // 标记预警已解决
  const resolveAlert = (alertId: string): boolean => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (!alert) return false
    alert.isResolved = true
    alert.resolvedAt = new Date().toISOString()
    return true
  }

  return {
    // 状态
    products,
    transactions,
    alerts,
    stats,

    // 方法
    getProduct,
    getProductTransactions,
    adjustInventory,
    purchaseIn,
    purchaseReturn,
    saleOut,
    saleReturn,
    adjustment,
    addProduct,
    updateProduct,
    getActiveAlerts,
    resolveAlert
  }
}

// 单例模式
let inventoryInstance: ReturnType<typeof useInventory> | null = null

export function useInventoryStore() {
  if (!inventoryInstance) {
    inventoryInstance = useInventory()
  }
  return inventoryInstance
}
