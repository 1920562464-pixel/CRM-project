<template>
  <div class="h-screen flex flex-col overflow-hidden" :style="{ background: 'var(--background)', color: 'var(--text-primary)' }">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Header Section -->
    <div class="flex-shrink-0 p-4" :style="{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-1 h-8 rounded-full" :style="{ background: isBlackGold ? 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }"></div>
            <div>
              <h1 class="text-xl font-bold">教练管理员看板</h1>
              <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">Coach Admin Dashboard</p>
            </div>
          </div>

          <!-- Time Filter Tabs -->
          <div class="flex items-center gap-1 p-1 rounded-lg" :style="{ background: 'var(--fill-light)' }">
            <button
              v-for="tab in timeTabs"
              :key="tab.value"
              @click="timeFilter = tab.value"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              :style="timeFilter === tab.value ? {
                background: isBlackGold ? '#B8860B' : '#4f46e5',
                color: 'white'
              } : {
                color: 'var(--text-secondary)'
              }"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索教练姓名..."
              class="pl-9 pr-4 py-2 rounded-lg text-sm w-48 focus:outline-none focus:ring-2"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--fill-light)',
                color: 'var(--text-primary)'
              }"
            />
          </div>

          <!-- Export Button -->
          <button
            @click="exportData"
            class="px-4 py-2 text-sm rounded-lg flex items-center gap-2 text-white"
            :style="{ background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }"
          >
            <Download :size="16" />
            导出报表
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Overview View -->
      <div v-if="!selectedCoach" class="h-full overflow-y-auto p-4 space-y-4">
        <!-- KPI Cards -->
        <div class="grid grid-cols-5 gap-4">
          <!-- Total Coaches -->
          <div class="rounded-xl p-4 relative overflow-hidden group" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              :style="{ background: isBlackGold ? '#B8860B' : '#4f46e5' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">教练总数</span>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{
                background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)'
              }">
                <Users :size="20" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
              </div>
            </div>
            <div class="text-3xl font-bold mb-1">{{ kpiData.totalCoaches }}</div>
            <div class="flex items-center gap-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
              <span>在职: {{ kpiData.activeCoaches }}</span>
              <span>·</span>
              <span>试用期: {{ kpiData.probationCoaches }}</span>
            </div>
          </div>

          <!-- Avg Completion Rate -->
          <div class="rounded-xl p-4 relative overflow-hidden" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              :style="{ background: '#10b981' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">平均完成率</span>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(16, 185, 129, 0.1)">
                <TrendingUp :size="20" style="color: #10b981" />
              </div>
            </div>
            <div class="text-3xl font-bold mb-1">{{ kpiData.avgCompletionRate }}%</div>
            <div class="flex items-center gap-1 text-xs" :style="{ color: kpiData.completionTrend >= 0 ? '#10b981' : '#ef4444' }">
              <TrendingUp v-if="kpiData.completionTrend >= 0" :size="14" />
              <TrendingDown v-else :size="14" />
              <span>{{ kpiData.completionTrend >= 0 ? '+' : '' }}{{ kpiData.completionTrend }}% 较上期</span>
            </div>
          </div>

          <!-- Top Performers -->
          <div class="rounded-xl p-4 relative overflow-hidden" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              :style="{ background: '#f59e0b' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">优秀教练</span>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(245, 158, 11, 0.1)">
                <Award :size="20" style="color: #f59e0b" />
              </div>
            </div>
            <div class="text-3xl font-bold mb-1">{{ kpiData.topPerformers }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
              完成率 ≥ 85%
            </div>
          </div>

          <!-- Total Users -->
          <div class="rounded-xl p-4 relative overflow-hidden" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              :style="{ background: '#8b5cf6' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">服务用户</span>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(139, 92, 246, 0.1)">
                <UserCircle :size="20" style="color: #8b5cf6" />
              </div>
            </div>
            <div class="text-3xl font-bold mb-1">{{ kpiData.totalUsers }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
              今日活跃 {{ kpiData.todayActiveUsers }}
            </div>
          </div>

          <!-- Attention Needed -->
          <div class="rounded-xl p-4 relative overflow-hidden" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              :style="{ background: '#ef4444' }"></div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">待关注</span>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(239, 68, 68, 0.1)">
                <AlertCircle :size="20" style="color: #ef4444" />
              </div>
            </div>
            <div class="text-3xl font-bold mb-1" style="color: #ef4444">{{ kpiData.attentionNeeded }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
              完成率 < 60%
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Performance Trend Chart -->
          <div class="col-span-2 rounded-xl p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold flex items-center gap-2">
                <BarChart3 :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
                完成率趋势
              </h3>
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 rounded" :style="{ background: isBlackGold ? '#B8860B' : '#4f46e5' }"></div>
                  <span :style="{ color: 'var(--text-secondary)' }">整体平均</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 rounded" style="background: #10b981"></div>
                  <span :style="{ color: 'var(--text-secondary)' }">最佳教练</span>
                </div>
              </div>
            </div>
            <!-- CSS Chart -->
            <div class="h-40 flex items-end gap-2 px-4">
              <div
                v-for="(item, index) in trendData"
                :key="index"
                class="flex-1 flex flex-col items-center gap-1 group"
              >
                <div class="w-full flex items-end gap-0.5 h-28">
                  <div
                    class="flex-1 rounded-t transition-all duration-300 group-hover:opacity-80"
                    :style="{
                      height: `${item.overall}%`,
                      background: isBlackGold ? 'linear-gradient(180deg, #B8860B 0%, rgba(184, 134, 11, 0.3) 100%)' : 'linear-gradient(180deg, #4f46e5 0%, rgba(79, 70, 229, 0.3) 100%)'
                    }"
                  ></div>
                  <div
                    class="flex-1 rounded-t transition-all duration-300 group-hover:opacity-80"
                    :style="{
                      height: `${item.top}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.3) 100%)'
                    }"
                  ></div>
                </div>
                <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ item.label }}</span>
              </div>
            </div>
          </div>

          <!-- Task Completion Distribution -->
          <div class="rounded-xl p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold flex items-center gap-2">
                <PieChart :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
                任务完成分布
              </h3>
            </div>
            <div class="space-y-3">
              <div v-for="task in taskDistribution" :key="task.name">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span>{{ task.name }}</span>
                  <span :style="{ color: 'var(--text-secondary)' }">{{ task.rate }}%</span>
                </div>
                <div class="w-full h-2 rounded-full overflow-hidden" :style="{ background: 'var(--fill-light)' }">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${task.rate}%`,
                      background: task.color
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coach Ranking Table -->
        <div class="rounded-xl overflow-hidden" :style="{
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }">
          <div class="p-4 border-b" :style="{ borderBottom: '1px solid var(--border)' }">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold flex items-center gap-2">
                <Trophy :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
                教练排行榜
              </h3>
              <div class="flex items-center gap-2">
                <select
                  v-model="sortBy"
                  class="px-3 py-1.5 text-sm rounded-lg focus:outline-none"
                  :style="{
                    border: '1px solid var(--border)',
                    background: 'var(--fill-light)',
                    color: 'var(--text-primary)'
                  }"
                >
                  <option value="completionRate">按完成率</option>
                  <option value="userCount">按用户数</option>
                  <option value="todayActive">按今日活跃</option>
                  <option value="loadRate">按负载率</option>
                </select>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-xs" :style="{ color: 'var(--text-secondary)', background: 'var(--fill-light)' }">
                  <th class="px-4 py-3 text-left font-medium">排名</th>
                  <th class="px-4 py-3 text-left font-medium">教练</th>
                  <th class="px-4 py-3 text-left font-medium">角色</th>
                  <th class="px-4 py-3 text-center font-medium">服务用户</th>
                  <th class="px-4 py-3 text-center font-medium">今日活跃</th>
                  <th class="px-4 py-3 text-center font-medium">平均完成率</th>
                  <th class="px-4 py-3 text-center font-medium">负载</th>
                  <th class="px-4 py-3 text-center font-medium">状态</th>
                  <th class="px-4 py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(coach, index) in sortedCoaches"
                  :key="coach.id"
                  class="border-b transition-colors hover:bg-opacity-50 cursor-pointer"
                  :style="{ borderBottom: '1px solid var(--border-light)' }"
                  :class="{ 'hover:bg-blue-50': !isBlackGold, 'hover:bg-yellow-50': isBlackGold }"
                  @click="viewCoachDetails(coach)"
                >
                  <td class="px-4 py-3">
                    <div v-if="index < 3" class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      :style="{
                        background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'
                      }">
                      {{ index + 1 }}
                    </div>
                    <span v-else class="text-sm" :style="{ color: 'var(--text-secondary)' }">{{ index + 1 }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        :style="{ background: coach.avatarColor }">
                        {{ coach.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-medium text-sm">{{ coach.name }}</div>
                        <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ coach.groupName || '独立教练' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded"
                      :style="{
                        background: coach.role === 'mentor' ? 'rgba(251, 191, 36, 0.1)' :
                                 coach.role === 'apprentice' ? 'rgba(168, 85, 247, 0.1)' :
                                 'rgba(79, 70, 229, 0.1)',
                        color: coach.role === 'mentor' ? '#f59e0b' :
                               coach.role === 'apprentice' ? '#a855f7' : '#4f46e5'
                      }">
                      {{ coach.roleLabel }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="text-sm font-medium">{{ coach.userCount }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="text-sm">{{ coach.todayActive }}</span>
                    <span class="text-xs ml-1" :style="{ color: 'var(--text-secondary)' }">/ {{ coach.userCount }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-sm font-bold"
                        :style="{
                          color: coach.completionRate >= 80 ? '#10b981' :
                                 coach.completionRate >= 60 ? '#f59e0b' : '#ef4444'
                        }">
                        {{ coach.completionRate }}%
                      </span>
                      <!-- Mini Progress Bar -->
                      <div class="w-12 h-1.5 rounded-full overflow-hidden" :style="{ background: 'var(--fill-light)' }">
                        <div class="h-full"
                          :style="{
                            width: `${coach.completionRate}%`,
                            background: coach.completionRate >= 80 ? '#10b981' :
                                       coach.completionRate >= 60 ? '#f59e0b' : '#ef4444'
                          }">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="text-xs px-2 py-1 rounded"
                      :style="{
                        background: coach.loadRate >= 0.9 ? 'rgba(239, 68, 68, 0.1)' :
                                 coach.loadRate >= 0.7 ? 'rgba(245, 158, 11, 0.1)' :
                                 'rgba(16, 185, 129, 0.1)',
                        color: coach.loadRate >= 0.9 ? '#ef4444' :
                               coach.loadRate >= 0.7 ? '#f59e0b' : '#10b981'
                      }">
                      {{ coach.load }}/{{ coach.maxLoad }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <div
                        class="w-2 h-2 rounded-full"
                        :style="{
                          background: coach.status === 'active' ? '#10b981' : '#ef4444'
                        }"
                      ></div>
                      <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                        {{ coach.status === 'active' ? '在线' : '离线' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      @click.stop="viewCoachDetails(coach)"
                      class="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      :style="{
                        background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                        color: isBlackGold ? '#B8860B' : '#4f46e5'
                      }"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Coach Detail View -->
      <div v-else class="h-full overflow-hidden flex flex-col">
        <!-- Detail Header -->
        <div class="flex-shrink-0 p-4" :style="{ background: 'var(--fill-light)', borderBottom: '1px solid var(--border)' }">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button
                @click="selectedCoach = null"
                class="p-2 rounded-lg transition-colors"
                :style="{ background: 'var(--card)', border: '1px solid var(--border)' }"
              >
                <ArrowLeft :size="18" />
              </button>
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  :style="{ background: selectedCoach.avatarColor }">
                  {{ selectedCoach.name.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-lg font-bold">{{ selectedCoach.name }}</h2>
                  <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
                    <span>{{ selectedCoach.roleLabel }}</span>
                    <span>·</span>
                    <span>{{ selectedCoach.groupName || '独立教练' }}</span>
                    <span>·</span>
                    <span>服务 {{ selectedCoach.userCount }} 位用户</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="px-4 py-2 text-sm rounded-lg flex items-center gap-2" :style="{
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text-regular)'
              }">
                <MessageSquare :size="16" />
                发送消息
              </button>
              <button class="px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2" :style="{
                background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
              }">
                <Settings :size="16" />
                管理设置
              </button>
            </div>
          </div>
        </div>

        <!-- Detail Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Performance Metrics -->
          <div class="grid grid-cols-4 gap-4">
            <div class="rounded-xl p-4 text-center" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="text-3xl font-bold mb-1" :style="{
                color: selectedCoach.completionRate >= 80 ? '#10b981' :
                       selectedCoach.completionRate >= 60 ? '#f59e0b' : '#ef4444'
              }">
                {{ selectedCoach.completionRate }}%
              </div>
              <div class="text-sm" :style="{ color: 'var(--text-secondary)' }">整体完成率</div>
              <div class="mt-2 text-xs" :style="{ color: selectedCoach.completionTrend >= 0 ? '#10b981' : '#ef4444' }">
                {{ selectedCoach.completionTrend >= 0 ? '+' : '' }}{{ selectedCoach.completionTrend }}% 较上周
              </div>
            </div>

            <div class="rounded-xl p-4 text-center" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="text-3xl font-bold mb-1" style="color: #4f46e5">
                {{ selectedCoach.todayActive }}/{{ selectedCoach.userCount }}
              </div>
              <div class="text-sm" :style="{ color: 'var(--text-secondary)' }">今日活跃</div>
              <div class="mt-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
                活跃率 {{ Math.round(selectedCoach.todayActive / selectedCoach.userCount * 100) }}%
              </div>
            </div>

            <div class="rounded-xl p-4 text-center" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="text-3xl font-bold mb-1" style="color: #8b5cf6">
                {{ selectedCoach.load }}/{{ selectedCoach.maxLoad }}
              </div>
              <div class="text-sm" :style="{ color: 'var(--text-secondary)' }">当前负载</div>
              <div class="mt-2 text-xs" :style="{
                color: selectedCoach.loadRate >= 0.9 ? '#ef4444' :
                       selectedCoach.loadRate >= 0.7 ? '#f59e0b' : '#10b981'
              }">
                {{ selectedCoach.loadRate >= 0.9 ? '负载过高' : selectedCoach.loadRate >= 0.7 ? '负载适中' : '负载偏低' }}
              </div>
            </div>

            <div class="rounded-xl p-4 text-center" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="text-3xl font-bold mb-1" style="color: #f59e0b">
                {{ selectedCoach.avgResponseTime }}min
              </div>
              <div class="text-sm" :style="{ color: 'var(--text-secondary)' }">平均响应</div>
              <div class="mt-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
                本周数据
              </div>
            </div>
          </div>

          <!-- User List -->
          <div class="rounded-xl overflow-hidden" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="p-4 border-b flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)' }">
              <h3 class="font-semibold flex items-center gap-2">
                <Users :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
                用户列表
              </h3>
              <div class="flex items-center gap-2">
                <select
                  v-model="userFilter"
                  class="px-3 py-1.5 text-sm rounded-lg focus:outline-none"
                  :style="{
                    border: '1px solid var(--border)',
                    background: 'var(--fill-light)',
                    color: 'var(--text-primary)'
                  }"
                >
                  <option value="all">全部用户</option>
                  <option value="completed">今日已完成</option>
                  <option value="pending">今日未完成</option>
                  <option value="behind">进度落后</option>
                </select>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-xs" :style="{ color: 'var(--text-secondary)', background: 'var(--fill-light)' }">
                    <th class="px-4 py-3 text-left font-medium">用户</th>
                    <th class="px-4 py-3 text-center font-medium">今日状态</th>
                    <th class="px-4 py-3 text-center font-medium">完成率</th>
                    <th class="px-4 py-3 text-center font-medium">饮食上传</th>
                    <th class="px-4 py-3 text-center font-medium">热量达标</th>
                    <th class="px-4 py-3 text-center font-medium">习惯打卡</th>
                    <th class="px-4 py-3 text-left font-medium">本周趋势</th>
                    <th class="px-4 py-3 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in filteredUsers"
                    :key="user.id"
                    class="border-b transition-colors"
                    :style="{ borderBottom: '1px solid var(--border-light)' }"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          :style="{ background: user.avatarColor }">
                          {{ user.name.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-medium text-sm">{{ user.name }}</div>
                          <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                            入组 {{ user.daysInGroup }} 天
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center">
                        <div
                          class="w-3 h-3 rounded-full"
                          :style="{ background: user.todayCompleted ? '#10b981' : '#ef4444' }"
                        ></div>
                        <span class="text-xs ml-2" :style="{ color: 'var(--text-secondary)' }">
                          {{ user.todayCompleted ? '已完成' : '未完成' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-sm font-bold"
                        :style="{
                          color: user.completionRate >= 80 ? '#10b981' :
                                 user.completionRate >= 60 ? '#f59e0b' : '#ef4444'
                        }">
                        {{ user.completionRate }}%
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded"
                        :style="{
                          background: user.tasks.mealUploaded ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: user.tasks.mealUploaded ? '#10b981' : '#ef4444'
                        }">
                        {{ user.tasks.mealUploaded ? '已上传' : '未上传' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded"
                        :style="{
                          background: user.tasks.caloriesOnTarget ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: user.tasks.caloriesOnTarget ? '#10b981' : '#f59e0b'
                        }">
                        {{ user.tasks.caloriesOnTarget ? '达标' : '超标' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs">{{ user.tasks.habitsCompleted }}/{{ user.tasks.totalHabits }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <!-- Weekly Trend Mini Chart -->
                      <div class="flex items-end gap-0.5 h-6">
                        <div
                          v-for="(day, index) in user.weeklyTrend"
                          :key="index"
                          class="flex-1 rounded-t"
                          :style="{
                            height: `${day}%`,
                            background: day >= 80 ? '#10b981' : day >= 50 ? '#f59e0b' : '#ef4444',
                            opacity: day === 0 ? 0.3 : 1
                          }"
                        ></div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        @click="viewUserDetail(user)"
                        class="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        :style="{
                          background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                          color: isBlackGold ? '#B8860B' : '#4f46e5'
                        }"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
  Users,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  UserCircle,
  BarChart3,
  PieChart,
  Trophy,
  ArrowLeft,
  MessageSquare,
  Settings
} from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import Toast from '../components/shared/Toast.vue'

const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

// Time filter tabs
const timeTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' }
]

const timeFilter = ref('today')
const searchQuery = ref('')
const sortBy = ref('completionRate')
const selectedCoach = ref<Coach | null>(null)
const userFilter = ref('all')

// Types
interface Coach {
  id: string
  name: string
  avatarColor: string
  role: 'mentor' | 'apprentice' | 'coach'
  roleLabel: string
  groupName?: string
  userCount: number
  todayActive: number
  completionRate: number
  completionTrend: number
  load: number
  maxLoad: number
  loadRate: number
  status: 'active' | 'inactive'
  avgResponseTime: number
  users: CoachUser[]
}

interface CoachUser {
  id: string
  name: string
  avatarColor: string
  todayCompleted: boolean
  completionRate: number
  daysInGroup: number
  tasks: {
    mealUploaded: boolean
    caloriesOnTarget: boolean
    habitsCompleted: number
    totalHabits: number
  }
  weeklyTrend: number[]
}

// Mock data - coaches
const coaches = ref<Coach[]>([
  {
    id: 'c1',
    name: '张伟',
    avatarColor: '#4f46e5',
    role: 'mentor',
    roleLabel: '总教练',
    groupName: '冠军战队',
    userCount: 25,
    todayActive: 22,
    completionRate: 88,
    completionTrend: 5,
    load: 23,
    maxLoad: 25,
    loadRate: 0.92,
    status: 'active',
    avgResponseTime: 8,
    users: [
      { id: 'u1', name: '王芳', avatarColor: '#ec4899', todayCompleted: true, completionRate: 92, daysInGroup: 45, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 100, 100, 85, 100, 90, 100] },
      { id: 'u2', name: '李明', avatarColor: '#f59e0b', todayCompleted: true, completionRate: 85, daysInGroup: 30, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [80, 90, 85, 100, 75, 80, 85] },
      { id: 'u3', name: '赵丽', avatarColor: '#10b981', todayCompleted: false, completionRate: 72, daysInGroup: 15, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 1, totalHabits: 4 }, weeklyTrend: [60, 70, 65, 50, 0, 55, 0] },
      { id: 'u4', name: '孙强', avatarColor: '#8b5cf6', todayCompleted: true, completionRate: 95, daysInGroup: 60, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 100, 95, 100, 100, 100, 100] },
      { id: 'u5', name: '周杰', avatarColor: '#ef4444', todayCompleted: true, completionRate: 78, daysInGroup: 22, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 70, 85, 90, 75, 80] }
    ]
  },
  {
    id: 'c2',
    name: '刘洋',
    avatarColor: '#10b981',
    role: 'apprentice',
    roleLabel: '实习教练',
    groupName: '冠军战队',
    userCount: 8,
    todayActive: 6,
    completionRate: 75,
    completionTrend: 8,
    load: 6,
    maxLoad: 10,
    loadRate: 0.6,
    status: 'active',
    avgResponseTime: 12,
    users: [
      { id: 'u6', name: '陈静', avatarColor: '#f472b6', todayCompleted: true, completionRate: 88, daysInGroup: 20, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [85, 90, 88, 100, 92, 85, 90] },
      { id: 'u7', name: '吴磊', avatarColor: '#06b6d4', todayCompleted: false, completionRate: 65, daysInGroup: 10, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 2, totalHabits: 4 }, weeklyTrend: [50, 60, 55, 70, 0, 65, 0] },
      { id: 'u8', name: '郑华', avatarColor: '#84cc16', todayCompleted: true, completionRate: 82, daysInGroup: 35, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [80, 85, 82, 90, 75, 80, 85] }
    ]
  },
  {
    id: 'c3',
    name: '王芳',
    avatarColor: '#ec4899',
    role: 'coach',
    roleLabel: '教练',
    groupName: '健康小分队',
    userCount: 18,
    todayActive: 15,
    completionRate: 82,
    completionTrend: -2,
    load: 16,
    maxLoad: 20,
    loadRate: 0.8,
    status: 'active',
    avgResponseTime: 10,
    users: [
      { id: 'u9', name: '林峰', avatarColor: '#f59e0b', todayCompleted: true, completionRate: 90, daysInGroup: 50, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 95, 100, 100, 90, 100, 100] },
      { id: 'u10', name: '郭敏', avatarColor: '#8b5cf6', todayCompleted: true, completionRate: 78, daysInGroup: 25, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 78, 85, 70, 75, 80] },
      { id: 'u11', name: '黄涛', avatarColor: '#ef4444', todayCompleted: false, completionRate: 55, daysInGroup: 8, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 1, totalHabits: 4 }, weeklyTrend: [40, 50, 45, 30, 0, 35, 0] }
    ]
  },
  {
    id: 'c4',
    name: '李明',
    avatarColor: '#f59e0b',
    role: 'coach',
    roleLabel: '教练',
    groupName: '减脂达人组',
    userCount: 15,
    todayActive: 12,
    completionRate: 79,
    completionTrend: 3,
    load: 14,
    maxLoad: 20,
    loadRate: 0.7,
    status: 'active',
    avgResponseTime: 11,
    users: [
      { id: 'u12', name: '梁晨', avatarColor: '#06b6d4', todayCompleted: true, completionRate: 86, daysInGroup: 40, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [85, 90, 86, 100, 80, 85, 90] },
      { id: 'u13', name: '谢琳', avatarColor: '#ec4899', todayCompleted: true, completionRate: 75, daysInGroup: 18, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [70, 75, 72, 80, 65, 70, 75] }
    ]
  },
  {
    id: 'c5',
    name: '陈静',
    avatarColor: '#f472b6',
    role: 'apprentice',
    roleLabel: '实习教练',
    groupName: '冠军战队',
    userCount: 5,
    todayActive: 3,
    completionRate: 68,
    completionTrend: -5,
    load: 4,
    maxLoad: 10,
    loadRate: 0.4,
    status: 'inactive',
    avgResponseTime: 18,
    users: [
      { id: 'u14', name: '唐宇', avatarColor: '#10b981', todayCompleted: true, completionRate: 80, daysInGroup: 28, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 78, 85, 70, 75, 80] },
      { id: 'u15', name: '邓超', avatarColor: '#f59e0b', todayCompleted: false, completionRate: 52, daysInGroup: 5, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 0, totalHabits: 4 }, weeklyTrend: [30, 40, 35, 0, 0, 25, 0] }
    ]
  }
])

