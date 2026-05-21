<template>
  <div class="obstacle-identification-container">
    <!-- 头部信息区 -->
    <div class="header-section">
      <div class="header-left">
        <div class="header-title-with-icon">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3.121 18.606L10.586 3.33101C11.218 2.06101 12.782 2.06101 13.414 3.33101L20.879 18.606C21.483 19.821 20.603 21.25 19.254 21.25H4.746C3.397 21.25 2.517 19.821 3.121 18.606Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <h1 class="page-title">阻碍识别</h1>
        </div>
        <p class="subtitle">{{ totalCount }} 条阻碍信息</p>
      </div>
      <div class="header-right">
        <button class="export-btn" @click="handleExport">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          导出数据
        </button>
        <button class="refresh-btn" @click="handleRefresh">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 2V6H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.1023 3 19.6398 5.76728 20.7842 9.5M21 12C21 16.9706 16.9706 21 12 21C7.89772 21 4.36016 18.2327 3.21582 14.5M1 18V22H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stats-section">
      <div class="stat-card total">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总记录数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>
      <div class="stat-card urgent">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3.121 18.606L10.586 3.33101C11.218 2.06101 12.782 2.06101 13.414 3.33101L20.879 18.606C21.483 19.821 20.603 21.25 19.254 21.25H4.746C3.397 21.25 2.517 19.821 3.121 18.606Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">紧急</div>
          <div class="stat-value">{{ stats.urgent }}</div>
        </div>
      </div>
      <div class="stat-card unresolved">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">未解决</div>
          <div class="stat-value">{{ stats.unresolved }}</div>
        </div>
      </div>
      <div class="stat-card resolved">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">已解决</div>
          <div class="stat-value">{{ stats.resolved }}</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-section">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索阻碍内容、用户姓名..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="filter-controls">
        <!-- 类型筛选 -->
        <select v-model="typeFilter" @change="applyFilters" class="filter-select">
          <option value="">全部类型</option>
          <option value="饮食打卡阻碍">饮食打卡阻碍</option>
          <option value="运动打卡阻碍">运动打卡阻碍</option>
          <option value="睡眠记录阻碍">睡眠记录阻碍</option>
          <option value="体重记录阻碍">体重记录阻碍</option>
        </select>

        <!-- 优先级筛选 -->
        <select v-model="priorityFilter" @change="applyFilters" class="filter-select">
          <option value="">全部优先级</option>
          <option value="high">紧急</option>
          <option value="medium">中等</option>
          <option value="low">一般</option>
        </select>

        <!-- 排序 -->
        <select v-model="sortBy" @change="applyFilters" class="filter-select">
          <option value="time_desc">最新优先</option>
          <option value="time_asc">最早优先</option>
          <option value="priority_desc">优先级排序</option>
        </select>

        <!-- 批量操作按钮 -->
        <button
          v-if="selectedItems.length > 0"
          @click="handleBatchResolve"
          class="batch-btn batch-resolve"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          批量解决 ({{ selectedItems.length }})
        </button>

        <button
          v-if="selectedItems.length > 0"
          @click="clearSelection"
          class="batch-btn batch-clear"
        >
          取消选择
        </button>
      </div>
    </div>

    <!-- 状态筛选区 -->
    <div class="filter-section">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentFilter === tab.value }"
        @click="handleFilterChange(tab.value)"
      >
        {{ tab.label }}
        <span class="tab-count">({{ getTabCount(tab.value) }})</span>
      </button>
    </div>

    <!-- 列表数据区 -->
    <div class="list-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="paginatedObstacles.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p>{{ searchKeyword ? '未找到匹配的阻碍记录' : '暂无阻碍记录' }}</p>
      </div>

      <div v-else>
        <!-- 全选按钮 -->
        <div v-if="paginatedObstacles.length > 0" class="select-all-section">
          <label class="select-all-checkbox">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isSomeSelected"
              @change="toggleSelectAll"
            />
            <span>全选当前页</span>
          </label>
        </div>

        <div class="obstacle-list">
          <div
            v-for="obstacle in paginatedObstacles"
            :key="obstacle.id"
            class="obstacle-card"
            :class="[
              obstacle.status === 'unresolved' ? 'unresolved' : 'resolved',
              { 'selected': selectedItems.includes(obstacle.id) }
            ]"
          >
            <!-- 选择框 -->
            <div class="checkbox-section">
              <input
                type="checkbox"
                :checked="selectedItems.includes(obstacle.id)"
                @change="toggleSelectItem(obstacle.id)"
              />
            </div>

            <!-- 优先级标识 -->
            <div class="priority-section">
              <div class="priority-badge" :class="obstacle.priority">
                {{ getPriorityLabel(obstacle.priority) }}
              </div>
            </div>

            <!-- 主要内容区 -->
            <div class="card-content">
              <div class="content-header">
                <span class="content-type">{{ obstacle.type }}</span>
                <span class="status-tag" :class="obstacle.status">
                  {{ obstacle.status === 'unresolved' ? '未解决' : '已解决' }}
                </span>
              </div>
              <div class="content-title">{{ obstacle.content }}</div>
              <div class="content-meta">
                <span class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.44143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ obstacle.userName }}
                </span>
                <span class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ obstacle.relativeTime }}
                </span>
                <span v-if="obstacle.assignee" class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  处理人: {{ obstacle.assignee }}
                </span>
              </div>
            </div>

            <!-- 操作区 -->
            <div class="card-actions">
              <button
                v-if="obstacle.status === 'unresolved'"
                @click="openResolveModal(obstacle)"
                class="action-btn resolve-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                解决
              </button>

              <button
                @click="openAssignModal(obstacle)"
                class="action-btn assign-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                分配
              </button>

              <button
                @click="openDetailModal(obstacle)"
                class="action-btn detail-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="1" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="5" r="1" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="19" r="1" stroke="currentColor" stroke-width="2"/>
                </svg>
                详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部分页区 -->
    <div v-if="!loading && paginatedObstacles.length > 0" class="pagination-section">
      <div class="pagination-info">
        共 {{ filteredObstacles.length }} 条，当前第 {{ currentPage }}/{{ totalPages }} 页
      </div>
      <div class="pagination-controls">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          上一页
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage, ellipsis: page === '...' }"
            :disabled="page === '...'"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 解决弹窗 -->
    <div v-if="showResolveModal" class="modal-overlay" @click="closeResolveModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>解决阻碍</h3>
          <button @click="closeResolveModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="obstacle-info">
            <div class="info-label">阻碍内容</div>
            <div class="info-content">{{ currentObstacle?.content }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">解决方案</label>
            <textarea
              v-model="resolveForm.solution"
              class="form-textarea"
              placeholder="请描述解决方案..."
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">跟进备注</label>
            <textarea
              v-model="resolveForm.notes"
              class="form-textarea"
              placeholder="其他需要记录的信息..."
              rows="2"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeResolveModal" class="btn btn-cancel">取消</button>
          <button @click="confirmResolve" class="btn btn-confirm" :disabled="!resolveForm.solution">
            确认解决
          </button>
        </div>
      </div>
    </div>

    <!-- 分配弹窗 -->
    <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>分配处理人</h3>
          <button @click="closeAssignModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="obstacle-info">
            <div class="info-label">阻碍内容</div>
            <div class="info-content">{{ currentObstacle?.content }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">选择处理人</label>
            <select v-model="assignForm.assignee" class="form-select">
              <option value="">请选择...</option>
              <option value="教练A">教练A</option>
              <option value="教练B">教练B</option>
              <option value="教练C">教练C</option>
              <option value="管理员">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">优先级</label>
            <select v-model="assignForm.priority" class="form-select">
              <option value="high">紧急</option>
              <option value="medium">中等</option>
              <option value="low">一般</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">分配说明</label>
            <textarea
              v-model="assignForm.notes"
              class="form-textarea"
              placeholder="分配说明..."
              rows="2"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAssignModal" class="btn btn-cancel">取消</button>
          <button @click="confirmAssign" class="btn btn-confirm" :disabled="!assignForm.assignee">
            确认分配
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>阻碍详情</h3>
          <button @click="closeDetailModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">阻碍类型</div>
              <div class="detail-value">{{ currentObstacle?.type }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">当前状态</div>
              <div class="detail-value">
                <span :class="['status-tag', currentObstacle?.status]">
                  {{ currentObstacle?.status === 'unresolved' ? '未解决' : '已解决' }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">优先级</div>
              <div class="detail-value">
                <span :class="['priority-badge', currentObstacle?.priority]">
                  {{ getPriorityLabel(currentObstacle?.priority) }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">反馈用户</div>
              <div class="detail-value">{{ currentObstacle?.userName }}</div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">阻碍内容</div>
              <div class="detail-value">{{ currentObstacle?.content }}</div>
            </div>
            <div v-if="currentObstacle?.resolvedTime" class="detail-item full-width">
              <div class="detail-label">解决时间</div>
              <div class="detail-value">{{ currentObstacle.resolvedTime }}</div>
            </div>
            <div v-if="currentObstacle?.assignee" class="detail-item">
              <div class="detail-label">处理人</div>
              <div class="detail-value">{{ currentObstacle.assignee }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-cancel">关闭</button>
          <button
            v-if="currentObstacle?.status === 'unresolved'"
            @click="closeDetailModal; openResolveModal(currentObstacle)"
            class="btn btn-confirm"
          >
            去解决
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getObstacleList, resolveObstacle, type ObstacleRecord } from '../api/obstacle'

interface Obstacle extends ObstacleRecord {
  priority?: 'high' | 'medium' | 'low'
  assignee?: string
}

interface FilterTab {
  label: string
  value: 'all' | 'unresolved' | 'resolved'
}

// 响应式数据
const loading = ref(true)
const obstacles = ref<Obstacle[]>([])
const currentFilter = ref<'all' | 'unresolved' | 'resolved'>('all')
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const typeFilter = ref('')
const priorityFilter = ref('')
const sortBy = ref('time_desc')
const selectedItems = ref<number[]>([])

// 弹窗状态
const showResolveModal = ref(false)
const showAssignModal = ref(false)
const showDetailModal = ref(false)
const currentObstacle = ref<Obstacle | null>(null)

// 表单数据
const resolveForm = ref({
  solution: '',
  notes: ''
})

const assignForm = ref({
  assignee: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  notes: ''
})

// 统计数据
const stats = ref({
  total: 0,
  urgent: 0,
  unresolved: 0,
  resolved: 0
})

// 筛选标签
const filterTabs: FilterTab[] = [
  { label: '全部', value: 'all' },
  { label: '未解决', value: 'unresolved' },
  { label: '已解决', value: 'resolved' }
]

// 计算属性
const filteredObstacles = computed(() => {
  let result = obstacles.value

  // 状态筛选
  if (currentFilter.value !== 'all') {
    result = result.filter(obs => obs.status === currentFilter.value)
  }

  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(obs => obs.type === typeFilter.value)
  }

  // 优先级筛选
  if (priorityFilter.value) {
    result = result.filter(obs => obs.priority === priorityFilter.value)
  }

  // 搜索筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(obs =>
      obs.content.toLowerCase().includes(keyword) ||
      obs.type.toLowerCase().includes(keyword) ||
      obs.userName.toLowerCase().includes(keyword)
    )
  }

  // 排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'priority_desc':
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
      case 'time_asc':
        return 0 // 这里需要根据实际时间字段排序
      case 'time_desc':
      default:
        return b.id - a.id // 按ID倒序作为时间排序的替代
    }
  })

  return result
})

