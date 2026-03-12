import { ref, computed, onUnmounted } from 'vue'

// 轮播配置常量
export const AUTOPLAY_CONFIG = {
  INTERVAL: 5000,           // 5秒切换一次
  PAUSE_ON_INTERACTION: true,  // 用户交互时暂停
  RESUME_DELAY: 3000,       // 3秒后恢复
  LOOP_MODE: 'cycle' as const, // 循环模式
}

interface UseAutoPlayOptions {
  interval?: number
  onNext: () => void
  pauseOnInteraction?: boolean
  resumeDelay?: number
  loopMode?: 'cycle' | 'once'
  autoStart?: boolean
}

interface UseAutoPlayReturn {
  // 状态
  isPlaying: Ref<boolean>
  isPaused: Ref<boolean>
  progress: Ref<number>
  currentInterval: Ref<number>

  // 方法
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  toggle: () => void
  onUserInteraction: () => void
  setInterval: (interval: number) => void
}

export function useAutoPlay(options: UseAutoPlayOptions): UseAutoPlayReturn {
  const {
    interval: initialInterval = AUTOPLAY_CONFIG.INTERVAL,
    onNext,
    pauseOnInteraction = AUTOPLAY_CONFIG.PAUSE_ON_INTERACTION,
    resumeDelay = AUTOPLAY_CONFIG.RESUME_DELAY,
    loopMode = AUTOPLAY_CONFIG.LOOP_MODE,
    autoStart = false,
  } = options

  // 状态
  const isPlaying = ref(autoStart)
  const isPaused = ref(false)
  const progress = ref(0)
  const currentInterval = ref(initialInterval)

  // 内部变量
  let timer: ReturnType<typeof setTimeout> | null = null
  let progressTimer: ReturnType<typeof setInterval> | null = null
  let resumeTimer: ReturnType<typeof setTimeout> | null = null
  let startTime = 0
  let elapsed = 0

  // 更新进度条
  const updateProgress = () => {
    const now = Date.now()
    elapsed = now - startTime
    progress.value = Math.min((elapsed / currentInterval.value) * 100, 100)
  }

  // 执行轮播动作
  const executeNext = () => {
    onNext()
    resetProgress()
    if (isPlaying.value && !isPaused.value) {
      scheduleNext()
    }
  }

  // 安排下一次轮播
  const scheduleNext = () => {
    if (timer) {
      clearTimeout(timer)
    }
    if (progressTimer) {
      clearInterval(progressTimer)
    }

    startTime = Date.now()
    elapsed = 0
    progress.value = 0

    // 启动进度条更新
    progressTimer = setInterval(updateProgress, 50)

    // 安排下一次切换
    timer = setTimeout(executeNext, currentInterval.value)
  }

  // 重置进度
  const resetProgress = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    progress.value = 0
    elapsed = 0
  }

  // 开始轮播
  const start = () => {
    if (isPlaying.value && !isPaused.value) {
      return // 已经在运行中
    }

    isPlaying.value = true
    isPaused.value = false
    scheduleNext()
  }

  // 停止轮播
  const stop = () => {
    isPlaying.value = false
    isPaused.value = false

    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer)
      resumeTimer = null
    }

    resetProgress()
  }

  // 暂停轮播
  const pause = () => {
    if (!isPlaying.value || isPaused.value) {
      return
    }

    isPaused.value = true

    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }

    // 保存当前进度
    elapsed = Date.now() - startTime
    progress.value = (elapsed / currentInterval.value) * 100
  }

  // 恢复轮播
  const resume = () => {
    if (!isPlaying.value || !isPaused.value) {
      return
    }

    isPaused.value = false

    // 计算剩余时间
    const remainingTime = currentInterval.value - elapsed

    if (remainingTime <= 0) {
      executeNext()
    } else {
      // 重新开始计时
      startTime = Date.now() - elapsed

      progressTimer = setInterval(updateProgress, 50)
      timer = setTimeout(executeNext, remainingTime)
    }
  }

  // 切换播放/暂停
  const toggle = () => {
    if (isPlaying.value) {
      if (isPaused.value) {
        resume()
      } else {
        pause()
      }
    } else {
      start()
    }
  }

  // 用户交互处理
  const onUserInteraction = () => {
    if (!pauseOnInteraction || !isPlaying.value) {
      return
    }

    // 暂停并安排恢复
    pause()

    if (resumeTimer) {
      clearTimeout(resumeTimer)
    }

    resumeTimer = setTimeout(() => {
      resume()
    }, resumeDelay)
  }

  // 设置间隔时间
  const setIntervalTime = (newInterval: number) => {
    currentInterval.value = newInterval

    // 如果正在运行，需要重新计时
    if (isPlaying.value && !isPaused.value) {
      stop()
      start()
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    stop()
  })

  // 自动开始
  if (autoStart) {
    start()
  }

  return {
    // 状态
    isPlaying,
    isPaused,
    progress,
    currentInterval,

    // 方法
    start,
    stop,
    pause,
    resume,
    toggle,
    onUserInteraction,
    setInterval: setIntervalTime,
  }
}

// 类型导入辅助
type Ref<T> = import('vue').Ref<T>