// KPI Data
const kpiData = computed(() => {
  const totalCoaches = coaches.value.length
  const activeCoaches = coaches.value.filter(c => c.status === 'active').length
  const probationCoaches = coaches.value.filter(c => c.role === 'apprentice').length
  const avgCompletionRate = Math.round(coaches.value.reduce((sum, c) => sum + c.completionRate, 0) / totalCoaches)
  const topPerformers = coaches.value.filter(c => c.completionRate >= 85).length
  const totalUsers = coaches.value.reduce((sum, c) => sum + c.userCount, 0)
  const todayActiveUsers = coaches.value.reduce((sum, c) => sum + c.todayActive, 0)
  const attentionNeeded = coaches.value.filter(c => c.completionRate < 60).length

  return {
    totalCoaches,
    activeCoaches,
    probationCoaches,
    avgCompletionRate,
    completionTrend: 5, // Mock trend data
    topPerformers,
    totalUsers,
    todayActiveUsers,
    attentionNeeded
  }
})

// Trend data for chart
const trendData = computed(() => {
  if (timeFilter.value === 'today') {
    return [
      { label: '6:00', overall: 45, top: 80 },
      { label: '9:00', overall: 65, top: 90 },
      { label: '12:00', overall: 72, top: 95 },
      { label: '15:00', overall: 78, top: 92 },
      { label: '18:00', overall: 85, top: 100 },
      { label: '21:00', overall: 88, top: 100 }
    ]
  } else if (timeFilter.value === 'week') {
    return [
      { label: '周一', overall: 75, top: 88 },
      { label: '周二', overall: 78, top: 90 },
      { label: '周三', overall: 72, top: 85 },
      { label: '周四', overall: 80, top: 92 },
      { label: '周五', overall: 85, top: 95 },
      { label: '周六', overall: 82, top: 90 },
      { label: '周日', overall: 88, top: 100 }
    ]
  } else {
    return [
      { label: '第1周', overall: 70, top: 85 },
      { label: '第2周', overall: 75, top: 88 },
      { label: '第3周', overall: 78, top: 90 },
      { label: '第4周', overall: 82, top: 95 }
    ]
  }
})

