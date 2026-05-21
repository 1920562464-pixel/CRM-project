/**
 * 响应式设计 Composable
 * 提供断点管理和响应式状态
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { Ref as VueRef } from 'vue'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

// 默认断点配置（Tailwind CSS 默认断点）
const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

/**
 * 使用响应式断点
 */
export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints }
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  /**
   * 当前断点
   */
  const currentBreakpoint = computed<Breakpoint>(() => {
    const width = windowWidth.value
    if (width < breakpoints.sm) return 'xs'
    if (width < breakpoints.md) return 'sm'
    if (width < breakpoints.lg) return 'md'
    if (width < breakpoints.xl) return 'lg'
    if (width < breakpoints['2xl']) return 'xl'
    return '2xl'
  })

  /**
   * 是否小于指定断点
   */
  const lessThan = (breakpoint: Breakpoint) => {
    return computed(() => windowWidth.value < breakpoints[breakpoint])
  }

  /**
   * 是否大于等于指定断点
   */
  const greaterThanOrEqual = (breakpoint: Breakpoint) => {
    return computed(() => windowWidth.value >= breakpoints[breakpoint])
  }

  /**
   * 是否在指定断点之间
   */
  const between = (min: Breakpoint, max: Breakpoint) => {
    return computed(() =>
      windowWidth.value >= breakpoints[min] &&
      windowWidth.value < breakpoints[max]
    )
  }

  // 常用断点别名
  const isMobile = lessThan('md')  // 小于 768px
  const isTablet = between('md', 'lg')  // 768px - 1024px
  const isDesktop = greaterThanOrEqual('lg')  // 大于等于 1024px
  const isSmallScreen = lessThan('sm')  // 小于 640px

  return {
    windowWidth,
    currentBreakpoint,
    lessThan,
    greaterThanOrEqual,
    between,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen
  }
}

/**
 * 移动端导航 Composable
 */
export function useMobileNavigation() {
  const { isMobile } = useResponsive()
  const isOpen = ref(false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  // 在桌面端自动关闭移动菜单
  const handleResize = () => {
    if (!isMobile.value) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

/**
 * 触摸手势 Composable
 */
export function useTouchGestures(
  elementRef: VueRef<HTMLElement | undefined>,
  options: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number
  } = {}
) {
  const { threshold = 50 } = options

  const touchStartX = ref(0)
  const touchStartY = ref(0)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - touchStartX.value
    const deltaY = touchEndY - touchStartY.value

    // 水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          options.onSwipeRight?.()
        } else {
          options.onSwipeLeft?.()
        }
      }
    }
    // 垂直滑动
    else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          options.onSwipeDown?.()
        } else {
          options.onSwipeUp?.()
        }
      }
    }
  }

  onMounted(() => {
    const element = elementRef.value
    if (element) {
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchend', handleTouchEnd)
    }
  })

  onUnmounted(() => {
    const element = elementRef.value
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  })
}