const totalCount = computed(() => filteredObstacles.value.length)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const paginatedObstacles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredObstacles.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > delta + 2) {
      pages.push('...')
    }
    const start = Math.max(2, current - delta)
    const end = Math.min(total - 1, current + delta)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - delta - 1) {
      pages.push('...')
    }
    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

// 选择状态
const isAllSelected = computed(() => {
  return paginatedObstacles.value.length > 0 &&
         paginatedObstacles.value.every(item => selectedItems.value.includes(item.id))
})

const isSomeSelected = computed(() => {
  return paginatedObstacles.value.some(item => selectedItems.value.includes(item.id)) &&
         !isAllSelected.value
})

// 方法
const getTabCount = (tab: 'all' | 'unresolved' | 'resolved') => {
  if (tab === 'all') return obstacles.value.length
  return obstacles.value.filter(obs => obs.status === tab).length
}

const getPriorityLabel = (priority?: string) => {
  const labels = {
    high: '紧急',
    medium: '中等',
    low: '一般'
  }
  return labels[priority as keyof typeof labels] || '一般'
}

const handleFilterChange = (filter: 'all' | 'unresolved' | 'resolved') => {
  currentFilter.value = filter
  currentPage.value = 1
  clearSelection()
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
  clearSelection()
}

const handlePageChange = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 选择功能
const toggleSelectItem = (id: number) => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    paginatedObstacles.value.forEach(item => {
      const index = selectedItems.value.indexOf(item.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
    })
  } else {
    // 全选
    paginatedObstacles.value.forEach(item => {
      if (!selectedItems.value.includes(item.id)) {
        selectedItems.value.push(item.id)
      }
    })
  }
}