// Task distribution
const taskDistribution = computed(() => [
  { name: '饮食上传', rate: 85, color: '#4f46e5' },
  { name: '热量达标', rate: 72, color: '#f59e0b' },
  { name: '营养均衡', rate: 68, color: '#10b981' },
  { name: '习惯打卡', rate: 80, color: '#8b5cf6' }
])

// Sorted and filtered coaches
const sortedCoaches = computed(() => {
  let filtered = coaches.value

  // Apply search
  if (searchQuery.value) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'completionRate':
        return b.completionRate - a.completionRate
      case 'userCount':
        return b.userCount - a.userCount
      case 'todayActive':
        return b.todayActive - a.todayActive
      case 'loadRate':
        return b.loadRate - a.loadRate
      default:
        return 0
    }
  })

  return sorted
})

// Filtered users for selected coach
const filteredUsers = computed(() => {
  if (!selectedCoach.value) return []

  let users = selectedCoach.value.users

  switch (userFilter.value) {
    case 'completed':
      return users.filter(u => u.todayCompleted)
    case 'pending':
      return users.filter(u => !u.todayCompleted)
    case 'behind':
      return users.filter(u => u.completionRate < 70)
    default:
      return users
  }
})

// Methods
const viewCoachDetails = (coach: Coach) => {
  selectedCoach.value = coach
}

const viewUserDetail = (user: CoachUser) => {
  toastRef.value?.showSuccess(`查看用户 ${user.name} 的详情`)
}

const exportData = () => {
  // Mock export functionality
  toastRef.value?.showSuccess('报表导出成功')
}
</script>
