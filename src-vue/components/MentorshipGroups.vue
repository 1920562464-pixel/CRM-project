<template>
  <div class="space-y-6">
    <!-- 组排行榜 -->
    <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Trophy :size="24" />
          师徒组排行榜
        </h2>
        <div class="text-sm opacity-90">
          总分 = 负载率×30 + 平均绩效×0.7
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="(group, index) in rankedGroups.slice(0, 3)"
          :key="group.id"
          :class="[
            'bg-white/10 backdrop-blur-sm rounded-lg p-4',
            index === 0 ? 'ring-2 ring-yellow-400' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-slate-300 text-slate-700' :
                'bg-orange-400 text-orange-900'
              ]"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-bold">{{ group.name }}</div>
              <div class="text-xs opacity-90">{{ group.mentorName }}</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold">{{ group.totalScore.toFixed(1) }}</div>
              <div class="text-xs opacity-90">总分</div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div class="text-center">
              <div class="opacity-75">成员</div>
              <div class="font-bold">{{ group.memberCount }}</div>
            </div>
            <div class="text-center">
              <div class="opacity-75">负载率</div>
              <div class="font-bold">{{ (group.loadRate * 100).toFixed(0) }}%</div>
            </div>
            <div class="text-center">
              <div class="opacity-75">绩效</div>
              <div class="font-bold">{{ group.avgPerformance.toFixed(0) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">师徒组数</div>
            <div class="text-2xl font-bold">{{ groups.length }}</div>
          </div>
          <Users :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">师傅人数</div>
            <div class="text-2xl font-bold">{{ statistics.mentorCount }}</div>
          </div>
          <UserCheck :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">徒弟总数</div>
            <div class="text-2xl font-bold">{{ statistics.apprenticeCount }}</div>
          </div>
          <HeartHandshake :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">平均负载率</div>
            <div class="text-2xl font-bold">{{ averageLoadRate }}%</div>
          </div>
          <TrendingUp :size="24" class="opacity-80" />
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索师傅或徒弟..."
              class="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 添加师徒关系按钮 -->
          <button
            @click="openAddRelationshipModal"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus :size="16" />
            添加师徒关系
          </button>
        </div>
      </div>
    </div>

    <!-- 师徒组列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="group in filteredGroups"
        :key="group.mentor.id"
        class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        @click="viewGroupDetails(group)"
      >
        <!-- 师傅信息 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                {{ group.mentor.name.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900">{{ group.groupName || group.mentor.name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">师傅</span>
                </div>
                <div class="text-xs text-slate-600 mt-0.5">
                  {{ group.mentor.position }} | 负载: {{ group.mentor.currentLoad }}/{{ group.mentor.maxLoad }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2" @click.stop>
              <button
                @click="editGroupName(group.mentor)"
                class="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                title="修改组名"
              >
                <Edit3 :size="14" />
              </button>
              <button
                @click="viewGroupDetails(group)"
                class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="查看组详情"
              >
                <Eye :size="14" />
              </button>
            </div>
          </div>

          <!-- 组统计 -->
          <div class="mt-3 grid grid-cols-4 gap-2 text-center">
            <div class="bg-white/50 rounded p-2">
              <div class="text-lg font-bold text-purple-600">{{ group.totalLoad }}</div>
              <div class="text-xs text-slate-600">总负载</div>
            </div>
            <div class="bg-white/50 rounded p-2">
              <div class="text-lg font-bold text-pink-600">{{ group.totalMaxLoad }}</div>
              <div class="text-xs text-slate-600">总容量</div>
            </div>
            <div class="bg-white/50 rounded p-2">
              <div class="text-lg font-bold text-cyan-600">{{ (group.loadRate * 100).toFixed(0) }}%</div>
              <div class="text-xs text-slate-600">负载率</div>
            </div>
            <div class="bg-white/50 rounded p-2">
              <div class="text-lg font-bold text-amber-600">{{ group.avgPerformance.toFixed(0) }}</div>
              <div class="text-xs text-slate-600">平均绩效</div>
            </div>
          </div>
        </div>

        <!-- 徒弟列表 -->
        <div class="divide-y divide-slate-100">
          <div
            v-for="apprentice in group.apprentices"
            :key="apprentice.employee.id"
            class="p-3 hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center font-medium text-pink-700 text-sm">
                  {{ apprentice.employee.name.charAt(0) }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-900 text-sm">{{ apprentice.employee.name }}</span>
                    <span class="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">徒弟</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    {{ apprentice.employee.position }} | 绩效: {{ apprentice.employee.performanceScore || 0 }} | 负载: {{ apprentice.employee.currentLoad }}/{{ apprentice.employee.maxLoad }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- 操作按钮 -->
                <div class="flex items-center gap-1" @click.stop>
                  <button
                    @click="editRelationship(apprentice.relationship)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="查看详情"
                  >
                    <Eye :size="14" />
                  </button>
                  <button
                    @click="updateProgress(apprentice.relationship)"
                    class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="更新进度"
                  >
                    <TrendingUp :size="14" />
                  </button>
                  <button
                    @click="confirmEndRelationship(apprentice.relationship)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="结束关系"
                  >
                    <X :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="group.apprentices.length === 0" class="p-4 text-center text-slate-400 text-sm">
            暂无徒弟
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGroups.length === 0" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
        <Users :size="32" />
      </div>
      <p class="text-lg font-medium text-slate-600">暂无师徒组</p>
      <p class="text-sm text-slate-400 mt-1">点击"添加师徒关系"按钮创建第一个师徒组</p>
    </div>

    <!-- 添加师徒关系模态框 -->
    <Modal v-model:show="showAddModal" title="添加师徒关系" size="lg">
      <form @submit.prevent="handleAddRelationship" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择师傅 *</label>
          <select
            v-model="relationshipForm.mentorId"
            required
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">请选择师傅</option>
            <option v-for="mentor in availableMentors" :key="mentor.id" :value="mentor.id">
              {{ mentor.name }} - {{ mentor.position }} ({{ mentor.groupName || '未命名战队' }}, 当前带 {{ mentor.apprentices?.length || 0 }} 个徒弟)
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择徒弟 *</label>
          <select
            v-model="relationshipForm.apprenticeId"
            required
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">请选择徒弟</option>
            <option v-for="apprentice in availableApprentices" :key="apprentice.id" :value="apprentice.id">
              {{ apprentice.name }} - {{ apprentice.position }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">培训目标</label>
          <textarea
            v-model="relationshipForm.trainingGoals"
            rows="3"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="描述该徒弟的培训目标..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showAddModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleAddRelationship"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          添加关系
        </button>
      </template>
    </Modal>

    <!-- 修改组名模态框 -->
    <Modal v-model:show="showGroupNameModal" title="修改组名" size="md">
      <div v-if="selectedMentor" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">师傅</label>
          <div class="text-slate-900 font-medium">{{ selectedMentor.name }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">组名 *</label>
          <input
            v-model="groupNameForm.name"
            type="text"
            required
            maxlength="20"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="给您的师徒组起个响亮的名字..."
          />
          <div class="text-xs text-slate-500 mt-1">{{ groupNameForm.name.length }}/20</div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showGroupNameModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleUpdateGroupName"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          保存
        </button>
      </template>
    </Modal>

    <!-- 更新进度模态框 -->
    <Modal v-model:show="showProgressModal" title="更新培训进度" size="md">
      <div v-if="selectedRelationship" class="space-y-4">
        <div class="bg-slate-50 rounded-lg p-3">
          <div class="text-sm text-slate-600">
            <span class="font-medium">师傅:</span> {{ selectedRelationship.mentorName }}
          </div>
          <div class="text-sm text-slate-600 mt-1">
            <span class="font-medium">徒弟:</span> {{ selectedRelationship.apprenticeName }}
          </div>
          <div v-if="selectedRelationship.trainingGoals" class="text-sm text-slate-600 mt-1">
            <span class="font-medium">目标:</span> {{ selectedRelationship.trainingGoals }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">培训进度 (0-100%)</label>
          <input
            v-model.number="progressForm.progress"
            type="number"
            min="0"
            max="100"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="progressForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="添加培训备注..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showProgressModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleUpdateProgress"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          保存
        </button>
      </template>
    </Modal>

    <!-- 关系详情模态框 -->
    <Modal v-model:show="showDetailModal" title="师徒关系详情" size="lg">
      <div v-if="selectedRelationship" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="text-xs text-purple-600 mb-1">师傅</div>
            <div class="font-semibold text-slate-900">{{ selectedRelationship.mentorName }}</div>
          </div>
          <div class="bg-pink-50 rounded-lg p-3">
            <div class="text-xs text-pink-600 mb-1">徒弟</div>
            <div class="font-semibold text-slate-900">{{ selectedRelationship.apprenticeName }}</div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">开始日期:</span>
            <span class="font-medium text-slate-900">{{ selectedRelationship.startDate }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">状态:</span>
            <span
              :class="[
                'px-2 py-0.5 rounded text-xs font-semibold',
                selectedRelationship.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
              ]"
            >
              {{ selectedRelationship.status === 'active' ? '活跃' : '已结束' }}
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">培训进度:</span>
            <span class="font-medium text-slate-900">{{ selectedRelationship.progress || 0 }}%</span>
          </div>
          <div v-if="selectedRelationship.trainingGoals" class="flex justify-between text-sm">
            <span class="text-slate-600">培训目标:</span>
            <span class="font-medium text-slate-900 text-right max-w-xs">{{ selectedRelationship.trainingGoals }}</span>
          </div>
          <div v-if="selectedRelationship.endDate" class="flex justify-between text-sm">
            <span class="text-slate-600">结束日期:</span>
            <span class="font-medium text-slate-900">{{ selectedRelationship.endDate }}</span>
          </div>
          <div v-if="selectedRelationship.notes" class="flex justify-between text-sm">
            <span class="text-slate-600">备注:</span>
            <span class="font-medium text-slate-900 text-right max-w-xs">{{ selectedRelationship.notes }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showDetailModal = false"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          关闭
        </button>
      </template>
    </Modal>

    <!-- 师徒组详情模态框 -->
    <Modal v-model:show="showGroupDetailModal" title="师徒组详情" size="xl">
      <div v-if="selectedGroup" class="space-y-6">
        <!-- 组基本信息 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl">
                {{ selectedGroup.mentor.name.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-2xl font-bold text-slate-900">{{ selectedGroup.groupName || selectedGroup.mentor.name }}</h3>
                  <span class="px-3 py-1 rounded bg-purple-100 text-purple-700 text-sm">师傅</span>
                </div>
                <div class="text-slate-600 mt-1">
                  {{ selectedGroup.mentor.position }} | {{ selectedGroup.mentor.phone }}
                </div>
              </div>
            </div>
          </div>

          <!-- 组统计 -->
          <div class="mt-4 grid grid-cols-5 gap-4">
            <div class="bg-white/60 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ selectedGroup.apprentices.length + 1 }}</div>
              <div class="text-xs text-slate-600 mt-1">成员总数</div>
            </div>
            <div class="bg-white/60 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ selectedGroup.totalLoad }}</div>
              <div class="text-xs text-slate-600 mt-1">总负载</div>
            </div>
            <div class="bg-white/60 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-pink-600">{{ selectedGroup.totalMaxLoad }}</div>
              <div class="text-xs text-slate-600 mt-1">总容量</div>
            </div>
            <div class="bg-white/60 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-cyan-600">{{ (selectedGroup.loadRate * 100).toFixed(0) }}%</div>
              <div class="text-xs text-slate-600 mt-1">负载率</div>
            </div>
            <div class="bg-white/60 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-amber-600">{{ selectedGroup.avgPerformance.toFixed(0) }}</div>
              <div class="text-xs text-slate-600 mt-1">平均绩效</div>
            </div>
          </div>
        </div>

        <!-- 师傅详细信息 -->
        <div>
          <h4 class="text-lg font-semibold text-slate-900 mb-3">师傅信息</h4>
          <div class="bg-white border border-slate-200 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-600">姓名:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.name }}</span>
              </div>
              <div>
                <span class="text-slate-600">职位:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.position }}</span>
              </div>
              <div>
                <span class="text-slate-600">部门:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.department }}</span>
              </div>
              <div>
                <span class="text-slate-600">聘用类型:</span>
                <span class="ml-2 font-medium text-slate-900">
                  {{ selectedGroup.mentor.employmentType === 'full_time' ? '全职' :
                     selectedGroup.mentor.employmentType === 'part_time' ? '兼职' :
                     selectedGroup.mentor.employmentType === 'contract' ? '合同工' : '实习生' }}
                </span>
              </div>
              <div>
                <span class="text-slate-600">当前负载:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.currentLoad }}/{{ selectedGroup.mentor.maxLoad }}</span>
              </div>
              <div>
                <span class="text-slate-600">绩效分数:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.performanceScore || 0 }}</span>
              </div>
              <div>
                <span class="text-slate-600">入职日期:</span>
                <span class="ml-2 font-medium text-slate-900">{{ selectedGroup.mentor.hireDate }}</span>
              </div>
              <div>
                <span class="text-slate-600">在职状态:</span>
                <span class="ml-2 font-medium text-slate-900">
                  {{ selectedGroup.mentor.status === 'regular' ? '正式员工' :
                     selectedGroup.mentor.status === 'probation' ? '试用期' :
                     selectedGroup.mentor.status === 'resigned' ? '已离职' : '休假中' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 徒弟列表 -->
        <div>
          <h4 class="text-lg font-semibold text-slate-900 mb-3">徒弟列表 ({{ selectedGroup.apprentices.length }}人)</h4>
          <div v-if="selectedGroup.apprentices.length > 0" class="space-y-3">
            <div
              v-for="apprentice in selectedGroup.apprentices"
              :key="apprentice.employee.id"
              class="bg-white border border-slate-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center font-bold text-pink-700">
                    {{ apprentice.employee.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-slate-900">{{ apprentice.employee.name }}</span>
                      <span class="text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-700">徒弟</span>
                    </div>
                    <div class="text-sm text-slate-600 mt-1">
                      {{ apprentice.employee.position }} | {{ apprentice.employee.department }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 徒弟详细信息 -->
              <div class="mt-4 grid grid-cols-4 gap-3 text-sm">
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-slate-600 text-xs">负载</div>
                  <div class="font-medium text-slate-900">{{ apprentice.employee.currentLoad }}/{{ apprentice.employee.maxLoad }}</div>
                </div>
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-slate-600 text-xs">绩效</div>
                  <div class="font-medium text-slate-900">{{ apprentice.employee.performanceScore || 0 }}</div>
                </div>
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-slate-600 text-xs">入职日期</div>
                  <div class="font-medium text-slate-900">{{ apprentice.employee.hireDate }}</div>
                </div>
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-slate-600 text-xs">培训进度</div>
                  <div class="font-medium text-slate-900">{{ apprentice.relationship.progress || 0 }}%</div>
                </div>
              </div>

              <!-- 培训信息 -->
              <div v-if="apprentice.relationship.trainingGoals" class="mt-3 bg-purple-50 rounded p-2">
                <div class="text-xs text-purple-600">培训目标</div>
                <div class="text-sm text-slate-900 mt-1">{{ apprentice.relationship.trainingGoals }}</div>
              </div>
            </div>
          </div>
          <div v-else class="bg-slate-50 rounded-lg p-8 text-center text-slate-400">
            暂无徒弟
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showGroupDetailModal = false"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          关闭
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users, UserCheck, HeartHandshake, Search, Plus, Eye, TrendingUp, X, Edit3, Trophy
} from 'lucide-vue-next'
import { useHRManagement } from '../composables/useHRManagement'
import { useToast } from '../composables/useToast'
import Modal from './shared/Modal.vue'
import type { CoachingRelationship, HREmployee } from '../types'

const toast = useToast()
const {
  getAllMentors,
  getAllApprentices,
  getAllCoachingRelationships,
  getActiveRelationships,
  getApprenticesByMentor,
  createCoachingRelationship,
  endCoachingRelationship,
  updateTrainingProgress,
  getHRStatistics,
  getAllMentorshipGroups,
  getGroupRankings,
  updateGroupName
} = useHRManagement()

// 搜索查询
const searchQuery = ref('')

// 模态框状态
const showAddModal = ref(false)
const showProgressModal = ref(false)
const showDetailModal = ref(false)
const showGroupNameModal = ref(false)
const showGroupDetailModal = ref(false)

// 选中的关系和师傅
const selectedRelationship = ref<CoachingRelationship | undefined>()
const selectedMentor = ref<HREmployee | undefined>()
const selectedGroup = ref<MentorshipGroupDisplay | undefined>()

// 表单数据
const relationshipForm = ref({
  mentorId: '',
  apprenticeId: '',
  trainingGoals: ''
})

const groupNameForm = ref({
  name: ''
})

const progressForm = ref({
  progress: 0,
  notes: ''
})

// 统计数据
const statistics = ref(getHRStatistics())

// 所有师徒关系
const allRelationships = getAllCoachingRelationships()

// 师徒组数据
interface MentorshipGroupDisplay {
  mentor: HREmployee
  groupName: string | undefined
  apprentices: Array<{
    employee: HREmployee
    relationship: CoachingRelationship
  }>
  totalLoad: number
  totalMaxLoad: number
  loadRate: number
  avgPerformance: number
}

// 计算师徒组列表
const groups = computed<MentorshipGroupDisplay[]>(() => {
  const mentors = getAllMentors()
  const relationships = getActiveRelationships()

  return mentors.map(mentor => {
    const apprenticeIds = mentor.apprentices || []
    const apprentices = apprenticeIds.map(apprenticeId => {
      const relationship = relationships.find(
        r => r.mentorId === mentor.id && r.apprenticeId === apprenticeId
      )
      return {
        employee: getAllApprentices().find(a => a.id === apprenticeId)!,
        relationship: relationship!
      }
    }).filter(item => item.employee && item.relationship)

    const allMembers = [mentor, ...apprentices.map(a => a.employee)]
    const totalLoad = allMembers.reduce((sum, e) => sum + e.currentLoad, 0)
    const totalMaxLoad = allMembers.reduce((sum, e) => sum + e.maxLoad, 0)
    const loadRate = totalMaxLoad > 0 ? totalLoad / totalMaxLoad : 0
    const avgPerformance = allMembers.length > 0
      ? allMembers.reduce((sum, e) => sum + (e.performanceScore || 0), 0) / allMembers.length
      : 0

    return {
      mentor,
      groupName: mentor.groupName,
      apprentices,
      totalLoad,
      totalMaxLoad,
      loadRate,
      avgPerformance
    }
  }).filter(group => group.mentor.role === 'mentor')
})

// 排名后的组（用于排行榜）
const rankedGroups = computed(() => {
  return getGroupRankings()
})

// 平均负载率
const averageLoadRate = computed(() => {
  if (groups.value.length === 0) return 0
  const totalLoadRate = groups.value.reduce((sum, g) => sum + g.loadRate, 0)
  return (totalLoadRate / groups.value.length * 100).toFixed(0)
})

// 过滤后的师徒组
const filteredGroups = computed(() => {
  if (!searchQuery.value) return groups.value

  const query = searchQuery.value.toLowerCase()
  return groups.value.filter(group => {
    // 搜索组名
    if (group.groupName?.toLowerCase().includes(query)) return true
    // 搜索师傅名称
    if (group.mentor.name?.toLowerCase().includes(query)) return true
    // 搜索徒弟名称
    return group.apprentices.some(a =>
      a.employee.name?.toLowerCase().includes(query)
    )
  })
})

// 可用的师傅（用于添加关系）
const availableMentors = computed(() => {
  return getAllMentors()
})

// 可用的徒弟（还没有师傅或关系已结束的徒弟）
const availableApprentices = computed(() => {
  const activeRelationships = getActiveRelationships()
  const activeApprenticeIds = activeRelationships.map(r => r.apprenticeId)

  return getAllApprentices().filter(apprentice => {
    // 徒弟没有活跃的师徒关系
    return !activeApprenticeIds.includes(apprentice.id) || !apprentice.mentorId
  })
})

// 打开添加关系模态框
const openAddRelationshipModal = () => {
  relationshipForm.value = {
    mentorId: '',
    apprenticeId: '',
    trainingGoals: ''
  }
  showAddModal.value = true
}

// 处理添加关系
const handleAddRelationship = () => {
  if (!relationshipForm.value.mentorId || !relationshipForm.value.apprenticeId) {
    toast.error('操作失败', '请选择师傅和徒弟')
    return
  }

  const result = createCoachingRelationship(
    relationshipForm.value.mentorId,
    relationshipForm.value.apprenticeId,
    relationshipForm.value.trainingGoals || undefined
  )

  if (result) {
    toast.success('添加成功', '师徒关系已建立')
    showAddModal.value = false
    statistics.value = getHRStatistics()
  } else {
    toast.error('添加失败', '建立师徒关系失败，可能已存在关系或员工不存在')
  }
}

// 修改组名
const editGroupName = (mentor: HREmployee) => {
  selectedMentor.value = mentor
  groupNameForm.value.name = mentor.groupName || ''
  showGroupNameModal.value = true
}

// 处理更新组名
const handleUpdateGroupName = () => {
  if (!selectedMentor.value) return

  if (!groupNameForm.value.name.trim()) {
    toast.error('操作失败', '请输入组名')
    return
  }

  const success = updateGroupName(selectedMentor.value.id, groupNameForm.value.name.trim())
  if (success) {
    toast.success('修改成功', '组名已更新')
    showGroupNameModal.value = false
  } else {
    toast.error('修改失败', '更新组名失败')
  }
}

// 编辑关系
const editRelationship = (relationship: CoachingRelationship) => {
  selectedRelationship.value = relationship
  showDetailModal.value = true
}

// 更新进度
const updateProgress = (relationship: CoachingRelationship) => {
  selectedRelationship.value = relationship
  progressForm.value = {
    progress: relationship.progress || 0,
    notes: relationship.notes || ''
  }
  showProgressModal.value = true
}

// 处理更新进度
const handleUpdateProgress = () => {
  if (!selectedRelationship.value) return

  const success = updateTrainingProgress(
    selectedRelationship.value.id,
    progressForm.value.progress
  )

  if (success) {
    // 更新备注
    if (selectedRelationship.value && progressForm.value.notes) {
      selectedRelationship.value.notes = progressForm.value.notes
    }
    toast.success('更新成功', '培训进度已更新')
    showProgressModal.value = false
  } else {
    toast.error('更新失败', '更新培训进度失败')
  }
}

// 确认结束关系
const confirmEndRelationship = (relationship: CoachingRelationship) => {
  if (confirm(`确定要结束 ${relationship.mentorName} 和 ${relationship.apprenticeName} 的师徒关系吗？`)) {
    const success = endCoachingRelationship(relationship.id)
    if (success) {
      toast.success('关系已结束', '师徒关系已成功结束')
      statistics.value = getHRStatistics()
    } else {
      toast.error('操作失败', '结束师徒关系失败')
    }
  }
}

// 查看组详情
const viewGroupDetails = (group: MentorshipGroupDisplay) => {
  selectedGroup.value = group
  showGroupDetailModal.value = true
}

onMounted(() => {
  statistics.value = getHRStatistics()
})
</script>
