<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Toast -->
    <Toast ref="toastRef" />

    <!-- Top Controls -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <!-- Device Status & Actions -->
      <div class="flex items-center gap-3">
        <!-- Device Status Badge -->
        <div class="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
          <div
            class="w-2 h-2 rounded-full"
            :class="hasDevice ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"
          ></div>
          <span class="text-sm font-medium text-slate-700">
            {{ hasDevice ? '设备已连接' : '未绑定设备' }}
          </span>
          <span v-if="hasDevice" class="text-xs text-slate-500">{{ deviceName }}</span>
        </div>

        <!-- Sync Button -->
        <button
          v-if="hasDevice"
          @click="syncFromDevice"
          :disabled="isSyncing"
          class="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Watch :size="16" :class="{ 'animate-spin': isSyncing }" />
          <span>{{ isSyncing ? '同步中...' : '立即同步' }}</span>
        </button>

        <!-- Manual Entry Button -->
        <button
          @click="showManualEntryModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Edit3 :size="16" />
          <span>手动录入</span>
        </button>
      </div>

      <!-- Time Range Selector -->
      <div class="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-sm">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          @click="selectedTimeRange = range.value"
          :class="`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            selectedTimeRange === range.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
          }`"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Export & Report -->
      <div class="flex items-center gap-2">
        <button
          @click="exportData"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors"
        >
          <Download :size="16" />
          导出数据
        </button>
        <button
          @click="generateReport"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <FileText :size="16" />
          健康报告
        </button>
      </div>
    </div>

    <!-- Unified Dashboard -->
    <div class="space-y-6">
      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div v-for="stat in quickStats" :key="stat.id"
          class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          :class="stat.id === 'glucose' ? 'cursor-pointer hover:border-indigo-300 hover:shadow-lg' : ''"
          @click="stat.id === 'glucose' ? $router.push({ path: '/blood-glucose-detail', query: { from: 'health', clientId: props.clientId } }) : null">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg" :class="stat.bgColor">
              <component :is="stat.icon" :size="20" :class="stat.iconColor" />
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full"
              :class="stat.trend === 'down' ? 'bg-green-100 text-green-700' : stat.trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'">
              {{ stat.trendText }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-1">{{ stat.label }}</p>
          <p class="text-xl font-bold text-slate-900">{{ stat.value }} <span class="text-xs font-normal text-slate-500">{{ stat.unit }}</span></p>
          <p v-if="stat.target" class="text-[10px] text-slate-400 mt-1">目标: {{ stat.target }}{{ stat.unit }}</p>
          <div v-if="stat.id === 'glucose'" class="flex items-center gap-1 mt-2 text-[10px] text-indigo-600">
            <span>查看详情</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <!-- Weight & Body Fat Trend -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Scale :size="20" class="text-indigo-600" />
              体重 & 体脂趋势
            </h3>
            <p class="text-xs text-slate-500 mt-1">Agent 自动生成的阈值线已标记</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">最近7天</span>
            <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded cursor-pointer hover:bg-slate-200">本月</span>
          </div>
        </div>

        <!-- SVG Chart -->
        <div class="h-64 mb-6">
          <svg viewBox="0 0 600 200" class="w-full h-full">
            <!-- Grid Lines -->
            <line v-for="i in 5" :key="'grid-'+i"
              :x1="0" :y1="i * 40" :x2="600" :y2="i * 40"
              stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4"/>
            <!-- Weight Line -->
            <polyline
              :points="weightChartPoints"
              fill="none"
              stroke="#4D70FF"
              stroke-width="2"
              class="drop-shadow-sm"
            />
            <!-- Weight Points -->
            <circle v-for="(point, index) in weightData" :key="'weight-'+index"
              :cx="index * (600 / (weightData.length - 1))"
              :cy="200 - ((point.value - 80) / 10) * 200"
              r="4"
              fill="#4D70FF"
              class="hover:r-6 transition-all cursor-pointer"
            />
            <!-- Body Fat Line (secondary) -->
            <polyline
              :points="bodyFatChartPoints"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              stroke-dasharray="4"
              opacity="0.6"
            />
            <!-- Target Line -->
            <line x1="0" y1="120" x2="600" y2="120" stroke="#10b981" stroke-width="1" stroke-dasharray="8" opacity="0.5"/>
          </svg>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-3 h-0.5 bg-indigo-600"></div>
            <span class="text-slate-600">体重</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-0.5 bg-amber-500 border-dashed"></div>
            <span class="text-slate-600">体脂率</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-0.5 bg-emerald-500 border-dashed"></div>
            <span class="text-slate-600">目标线</span>
          </div>
        </div>
      </div>

      <!-- Blood Glucose Trend -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
        @click="$router.push({ path: '/blood-glucose-detail', query: { from: 'health', clientId: props.clientId } })">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Heart :size="20" class="text-red-500" />
              血糖趋势
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </h3>
            <p class="text-xs text-slate-500 mt-1">空腹 & 餐后2小时监测 · 点击查看详情</p>
          </div>
        </div>

        <div class="h-48">
          <svg viewBox="0 0 600 150" class="w-full h-full">
            <!-- Grid -->
            <line v-for="i in 4" :key="'ggrid-'+i"
              :x1="0" :y1="i * 37.5" :x2="600" :y2="i * 37.5"
              stroke="#e2e8f0" stroke-width="1"/>
            <!-- High threshold zone -->
            <rect x="0" y="0" width="600" height="40" fill="#fecaca" opacity="0.3"/>
            <!-- Normal zone -->
            <rect x="0" y="40" width="600" height="50" fill="#bbf7d0" opacity="0.3"/>
            <!-- Glucose Line -->
            <polyline
              :points="glucoseChartPoints"
              fill="none"
              stroke="#ef4444"
              stroke-width="2"
            />
            <!-- Points -->
            <circle v-for="(point, index) in glucoseData" :key="'glucose-'+index"
              :cx="index * (600 / (glucoseData.length - 1))"
              :cy="150 - ((point.value - 3) / 10) * 150"
              r="4"
              :fill="point.value > 7 ? '#ef4444' : point.value < 3.9 ? '#f59e0b' : '#10b981'"
              class="hover:r-6 transition-all cursor-pointer"
            />
          </svg>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div class="text-center">
            <p class="text-xs text-slate-500">空腹血糖</p>
            <p class="text-lg font-bold" :class="glucoseStats.fasting > 7 ? 'text-red-600' : 'text-green-600'">
              {{ glucoseStats.fasting }} <span class="text-xs font-normal">mmol/L</span>
            </p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">平均血糖</p>
            <p class="text-lg font-bold text-slate-900">{{ glucoseStats.average }} <span class="text-xs font-normal">mmol/L</span></p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">达标率</p>
            <p class="text-lg font-bold text-green-600">{{ glucoseStats.inRange }}%</p>
          </div>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 flex justify-center">
          <button
            @click.stop="$router.push({ path: '/blood-glucose-detail', query: { from: 'health', clientId: props.clientId } })"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <FileText :size="14" />
            查看详细报告
          </button>
        </div>
      </div>

      <!-- Blood Pressure & Heart Rate -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Activity :size="20" class="text-rose-500" />
            血压监测
          </h3>
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-3xl font-bold text-slate-900">
                {{ bpStats.systolic }}/<span class="text-2xl">{{ bpStats.diastolic }}</span>
              </p>
              <p class="text-xs text-slate-500">mmHg</p>
            </div>
            <div class="px-3 py-1 rounded-full text-xs font-bold"
              :class="bpStats.level === '正常' ? 'bg-green-100 text-green-700' :
                bpStats.level === '升高' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'">
              {{ bpStats.level }}
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">收缩压</span>
              <span class="font-medium" :class="bpStats.systolic > 140 ? 'text-red-600' : bpStats.systolic > 120 ? 'text-yellow-600' : 'text-green-600'">
                {{ bpStats.systolic }} mmHg
              </span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">舒张压</span>
              <span class="font-medium" :class="bpStats.diastolic > 90 ? 'text-red-600' : bpStats.diastolic > 80 ? 'text-yellow-600' : 'text-green-600'">
                {{ bpStats.diastolic }} mmHg
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Heart :size="20" class="text-pink-500" />
            心率监测
          </h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-4xl font-bold text-slate-900">{{ hrStats.resting }}</p>
              <p class="text-xs text-slate-500">静息心率 (bpm)</p>
            </div>
            <div class="w-20 h-20 rounded-full border-4 flex items-center justify-center"
              :class="hrStats.resting < 60 ? 'border-green-500' : hrStats.resting < 100 ? 'border-indigo-500' : 'border-red-500'">
              <span class="text-lg font-bold" :class="hrStats.resting < 60 ? 'text-green-600' : hrStats.resting < 100 ? 'text-indigo-600' : 'text-red-600'">
                {{ hrStats.level }}
              </span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">运动心率</span>
              <span class="font-medium text-slate-800">{{ hrStats.max }} bpm</span>
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span class="text-slate-500">目标心率区间</span>
              <span class="font-medium text-indigo-600">{{ hrStats.targetMin }}-{{ hrStats.targetMax }} bpm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body Measurements -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Ruler :size="20" class="text-purple-500" />
          围度记录
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="measurement in measurements" :key="measurement.id"
            class="p-4 rounded-lg border transition-all hover:shadow-sm"
            :class="measurement.change > 0 ? 'border-red-200 bg-red-50/50' : measurement.change < 0 ? 'border-green-200 bg-green-50/50' : 'border-slate-200'">
            <div class="flex items-center gap-2 mb-2">
              <component :is="measurement.icon" :size="16" class="text-slate-500" />
              <span class="text-xs text-slate-500">{{ measurement.label }}</span>
            </div>
            <p class="text-2xl font-bold text-slate-900">{{ measurement.value }} <span class="text-xs font-normal">cm</span></p>
            <p class="text-xs mt-1"
              :class="measurement.change > 0 ? 'text-red-600' : measurement.change < 0 ? 'text-green-600' : 'text-slate-400'">
              {{ measurement.change > 0 ? '+' : '' }}{{ measurement.change }} cm
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Combined Data Records (Manual + Device Sync) -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="font-bold text-slate-800">健康数据记录</h3>
          <!-- Data Source Stats -->
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full">
              📱 设备: {{ dataSourceStats.deviceCount }}
            </span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              ✏️ 手动: {{ dataSourceStats.manualCount }}
            </span>
            <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              自动化率: {{ dataSourceStats.automationRate }}%
            </span>
          </div>
        </div>
        <span class="text-xs text-slate-500">{{ filteredEntries.length }} 条记录</span>
      </div>
      <div class="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        <div v-for="entry in filteredEntries" :key="entry.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-4">
            <!-- Source Icon -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="entry.source === '设备' ? 'bg-green-100' : 'bg-blue-100'">
              <Watch v-if="entry.source === '设备'" :size="18" class="text-green-600" />
              <Edit3 v-else :size="18" class="text-blue-600" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-slate-800">{{ getLabel(entry.type) }}</p>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full"
                  :class="entry.source === '设备' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ entry.source }}
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ entry.date }} {{ entry.notes ? '· ' + entry.notes : '' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-slate-900">{{ entry.value }} <span class="text-xs font-normal text-slate-500">{{ entry.unit }}</span></p>
            <p v-if="entry.deviceName" class="text-xs text-slate-400">{{ entry.deviceName }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="editEntry(entry)"
              class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit3 :size="14" />
            </button>
            <button
              @click="deleteEntry(entry.id)"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredEntries.length === 0" class="p-8 text-center text-slate-400">
        <FileText :size="32" class="mx-auto mb-2 opacity-50" />
        <p>暂无记录，请手动录入或连接设备同步数据</p>
      </div>
    </div>

    <!-- Manual Entry Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showManualEntryModal"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          @click.self="showManualEntryModal = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit3 :size="20" class="text-blue-600" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-800">手动录入健康数据</h3>
                  <p class="text-xs text-slate-500">输入测量值和时间</p>
                </div>
              </div>
              <button
                @click="showManualEntryModal = false"
                class="text-slate-400 hover:text-slate-600 hover:bg-white p-1.5 rounded-lg transition-all"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Form -->
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">数据类型</label>
                <select v-model="entryType" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="weight">体重</option>
                  <option value="fat">体脂率</option>
                  <option value="glucose">血糖</option>
                  <option value="bp">血压</option>
                  <option value="hr">心率</option>
                  <option value="waist">腰围</option>
                  <option value="hip">臀围</option>
                </select>
              </div>

              <div v-if="entryType === 'bp'" class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">收缩压</label>
                  <input v-model="entryValue" type="number" placeholder="120" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">舒张压</label>
                  <input v-model="entryValue2" type="number" placeholder="80" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div v-else>
                <label class="block text-sm font-medium text-slate-700 mb-2">数值</label>
                <input v-model="entryValue" type="number" step="0.1" placeholder="请输入数值" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <p v-if="getValidationHint()" class="text-xs mt-1" :class="getValidationClass()">{{ getValidationHint() }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">记录时间</label>
                <input v-model="entryDate" type="datetime-local" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
                <input v-model="entryNotes" type="text" placeholder="选填，如：餐后、运动后等" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <!-- Footer -->
            <div class="flex gap-3 p-5 border-t border-slate-100 bg-slate-50">
              <button
                @click="showManualEntryModal = false"
                class="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-white transition-all text-sm"
              >
                取消
              </button>
              <button
                @click="handleAddEntry"
                :disabled="!entryValue || (entryType === 'bp' && !entryValue2)"
                class="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Health Report Modal -->
    <Teleport to="body">
      <div v-if="showReportModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showReportModal = false"></div>
      <div v-if="showReportModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-xl text-slate-800">健康分析报告</h3>
            <button @click="showReportModal = false" class="text-slate-400 hover:text-slate-600">
              <X :size="24" />
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-1">生成时间：{{ new Date().toLocaleString('zh-CN') }}</p>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
            <h4 class="font-bold text-slate-800 mb-2">综合评分</h4>
            <div class="flex items-center gap-4">
              <div class="text-4xl font-bold text-indigo-600">{{ healthScore }}</div>
              <div class="flex-1">
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full" :style="{ width: `${healthScore}%` }"></div>
                </div>
                <p class="text-xs text-slate-600 mt-1">{{ healthScore >= 80 ? '健康状况良好' : healthScore >= 60 ? '需要改善' : '需要关注' }}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-slate-800 mb-2">重点关注</h4>
            <div class="space-y-2">
              <div v-for="alert in healthAlerts" :key="alert" class="flex items-start gap-2 p-3 rounded-lg"
                :class="alert.type === 'danger' ? 'bg-red-50' : 'bg-amber-50'">
                <AlertTriangle :size="16" :class="alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'" />
                <p class="text-sm" :class="alert.type === 'danger' ? 'text-red-700' : 'text-amber-700'">{{ alert.message }}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-slate-800 mb-2">改善建议</h4>
            <ul class="space-y-2 text-sm text-slate-600">
              <li class="flex items-start gap-2">
                <CheckCircle2 :size="16" class="text-green-600 mt-0.5" />
                <span>继续保持良好的运动习惯，每周至少150分钟中等强度运动</span>
              </li>
              <li class="flex items-start gap-2">
                <CheckCircle2 :size="16" class="text-green-600 mt-0.5" />
                <span>建议控制晚餐碳水摄入，增加膳食纤维</span>
              </li>
              <li class="flex items-start gap-2">
                <CheckCircle2 :size="16" class="text-green-600 mt-0.5" />
                <span>保持规律作息，每晚23:00前入睡有助于代谢</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="p-4 border-t border-slate-100 flex gap-2">
          <button @click="downloadReport" class="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Download :size="16" /> 下载PDF报告
          </button>
          <button @click="showReportModal = false" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
            关闭
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'

// Props
interface Props {
  clientId?: string
}

const props = withDefaults(defineProps<Props>(), {
  clientId: ''
})
import {
  Activity,
  Scale,
  Edit3,
  Watch,
  Download,
  Heart,
  PlusCircle,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Ruler,
  X,
  TrendingDown,
  TrendingUp,
  Minus,
  Droplets
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'

interface Entry {
  id: number
  type: string
  value: string
  unit: string
  date: string
  source: string
  notes?: string
  deviceName?: string
}

const toastRef = ref<InstanceType<typeof Toast>>()
const selectedTimeRange = ref('7d')
const showReportModal = ref(false)
const showManualEntryModal = ref(false)
const isSyncing = ref(false)

// Device binding status
const hasDevice = ref(true) // 默认有设备
const deviceName = ref('Apple Watch')

const entryType = ref('weight')
const entryValue = ref('')
const entryValue2 = ref('')
const entryDate = ref(new Date().toISOString().slice(0, 16))
const entryNotes = ref('')

// Time ranges
const timeRanges = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' }
]

// Chart data (mock)
const weightData = ref([
  { date: '11-01', value: 85.2 },
  { date: '11-02', value: 84.9 },
  { date: '11-03', value: 84.7 },
  { date: '11-04', value: 84.5 },
  { date: '11-05', value: 84.3 },
  { date: '11-06', value: 84.2 },
  { date: '11-07', value: 84.0 }
])

const bodyFatData = ref([
  { date: '11-01', value: 28.5 },
  { date: '11-02', value: 28.4 },
  { date: '11-03', value: 28.2 },
  { date: '11-04', value: 28.0 },
  { date: '11-05', value: 27.9 },
  { date: '11-06', value: 27.8 },
  { date: '11-07', value: 27.8 }
])

const glucoseData = ref([
  { date: '11-01', value: 6.8 },
  { date: '11-02', value: 6.5 },
  { date: '11-03', value: 6.2 },
  { date: '11-04', value: 7.1 },
  { date: '11-05', value: 6.0 },
  { date: '11-06', value: 5.8 },
  { date: '11-07', value: 6.1 }
])

// Recent entries - merge device and manual data
const recentEntries = ref<Entry[]>([
  { id: 1, type: 'weight', value: '84.0', unit: 'kg', date: '2023-11-07 08:30', source: '手动录入', notes: '晨起空腹' },
  { id: 2, type: 'glucose', value: '6.1', unit: 'mmol/L', date: '2023-11-07 07:15', source: '手动录入', notes: '空腹' },
  { id: 3, type: 'bp', value: '125/82', unit: 'mmHg', date: '2023-11-07 08:00', source: '手动录入', notes: '' },
  { id: 4, type: 'weight', value: '83.8', unit: 'kg', date: '2023-11-06 08:00', source: '设备', deviceName: 'Apple Watch' },
  { id: 5, type: 'hr', value: '72', unit: 'bpm', date: '2023-11-06 10:30', source: '设备', deviceName: 'Apple Watch' }
])

// Filter entries by time range
const filteredEntries = computed(() => {
  const now = new Date()
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = daysMap[selectedTimeRange.value as keyof typeof daysMap] || 7

  return recentEntries.value.filter(entry => {
    const entryDate = new Date(entry.date.replace(/-/g, '/'))
    const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= days
  })
})

// Data source statistics
const dataSourceStats = computed(() => {
  const total = filteredEntries.value.length
  const deviceCount = filteredEntries.value.filter(e => e.source === '设备').length
  const manualCount = filteredEntries.value.filter(e => e.source === '手动录入').length
  const automationRate = total > 0 ? Math.round((deviceCount / total) * 100) : 0

  return {
    total,
    deviceCount,
    manualCount,
    automationRate
  }
})

// Computed chart points
const weightChartPoints = computed(() => {
  return weightData.value.map((point, index) => {
    const x = index * (600 / (weightData.value.length - 1))
    const y = 200 - ((point.value - 80) / 10) * 200
    return `${x},${y}`
  }).join(' ')
})

const bodyFatChartPoints = computed(() => {
  return bodyFatData.value.map((point, index) => {
    const x = index * (600 / (bodyFatData.value.length - 1))
    const y = 200 - ((point.value - 25) / 10) * 200
    return `${x},${y}`
  }).join(' ')
})

const glucoseChartPoints = computed(() => {
  return glucoseData.value.map((point, index) => {
    const x = index * (600 / (glucoseData.value.length - 1))
    const y = 150 - ((point.value - 3) / 10) * 150
    return `${x},${y}`
  }).join(' ')
})

// Quick stats
const quickStats = computed(() => [
  {
    id: 'weight',
    label: '当前体重',
    value: '84.0',
    unit: 'kg',
    target: '75',
    trend: 'down',
    trendText: '↓ 1.2kg',
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    icon: markRaw(Scale)
  },
  {
    id: 'fat',
    label: '体脂率',
    value: '27.8',
    unit: '%',
    target: '20',
    trend: 'down',
    trendText: '↓ 0.7%',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: markRaw(Activity)
  },
  {
    id: 'glucose',
    label: '血糖',
    value: glucoseStats.value.fasting,
    unit: 'mmol/L',
    target: '6.1',
    trend: parseFloat(glucoseStats.value.fasting) > 6.1 ? 'up' : 'stable',
    trendText: parseFloat(glucoseStats.value.fasting) > 6.1 ? '稍高' : '正常',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: markRaw(Droplets)
  },
  {
    id: 'bmi',
    label: 'BMI',
    value: '26.4',
    unit: '',
    target: '23',
    trend: 'stable',
    trendText: '稳定',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: markRaw(TrendingUp)
  },
  {
    id: 'goal',
    label: '目标完成',
    value: '68',
    unit: '%',
    target: '100',
    trend: 'up',
    trendText: '+5%',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    icon: markRaw(TrendingDown)
  }
])

// Glucose stats
const glucoseStats = computed(() => ({
  fasting: glucoseData.value[glucoseData.value.length - 1]?.value.toFixed(1) || '6.1',
  average: (glucoseData.value.reduce((sum, p) => sum + p.value, 0) / glucoseData.value.length).toFixed(1),
  inRange: Math.round((glucoseData.value.filter(p => p.value >= 3.9 && p.value <= 7).length / glucoseData.value.length) * 100)
}))

// BP stats
const bpStats = computed(() => ({
  systolic: 125,
  diastolic: 82,
  level: '正常'
}))

// HR stats
const hrStats = computed(() => ({
  resting: 68,
  max: 145,
  targetMin: 108,
  targetMax: 144,
  level: '优'
}))

// Measurements
const measurements = computed(() => [
  { id: 'waist', label: '腰围', value: '92', change: -2, icon: markRaw(Ruler) },
  { id: 'hip', label: '臀围', value: '102', change: -1, icon: markRaw(Ruler) },
  { id: 'chest', label: '胸围', value: '98', change: 0, icon: markRaw(Activity) },
  { id: 'thigh', label: '大腿围', value: '58', change: -1, icon: markRaw(Ruler) }
])

// Health score
const healthScore = computed(() => {
  let score = 100
  const weight = parseFloat(quickStats.value[0].value)
  const target = parseFloat(quickStats.value[0].target || '75')
  const progress = ((weight - 90) / (target - 90)) * 100
  score = Math.max(0, Math.min(100, progress))
  return Math.round(score)
})

const healthAlerts = computed(() => {
  const alerts: { type: string; message: string }[] = []
  if (parseFloat(glucoseStats.value.fasting) > 7) {
    alerts.push({ type: 'danger', message: '空腹血糖偏高，建议控制碳水摄入' })
  }
  if (bpStats.value.systolic > 130) {
    alerts.push({ type: 'warning', message: '血压略高，建议减少钠盐摄入' })
  }
  if (alerts.length === 0) {
    alerts.push({ type: 'success', message: '各项指标正常，继续保持！' })
  }
  return alerts
})

// Methods
const getUnit = (type: string) => {
  const units: Record<string, string> = {
    weight: 'kg',
    fat: '%',
    glucose: 'mmol/L',
    bp: 'mmHg',
    hr: 'bpm',
    waist: 'cm',
    hip: 'cm'
  }
  return units[type] || ''
}

const getLabel = (type: string) => {
  const labels: Record<string, string> = {
    weight: '体重',
    fat: '体脂率',
    glucose: '血糖',
    bp: '血压',
    hr: '心率',
    waist: '腰围',
    hip: '臀围'
  }
  return labels[type] || type
}

const getValidationHint = () => {
  const value = parseFloat(entryValue.value)
  if (!value) return ''

  const hints: Record<string, { min: number; max: number; message: string }> = {
    weight: { min: 30, max: 200, message: '正常范围: 30-200 kg' },
    fat: { min: 5, max: 50, message: '正常范围: 5-50%' },
    glucose: { min: 2, max: 30, message: '正常范围: 2-30 mmol/L' },
    hr: { min: 30, max: 220, message: '正常范围: 30-220 bpm' },
    waist: { min: 40, max: 150, message: '正常范围: 40-150 cm' },
    hip: { min: 50, max: 160, message: '正常范围: 50-160 cm' }
  }

  const hint = hints[entryType.value]
  if (!hint) return ''

  if (value < hint.min || value > hint.max) {
    return `⚠️ ${hint.message}`
  }
  return '✓ 数值在正常范围内'
}

const getValidationClass = () => {
  const value = parseFloat(entryValue.value)
  if (!value) return 'text-slate-400'

  const ranges: Record<string, { min: number; max: number }> = {
    weight: { min: 30, max: 200 },
    fat: { min: 5, max: 50 },
    glucose: { min: 2, max: 30 },
    hr: { min: 30, max: 220 },
    waist: { min: 40, max: 150 },
    hip: { min: 50, max: 160 }
  }

  const range = ranges[entryType.value]
  if (!range) return 'text-slate-400'

  if (value < range.min || value > range.max) {
    return 'text-amber-600'
  }
  return 'text-green-600'
}

const getEntryIcon = (type: string) => {
  const icons: Record<string, any> = {
    weight: markRaw(Scale),
    fat: markRaw(Activity),
    glucose: markRaw(Heart),
    bp: markRaw(Heart),
    hr: markRaw(Heart),
    waist: markRaw(Ruler),
    hip: markRaw(Ruler)
  }
  return icons[type] || markRaw(FileText)
}

const getEntryIconBg = (type: string) => {
  const bgs: Record<string, string> = {
    weight: 'bg-indigo-100',
    fat: 'bg-amber-100',
    glucose: 'bg-red-100',
    bp: 'bg-rose-100',
    hr: 'bg-pink-100',
    waist: 'bg-purple-100',
    hip: 'bg-purple-100'
  }
  return bgs[type] || 'bg-slate-100'
}

const getEntryIconColor = (type: string) => {
  const colors: Record<string, string> = {
    weight: 'text-indigo-600',
    fat: 'text-amber-600',
    glucose: 'text-red-600',
    bp: 'text-rose-600',
    hr: 'text-pink-600',
    waist: 'text-purple-600',
    hip: 'text-purple-600'
  }
  return colors[type] || 'text-slate-600'
}

const handleAddEntry = () => {
  if (!entryValue.value) return
  if (entryType.value === 'bp' && !entryValue2.value) return

  // Validate range
  const value = parseFloat(entryValue.value)
  const hint = getValidationHint()
  if (hint && hint.includes('⚠️')) {
    toastRef.value?.show('数值超出正常范围，请确认后继续', 'warning')
  }

  let displayValue = entryValue.value
  if (entryType.value === 'bp' && entryValue2.value) {
    displayValue = `${entryValue.value}/${entryValue2.value}`
  }

  const newEntry: Entry = {
    id: Date.now(),
    type: entryType.value,
    value: displayValue,
    unit: getUnit(entryType.value),
    date: entryDate.value.replace('T', ' '),
    source: '手动录入',
    notes: entryNotes.value
  }

  recentEntries.value.unshift(newEntry)
  toastRef.value?.show('记录已添加', 'success')

  // Clear form and close modal
  clearEntryForm()
  showManualEntryModal.value = false
  saveData()
}

// Sync from device
const syncFromDevice = async () => {
  if (!hasDevice.value) {
    toastRef.value?.show('未绑定设备，请先在设备设置中绑定', 'warning')
    return
  }

  isSyncing.value = true

  // Simulate device sync
  setTimeout(() => {
    // Generate mock synced data
    const metrics = [
      { type: 'weight', value: (83 + Math.random() * 2).toFixed(1), unit: 'kg' },
      { type: 'hr', value: String(Math.floor(60 + Math.random() * 30)), unit: 'bpm' },
      { type: 'glucose', value: (5 + Math.random() * 2).toFixed(1), unit: 'mmol/L' }
    ]

    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)]

    const newEntry: Entry = {
      id: Date.now(),
      type: randomMetric.type,
      value: randomMetric.value,
      unit: randomMetric.unit,
      date: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: '设备',
      deviceName: deviceName.value
    }

    recentEntries.value.unshift(newEntry)
    isSyncing.value = false
    toastRef.value?.show(`已从${deviceName.value}同步数据`, 'success')
    saveData()
  }, 2000)
}

const clearEntryForm = () => {
  entryValue.value = ''
  entryValue2.value = ''
  entryNotes.value = ''
  entryDate.value = new Date().toISOString().slice(0, 16)
}

const editEntry = (entry: Entry) => {
  entryType.value = entry.type
  entryDate.value = entry.date.replace(' ', 'T') + ':00'
  entryNotes.value = entry.notes || ''

  if (entry.type === 'bp') {
    const values = entry.value.split('/')
    entryValue.value = values[0]
    entryValue2.value = values[1]
  } else {
    entryValue.value = entry.value.replace(/[^\d.]/g, '')
  }

  // Remove from list temporarily
  recentEntries.value = recentEntries.value.filter(e => e.id !== entry.id)
}

const deleteEntry = (id: number) => {
  recentEntries.value = recentEntries.value.filter(e => e.id !== id)
  toastRef.value?.show('记录已删除', 'success')
  saveData()
}

const exportData = () => {
  // Generate CSV
  const headers = ['日期', '类型', '数值', '单位', '来源', '备注']
  const rows = recentEntries.value.map(e => [
    e.date,
    getLabel(e.type),
    e.value,
    e.unit,
    e.source,
    e.notes || ''
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `健康数据_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()

  toastRef.value?.show('数据已导出', 'success')
}

const generateReport = () => {
  showReportModal.value = true
}

const downloadReport = () => {
  toastRef.value?.show('正在生成PDF报告...', 'info')
  // In a real app, this would generate a PDF
  setTimeout(() => {
    toastRef.value?.show('报告下载功能开发中', 'info')
  }, 1000)
}

// Local Storage
const STORAGE_KEY = 'health_data_entries'

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentEntries.value))
}

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      recentEntries.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load health data:', e)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
