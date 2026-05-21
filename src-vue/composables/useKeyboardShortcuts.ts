/**
 * 键盘快捷键 Composable
 * 提供统一的键盘快捷键管理
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  handler: (event: KeyboardEvent) => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enabled) return

    // 检查是否在输入框中
    const target = event.target as HTMLElement
    const isInInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.contentEditable === 'true'

    // 如果在输入框中，只处理 Escape 键
    if (isInInput && event.key !== 'Escape') return

    for (const shortcut of shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
        (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
        (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
        (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
      ) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.handler(event)
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}

/**
 * 知识库专用快捷键 Hook
 */
export function useKnowledgeShortcuts(options: {
  onNewFolder?: () => void
  onUpload?: () => void
  onSearch?: () => void
  onSelectAll?: () => void
  onDelete?: () => void
  onCloseModal?: () => void
  onRefresh?: () => void
  onToggleView?: () => void
  onNavigateUp?: () => void
  onHelp?: () => void
  enabled?: boolean
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (options.onNewFolder) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      description: '新建文件夹',
      handler: options.onNewFolder
    })
  }

  if (options.onUpload) {
    shortcuts.push({
      key: 'u',
      ctrlKey: true,
      description: '上传文件',
      handler: options.onUpload
    })
  }

  if (options.onSearch) {
    shortcuts.push({
      key: 'f',
      ctrlKey: true,
      description: '搜索',
      handler: options.onSearch
    })
  }

  if (options.onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrlKey: true,
      description: '全选',
      handler: options.onSelectAll
    })
  }

  if (options.onDelete) {
    shortcuts.push({
      key: 'Delete',
      description: '删除选中',
      handler: options.onDelete
    })
  }

  if (options.onCloseModal) {
    shortcuts.push({
      key: 'Escape',
      description: '关闭对话框',
      handler: options.onCloseModal
    })
  }

  if (options.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrlKey: true,
      description: '刷新',
      handler: options.onRefresh
    })
  }

  if (options.onToggleView) {
    shortcuts.push({
      key: 'v',
      ctrlKey: true,
      description: '切换视图',
      handler: options.onToggleView
    })
  }

  if (options.onNavigateUp) {
    shortcuts.push({
      key: 'Backspace',
      altKey: true,
      description: '返回上级',
      handler: options.onNavigateUp
    })
  }

  if (options.onHelp) {
    shortcuts.push({
      key: '?',
      description: '显示快捷键帮助',
      handler: options.onHelp
    })
  }

  useKeyboardShortcuts(shortcuts, options.enabled)

  return {
    shortcuts
  }
}

/**
 * 快捷键帮助显示 Hook
 */
export function useShortcutHelp() {
  const showHelp = ref(false)

  const toggleHelp = () => {
    showHelp.value = !showHelp.value
  }

  return {
    showHelp,
    toggleHelp
  }
}
