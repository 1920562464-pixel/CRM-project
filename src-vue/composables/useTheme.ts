import { ref, watch } from 'vue'

export type Theme = 'default' | 'black-gold' | 'warm-yellow'

const THEME_STYLES: Record<Theme, Record<string, string>> = {
  // 默认蓝白黑主题
  default: {
    '--primary': '#4D70FF',
    '--primary-light-3': '#A6B8FF',
    '--primary-light-5': '#C6D1FF',
    '--primary-light-7': '#E5EAFF',
    '--primary-light-8': '#F0F3FF',
    '--primary-light-9': '#FAFBFF',
    '--primary-dark-2': '#3A5AD9',

    '--background': '#FFFFFF',
    '--background-page': '#F2F3F5',
    '--card': '#FFFFFF',
    '--popover': '#FFFFFF',

    '--text-primary': '#303133',
    '--text-regular': '#606266',
    '--text-secondary': '#909399',
    '--text-placeholder': '#A8ABB2',
    '--text-disabled': '#C0C4CC',

    '--border': '#DCDFE6',
    '--border-light': '#E4E7ED',
    '--border-lighter': '#EBEEF5',
    '--border-dark': '#D4D7DE',
    '--border-darker': '#CDD0D6',

    '--fill': '#F0F2F5',
    '--fill-light': '#F5F7FA',
    '--fill-lighter': '#FAFAFA',
    '--fill-dark': '#EBEDF0',
    '--fill-darker': '#E6E8EB',

    '--sidebar': '#1e293b',
    '--sidebar-foreground': '#e2e8f0',
    '--sidebar-primary': '#4D70FF',
    '--sidebar-primary-foreground': '#FFFFFF',
    '--sidebar-accent': '#334155',
    '--sidebar-accent-foreground': '#e2e8f0',
    '--sidebar-border': '#334155',
    '--sidebar-bg': '#0f172a',

    '--shadow-light': '0px 0px 12px rgba(0, 0, 0, 0.12)',
    '--shadow-base': '0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)',
    '--shadow-dark': '0px 16px 48px 16px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.12)',

    '--success': '#67C23A',
    '--warning': '#E6A23C',
    '--danger': '#F56C6C',
    '--info': '#909399',
  },

  // 黑金主题
  'black-gold': {
    '--primary': '#B8860B',
    '--primary-light-3': '#D4A84A',
    '--primary-light-5': '#E6C87D',
    '--primary-light-7': '#F0DDA8',
    '--primary-light-8': '#F6E8C4',
    '--primary-light-9': '#FAF3E3',
    '--primary-dark-2': '#9A6F09',
    '--primary-dark-3': '#7C5807',

    '--background': '#1A1A1A',
    '--background-page': '#0D0D0D',
    '--card': '#242424',
    '--popover': '#2A2A2A',

    '--text-primary': '#F5E6D3',
    '--text-regular': '#D4C4B0',
    '--text-secondary': '#A89F8E',
    '--text-placeholder': '#7A7060',
    '--text-disabled': '#4A4238',

    '--border': '#3D3D3D',
    '--border-light': '#4A4A4A',
    '--border-lighter': '#5A5A5A',
    '--border-dark': '#2D2D2D',
    '--border-darker': '#1D1D1D',

    '--fill': '#2A2A2A',
    '--fill-light': '#333333',
    '--fill-lighter': '#3D3D3D',
    '--fill-dark': '#1F1F1F',
    '--fill-darker': '#151515',

    '--sidebar': '#1A1A1A',
    '--sidebar-foreground': '#F5E6D3',
    '--sidebar-primary': '#B8860B',
    '--sidebar-primary-foreground': '#F5E6D3',
    '--sidebar-accent': '#2A2A2A',
    '--sidebar-accent-foreground': '#F5E6D3',
    '--sidebar-border': '#3D3D3D',
    '--sidebar-bg': '#0D0D0D',

    '--shadow-light': '0px 0px 12px rgba(184, 134, 11, 0.15)',
    '--shadow-base': '0px 12px 32px 4px rgba(0, 0, 0, 0.3), 0px 8px 20px rgba(184, 134, 11, 0.1)',
    '--shadow-dark': '0px 16px 48px 16px rgba(0, 0, 0, 0.5), 0px 12px 32px rgba(184, 134, 11, 0.15)',

    '--success': '#67C23A',
    '--warning': '#E6A23C',
    '--danger': '#F56C6C',
    '--info': '#909399',
  },

  // 温暖黄色主题
  'warm-yellow': {
    '--primary': '#B8860B',
    '--primary-light-3': '#D4A84A',
    '--primary-light-5': '#E6C87D',
    '--primary-light-7': '#F0DDA8',
    '--primary-light-8': '#F6E8C4',
    '--primary-light-9': '#FAF3E3',
    '--primary-dark-2': '#9A6F09',
    '--primary-dark-3': '#7C5807',

    '--background': '#FFFBF0',
    '--background-page': '#FAF8F0',
    '--card': '#FFFEF8',
    '--popover': '#FFFEF8',

    '--text-primary': '#2C2416',
    '--text-regular': '#5C4A32',
    '--text-secondary': '#8B7355',
    '--text-placeholder': '#A89578',
    '--text-disabled': '#C4B5A0',

    '--border': '#E8DCC8',
    '--border-light': '#F0E6D4',
    '--border-lighter': '#F5EDE0',
    '--border-dark': '#D4C4B0',
    '--border-darker': '#C4B5A0',

    '--fill': '#F5EDE0',
    '--fill-light': '#FAF3E3',
    '--fill-lighter': '#FEF8F0',
    '--fill-dark': '#EDE5D8',
    '--fill-darker': '#E5DCC8',

    '--sidebar': '#FFFBF0',
    '--sidebar-foreground': '#2C2416',
    '--sidebar-primary': '#B8860B',
    '--sidebar-primary-foreground': '#FFFEF8',
    '--sidebar-accent': '#FAF3E3',
    '--sidebar-accent-foreground': '#2C2416',
    '--sidebar-border': '#E8DCC8',
    '--sidebar-bg': '#FAF8F0',

    '--shadow-light': '0px 0px 12px rgba(184, 134, 11, 0.08)',
    '--shadow-base': '0px 4px 16px rgba(184, 134, 11, 0.1), 0px 2px 8px rgba(0, 0, 0, 0.04)',
    '--shadow-dark': '0px 8px 24px rgba(184, 134, 11, 0.15), 0px 4px 12px rgba(0, 0, 0, 0.08)',

    '--success': '#67C23A',
    '--warning': '#E6A23C',
    '--danger': '#F56C6C',
    '--info': '#909399',
  },
}

