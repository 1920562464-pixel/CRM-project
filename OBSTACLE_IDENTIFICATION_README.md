# 阻碍识别模块使用说明

## 概述

阻碍识别模块是一个全新的列表管理页面，用于管理和跟踪用户在健康打卡过程中遇到的阻碍和问题。

## 功能特性

### 1. 页面布局
- **头部信息区**: 显示页面标题、统计信息和刷新按钮
- **状态筛选区**: 提供"全部"、"未解决"、"已解决"三个筛选标签
- **列表数据区**: 卡片式列表展示，支持悬浮效果
- **底部分页区**: 完整的分页功能，支持页码跳转

### 2. 视觉设计
- **未解决卡片**: 浅红色背景 (#fef2f2)，红色图标，传达待处理的视觉语义
- **已解决卡片**: 浅绿色背景 (#f0fdf4)，绿色图标，传达已完成的视觉语义
- **悬浮效果**: 卡片悬浮时有阴影和轻微上移动画
- **响应式设计**: 支持移动端和桌面端自适应布局

### 3. 交互功能
- **筛选切换**: 点击筛选标签可快速切换不同状态的阻碍记录
- **解决操作**: 未解决的记录可以点击"解决"按钮标记为已解决
- **分页导航**: 支持上一页、下一页和页码直接跳转
- **数据刷新**: 点击刷新按钮可重新获取最新数据

## 文件结构

```
src-vue/
├── views/
│   └── ObstacleIdentification.vue      # 主页面组件
├── api/
│   └── obstacle.ts                      # API 接口文件
└── router/
    └── index.ts                         # 路由配置（已更新）
```

## 路由配置

访问路径: `/obstacle-identification`

```typescript
{
  path: '/obstacle-identification',
  name: 'ObstacleIdentification',
  component: ObstacleIdentification
}
```

## API 接口

### getObstacleList
获取阻碍记录列表，支持筛选和分页。

```typescript
interface ObstacleFilter {
  status?: 'all' | 'unresolved' | 'resolved';
  page?: number;
  pageSize?: number;
  keyword?: string;
}
```

### resolveObstacle
标记阻碍记录为已解决。

```typescript
async function resolveObstacle(id: number): Promise<boolean>
```

### getObstacleStats
获取阻碍统计信息。

```typescript
async function getObstacleStats(): Promise<{
  total: number;
  unresolved: number;
  resolved: number;
  todayNew: number;
}>
```

## 集成到大屏监控

在大屏监控页面 (`batchtask.vue`) 的阻碍记录横幅中，已经添加了"查看全部"链接，点击即可跳转到完整的阻碍识别页面。

```vue
<router-link to="/obstacle-identification" class="text-xs text-indigo-500 cursor-pointer hover:text-indigo-700 font-medium bg-indigo-50 px-3 py-1.5 rounded-md transition-all hover:bg-indigo-100">
  查看全部 →
</router-link>
```

## 数据结构

```typescript
interface ObstacleRecord {
  id: number;                  // 记录ID
  type: string;                // 阻碍类型
  content: string;             // 阻碍内容描述
  status: 'unresolved' | 'resolved';  // 状态
  userId: string;              // 用户ID
  userName: string;            // 用户名
  time: string;                // 具体时间
  relativeTime: string;        // 相对时间（如"13分钟前"）
  resolvedTime?: string;       // 解决时间（已解决的记录）
}
```

## 开发说明

当前使用模拟数据进行展示。实际项目中需要：

1. 替换 `src-vue/api/obstacle.ts` 中的模拟数据为真实 API 调用
2. 根据后端接口调整数据结构
3. 添加错误处理和加载状态管理
4. 考虑添加批量操作功能（如批量解决、批量删除）

## 测试

开发服务器已启动在: `http://localhost:5174/`

访问 `http://localhost:5174/obstacle-identification` 查看页面效果。

## 扩展功能建议

1. **搜索功能**: 添加关键词搜索，支持按内容、用户名等字段搜索
2. **批量操作**: 支持多选记录进行批量解决或删除
3. **数据导出**: 支持导出阻碍记录为 Excel 或 CSV
4. **统计分析**: 添加阻碍类型的统计图表
5. **通知提醒**: 当有新的阻碍记录时发送通知
6. **优先级标记**: 为阻碍记录添加优先级标识

## 注意事项

- 页面使用 Vue 3 Composition API 编写
- 使用 TypeScript 进行类型检查
- 样式采用 scoped CSS，避免样式污染
- 响应式设计兼容移动端和桌面端
- 所有异步操作都有 loading 状态管理