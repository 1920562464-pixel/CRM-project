---
version: 1.0
name: 惯能CRM仪表盘设计规范
description: "参考 Linear 设计语言，为惯能健康CRM仪表盘打造的专业、克制、高信息密度的界面风格。以近黑画布为底，四级灰阶表面层级递进，单一品牌色（靛蓝）作为唯一彩色强调。卡片采用深色面板+细线边框，文字轻灰高对比。整体读感：高效、专业、有质感的健康管理工具。"

colors:
  # 品牌色
  primary: "#5e6ad2"
  on-primary: "#ffffff"
  primary-hover: "#828fff"
  primary-focus: "#5e69d1"
  
  # 文字
  ink: "#f7f8f8"
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#62666d"
  
  # 画布 & 表面
  canvas: "#010102"
  surface-1: "#0f1011"
  surface-2: "#141516"
  surface-3: "#18191a"
  surface-4: "#191a1b"
  
  # 边框
  hairline: "#23252a"
  hairline-strong: "#34343a"
  hairline-tertiary: "#3e3e44"
  
  # 语义色（CRM业务用）
  success: "#27a644"
  success-soft: "#0d2818"
  warning: "#f5a623"
  warning-soft: "#2a2010"
  error: "#e5484d"
  error-soft: "#2a1012"
  info: "#5e6ad2"
  info-soft: "#1a1a2e"
  
  # 业务指标色
  metric-blue: "#5e6ad2"
  metric-green: "#27a644"
  metric-amber: "#f5a623"
  metric-rose: "#e5484d"
  metric-cyan: "#50e3c2"

typography:
  # 标题
  page-title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.6px
  section-title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.3px
  card-title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: -0.2px
  
  # 数值（仪表盘核心）
  metric-xl:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -1.0px
  metric-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.6px
  metric-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.3px
  
  # 正文
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0.2px
  button:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px

components:
  # 核心指标卡片
  stat-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
    border: "1px solid {colors.hairline}"
    
  stat-card-hover:
    backgroundColor: "{colors.surface-2}"
    border: "1px solid {colors.hairline-strong}"
    
  # 任务卡片
  task-card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    border: "1px solid {colors.hairline}"
    
  task-card-hover:
    backgroundColor: "{colors.surface-2}"
    
  # 按钮
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    border: "1px solid {colors.hairline}"
    
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-subtle}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
    
  button-ghost-hover:
    textColor: "{colors.ink}"
    backgroundColor: "{colors.surface-2}"
    
  # 状态标签
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-info:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    
  # 头部导航
  top-header:
    backgroundColor: "{colors.canvas}"
    height: "56px"
    borderBottom: "1px solid {colors.hairline}"
    
  # 角色切换器
  role-switcher:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.md}"
    padding: "3px"
    
  role-tab:
    rounded: "{rounded.sm}"
    padding: "6px 14px"
    
  role-tab-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    
  role-tab-inactive:
    textColor: "{colors.ink-subtle}"
---

## 概述

基于 Linear 的暗色设计语言，为惯能健康CRM仪表盘定制的视觉系统。

### 核心原则

1. **深色画布即留白** — 层级通过表面递进（surface ladder）表达，不靠白色间隙
2. **单一品牌色** — 靛蓝 (#5e6ad2) 仅用于：品牌标识、主按钮、焦点环、链接。业务指标可用语义色
3. **数值优先** — 仪表盘的核心是数据，用大字号 + 负字距 + 高权重让数字跳出来
4. **细线边框** — 卡片用 1px hairline，不用阴影
5. **克制圆角** — 卡片 12px，按钮 8px，标签 pill

### 表面层级

| 层级 | 颜色 | 用途 |
|------|------|------|
| Canvas | #010102 | 页面背景 |
| Surface-1 | #0f1011 | 卡片、面板 |
| Surface-2 | #141516 | 悬停态、选中态 |
| Surface-3 | #18191a | 下拉、弹出层 |
| Surface-4 | #191a1b | 最深嵌套 |

### 改造区域（按优先级）

1. **Header** — 去白底，改为 canvas 背景 + hairline 底边框
2. **核心指标卡片** — 从白底彩色改为 surface-1 深色卡片
3. **快捷操作** — 从白底改为 surface-1，图标改为 ink-subtle
4. **任务列表** — 从白底改为 surface-1 深色任务卡片
5. **右侧动态** — 整体改为深色面板
6. **角色切换器** — 从白底改为 surface-1 嵌套标签

### CSS 变量映射

将以下 Tailwind 类替换为对应的深色方案：

```
bg-white → bg-[#0f1011]
bg-slate-50 → bg-[#010102]
border-slate-200 → border-[#23252a]
text-slate-800 → text-[#f7f8f8]
text-slate-500 → text-[#8a8f98]
text-slate-400 → text-[#62666d]
shadow-sm → 去掉 shadow，用 border
```