const clearSelection = () => {
  selectedItems.value = []
}

// 批量操作
const handleBatchResolve = async () => {
  if (selectedItems.value.length === 0) return

  if (confirm(`确定要批量解决 ${selectedItems.value.length} 条阻碍记录吗？`)) {
    try {
      for (const id of selectedItems.value) {
        await resolveObstacle(id)
        const index = obstacles.value.findIndex(o => o.id === id)
        if (index !== -1) {
          obstacles.value[index].status = 'resolved'
          obstacles.value[index].resolvedTime = '刚刚'
        }
      }
      clearSelection()
      alert(`成功解决 ${selectedItems.value.length} 条阻碍记录`)
    } catch (error) {
      console.error('批量解决失败:', error)
      alert('批量解决失败，请重试')
    }
  }
}

// 弹窗操作
const openResolveModal = (obstacle: Obstacle) => {
  currentObstacle.value = obstacle
  resolveForm.value = { solution: '', notes: '' }
  showResolveModal.value = true
}

const closeResolveModal = () => {
  showResolveModal.value = false
  currentObstacle.value = null
  resolveForm.value = { solution: '', notes: '' }
}

const confirmResolve = async () => {
  if (!currentObstacle.value || !resolveForm.value.solution) return

  try {
    await resolveObstacle(currentObstacle.value.id)
    const index = obstacles.value.findIndex(o => o.id === currentObstacle.value!.id)
    if (index !== -1) {
      obstacles.value[index].status = 'resolved'
      obstacles.value[index].resolvedTime = '刚刚'
    }
    closeResolveModal()
    alert('阻碍已标记为已解决')
  } catch (error) {
    console.error('解决阻碍失败:', error)
    alert('操作失败，请重试')
  }
}

