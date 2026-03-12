import { ref, computed, Ref, ComputedRef, watch } from 'vue'

// 分页配置常量
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 50,      // 每页显示50人
  MAX_PAGE_BUTTONS: 7,     // 最多显示7个页码按钮
  PAGE_RANGE: 3,           // 当前页前后显示3页
}

interface UsePaginationOptions<T> {
  itemsPerPage?: number
  data: ComputedRef<T[]> | Ref<T[]>
  maxPageButtons?: number
  pageRange?: number
}

interface UsePaginationReturn<T> {
  // 状态
  currentPage: Ref<number>
  totalPages: ComputedRef<number>
  pageNumbers: ComputedRef<number[]>
  startIndex: ComputedRef<number>
  endIndex: ComputedRef<number>
  currentData: ComputedRef<T[]>
  totalItems: ComputedRef<number>
  itemsPerPage: Ref<number>

  // 方法
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  reset: () => void
}

export function usePagination<T>(
  options: UsePaginationOptions<T>
): UsePaginationReturn<T> {
  const {
    itemsPerPage: initialItemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE,
    data,
    maxPageButtons = PAGINATION_CONFIG.MAX_PAGE_BUTTONS,
    pageRange = PAGINATION_CONFIG.PAGE_RANGE,
  } = options

  // 当前页码
  const currentPage = ref(1)
  const itemsPerPage = ref(initialItemsPerPage)

  // 总页数
  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(data.value.length / itemsPerPage.value))
  })

  // 总条目数
  const totalItems = computed(() => data.value.length)

  // 当前页的起始索引
  const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value
  })

  // 当前页的结束索引
  const endIndex = computed(() => {
    return Math.min(startIndex.value + itemsPerPage.value, totalItems.value)
  })

  // 当前页的数据
  const currentData = computed(() => {
    if (!data.value || data.value.length === 0) return []
    const sliced = data.value.slice(startIndex.value, endIndex.value)
    // Filter out any undefined or null items as a safety measure
    return sliced.filter((item): item is T => item != null)
  })

  // 计算显示的页码按钮（智能算法）
  const pageNumbers = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value
    const range = pageRange

    if (total <= maxPageButtons) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第一页
      pages.push(1)

      // 计算中间页码的起始和结束
      let start = Math.max(2, current - range)
      let end = Math.min(total - 1, current + range)

      // 如果中间页码不够，向另一侧扩展
      if (end - start < range * 2) {
        if (start === 2) {
          end = Math.min(total - 1, start + range * 2)
        } else if (end === total - 1) {
          start = Math.max(2, end - range * 2)
        }
      }

      // 添加省略号和中间页码
      if (start > 2) {
        pages.push(-1) // -1 表示省略号
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < total - 1) {
        pages.push(-1)
      }

      // 总是显示最后一页
      pages.push(total)
    }

    return pages
  })

  // 下一页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  // 上一页
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  // 跳转到指定页
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // 设置每页显示数量
  const setItemsPerPage = (size: number) => {
    itemsPerPage.value = size
    // 调整当前页，确保不超出范围
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value)
    }
  }

  // 重置到第一页
  const reset = () => {
    currentPage.value = 1
  }

  // 监听数据变化，如果当前页超出范围，自动调整
  watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages) {
      currentPage.value = Math.max(1, newTotalPages)
    }
  })

  return {
    // 状态
    currentPage,
    totalPages,
    pageNumbers,
    startIndex,
    endIndex,
    currentData,
    totalItems,
    itemsPerPage,

    // 方法
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
    reset,
  }
}
