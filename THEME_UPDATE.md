# 系统主题色系更新

## 概述

系统主题已更新为 **Element Plus** 风格色系，以 **#4D70FF** 为主色调。

## 主色调

### Primary Blue - 主蓝色
```css
--primary: #4D70FF          /* 主色 */
--primary-light-3: #A6B8FF  /* 浅色-3 */
--primary-light-5: #C6D1FF  /* 浅色-5 */
--primary-light-7: #E5EAFF  /* 浅色-7 */
--primary-light-8: #F0F3FF  /* 浅色-8 */
--primary-light-9: #FAFBFF  /* 浅色-9 */
--primary-dark-2: #3A5AD9    /* 深色-2 */
```

### Tailwind 使用方式
```vue
<!-- 主色 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">按钮</button>

<!-- 浅色背景 -->
<div class="bg-primary-50 text-primary-500">浅色背景</div>
```

## 功能色系

### Success Green - 成功色
```css
--success: #67C23A          /* 成功色 */
--success-light: #E1F3D8    /* 浅色 */
--success-lighter: #F0F9EB  /* 更浅色 */
--success-dark: #529B2E     /* 深色 */
```

### Warning Orange - 警告色
```css
--warning: #E6A23C          /* 警告色 */
--warning-light: #F5DAB1    /* 浅色 */
--warning-lighter: #FAF6EC  /* 更浅色 */
--warning-dark: #B88230     /* 深色 */
```

### Danger Red - 危险色
```css
--danger: #F56C6C           /* 危险色 */
--danger-light: #FBC4C4     /* 浅色 */
--danger-lighter: #FEF0F0   /* 更浅色 */
--danger-dark: #C85858      /* 深色 */
```

### Info Gray - 信息色
```css
--info: #909399             /* 信息色 */
--info-light: #E9E9EB       /* 浅色 */
--info-lighter: #F4F4F5     /* 更浅色 */
--info-dark: #73767A        /* 深色 */
```

## 文字色系

```css
--text-primary: #303133      /* 主要文字 */
--text-regular: #606266      /* 常规文字 */
--text-secondary: #909399    /* 次要文字 */
--text-placeholder: #A8ABB2  /* 占位文字 */
--text-disabled: #C0C4CC     /* 禁用文字 */
```

### Tailwind 使用方式
```vue
<p class="text-text-primary">主要文字</p>
<p class="text-text-regular">常规文字</p>
<p class="text-text-secondary">次要文字</p>
<input class="placeholder-text-text-placeholder" />
```

## 边框色系

```css
--border: #DCDFE6           /* 默认边框 */
--border-light: #E4E7ED     /* 浅色边框 */
--border-lighter: #EBEEF5   /* 更浅边框 */
--border-dark: #D4D7DE      /* 深色边框 */
--border-darker: #CDD0D6    /* 更深边框 */
```

### Tailwind 使用方式
```vue
<div class="border border-border">默认边框</div>
<div class="border border-border-light">浅色边框</div>
<div class="border border-border-dark">深色边框</div>
```

## 填充色系

```css
--fill: #F0F2F5             /* 默认填充 */
--fill-light: #F5F7FA       /* 浅色填充 */
--fill-lighter: #FAFAFA     /* 更浅填充 */
--fill-dark: #EBEDF0        /* 深色填充 */
--fill-darker: #E6E8EB      /* 更深填充 */
```

### Tailwind 使用方式
```vue
<div class="bg-fill">默认填充背景</div>
<div class="bg-fill-light">浅色填充背景</div>
<div class="bg-fill-dark">深色填充背景</div>
```

## 阴影

```css
--shadow-light: 0px 0px 12px rgba(0, 0, 0, 0.12)
--shadow-base: 0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08)
--shadow-dark: 0px 16px 48px 16px rgba(0, 0, 0, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.12)
```

### Tailwind 使用方式
```vue
<div class="shadow-light">轻阴影</div>
<div class="shadow">默认阴影</div>
<div class="shadow-dark">深阴影</div>
```