const openAssignModal = (obstacle: Obstacle) => {
  currentObstacle.value = obstacle
  assignForm.value = {
    assignee: obstacle.assignee || '',
    priority: obstacle.priority || 'medium',
    notes: ''
  }
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  currentObstacle.value = null
}

const confirmAssign = () => {
  if (!currentObstacle.value || !assignForm.value.assignee) return

  const index = obstacles.value.findIndex(o => o.id === currentObstacle.value!.id)
  if (index !== -1) {
    obstacles.value[index].assignee = assignForm.value.assignee
    obstacles.value[index].priority = assignForm.value.priority
  }
  closeAssignModal()
  alert(`已分配给 ${assignForm.value.assignee}`)
}

const openDetailModal = (obstacle: Obstacle) => {
  currentObstacle.value = obstacle
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentObstacle.value = null
}

// 其他操作
const handleRefresh = async () => {
  loading.value = true
  await fetchObstacles()
  loading.value = false
}

const handleExport = () => {
  // 导出功能
  const csvContent = generateCSV()
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `阻碍记录_${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const generateCSV = () => {
  const headers = ['ID', '类型', '内容', '状态', '用户', '时间', '优先级', '处理人']
  const rows = filteredObstacles.value.map(obs => [
    obs.id,
    obs.type,
    obs.content,
    obs.status === 'unresolved' ? '未解决' : '已解决',
    obs.userName,
    obs.relativeTime,
    getPriorityLabel(obs.priority),
    obs.assignee || '未分配'
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// 数据获取
const fetchObstacles = async () => {
  try {
    const response = await getObstacleList({
      status: currentFilter.value,
      page: currentPage.value,
      pageSize: 100 // 获取更多数据用于客户端筛选
    })
    obstacles.value = response.data.map(item => ({
      ...item,
      priority: item.priority || ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      assignee: item.assignee || ''
    }))

    // 更新统计数据
    stats.value = {
      total: obstacles.value.length,
      urgent: obstacles.value.filter(o => o.priority === 'high').length,
      unresolved: obstacles.value.filter(o => o.status === 'unresolved').length,
      resolved: obstacles.value.filter(o => o.status === 'resolved').length
    }
  } catch (error) {
    console.error('获取阻碍记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchObstacles()
})
</script>

<style scoped>
.obstacle-identification-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-icon {
  width: 32px;
  height: 32px;
  color: #f59e0b;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.export-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover, .refresh-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.export-btn .icon, .refresh-btn .icon {
  width: 16px;
  height: 16px;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.urgent .stat-icon { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); }
.stat-card.unresolved .stat-icon { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.stat-card.resolved .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }

.stat-icon svg { width: 24px; height: 24px; }

.stat-content { flex: 1; }

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

/* 搜索筛选区 */
.search-filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
}

.clear-btn:hover { color: #6b7280; }

.clear-btn svg { width: 16px; height: 16px; }

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
}

.batch-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.batch-btn svg { width: 16px; height: 16px; }

.batch-resolve {
  background: #10b981;
  color: white;
}

.batch-resolve:hover { background: #059669; }

.batch-clear {
  background: #f3f4f6;
  color: #374151;
}

.batch-clear:hover { background: #e5e7eb; }

/* 筛选标签区 */
.filter-section {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-tab {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tab:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-tab.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.tab-count {
  font-size: 12px;
  opacity: 0.7;
}

/* 列表区域 */
.list-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #9ca3af;
}

.select-all-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.obstacle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 卡片样式 */
.obstacle-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.obstacle-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.obstacle-card.selected {
  background: #f0f9ff;
  border-color: #3b82f6;
}

.obstacle-card.unresolved {
  border-left: 4px solid #ef4444;
}

.obstacle-card.resolved {
  border-left: 4px solid #10b981;
  opacity: 0.8;
}

.checkbox-section {
  flex-shrink: 0;
}

.checkbox-section input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.priority-section {
  flex-shrink: 0;
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.priority-badge.high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.low {
  background: #d1fae5;
  color: #059669;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.content-type {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.unresolved {
  background: #fecaca;
  color: #dc2626;
}

.status-tag.resolved {
  background: #bbf7d0;
  color: #16a34a;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.4;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.resolve-btn {
  background: #10b981;
  color: white;
}

.resolve-btn:hover {
  background: #059669;
  transform: scale(1.05);
}

.assign-btn {
  background: #6366f1;
  color: white;
}

.assign-btn:hover {
  background: #4f46e5;
  transform: scale(1.05);
}

.detail-btn {
  background: #f3f4f6;
  color: #374151;
}

.detail-btn:hover {
  background: #e5e7eb;
}

/* 分页区 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  padding: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover:not(.ellipsis):not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.page-number.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.page-number.ellipsis {
  border: none;
  cursor: default;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

.modal-content.large {
  max-width: 700px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #374151;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.obstacle-info {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-content {
  font-size: 14px;
  color: #111827;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-textarea, .form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #6366f1;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #6366f1;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 详情网格 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filter-controls {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .obstacle-identification-container {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .obstacle-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .checkbox-section, .priority-section {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-content {
    width: 100%;
  }

  .card-actions {
    width: 100%;
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .pagination-section {
    flex-direction: column;
    gap: 16px;
  }

  .page-numbers {
    display: none;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
