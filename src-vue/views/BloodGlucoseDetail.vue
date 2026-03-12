<template>
  <div class="min-h-screen bg-slate-50 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="handleGoBack"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft :size="20" class="text-slate-600" />
            </button>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Droplets :size="24" class="text-red-500" />
                血糖监测详情
              </h1>
              <p class="text-sm text-slate-500 mt-1">
                空腹血糖、餐后血糖及血糖趋势分析
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="exportData"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors"
            >
              <Download :size="16" />
              导出数据
            </button>
            <button
              @click="showAddModal = true"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus :size="16" />
              添加记录
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Time Range Filter -->
      <div class="bg-white p-2 rounded-lg border border-slate-200 flex items-center shadow-sm w-fit">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          @click="selectedTimeRange = range.value"
          :class="`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTimeRange === range.value ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Overview Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg bg-blue-100">
              <Activity :size="18" class="text-blue-600" />
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {{ getGlucoseStatus(latestGlucose) }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-1">最新血糖</p>
          <p class="text-2xl font-bold text-slate-900">
            {{ latestGlucose }} <span class="text-sm font-normal text-slate-500">mmol/L</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-1">{{ latestGlucoseDate }}</p>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg bg-amber-100">
              <Sunrise :size="18" class="text-amber-600" />
            </div>
          </div>
          <p class="text-xs text-slate-500 mb-1">空腹血糖</p>
          <p class="text-2xl font-bold" :class="fastingAverage > 7 ? 'text-red-600' : fastingAverage > 6.1 ? 'text-amber-600' : 'text-green-600'">
            {{ fastingAverage }} <span class="text-sm font-normal text-slate-500">mmol/L</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-1">平均值</p>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg bg-orange-100">
              <Utensils :size="18" class="text-orange-600" />
            </div>
          </div>
          <p class="text-xs text-slate-500 mb-1">餐后2小时</p>
          <p class="text-2xl font-bold" :class="postprandialAverage > 11.1 ? 'text-red-600' : postprandialAverage > 7.8 ? 'text-amber-600' : 'text-green-600'">
            {{ postprandialAverage }} <span class="text-sm font-normal text-slate-500">mmol/L</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-1">平均值</p>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg bg-purple-100">
              <TrendingUp :size="18" class="text-purple-600" />
            </div>
          </div>
          <p class="text-xs text-slate-500 mb-1">平均血糖</p>
          <p class="text-2xl font-bold text-slate-900">
            {{ overallAverage }} <span class="text-sm font-normal text-slate-500">mmol/L</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-1">全部记录</p>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 rounded-lg bg-green-100">
              <Target :size="18" class="text-green-600" />
            </div>
          </div>
          <p class="text-xs text-slate-500 mb-1">达标率</p>
          <p class="text-2xl font-bold text-green-600">
            {{ complianceRate }}<span class="text-sm font-normal text-slate-500">%</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-1">正常范围内</p>
        </div>
      </div>

      <!-- Main Trend Chart -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold text-slate-800">血糖趋势图</h2>
            <p class="text-xs text-slate-500 mt-1">
              空腹血糖正常值: 3.9-6.1 mmol/L | 餐后2小时正常值: < 7.8 mmol/L
            </p>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" v-model="showFasting" class="rounded text-indigo-600">
              <span class="w-3 h-3 rounded-full bg-amber-500"></span>
              空腹
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" v-model="showPostprandial" class="rounded text-indigo-600">
              <span class="w-3 h-3 rounded-full bg-orange-500"></span>
              餐后
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" v-model="showBedtime" class="rounded text-indigo-600">
              <span class="w-3 h-3 rounded-full bg-purple-500"></span>
              睡前
            </label>
          </div>
        </div>

        <div class="h-80">
          <svg viewBox="0 0 800 300" class="w-full h-full">
            <!-- Grid Lines -->
            <g class="grid">
              <!-- Horizontal grid lines -->
              <line v-for="i in 6" :key="'hgrid-'+i"
                :x1="60" :y1="20 + i * 45" :x2="780" :y2="20 + i * 45"
                stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4"/>

              <!-- Vertical grid lines -->
              <line v-for="i in filteredData.length" :key="'vgrid-'+i"
                :x1="60 + (i - 1) * (720 / Math.max(filteredData.length - 1, 1))" :y1="20" :x2="60 + (i - 1) * (720 / Math.max(filteredData.length - 1, 1))" :y2="290"
                stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4" v-if="filteredData.length > 1"/>
            </g>

            <!-- Warning Zones -->
            <!-- High zone (diabetic level) -->
            <rect x="60" y="20" width="720" height="65" fill="#fecaca" opacity="0.2"/>
            <text x="70" y="35" font-size="10" fill="#ef4444" font-weight="bold">高血糖区 (>11.1)</text>

            <!-- Elevated zone -->
            <rect x="60" y="85" width="720" height="45" fill="#fed7aa" opacity="0.2"/>
            <text x="70" y="100" font-size="10" fill="#f97316" font-weight="bold">稍高区 (7.8-11.1)</text>

            <!-- Normal zone -->
            <rect x="60" y="130" width="720" height="70" fill="#bbf7d0" opacity="0.2"/>
            <text x="70" y="145" font-size="10" fill="#10b981" font-weight="bold">正常区 (3.9-7.8)</text>

            <!-- Low zone (hypoglycemic) -->
            <rect x="60" y="200" width="720" height="90" fill="#fef08a" opacity="0.2"/>
            <text x="70" y="215" font-size="10" fill="#eab308" font-weight="bold">低血糖区 (<3.9)</text>

            <!-- Y-axis labels -->
            <g font-size="10" fill="#64748b" text-anchor="end">
              <text x="50" y="34">15</text>
              <text x="50" y="79">12</text>
              <text x="50" y="124">9</text>
              <text x="50" y="169">6</text>
              <text x="50" y="214">3</text>
              <text x="50" y="259">0</text>
            </g>

            <!-- Glucose Lines -->
            <polyline
              v-if="showFasting"
              :points="getChartLine('fasting')"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2.5"
              class="drop-shadow-sm"
            />
            <polyline
              v-if="showPostprandial"
              :points="getChartLine('postprandial')"
              fill="none"
              stroke="#f97316"
              stroke-width="2.5"
              class="drop-shadow-sm"
            />
            <polyline
              v-if="showBedtime"
              :points="getChartLine('bedtime')"
              fill="none"
              stroke="#a855f7"
              stroke-width="2.5"
              stroke-dasharray="4"
              class="drop-shadow-sm"
            />

            <!-- Data Points -->
            <g v-for="(point, index) in filteredData" :key="'point-'+index">
              <circle
                v-if="point.type === 'fasting' && showFasting"
                :cx="60 + index * (720 / Math.max(filteredData.length - 1, 1))"
                :cy="getY(point.value)"
                r="5"
                fill="#f59e0b"
                class="hover:r-7 cursor-pointer transition-all"
                @click="showPointDetail(point)"
              />
              <circle
                v-if="point.type === 'postprandial' && showPostprandial"
                :cx="60 + index * (720 / Math.max(filteredData.length - 1, 1))"
                :cy="getY(point.value)"
                r="5"
                fill="#f97316"
                class="hover:r-7 cursor-pointer transition-all"
                @click="showPointDetail(point)"
              />
              <circle
                v-if="point.type === 'bedtime' && showBedtime"
                :cx="60 + index * (720 / Math.max(filteredData.length - 1, 1))"
                :cy="getY(point.value)"
                r="5"
                fill="#a855f7"
                class="hover:r-7 cursor-pointer transition-all"
                @click="showPointDetail(point)"
              />
            </g>

            <!-- X-axis labels -->
            <g font-size="9" fill="#64748b" text-anchor="middle">
              <text v-for="(point, index) in filteredData.filter((_, i) => i % Math.ceil(filteredData.length / 7) === 0)"
                :key="'xlabel-'+index"
                :x="60 + filteredData.indexOf(point) * (720 / Math.max(filteredData.length - 1, 1))"
                y="305">
                {{ formatDate(point.date) }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-4 h-1 bg-amber-500 rounded"></div>
            <span class="text-slate-600">空腹血糖</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-1 bg-orange-500 rounded"></div>
            <span class="text-slate-600">餐后血糖</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-1 bg-purple-500 border-dashed rounded"></div>
            <span class="text-slate-600">睡前血糖</span>
          </div>
        </div>
      </div>

      <!-- Distribution Chart -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-800 mb-4">血糖分布</h3>
          <div class="h-64">
            <svg viewBox="0 0 300 200" class="w-full h-full">
              <!-- Pie Chart -->
              <g transform="translate(150, 100)">
                <!-- Calculate slices based on distribution -->
                <circle v-for="(slice, index) in pieSlices" :key="'slice-'+index"
                  :r="70"
                  :stroke="slice.color"
                  :stroke-width="40"
                  :stroke-dasharray="`${slice.perimeter * slice.percentage} ${slice.perimeter * (1 - slice.percentage)}`"
                  :transform="`rotate(${slice.rotation})`"
                  fill="none"
                  class="hover:opacity-80 cursor-pointer transition-opacity"
                />
              </g>
              <!-- Legend -->
              <g font-size="10" fill="#475569">
                <text x="230" y="40" :fill="pieSlices[0]?.color">● 正常 ({{ distribution.normal }})</text>
                <text x="230" y="60" :fill="pieSlices[1]?.color">● 稍高 ({{ distribution.elevated }})</text>
                <text x="230" y="80" :fill="pieSlices[2]?.color">● 高 ({{ distribution.high }})</text>
                <text x="230" y="100" :fill="pieSlices[3]?.color">● 低 ({{ distribution.low }})</text>
              </g>
            </svg>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-800 mb-4">时段分析</h3>
          <div class="space-y-4">
            <div v-for="stat in timeAnalysis" :key="stat.label" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="stat.bgColor">
                  <component :is="stat.icon" :size="18" :class="stat.iconColor" />
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ stat.label }}</p>
                  <p class="text-xs text-slate-500">{{ stat.count }} 次测量</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold" :class="stat.textColor">
                  {{ stat.average }} <span class="text-xs font-normal text-slate-500">mmol/L</span>
                </p>
                <p class="text-xs" :class="stat.statusColor">{{ stat.status }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Records Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 border-b border-slate-200">
          <h3 class="font-bold text-slate-800">最近记录</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">测量时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">时段</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">血糖值</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">备注</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="record in paginatedRecords" :key="record.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 text-sm text-slate-900">{{ record.fullDate }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded text-xs font-medium" :class="getTimeTypeClass(record.type)">
                    {{ getTimeTypeLabel(record.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-bold" :class="getGlucoseValueClass(record.value)">
                  {{ record.value }} mmol/L
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadgeClass(record.value)">
                    {{ getGlucoseStatus(record.value) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500">{{ record.notes || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex items-center gap-1">
                    <button
                      @click="editRecord(record)"
                      class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit3 :size="14" />
                    </button>
                    <button
                      @click="deleteRecord(record.id)"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="p-4 border-t border-slate-200 flex items-center justify-between">
          <p class="text-sm text-slate-500">
            显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredData.length) }} 共 {{ filteredData.length }} 条
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="currentPage = page"
              :class="`px-3 py-1 text-sm border rounded ${
                page === currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 hover:bg-slate-50'
              }`"
            >
              {{ page }}
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- Health Tips -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Lightbulb :size="18" class="text-amber-500" />
          血糖管理建议
        </h3>
        <ul class="space-y-2 text-sm text-slate-700">
          <li class="flex items-start gap-2">
            <CheckCircle2 :size="16" class="text-green-600 mt-0.5 flex-shrink-0" />
            <span>建议每天固定时间测量血糖，如早晨空腹和餐后2小时</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 :size="16" class="text-green-600 mt-0.5 flex-shrink-0" />
            <span>保持规律的饮食和运动习惯，有助于稳定血糖水平</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircle2 :size="16" class="text-green-600 mt-0.5 flex-shrink-0" />
            <span>如血糖持续偏高，请及时咨询医生或营养师</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Add Record Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showAddModal = false"></div>
      <div v-if="showAddModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-2xl shadow-2xl z-[70]">
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-xl text-slate-800">{{ editingRecord ? '编辑记录' : '添加血糖记录' }}</h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
              <X :size="24" />
            </button>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">测量时段</label>
            <select v-model="newRecord.type" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="fasting">空腹血糖</option>
              <option value="postprandial">餐后2小时</option>
              <option value="bedtime">睡前血糖</option>
              <option value="random">随机血糖</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">血糖值 (mmol/L)</label>
            <input v-model.number="newRecord.value" type="number" step="0.1" min="0" max="30" placeholder="6.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">测量时间</label>
            <input v-model="newRecord.date" type="datetime-local" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">备注（可选）</label>
            <input v-model="newRecord.notes" type="text" placeholder="如：饭后运动30分钟" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        <div class="p-4 border-t border-slate-100 flex gap-2">
          <button
            @click="saveRecord"
            :disabled="!newRecord.value"
            class="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            取消
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Point Detail Modal -->
    <Teleport to="body">
      <div v-if="showPointModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showPointModal = false"></div>
      <div v-if="showPointModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] bg-white rounded-2xl shadow-2xl z-[70]">
        <div class="p-6" v-if="selectedPoint">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg text-slate-800">测量详情</h3>
            <button @click="showPointModal = false" class="text-slate-400 hover:text-slate-600">
              <X :size="20" />
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">测量时间</span>
              <span class="text-sm font-medium text-slate-800">{{ selectedPoint.fullDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">测量时段</span>
              <span class="text-sm font-medium" :class="getTimeTypeClass(selectedPoint.type)">
                {{ getTimeTypeLabel(selectedPoint.type) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">血糖值</span>
              <span class="text-lg font-bold" :class="getGlucoseValueClass(selectedPoint.value)">
                {{ selectedPoint.value }} mmol/L
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">状态</span>
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadgeClass(selectedPoint.value)">
                {{ getGlucoseStatus(selectedPoint.value) }}
              </span>
            </div>
            <div v-if="selectedPoint.notes" class="pt-3 border-t border-slate-100">
              <span class="text-sm text-slate-500">备注</span>
              <p class="text-sm text-slate-800 mt-1">{{ selectedPoint.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Droplets,
  Download,
  Plus,
  Activity,
  Sunrise,
  Utensils,
  TrendingUp,
  Target,
  Edit3,
  Trash2,
  X,
  Lightbulb,
  CheckCircle2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

interface GlucoseRecord {
  id: number
  date: string
  fullDate: string
  type: 'fasting' | 'postprandial' | 'bedtime' | 'random'
  value: number
  notes?: string
}

// State
const selectedTimeRange = ref('7d')
const showFasting = ref(true)
const showPostprandial = ref(true)
const showBedtime = ref(true)
const currentPage = ref(1)
const pageSize = 10
const showAddModal = ref(false)
const showPointModal = ref(false)
const editingRecord = ref<GlucoseRecord | null>(null)
const selectedPoint = ref<GlucoseRecord | null>(null)

const newRecord = ref<Partial<GlucoseRecord>>({
  type: 'fasting',
  value: undefined,
  date: new Date().toISOString().slice(0, 16),
  notes: ''
})

const timeRanges = [
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
  { label: '最近90天', value: '90d' },
  { label: '全部', value: 'all' }
]

// 返回处理 - 根据来源返回到正确的页面
const handleGoBack = () => {
  const from = route.query.from as string

  if (from === 'health') {
    // 从健康数据页面来的，返回到客户档案的健康指标 tab
    // 获取当前路由中的客户ID（如果有的话）
    const clientId = route.query.clientId as string
    if (clientId) {
      router.push({ path: `/client-profile/${clientId}`, query: { tab: 'health' } })
    } else {
      // 没有客户ID，尝试返回到上一个页面
      router.back()
    }
  } else {
    // 其他情况，正常返回
    router.back()
  }
}

// Sample data
const glucoseRecords = ref<GlucoseRecord[]>([
  { id: 1, date: '2025-03-11', fullDate: '2025-03-11 07:30', type: 'fasting', value: 6.2, notes: '晨起空腹' },
  { id: 2, date: '2025-03-11', fullDate: '2025-03-11 09:45', type: 'postprandial', value: 7.8, notes: '早餐后2小时' },
  { id: 3, date: '2025-03-10', fullDate: '2025-03-10 22:00', type: 'bedtime', value: 5.8, notes: '睡前' },
  { id: 4, date: '2025-03-10', fullDate: '2025-03-10 07:15', type: 'fasting', value: 5.9, notes: '' },
  { id: 5, date: '2025-03-10', fullDate: '2025-03-10 19:30', type: 'postprandial', value: 8.2, notes: '晚餐后2小时' },
  { id: 6, date: '2025-03-09', fullDate: '2025-03-09 07:20', type: 'fasting', value: 6.5, notes: '' },
  { id: 7, date: '2025-03-09', fullDate: '2025-03-09 09:40', type: 'postprandial', value: 7.1, notes: '' },
  { id: 8, date: '2025-03-08', fullDate: '2025-03-08 07:10', type: 'fasting', value: 6.8, notes: '' },
  { id: 9, date: '2025-03-08', fullDate: '2025-03-08 19:20', type: 'postprandial', value: 9.5, notes: '摄入较多碳水' },
  { id: 10, date: '2025-03-07', fullDate: '2025-03-07 07:25', type: 'fasting', value: 5.6, notes: '' },
  { id: 11, date: '2025-03-07', fullDate: '2025-03-07 21:30', type: 'bedtime', value: 6.1, notes: '' },
  { id: 12, date: '2025-03-06', fullDate: '2025-03-06 07:30', type: 'fasting', value: 7.2, notes: '' },
  { id: 13, date: '2025-03-06', fullDate: '2025-03-06 09:50', type: 'postprandial', value: 10.1, notes: '高血糖警告' },
  { id: 14, date: '2025-03-05', fullDate: '2025-03-05 07:15', type: 'fasting', value: 5.4, notes: '' },
  { id: 15, date: '2025-03-05', fullDate: '2025-03-05 22:00', type: 'bedtime', value: 5.2, notes: '' }
])

// Computed
const filteredData = computed(() => {
  let data = [...glucoseRecords.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (selectedTimeRange.value !== 'all') {
    const days = parseInt(selectedTimeRange.value)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    data = data.filter(r => new Date(r.date) >= cutoff)
  }

  return data
})

const latestGlucose = computed(() => {
  if (filteredData.value.length === 0) return '-'
  return filteredData.value[filteredData.value.length - 1].value.toFixed(1)
})

const latestGlucoseDate = computed(() => {
  if (filteredData.value.length === 0) return '-'
  return filteredData.value[filteredData.value.length - 1].fullDate
})

const fastingData = computed(() => filteredData.value.filter(r => r.type === 'fasting'))
const postprandialData = computed(() => filteredData.value.filter(r => r.type === 'postprandial'))

const fastingAverage = computed(() => {
  if (fastingData.value.length === 0) return '-'
  const avg = fastingData.value.reduce((sum, r) => sum + r.value, 0) / fastingData.value.length
  return avg.toFixed(1)
})

const postprandialAverage = computed(() => {
  if (postprandialData.value.length === 0) return '-'
  const avg = postprandialData.value.reduce((sum, r) => sum + r.value, 0) / postprandialData.value.length
  return avg.toFixed(1)
})

const overallAverage = computed(() => {
  if (filteredData.value.length === 0) return '-'
  const avg = filteredData.value.reduce((sum, r) => sum + r.value, 0) / filteredData.value.length
  return avg.toFixed(1)
})

const complianceRate = computed(() => {
  if (filteredData.value.length === 0) return 0
  const inRange = filteredData.value.filter(r => r.value >= 3.9 && r.value <= 7.8).length
  return Math.round((inRange / filteredData.value.length) * 100)
})

const distribution = computed(() => {
  const normal = filteredData.value.filter(r => r.value >= 3.9 && r.value <= 6.1).length
  const elevated = filteredData.value.filter(r => r.value > 6.1 && r.value <= 7.8).length
  const high = filteredData.value.filter(r => r.value > 7.8).length
  const low = filteredData.value.filter(r => r.value < 3.9).length
  return { normal, elevated, high, low }
})

const pieSlices = computed(() => {
  const total = filteredData.value.length
  if (total === 0) return []

  const data = [
    { color: '#10b981', value: distribution.value.normal, label: '正常' },
    { color: '#f97316', value: distribution.value.elevated, label: '稍高' },
    { color: '#ef4444', value: distribution.value.high, label: '高' },
    { color: '#eab308', value: distribution.value.low, label: '低' }
  ]

  let currentAngle = 0
  const circumference = 2 * Math.PI * 70

  return data.filter(d => d.value > 0).map(d => {
    const percentage = d.value / total
    const angle = percentage * 360
    const rotation = currentAngle - 90
    currentAngle += angle

    return {
      color: d.color,
      percentage,
      perimeter: circumference,
      rotation,
      value: d.value,
      label: d.label
    }
  })
})

const timeAnalysis = computed(() => [
  {
    label: '空腹血糖',
    icon: Sunrise,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    count: fastingData.value.length,
    average: fastingAverage.value,
    textColor: parseFloat(fastingAverage.value as string) > 7 ? 'text-red-600' : parseFloat(fastingAverage.value as string) > 6.1 ? 'text-amber-600' : 'text-green-600',
    status: parseFloat(fastingAverage.value as string) > 7 ? '偏高' : parseFloat(fastingAverage.value as string) > 6.1 ? '稍高' : '正常',
    statusColor: parseFloat(fastingAverage.value as string) > 7 ? 'text-red-600' : parseFloat(fastingAverage.value as string) > 6.1 ? 'text-amber-600' : 'text-green-600'
  },
  {
    label: '餐后血糖',
    icon: Utensils,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    count: postprandialData.value.length,
    average: postprandialAverage.value,
    textColor: parseFloat(postprandialAverage.value as string) > 11.1 ? 'text-red-600' : parseFloat(postprandialAverage.value as string) > 7.8 ? 'text-amber-600' : 'text-green-600',
    status: parseFloat(postprandialAverage.value as string) > 11.1 ? '偏高' : parseFloat(postprandialAverage.value as string) > 7.8 ? '稍高' : '正常',
    statusColor: parseFloat(postprandialAverage.value as string) > 11.1 ? 'text-red-600' : parseFloat(postprandialAverage.value as string) > 7.8 ? 'text-amber-600' : 'text-green-600'
  },
  {
    label: '睡前血糖',
    icon: Activity,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    count: filteredData.value.filter(r => r.type === 'bedtime').length,
    average: (filteredData.value.filter(r => r.type === 'bedtime').reduce((sum, r) => sum + r.value, 0) / Math.max(filteredData.value.filter(r => r.type === 'bedtime').length, 1)).toFixed(1),
    textColor: 'text-slate-900',
    status: '-',
    statusColor: 'text-slate-500'
  }
])

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))

const displayedPages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= currentPage.value - 1 && i <= currentPage.value + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1)
    }
  }

  return pages
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return [...filteredData.value].reverse().slice(start, start + pageSize)
})

// Methods
const getY = (value: number) => {
  const min = 0
  const max = 15
  const range = max - min
  const normalized = (value - min) / range
  return 290 - normalized * 270
}

const getChartLine = (type: string) => {
  const data = filteredData.value.filter(r => r.type === type)
  if (data.length === 0) return ''

  return data.map((point, index) => {
    const x = 60 + filteredData.value.indexOf(point) * (720 / Math.max(filteredData.value.length - 1, 1))
    const y = getY(point.value)
    return `${x},${y}`
  }).join(' ')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getGlucoseStatus = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (numValue < 3.9) return '偏低'
  if (numValue <= 6.1) return '正常'
  if (numValue <= 7.8) return '稍高'
  return '偏高'
}

const getGlucoseValueClass = (value: number) => {
  if (value < 3.9) return 'text-yellow-600'
  if (value <= 6.1) return 'text-green-600'
  if (value <= 7.8) return 'text-amber-600'
  return 'text-red-600'
}

const getStatusBadgeClass = (value: number) => {
  if (value < 3.9) return 'bg-yellow-100 text-yellow-700'
  if (value <= 6.1) return 'bg-green-100 text-green-700'
  if (value <= 7.8) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

const getTimeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    fasting: '空腹',
    postprandial: '餐后2h',
    bedtime: '睡前',
    random: '随机'
  }
  return labels[type] || type
}

const getTimeTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    fasting: 'bg-amber-100 text-amber-700',
    postprandial: 'bg-orange-100 text-orange-700',
    bedtime: 'bg-purple-100 text-purple-700',
    random: 'bg-slate-100 text-slate-700'
  }
  return classes[type] || 'bg-slate-100 text-slate-700'
}

const showPointDetail = (point: GlucoseRecord) => {
  selectedPoint.value = point
  showPointModal.value = true
}

const editRecord = (record: GlucoseRecord) => {
  editingRecord.value = record
  newRecord.value = {
    type: record.type,
    value: record.value,
    date: record.fullDate.slice(0, 16),
    notes: record.notes
  }
  showAddModal.value = true
}

const deleteRecord = (id: number) => {
  if (confirm('确定要删除这条记录吗？')) {
    glucoseRecords.value = glucoseRecords.value.filter(r => r.id !== id)
    saveData()
  }
}

const saveRecord = () => {
  if (!newRecord.value.value) return

  if (editingRecord.value) {
    const index = glucoseRecords.value.findIndex(r => r.id === editingRecord.value!.id)
    if (index !== -1) {
      glucoseRecords.value[index] = {
        ...editingRecord.value,
        type: newRecord.value.type as GlucoseRecord['type'],
        value: newRecord.value.value,
        date: newRecord.value.date!.slice(0, 10),
        fullDate: newRecord.value.date!.replace('T', ' '),
        notes: newRecord.value.notes
      }
    }
  } else {
    glucoseRecords.value.push({
      id: Date.now(),
      type: newRecord.value.type as GlucoseRecord['type'],
      value: newRecord.value.value,
      date: newRecord.value.date!.slice(0, 10),
      fullDate: newRecord.value.date!.replace('T', ' '),
      notes: newRecord.value.notes
    })
  }

  closeModal()
  saveData()
}

const closeModal = () => {
  showAddModal.value = false
  editingRecord.value = null
  newRecord.value = {
    type: 'fasting',
    value: undefined,
    date: new Date().toISOString().slice(0, 16),
    notes: ''
  }
}

const exportData = () => {
  const headers = ['日期', '时段', '血糖值(mmol/L)', '状态', '备注']
  const rows = filteredData.value.map(r => [
    r.fullDate,
    getTimeTypeLabel(r.type),
    r.value,
    getGlucoseStatus(r.value),
    r.notes || ''
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `血糖数据_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

const saveData = () => {
  localStorage.setItem('glucose_records', JSON.stringify(glucoseRecords.value))
}

const loadData = () => {
  const saved = localStorage.getItem('glucose_records')
  if (saved) {
    try {
      glucoseRecords.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load glucose records:', e)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
