/**
 * 虚拟滚动 Composable
 * 用于优化大列表的渲染性能
 */

import { ref, computed, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export interface VirtualScrollOptions {
  itemHeight: number  // 每个项目的固定高度
  containerHeight: number  // 容器高度
  overscan?: number  // 额外渲染的项目数量（缓冲区）
  enabled?: boolean  // 是否启用虚拟滚动
}

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    enabled = true
  } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement | null>(null)

  // 可见的项目数量
  const visibleCount = Math.ceil(containerHeight / itemHeight)

  // 总高度
  const totalHeight = computed(() => items.value.length * itemHeight)

  // 起始索引
  const startIndex = computed(() => {
    if (!enabled) return 0
    const index = Math.floor(scrollTop.value / itemHeight)
    return Math.max(0, index - overscan)
  })

  // 结束索引
  const endIndex = computed(() => {
    if (!enabled) return items.value.length
    const index = Math.ceil((scrollTop.value + containerHeight) / itemHeight)
    return Math.min(items.value.length, index + overscan)
  })

  // 可见的项目
  const visibleItems = computed(() => {
    if (!enabled) return items.value
    return items.value.slice(startIndex.value, endIndex.value)
  })

  // 偏移量
  const offsetY = computed(() => {
    if (!enabled) return 0
    return startIndex.value * itemHeight
  })

  // 处理滚动事件
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // 滚动到指定索引
  const scrollToIndex = (index: number) => {
    if (!containerRef.value) return
    const targetScrollTop = index * itemHeight
    containerRef.value.scrollTop = targetScrollTop
    scrollTop.value = targetScrollTop
  }

  // 滚动到顶部
  const scrollToTop = () => {
    scrollToIndex(0)
  }

  // 滚动到底部
  const scrollToBottom = () => {
    scrollToIndex(items.value.length - 1)
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    scrollTop
  }
}

/**
 * 动态高度虚拟滚动
 * 用于高度不固定的列表
 */
export function useDynamicVirtualScroll<T>(
  items: Ref<T[]>,
  options: {
    containerHeight: number
    estimatedItemHeight: number
    overscan?: number
    enabled?: boolean
    getItemHeight?: (item: T, index: number) => number
  }
) {
  const {
    containerHeight,
    estimatedItemHeight,
    overscan = 5,
    enabled = true,
    getItemHeight = () => estimatedItemHeight
  } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement | null>(null)
  const itemHeights = ref<Map<number, number>>(new Map())
  const itemOffsets = ref<Map<number, number>>(new Map())

  // 计算项目偏移量
  const calculateOffsets = () => {
    let offset = 0
    const newOffsets = new Map<number, number>()

    for (let i = 0; i < items.value.length; i++) {
      newOffsets.set(i, offset)
      const height = itemHeights.value.get(i) || getItemHeight(items.value[i], i)
      offset += height
    }

    itemOffsets.value = newOffsets
    return offset
  }

  // 总高度
  const totalHeight = computed(() => {
    return calculateOffsets()
  })

  // 查找起始索引（二分查找）
  const findStartIndex = () => {
    if (!enabled || items.value.length === 0) return 0

    let left = 0
    let right = items.value.length - 1
    let result = 0

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const offset = itemOffsets.value.get(mid) || 0

      if (offset < scrollTop.value) {
        result = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return Math.max(0, result - overscan)
  }

  // 查找结束索引
  const findEndIndex = (startIndex: number) => {
    if (!enabled) return items.value.length

    let offset = itemOffsets.value.get(startIndex) || 0
    let endIndex = startIndex

    while (
      endIndex < items.value.length &&
      offset < scrollTop.value + containerHeight + estimatedItemHeight * overscan
    ) {
      offset += itemHeights.value.get(endIndex) || estimatedItemHeight
      endIndex++
    }

    return Math.min(items.value.length, endIndex + overscan)
  }

  const startIndex = computed(findStartIndex)

  const endIndex = computed(() => findEndIndex(startIndex.value))

  const visibleItems = computed(() => {
    if (!enabled) return items.value
    return items.value.slice(startIndex.value, endIndex.value)
  })

  const offsetY = computed(() => {
    if (!enabled) return 0
    return itemOffsets.value.get(startIndex.value) || 0
  })

  // 更新项目高度
  const updateItemHeight = (index: number, height: number) => {
    if (!itemHeights.value.has(index) || itemHeights.value.get(index) !== height) {
      itemHeights.value.set(index, height)
      calculateOffsets()
    }
  }

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
    updateItemHeight,
    scrollToIndex: (index: number) => {
      if (!containerRef.value) return
      const offset = itemOffsets.value.get(index) || 0
      containerRef.value.scrollTop = offset
      scrollTop.value = offset
    },
    scrollTop
  }
}

/**
 * 无限滚动 Composable
 * 用于分页加载
 */
export function useInfiniteScroll(
  loadMore: () => void | Promise<void>,
  options: {
    threshold?: number  // 距离底部多少像素时触发
    enabled?: boolean
  } = {}
) {
  const { threshold = 200, enabled = true } = options
  const containerRef = ref<HTMLElement | null>(null)
  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = async () => {
    if (!enabled || !containerRef.value || isLoading.value || !hasMore.value) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight

    if (distanceToBottom <= threshold) {
      isLoading.value = true
      try {
        await loadMore()
      } finally {
        isLoading.value = false
      }
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    containerRef,
    isLoading,
    hasMore,
    setHasMore: (value: boolean) => {
      hasMore.value = value
    }
  }
}