const STORAGE_KEY = 'crm-theme'

// 获取存储的主题
function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (stored === 'default' || stored === 'black-gold' || stored === 'warm-yellow')) {
    return stored as Theme
  }
  return 'default'
}

// 应用主题到 DOM
function applyTheme(theme: Theme) {
  const styles = THEME_STYLES[theme]
  const root = document.documentElement

  Object.entries(styles).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // 更新侧边栏渐变背景
  updateSidebarGradient(theme)
}

// 更新侧边栏渐变
function updateSidebarGradient(theme: Theme) {
  const sidebar = document.querySelector('aside') as HTMLElement
  if (!sidebar) return

  if (theme === 'default') {
    // 深蓝灰色渐变
    sidebar.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
  } else if (theme === 'black-gold') {
    sidebar.style.background = 'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)'
  } else if (theme === 'warm-yellow') {
    sidebar.style.background = 'linear-gradient(180deg, #FFFEF8 0%, #FAF3E3 100%)'
  }
}

export function useTheme() {
  const currentTheme = ref<Theme>(getStoredTheme())

  // 初始化时应用主题
  applyTheme(currentTheme.value)

  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  })

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['default', 'black-gold', 'warm-yellow']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'default':
        return '🎨'
      case 'black-gold':
        return '🖤'
      case 'warm-yellow':
        return '🌟'
      default:
        return '🎨'
    }
  }

  const getThemeName = (theme: Theme) => {
    switch (theme) {
      case 'default':
        return '默认蓝白'
      case 'black-gold':
        return '黑金会员'
      case 'warm-yellow':
        return '温暖金黄'
      default:
        return '默认主题'
    }
  }

  return {
    currentTheme,
    setTheme,
    cycleTheme,
    getThemeIcon,
    getThemeName,
  }
}
