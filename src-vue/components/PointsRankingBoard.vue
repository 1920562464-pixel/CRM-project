<template>
  <div class="leaderboard-container">
    <!-- Header -->
    <div class="leaderboard-header">
      <div class="header-left">
        <div class="title-section">
          <div class="title-icon">
            <Trophy :size="24" class="trophy-icon" />
          </div>
          <div>
            <h2 class="title">积分排行榜</h2>
            <p class="subtitle">实时更新 · 每周一结算</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-wrapper">
          <button
            v-for="tab in rankingTabs"
            :key="tab.key"
            @click="switchTab(tab.key)"
            class="tab-btn"
            :class="{ 'tab-active': activeTab === tab.key }"
          >
            <component :is="tab.icon" :size="16" />
            {{ tab.label }}
          </button>
        </div>
      </div>

    </div>

    <!-- Split Screen Layout -->
    <div class="split-layout">
      <!-- Left Column: List -->
      <div class="left-column">
        <!-- Podium (Top 3) -->
        <div v-if="activeTab === 'personal' && !isLoading && currentRankingList.length >= 3" class="mini-podium">
          <div
            v-for="(item, index) in currentRankingList.slice(0, 3)"
            :key="item.userId"
            class="mini-podium-item"
            :class="`podium-${item.rank}`"
            @click="selectUser(item)"
          >
            <div class="mini-podium-rank">{{ getRankIcon(item.rank - 1) }}</div>
            <div class="mini-podium-avatar">{{ item.userName.charAt(0) }}</div>
            <div class="mini-podium-info">
              <div class="mini-podium-name">{{ item.userName }}</div>
              <div class="mini-podium-points">{{ item.totalPoints }}</div>
            </div>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="skeleton-list">
          <div v-for="i in 10" :key="i" class="skeleton-item"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="currentRankingList.length === 0" class="empty-state">
          <div class="empty-icon">🏆</div>
          <div class="empty-title">暂无排行数据</div>
        </div>

        <!-- User List - Personal Ranking -->
        <div v-else-if="activeTab === 'personal'" class="user-list">
          <div
            v-for="item in currentRankingList"
            :key="item.userId || item.name"
            class="user-row"
            :class="{ 'user-selected': isSelected(item) }"
            @click="selectUser(item)"
          >
            <div class="user-rank" :class="`rank-color-${item.rank}`">
              {{ item.rank }}
            </div>
            <div class="user-avatar" :class="item.avatarColor || 'bg-slate-500'">
              {{ getDisplayName(item).charAt(0) }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ getDisplayName(item) }}</div>
              <div v-if="item.community" class="user-dept">{{ item.community }}</div>
            </div>
            <div class="user-points">{{ item.totalPoints }}</div>
          </div>
        </div>

        <!-- Community List - Community Ranking -->
        <div v-else class="community-list">
          <div
            v-for="community in currentRankingList"
            :key="community.name"
            class="community-group"
          >
            <!-- Community Header (Clickable) -->
            <div
              class="community-header"
              @click="toggleCommunity(community.name)"
            >
              <div class="community-rank" :class="`rank-color-${community.rank}`">
                {{ community.rank }}
              </div>
              <div class="community-icon">
                {{ community.name.charAt(0) }}
              </div>
              <div class="community-info">
                <div class="community-name">{{ community.name }}</div>
                <div class="community-meta">{{ community.members }} 成员 · 人均 {{ community.averagePoints }} 分</div>
              </div>
              <div class="community-points">{{ community.totalPoints }}</div>
              <div class="expand-icon">
                <component :is="expandedCommunity === community.name ? ChevronDown : ChevronRight" :size="16" />
              </div>
            </div>

            <!-- Community Members (Expanded) -->
            <div v-if="expandedCommunity === community.name" class="community-members">
              <div
                v-for="member in getCommunityMembers(community.name)"
                :key="member.userId"
                class="member-row"
                :class="{ 'user-selected': selectedUser?.userId === member.userId }"
                @click="selectCommunityMember(member)"
              >
                <div class="member-avatar" :class="member.avatarColor || 'bg-slate-500'">
                  {{ member.userName.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.userName }}</div>
                </div>
                <div class="member-points">{{ member.totalPoints }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination (Compact) -->
        <div v-if="currentPagination.totalItems.value > 0 && !isLoading" class="pagination-compact">
          <button
            @click="currentPagination.prevPage()"
            :disabled="currentPagination.currentPage.value === 1"
            class="page-btn-compact"
          >
            <ChevronLeft :size="16" />
          </button>
          <span class="page-info">{{ currentPagination.currentPage.value }} / {{ currentPagination.totalPages.value }}</span>
          <button
            @click="currentPagination.nextPage()"
            :disabled="currentPagination.currentPage.value === currentPagination.totalPages.value"
            class="page-btn-compact"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="right-column">
        <!-- Loading State -->
        <div v-if="isLoading" class="details-loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- Empty Selection State -->
        <div v-else-if="!selectedUser" class="details-empty">
          <div class="empty-icon-large">👈</div>
          <div class="empty-title">选择用户查看详情</div>
          <div class="empty-desc">点击左侧列表中的用户查看积分详情</div>
        </div>

        <!-- User Details -->
        <div v-else class="user-details" :key="selectedUser.userId || selectedUser.name">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="profile-avatar" :class="selectedUser.avatarColor || 'bg-slate-500'">
              {{ getDisplayName(selectedUser).charAt(0) }}
            </div>
            <div class="profile-info">
              <h3 class="profile-name">{{ getDisplayName(selectedUser) }}</h3>
              <div class="profile-meta">
                <span class="profile-rank">排名 #{{ selectedUser.rank }}</span>
              </div>
            </div>
            <div class="profile-points-section">
              <div class="profile-points">{{ selectedUser.totalPoints }}</div>
              <div class="profile-points-label">
                {{ activeTab === 'personal' ? '总积分' : '总积分' }}
              </div>
              <!-- Stats for users with pointDetails (personal ranking or community members) -->
              <div v-if="selectedUser.pointDetails" class="profile-points-stats">
                <div v-if="getTodayPoints(selectedUser) > 0" class="stat-item">
                  <span class="stat-label">今日</span>
                  <span class="stat-value stat-today">+{{ getTodayPoints(selectedUser) }}</span>
                </div>
                <div v-if="getWeekPoints(selectedUser) > 0" class="stat-item">
                  <span class="stat-label">本周</span>
                  <span class="stat-value stat-week">+{{ getWeekPoints(selectedUser) }}</span>
                </div>
              </div>
              <!-- Stats for community -->
              <div v-else class="profile-points-stats">
                <div class="stat-item">
                  <span class="stat-label">成员数</span>
                  <span class="stat-value stat-members">{{ selectedUser.members }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">人均积分</span>
                  <span class="stat-value stat-avg">{{ selectedUser.averagePoints }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline View -->
          <div class="timeline-section">
            <h4 class="timeline-title">积分明细</h4>

            <!-- Show timeline for users with pointDetails (personal ranking or community members) -->
            <div v-if="selectedUser.pointDetails">
              <div class="timeline-list">
                <template v-for="[date, group], index in Array.from(getGroupedActivities(selectedUser).entries())" :key="date">
                  <!-- Show only first 2 days by default, or all if expanded -->
                  <div v-if="showFullTimeline || index < 2" class="timeline-date-group">
                    <!-- Date Header -->
                    <div class="timeline-date-header">
                      <div class="timeline-date-line"></div>
                      <div class="timeline-date-info">
                        <div class="timeline-date">{{ date }}</div>
                        <div class="timeline-weekday">{{ getWeekday(String(date)) }}</div>
                      </div>
                      <div class="date-total">
                        <div class="date-total-text">累计</div>
                        <div class="date-total-value">+{{ group.reduce((sum: number, act: Activity) => sum + Number(act.points || 0), 0) }}</div>
                      </div>
                    </div>

                    <!-- Activities -->
                    <div class="timeline-activities">
                      <div
                        v-for="activity in group"
                        :key="activity.id"
                        class="log-entry"
                      >
                        <!-- Timeline Dot -->
                        <div class="log-dot"></div>

                        <!-- Log Card -->
                        <div class="log-card">
                          <!-- Icon -->
                          <div class="log-icon" :class="activity.iconClass">
                            <component :is="activity.icon" :size="16" />
                          </div>

                          <!-- Activity Name -->
                          <div class="log-content">
                            <div class="log-name">{{ activity.name }}</div>
                            <div class="log-time">{{ activity.time }}</div>
                          </div>

                          <!-- Points -->
                          <div class="log-points">
                            +{{ activity.points }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Show More/Less Button -->
                <div
                  v-if="getGroupedActivities(selectedUser).size > 2"
                  class="timeline-show-more"
                  @click="showTimelineModal = true"
                >
                  <span class="show-more-text">查看详情</span>
                  <ChevronDown :size="16" class="show-more-icon" />
                </div>

                <!-- Empty state -->
                <div v-if="getGroupedActivities(selectedUser).size === 0" class="timeline-empty">
                  <div class="empty-icon-small">📝</div>
                  <div class="empty-text">暂无积分记录</div>
                </div>
              </div>
            </div>

            <!-- Community/Department aggregate view -->
            <div v-else class="timeline-notice">
              <div class="notice-icon">📊</div>
              <div class="notice-title">积分明细</div>
              <div class="notice-desc">
                {{ activeTab === 'community' ? '社群' : '部门' }}积分由成员贡献累积
              </div>
              <div class="notice-desc">
                <span class="notice-highlight">{{ selectedUser.members }}</span> 名成员 ·
                人均 <span class="notice-highlight">{{ selectedUser.averagePoints }}</span> 分
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rules Section -->
    <div class="rules-section">
      <div class="rules-header">
        <h3 class="rules-title">
          <Info :size="16" />
          积分获取规则
        </h3>
        <span class="rules-time">每周一 00:00 结算</span>
      </div>
      <div class="rules-grid">
        <div class="rule-item rule-blue">
          <div class="rule-name">课件阅读</div>
          <div class="rule-points">+10 分/次</div>
        </div>
        <div class="rule-item rule-green">
          <div class="rule-name">饮食上传</div>
          <div class="rule-points">+5 分/次</div>
        </div>
        <div class="rule-item rule-purple">
          <div class="rule-name">健康打卡</div>
          <div class="rule-points">+3 分/次</div>
        </div>
        <div class="rule-item rule-orange">
          <div class="rule-name">阻碍提报</div>
          <div class="rule-points">+8 分/次</div>
        </div>
      </div>
    </div>

    <!-- Timeline Modal -->
    <div v-if="showTimelineModal && selectedUser" class="timeline-modal-overlay" @click.self="showTimelineModal = false">
      <div class="timeline-modal">
        <!-- Modal Header -->
        <div class="timeline-modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">积分明细</h3>
            <p class="modal-subtitle">{{ getDisplayName(selectedUser) }} 的完整积分记录</p>
          </div>
          <button
            @click="showTimelineModal = false"
            class="modal-close-btn"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="timeline-modal-content">
          <!-- Full Timeline -->
          <div class="timeline-list">
            <template v-for="[date, group] in Array.from(getGroupedActivities(selectedUser).entries())" :key="date">
              <div class="timeline-date-group">
                <!-- Date Header -->
                <div class="timeline-date-header">
                  <div class="timeline-date-line"></div>
                  <div class="timeline-date-info">
                    <div class="timeline-date">{{ date }}</div>
                    <div class="timeline-weekday">{{ getWeekday(String(date)) }}</div>
                  </div>
                  <div class="date-total">
                    <div class="date-total-text">累计</div>
                    <div class="date-total-value">+{{ group.reduce((sum: number, act: Activity) => sum + Number(act.points || 0), 0) }}</div>
                  </div>
                </div>

                <!-- Activities -->
                <div class="timeline-activities">
                  <div
                    v-for="activity in group"
                    :key="activity.id"
                    class="log-entry"
                  >
                    <!-- Timeline Dot -->
                    <div class="log-dot"></div>

                    <!-- Log Card -->
                    <div class="log-card">
                      <!-- Icon -->
                      <div class="log-icon" :class="activity.iconClass">
                        <component :is="activity.icon" :size="16" />
                      </div>

                      <!-- Activity Name -->
                      <div class="log-content">
                        <div class="log-name">{{ activity.name }}</div>
                        <div class="log-time">{{ activity.time }}</div>
                      </div>

                      <!-- Points -->
                      <div class="log-points">
                        +{{ activity.points }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Empty state -->
            <div v-if="getGroupedActivities(selectedUser).size === 0" class="timeline-empty">
              <div class="empty-icon-small">📝</div>
              <div class="empty-text">暂无积分记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Trophy,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  BookOpen,
  Upload,
  Heart,
  AlertTriangle,
  Radio,
  Award,
  X
} from 'lucide-vue-next'
import { usePointsSystem, type UserPoints } from '../composables/usePointsSystem'
import { usePagination } from '../composables/usePagination'

const {
  getPersonalRanking,
  getCommunityRanking,
  pointsData,
  initSampleData
} = usePointsSystem()

// Types
type RankingTabKey = 'personal' | 'community'

interface RankingTab {
  key: RankingTabKey
  label: string
  icon: any
}

interface Activity {
  id: string
  name: string
  points: number
  time: string
  date: string
  icon: any
  iconClass: string
}

// State
const activeTab = ref<RankingTabKey>('personal')
const isLoading = ref(true)
const isInitializing = ref(false)
const selectedUser = ref<UserPoints | any>(null)
const expandedCommunity = ref<string | null>(null) // Track expanded community
const showTimelineModal = ref(false) // Track if timeline modal is shown

const rankingTabs: RankingTab[] = [
  { key: 'personal', label: '个人榜', icon: User },
  { key: 'community', label: '社群榜', icon: Users }
]

// Data sources
const personalRankingData = computed(() => getPersonalRanking.value)
const communityRankingData = computed(() => getCommunityRanking.value)

// Pagination
const personalPagination = usePagination({
  itemsPerPage: 50,
  data: personalRankingData
})

const communityPagination = usePagination({
  itemsPerPage: 50,
  data: communityRankingData
})

const currentPagination = computed(() => {
  if (activeTab.value === 'personal') return personalPagination
  return communityPagination
})

const currentRankingList = computed(() => {
  const data = currentPagination.value.currentData.value
  return data.map((item, index) => {
    const rank = item.rank && item.rank > 0 ? item.rank : currentPagination.value.startIndex.value + index + 1
    return { ...item, rank }
  })
})

// Actions
const switchTab = (tab: RankingTabKey) => {
  activeTab.value = tab
  currentPagination.value.reset()
  selectedUser.value = null
  expandedCommunity.value = null // Reset expanded community when switching tabs
}

const isSelected = (item: any) => {
  if (!selectedUser.value) return false
  if (activeTab.value === 'personal') {
    return selectedUser.value.userId === item.userId
  }
  // For community tab, check if it's a community member or community aggregate
  if (item.userId) {
    // It's a community member
    return selectedUser.value.userId === item.userId
  }
  // It's a community aggregate
  return selectedUser.value.name === item.name
}

const selectUser = (item: any) => {
  selectedUser.value = item
  onUserInteraction()
}

const getDisplayName = (item: any) => {
  // If item has userName (personal ranking or community member), use it
  if (item.userName) return item.userName
  // Otherwise use name (community aggregate)
  return item.name
}

const getRankIcon = (index: number) => {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `#${index + 1}`
}

// Generate timeline activities for a user
const getGroupedActivities = (user: any) => {
  // Early return if no user or no pointDetails
  if (!user || !user.pointDetails) {
    return new Map()
  }

  const activities: Activity[] = []

  // Safely get point details with fallback
  const pointDetails = user.pointDetails || {}

  // Define activity configuration
  const activityConfig = [
    {
      key: 'courseReading',
      name: '阅读健康课件',
      pointValue: 10,
      icon: BookOpen,
      iconClass: 'icon-blue'
    },
    {
      key: 'mealUpload',
      name: '上传饮食记录',
      pointValue: 5,
      icon: Upload,
      iconClass: 'icon-green'
    },
    {
      key: 'healthCheckin',
      name: '完成健康打卡',
      pointValue: 3,
      icon: Heart,
      iconClass: 'icon-red'
    },
    {
      key: 'obstacleReport',
      name: '提报健康阻碍',
      pointValue: 8,
      icon: AlertTriangle,
      iconClass: 'icon-orange'
    },
    {
      key: 'liveWatching',
      name: '观看健康直播',
      pointValue: 15,
      icon: Radio,
      iconClass: 'icon-purple'
    },
    {
      key: 'weightLossResult',
      name: '减重成效奖励',
      pointValue: 50,
      icon: Award,
      iconClass: 'icon-amber'
    }
  ]

  const today = new Date()

  // Generate activities from point details
  activityConfig.forEach(config => {
    const rawValue = pointDetails[config.key]
    const totalPoints = rawValue !== undefined && rawValue !== null && !isNaN(Number(rawValue)) ? Number(rawValue) : 0

    if (totalPoints > 0) {
      // Calculate number of entries based on points
      const entries = Math.ceil(totalPoints / config.pointValue)
      const limitedEntries = Math.max(1, Math.min(entries, 5)) // At least 1, max 5 per type

      for (let i = 0; i < limitedEntries; i++) {
        // Distribute points across entries
        const pointsThisEntry = Math.max(
          config.pointValue,
          Math.floor(totalPoints / limitedEntries)
        )

        // Calculate date (spread over last 7 days)
        const daysAgo = Math.floor(i / 2)
        const activityDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
        activityDate.setHours(8 + Math.floor(Math.random() * 12)) // 8am-8pm
        activityDate.setMinutes(Math.floor(Math.random() * 60))

        const hours = activityDate.getHours()
        const minutes = activityDate.getMinutes()

        // Create activity object with all required fields
        const activity: Activity = {
          id: `act-${Date.now()}-${i}-${config.key}`,
          name: config.name,
          points: pointsThisEntry,
          time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          date: activityDate.toISOString(),
          icon: config.icon,
          iconClass: config.iconClass
        }

        activities.push(activity)
      }
    }
  })

  // If no activities, return empty map
  if (activities.length === 0) {
    return new Map()
  }

  // Sort by date descending (newest first)
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group by date
  const grouped = new Map<string, Activity[]>()

  activities.forEach(activity => {
    const dateObj = new Date(activity.date)

    // Validate date
    if (isNaN(dateObj.getTime())) {
      return
    }

    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const dateKey = `${month}月${day}日`

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }

    grouped.get(dateKey)!.push(activity)
  })

  return grouped
}

const getTodayPoints = (user: any) => {
  // Only calculate for personal ranking (has pointDetails)
  if (activeTab.value !== 'personal' || !user.pointDetails) {
    return 0
  }

  const today = new Date()
  const todayKey = `${today.getMonth() + 1}月${today.getDate()}日`
  const activities = getGroupedActivities(user)
  const todayActivities = activities.get(todayKey)

  if (!todayActivities) return 0
  return todayActivities.reduce((sum: number, act: Activity) => sum + Number(act.points), 0)
}

const getWeekPoints = (user: any) => {
  // Only calculate for personal ranking (has pointDetails)
  if (activeTab.value !== 'personal' || !user.pointDetails) {
    return 0
  }

  const activities = getGroupedActivities(user)
  let weekTotal = 0
  const today = new Date()

  // Check each date group
  activities.forEach((dayActivities, dateKey) => {
    // Parse date from "MM月DD日" format
    const match = dateKey.match(/(\d+)月(\d+)日/)
    if (match) {
      const month = parseInt(match[1]) - 1 // JS months are 0-indexed
      const day = parseInt(match[2])
      const actDate = new Date(today.getFullYear(), month, day)

      // Check if within last 7 days
      const daysDiff = Math.floor((today.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff < 7) {
        weekTotal += dayActivities.reduce((sum: number, act: Activity) => sum + Number(act.points), 0)
      }
    }
  })

  return weekTotal
}

// Get weekday from date string "MM月DD日"
const getWeekday = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return ''

  const match = dateStr.match(/(\d+)月(\d+)日/)
  if (!match) return ''

  const today = new Date()
  const month = parseInt(match[1]) - 1
  const day = parseInt(match[2])
  const date = new Date(today.getFullYear(), month, day)

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[date.getDay()]
}

// Get count of active days in current week
const getActiveDaysCount = (user: any) => {
  if (activeTab.value !== 'personal' || !user.pointDetails) {
    return 0
  }

  const activities = getGroupedActivities(user)
  const today = new Date()
  let activeDays = 0

  // Count days within last 7 days that have activities
  activities.forEach((dayActivities, dateKey) => {
    const match = dateKey.match(/(\d+)月(\d+)日/)
    if (match) {
      const month = parseInt(match[1]) - 1
      const day = parseInt(match[2])
      const actDate = new Date(today.getFullYear(), month, day)
      const daysDiff = Math.floor((today.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff < 7 && dayActivities.length > 0) {
        activeDays++
      }
    }
  })

  return activeDays
}

// Get best day (day with highest points)
const getBestDay = (user: any) => {
  if (activeTab.value !== 'personal' || !user.pointDetails) {
    return '-'
  }

  const activities = getGroupedActivities(user)
  let bestDay = '-'
  let maxPoints = 0

  activities.forEach((dayActivities, dateKey) => {
    const dayTotal = dayActivities.reduce((sum: number, act: Activity) => sum + Number(act.points), 0)
    if (dayTotal > maxPoints) {
      maxPoints = dayTotal
      bestDay = `${dateKey} (+${dayTotal}分)`
    }
  })

  return bestDay
}

// Get members of a community
const getCommunityMembers = (communityName: string) => {
  return Object.values(pointsData.value)
    .filter(user => user.community === communityName)
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

// Toggle community expansion
const toggleCommunity = (communityName: string) => {
  if (expandedCommunity.value === communityName) {
    expandedCommunity.value = null
  } else {
    expandedCommunity.value = communityName
  }
}

// Select a community member
const selectCommunityMember = (user: UserPoints) => {
  selectedUser.value = user
  onUserInteraction()
}

// Initialization
const createSimpleTestData = async () => {
  if (isInitializing.value) return

  if (Object.keys(pointsData.value).length > 0) {
    isLoading.value = false
    return
  }

  isInitializing.value = true
  isLoading.value = true

  try {
    initSampleData()
    await new Promise(resolve => setTimeout(resolve, 0))
  } catch (error) {
    console.error('Data initialization failed:', error)
  } finally {
    isLoading.value = false
    isInitializing.value = false
  }
}

onMounted(async () => {
  await createSimpleTestData()
})
</script>

<style scoped>
/* Container */
.leaderboard-container {
  @apply bg-white rounded-2xl shadow-sm border border-slate-200 p-6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.leaderboard-header {
  @apply flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4;
}

.header-left {
  @apply flex flex-col lg:flex-row lg:items-center gap-6;
}

.title-section {
  @apply flex items-center gap-3;
}

.title-icon {
  @apply w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg;
}

.trophy-icon {
  @apply text-white;
}

.title {
  @apply text-xl font-bold text-slate-800;
}

.subtitle {
  @apply text-sm text-slate-500 mt-0.5;
}

/* Tabs */
.tabs-wrapper {
  @apply flex bg-slate-100 rounded-xl p-1 gap-1;
}

.tab-btn {
  @apply px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2;
  @apply text-slate-600 hover:text-slate-800 hover:bg-white/50;
}

.tab-active {
  @apply bg-white text-indigo-600 shadow-sm;
}

/* Split Layout */
.split-layout {
  @apply grid grid-cols-1 md:grid-cols-[400px,1fr] gap-6;
}

/* Left Column */
.left-column {
  @apply flex flex-col gap-4;
}

/* Mini Podium */
.mini-podium {
  @apply grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200;
}

.mini-podium-item {
  @apply flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all;
  @apply hover:bg-white/50;
}

.mini-podium-rank {
  @apply text-lg mb-1;
}

.mini-podium-avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1;
  @apply bg-gradient-to-br from-amber-400 to-amber-600;
}

.podium-2 .mini-podium-avatar {
  @apply from-slate-400 to-slate-600;
}

.podium-3 .mini-podium-avatar {
  @apply from-orange-400 to-orange-600;
}

.mini-podium-name {
  @apply text-xs font-semibold text-slate-800 truncate w-full text-center;
}

.mini-podium-points {
  @apply text-sm font-bold text-amber-600;
}

.podium-2 .mini-podium-points {
  @apply text-slate-600;
}

.podium-3 .mini-podium-points {
  @apply text-orange-600;
}

/* User List */
.user-list {
  @apply flex-1 overflow-y-auto pr-2 space-y-1;
}

/* Community List */
.community-list {
  @apply flex-1 overflow-y-auto pr-2 space-y-2;
}

.community-group {
  @apply bg-white rounded-lg border border-slate-200 overflow-hidden;
}

.community-header {
  @apply h-[60px] px-3 flex items-center gap-3 cursor-pointer transition-all duration-200;
  @apply hover:bg-indigo-50;
}

.community-rank {
  @apply w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0;
  @apply bg-slate-100 text-slate-600;
}

.community-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0;
  @apply bg-gradient-to-br from-purple-400 to-purple-600 text-white;
}

.community-info {
  @apply flex-1 min-w-0;
}

.community-name {
  @apply text-sm font-semibold text-slate-800 truncate;
}

.community-meta {
  @apply text-xs text-slate-500 truncate;
}

.community-points {
  @apply text-sm font-bold text-purple-600 flex-shrink-0;
}

.expand-icon {
  @apply text-slate-400 flex-shrink-0 transition-transform duration-200;
}

/* Community Members */
.community-members {
  @apply border-t border-slate-200 bg-slate-50;
  @apply max-h-[300px] overflow-y-auto;
}

.member-row {
  @apply h-[50px] px-3 flex items-center gap-3 cursor-pointer transition-all duration-200;
  @apply hover:bg-white hover:shadow-sm;
  @apply border-b border-slate-100 last:border-b-0;
}

.member-avatar {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0;
}

.member-info {
  @apply flex-1 min-w-0;
}

.member-name {
  @apply text-sm font-medium text-slate-700 truncate;
}

.member-dept {
  @apply text-xs text-slate-500 truncate;
}

.member-points {
  @apply text-xs font-bold text-indigo-600 flex-shrink-0;
}

.user-row {
  @apply h-[60px] px-3 rounded-lg border border-slate-200 bg-white;
  @apply flex items-center gap-3 cursor-pointer transition-all duration-200;
  @apply hover:bg-indigo-50 hover:border-indigo-200;
}

.user-selected {
  @apply bg-indigo-100 border-indigo-300;
}

.user-rank {
  @apply w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0;
  @apply bg-slate-100 text-slate-600;
}

.rank-color-1 {
  @apply bg-gradient-to-br from-amber-400 to-amber-500 text-white;
}

.rank-color-2 {
  @apply bg-gradient-to-br from-slate-400 to-slate-500 text-white;
}

.rank-color-3 {
  @apply bg-gradient-to-br from-orange-400 to-orange-500 text-white;
}

.user-avatar {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0;
}

.user-info {
  @apply flex-1 min-w-0;
}

.user-name {
  @apply text-sm font-semibold text-slate-800 truncate;
}

.user-dept {
  @apply text-xs text-slate-500 truncate;
}

.user-points {
  @apply text-sm font-bold text-indigo-600 flex-shrink-0;
}

/* Pagination Compact */
.pagination-compact {
  @apply flex items-center justify-center gap-2 py-2 border-t border-slate-200;
}

.page-btn-compact {
  @apply p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-info {
  @apply text-sm text-slate-600;
}

/* Skeleton Loading */
.skeleton-list {
  @apply space-y-2;
}

.skeleton-item {
  @apply h-[60px] bg-slate-100 rounded-lg animate-pulse;
}

/* Empty State */
.empty-state {
  @apply text-center py-16;
}

.empty-icon {
  @apply text-4xl mb-2;
}

.empty-title {
  @apply text-sm font-semibold text-slate-700 mb-1;
}

/* Right Column */
.right-column {
  @apply bg-slate-50 rounded-xl border border-slate-200 overflow-hidden;
}

.details-loading {
  @apply flex flex-col items-center justify-center py-32 text-slate-500;
}

.loading-spinner {
  @apply w-8 h-8 rounded-full animate-spin mb-3;
  border: 3px solid rgb(224 231 255);
  border-top-color: rgb(79 70 229);
}

.details-empty {
  @apply flex flex-col items-center justify-center py-32 text-center;
}

.empty-icon-large {
  @apply text-6xl mb-4;
}

.empty-title {
  @apply text-lg font-semibold text-slate-700 mb-2;
}

.empty-desc {
  @apply text-sm text-slate-500;
}

/* User Details */
.user-details {
  @apply h-full overflow-y-auto;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Profile Header */
.profile-header {
  @apply p-6 bg-white border-b border-slate-200;
  @apply flex items-start gap-4;
}

.profile-avatar {
  @apply w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0;
}

.profile-info {
  @apply flex-1;
}

.profile-name {
  @apply text-xl font-bold text-slate-800 mb-2;
}

.profile-meta {
  @apply flex items-center gap-2;
}

.profile-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600;
}

.profile-rank {
  @apply px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700;
}

.profile-points-section {
  @apply text-right flex-shrink-0;
}

.profile-points {
  @apply text-3xl font-bold text-indigo-600;
}

.profile-points-label {
  @apply text-xs text-slate-500;
}

.profile-points-stats {
  @apply mt-2 space-y-1;
}

.stat-item {
  @apply flex items-center gap-2 text-xs;
}

.stat-label {
  @apply text-slate-500;
}

.stat-value {
  @apply font-bold;
}

.stat-today {
  @apply text-green-600;
}

.stat-week {
  @apply text-blue-600;
}

.stat-members {
  @apply text-purple-600;
}

.stat-avg {
  @apply text-green-600;
}

/* Highlights Section */
.highlights-section {
  @apply mb-6;
}

.highlight-card {
  @apply flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200;
}

.highlight-item {
  @apply flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm;
}

.highlight-icon {
  @apply text-base;
}

.highlight-text {
  @apply text-sm font-medium text-amber-800;
}

/* Timeline Section */
.timeline-section {
  @apply p-6;
}

.timeline-title {
  @apply text-base font-bold text-slate-800 mb-4;
}

.timeline-list {
  @apply space-y-6;
}

.timeline-date-group {
  @apply relative;
}

/* Date Header with Timeline Line */
.timeline-date-header {
  @apply flex items-center justify-between mb-3 sticky top-0 bg-slate-50 py-2 px-1 rounded;
}

.timeline-date-line {
  @apply absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-indigo-300;
  @apply left-4 z-10;
}

.timeline-date-info {
  @apply flex flex-col;
}

.timeline-date {
  @apply text-sm font-semibold text-slate-700;
}

.timeline-weekday {
  @apply text-xs text-slate-500;
}

.date-total {
  @apply text-right;
}

.date-total-text {
  @apply text-[10px] text-slate-500;
}

.date-total-value {
  @apply text-sm font-bold text-amber-600;
}

/* Activities */
.timeline-activities {
  @apply relative ml-8 space-y-2;
}

/* Timeline Connecting Line */
.timeline-activities::before {
  content: '';
  @apply absolute left-0 top-0 bottom-0 w-px bg-indigo-200 z-0;
}

/* Log Entry */
.log-entry {
  @apply relative flex items-start gap-3;
  @apply z-10;
}

.log-dot {
  @apply w-3 h-3 rounded-full bg-indigo-500 border-2 border-white flex-shrink-0 mt-2;
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.2);
}

.log-card {
  @apply flex-1 h-[50px] flex items-center gap-3 px-4;
  @apply bg-slate-50 rounded-lg border border-slate-200;
  @apply transition-all duration-200;
  @apply hover:bg-slate-100 hover:shadow-sm;
}

/* Log Icon */
.log-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
}

/* Log Content */
.log-content {
  @apply flex-1 min-w-0;
}

.log-name {
  @apply text-sm font-medium text-slate-800;
}

.log-time {
  @apply text-xs text-slate-500;
}

/* Log Points */
.log-points {
  @apply text-base font-bold text-indigo-600 flex-shrink-0;
}

/* Icon Colors */
.icon-blue {
  @apply bg-blue-100 text-blue-600;
}

.icon-green {
  @apply bg-green-100 text-green-600;
}

.icon-red {
  @apply bg-red-100 text-red-600;
}

.icon-orange {
  @apply bg-orange-100 text-orange-600;
}

.icon-purple {
  @apply bg-purple-100 text-purple-600;
}

.icon-amber {
  @apply bg-amber-100 text-amber-600;
}

/* Timeline Empty State */
.timeline-empty {
  @apply text-center py-12;
}

/* Show More Button */
.timeline-show-more {
  @apply flex items-center justify-center gap-2 py-3 px-4 mt-4;
  @apply bg-white border border-slate-200 rounded-lg;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:bg-indigo-50 hover:border-indigo-200;
}

.show-more-text {
  @apply text-sm font-medium text-indigo-600;
}

.show-more-icon {
  @apply text-indigo-600 transition-transform duration-200;
}

.empty-icon-small {
  @apply text-3xl mb-2 opacity-50;
}

.empty-text {
  @apply text-sm text-slate-500;
}

/* Timeline Notice for Community/Department */
.timeline-notice {
  @apply text-center py-12;
}

.notice-icon {
  @apply text-4xl mb-3;
}

.notice-title {
  @apply text-base font-semibold text-slate-700 mb-2;
}

.notice-desc {
  @apply text-sm text-slate-500;
}

.notice-highlight {
  @apply font-bold text-indigo-600;
}

/* Rules Section */
.rules-section {
  @apply mt-6 pt-6 border-t border-slate-200;
}

.rules-header {
  @apply flex items-center justify-between mb-4;
}

.rules-title {
  @apply text-sm font-bold text-slate-700 flex items-center gap-2;
}

.rules-time {
  @apply text-xs text-slate-500;
}

.rules-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3;
}

.rule-item {
  @apply p-3 rounded-xl;
}

.rule-blue {
  @apply bg-blue-50;
}

.rule-blue .rule-name {
  @apply text-blue-700;
}

.rule-blue .rule-points {
  @apply text-blue-600;
}

.rule-green {
  @apply bg-green-50;
}

.rule-green .rule-name {
  @apply text-green-700;
}

.rule-green .rule-points {
  @apply text-green-600;
}

.rule-purple {
  @apply bg-purple-50;
}

.rule-purple .rule-name {
  @apply text-purple-700;
}

.rule-purple .rule-points {
  @apply text-purple-600;
}

.rule-orange {
  @apply bg-orange-50;
}

.rule-orange .rule-name {
  @apply text-orange-700;
}

.rule-orange .rule-points {
  @apply text-orange-600;
}

.rule-name {
  @apply text-xs font-medium mb-1;
}

.rule-points {
  @apply text-sm font-bold;
}

/* Responsive */
@media (max-width: 768px) {
  .split-layout {
    @apply grid-cols-1;
  }

  .left-column {
    @apply max-h-[400px];
  }

  .right-column {
    @apply min-h-[400px];
  }

  .mini-podium {
    @apply grid-cols-1;
  }

  .mini-podium-item {
    @apply flex-row gap-3;
  }
}

/* Timeline Modal */
.timeline-modal-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.timeline-modal {
  @apply bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col;
  animation: slideUp 0.3s ease-out;
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

.timeline-modal-header {
  @apply flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50;
}

.modal-title-section {
  @apply flex flex-col;
}

.modal-title {
  @apply text-xl font-bold text-slate-800;
}

.modal-subtitle {
  @apply text-sm text-slate-500 mt-1;
}

.modal-close-btn {
  @apply p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors;
  @apply flex-shrink-0;
}

.timeline-modal-content {
  @apply flex-1 overflow-y-auto p-6;
}

/* Responsive for Modal */
@media (max-width: 768px) {
  .timeline-modal {
    @apply max-h-[90vh];
  }

  .timeline-modal-header {
    @apply p-4;
  }

  .modal-title {
    @apply text-lg;
  }

  .timeline-modal-content {
    @apply p-4;
  }
}
</style>
