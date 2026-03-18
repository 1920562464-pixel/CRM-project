// 采购管理类型定义

// 供应商
export interface Supplier {
  id: string
  name: string
  type: SupplierType
  contact: string
  phone: string
  email: string
  address: string
  bankName: string
  bankAccount: string
  creditLevel: CreditLevel
  status: SupplierStatus
  contractExpiry: string
  remark: string
  createdAt: string
  totalPurchaseAmount: number  // 累计采购金额
  unpaidAmount: number         // 未付款金额
}

export type SupplierType = 'goods' | 'service' | 'equipment'
export type CreditLevel = 'A' | 'B' | 'C'
export type SupplierStatus = 'active' | 'suspended' | 'terminated'

// 采购申请
export interface PurchaseRequest {
  id: string
  requestNo: string
  requester: string
  requesterId: string
  department: string
  requestDate: string
  type: RequestType
  items: PurchaseRequestItem[]
  totalBudget: number
  purpose: string
  status: RequestStatus
  approver?: string
  approveTime?: string
  approveComment?: string
  createdAt: string
}

export interface PurchaseRequestItem {
  id: string
  productId: string
  productName: string
  specification: string
  unit: string
  quantity: number
  budgetPrice: number
  budgetAmount: number
  remark: string
}

export type RequestType = 'normal' | 'urgent'
export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected'

// 采购订单
export interface PurchaseOrder {
  id: string
  orderNo: string
  requestId?: string
  supplierId: string
  supplierName: string
  orderDate: string
  deliveryDate: string
  deliveryAddress: string
  items: PurchaseOrderItem[]
  totalAmount: number
  paymentTerms: PaymentTerms
  status: OrderStatus
  remark: string
  attachments: string[]
  createdBy: string
  createdAt: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  receivedQuantity: number
  remark: string
}

export type PaymentTerms = 'prepaid' | 'on_delivery' | 'monthly'
export type OrderStatus = 'pending' | 'confirmed' | 'partial' | 'completed' | 'cancelled'

// 入库验收
export interface GoodsReceipt {
  id: string
  receiptNo: string
  orderId: string
  orderNo: string
  supplierId: string
  supplierName: string
  receiptDate: string
  receiptType: 'purchase' | 'return'
  items: GoodsReceiptItem[]
  status: ReceiptStatus
  receiver: string
  remark: string
  photos: string[]
  createdAt: string
}

export interface GoodsReceiptItem {
  id: string
  productId: string
  productName: string
  specification: string
  unit: string
  orderQuantity: number
  receivedQuantity: number
  difference: number
  differenceReason?: string
  remark: string
}

export type ReceiptStatus = 'pending' | 'qualified' | 'partial_qualified' | 'unqualified'

// 采购退货
export interface PurchaseReturn {
  id: string
  returnNo: string
  receiptId: string
  receiptNo: string
  supplierId: string
  supplierName: string
  returnDate: string
  returnReason: ReturnReason
  items: PurchaseReturnItem[]
  status: ReturnStatus
  handler: string
  remark: string
  createdAt: string
}

export interface PurchaseReturnItem {
  id: string
  productId: string
  productName: string
  specification: string
  unit: string
  quantity: number
  reason: string
}

export type ReturnReason = 'quality' | 'quantity_error' | 'spec_mismatch' | 'other'
export type ReturnStatus = 'pending' | 'returned' | 'refunded'

// 采购结算
export interface ProcurementSettlement {
  id: string
  settlementNo: string
  orderId: string
  orderNo: string
  supplierId: string
  supplierName: string
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  invoiceStatus: InvoiceStatus
  invoiceNo?: string
  invoiceDate?: string
  paymentRecords: PaymentRecord[]
  createdAt: string
}

export interface PaymentRecord {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  voucherNo: string
  remark: string
}

export type PaymentStatus = 'pending' | 'partial' | 'settled'
export type InvoiceStatus = 'none' | 'received'

// 供应商类型标签
export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  goods: '商品供应商',
  service: '服务供应商',
  equipment: '设备供应商'
}

// 信用等级标签
export const CREDIT_LEVEL_LABELS: Record<CreditLevel, { label: string; color: string }> = {
  A: { label: 'A级（优秀）', color: 'green' },
  B: { label: 'B级（良好）', color: 'yellow' },
  C: { label: 'C级（一般）', color: 'red' }
}

// 供应商状态标签
export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, { label: string; color: string }> = {
  active: { label: '合作中', color: 'green' },
  suspended: { label: '暂停合作', color: 'yellow' },
  terminated: { label: '终止合作', color: 'red' }
}

// 采购申请状态标签
export const REQUEST_STATUS_LABELS: Record<RequestStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审批', color: 'yellow' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'red' }
}

// 采购订单状态标签
export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'yellow' },
  confirmed: { label: '已确认', color: 'blue' },
  partial: { label: '部分到货', color: 'orange' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'red' }
}

// 入库状态标签
export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, { label: string; color: string }> = {
  pending: { label: '待验收', color: 'yellow' },
  qualified: { label: '验收合格', color: 'green' },
  partial_qualified: { label: '部分合格', color: 'orange' },
  unqualified: { label: '验收不合格', color: 'red' }
}

// 退货原因标签
export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  quality: '质量问题',
  quantity_error: '数量错误',
  spec_mismatch: '规格不符',
  other: '其他原因'
}

// 付款状态标签
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'red' },
  partial: { label: '部分付款', color: 'orange' },
  settled: { label: '已结清', color: 'green' }
}

// 付款方式选项
export const PAYMENT_TERMS_OPTIONS = [
  { value: 'prepaid', label: '预付款' },
  { value: 'on_delivery', label: '到货付款' },
  { value: 'monthly', label: '月结' }
]