## 预定义组件类

### 按钮类

```vue
<!-- 主按钮 -->
<button class="btn-primary">主按钮</button>

<!-- 成功按钮 -->
<button class="btn-success">成功按钮</button>

<!-- 警告按钮 -->
<button class="btn-warning">警告按钮</button>

<!-- 危险按钮 -->
<button class="btn-danger">危险按钮</button>

<!-- 默认按钮 -->
<button class="btn-default">默认按钮</button>
```

### 输入框类

```vue
<input class="input-base" placeholder="请输入内容" />
```

### 卡片类

```vue
<div class="card-base">
  卡片内容
</div>
```

### 徽章类

```vue
<span class="badge-success">成功</span>
<span class="badge-warning">警告</span>
<span class="badge-danger">危险</span>
<span class="badge-info">信息</span>
<span class="badge-primary">主要</span>
```

## 动画

### 淡入动画
```vue
<div class="animate-in">淡入动画</div>
<div class="fade-in">淡入动画</div>
```

### 滑入动画
```vue
<div class="slide-in-top">从上方滑入</div>
<div class="slide-in-bottom">从下方滑入</div>
```

## 圆角

```css
--radius: 4px               /* 默认圆角 */
--radius-small: 2px         /* 小圆角 */
--radius-large: 8px         /* 大圆角 */
--radius-round: 20px        /* 圆形圆角 */
--radius-circle: 100%       /* 完全圆形 */
```

### Tailwind 使用方式
```vue
<div class="rounded-[var(--radius)]">默认圆角</div>
<div class="rounded-[var(--radius-small)]">小圆角</div>
<div class="rounded-[var(--radius-large)]">大圆角</div>
```

## 过渡动画

```css
--transition-duration: 0.3s        /* 默认过渡时长 */
--transition-duration-fast: 0.2s  /* 快速过渡时长 */
--transition-all: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)
```

### Tailwind 使用方式
```vue
<div class="transition-all duration-300">默认过渡</div>
<div class="transition-all duration-200">快速过渡</div>
```

## 滚动条样式

系统已统一滚动条样式：
- 宽度: 8px
- 轨道背景: 浅灰色
- 滑块: 深灰色，悬停时变深

## 字体

```css
font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif
```

## 字体大小

```css
--font-size-extra-large: 20px
--font-size-large: 18px
--font-size-medium: 16px
--font-size-base: 14px
--font-size-small: 13px
--font-size-extra-small: 12px
```

### Tailwind 使用方式
```vue
<p class="text-extra-large">超大文字</p>
<p class="text-large">大文字</p>
<p class="text-base">默认文字</p>
<p class="text-small">小文字</p>
```

## 暗色模式

系统支持自动切换暗色模式，所有颜色在暗色模式下会自动适配。

### 启用暗色模式
```html
<html class="dark">
```

或在组件中：
```vue
<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>
```

## 迁移指南

### 从旧主题迁移

如果你之前使用了 `indigo-*` 或 `purple-*` 等颜色类，需要替换为新的主题色：

```vue
<!-- 旧代码 -->
<button class="bg-indigo-600 hover:bg-indigo-700">按钮</button>

<!-- 新代码 -->
<button class="bg-primary-500 hover:bg-primary-600">按钮</button>
```

或者使用预定义的按钮类：

```vue
<button class="btn-primary">按钮</button>
```

## 响应式 Focus Ring

所有可交互元素在聚焦时会显示主题色的 focus ring：

```css
focus:ring-2 focus:ring-[var(--ring)]
```

## 兼容性

- ✅ 支持所有现代浏览器
- ✅ 支持暗色模式
- ✅ 支持自定义 CSS 变量覆盖
- ✅ 完整的 Tailwind CSS 类支持

## 注意事项

1. 使用 CSS 变量时需要完整路径，如 `var(--primary)` 而不是 `--primary`
2. 颜色的透明度变体需要手动实现，如 `rgba(77, 112, 255, 0.5)`
3. 暗色模式下的颜色会自动适配，无需额外配置
