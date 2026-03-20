<template>
  <div class="flex h-screen w-full bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden relative">
    
    <!-- 全局 Toast 提示组件 -->
    <div v-if="toast" class="fixed top-8 right-1/2 translate-x-1/2 bg-slate-800/95 backdrop-blur-sm text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-10 duration-300">
      <CheckCircle2 :size="20" class="text-green-400" />
      <span class="font-medium">{{ toast }}</span>
    </div>

    <!-- 左侧导航栏 -->
    <div class="w-64 bg-[#111C44] text-white shadow-xl z-10 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-3 border-b border-white/10">
        <div class="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
          M
        </div>
        <span class="text-xl font-bold tracking-wider">慢能健康 CRM</span>
      </div>
      
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <template v-for="(group, idx) in navGroups" :key="idx">
          <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 mt-4 px-3">
            {{ group.title }}
          </div>
          <div v-for="item in group.items" :key="item.label"
               @click="activeTab = item.label"
               :class="['flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all', activeTab === item.label ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-300 hover:bg-white/10 hover:text-white']">
            <component :is="item.icon" :size="18" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </div>
        </template>
      </div>
      
      <div class="p-4 border-t border-white/10">
        <div @click="activeTab = '系统设置'" :class="['flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all', activeTab === '系统设置' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-300 hover:bg-white/10 hover:text-white']">
          <Settings :size="18" />
          <span class="text-sm font-medium">系统设置</span>
        </div>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      
      <!-- 顶部 Header -->
      <header class="h-16 bg-white flex items-center justify-between px-6 shadow-sm z-0 relative">
        <div class="flex items-center gap-4 w-96">
          <div class="relative w-full group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" :size="18" />
            <input 
              type="text" 
              placeholder="搜索用户姓名、电话或ID..." 
              class="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              @keydown.enter="(e) => showToastMessage(`正在搜索: ${e.target.value}`)"
            />
          </div>
        </div>
        <div class="flex items-center gap-5">
          <div class="relative">
            <button 
              class="relative text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-50"
              @click="showNotifications = !showNotifications"
            >
              <Bell :size="20" />
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <!-- 通知下拉面板 -->
            <div v-if="showNotifications" class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-slate-800">通知中心</h4>
                <span class="text-xs text-indigo-600 cursor-pointer hover:underline" @click="showNotifications = false">标为已读</span>
              </div>
              <div class="space-y-3">
                <div class="text-sm p-3 bg-red-50 text-red-700 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                  <span class="font-semibold">预警：</span> 王磊昨日血糖偏高，请及时关注。
                </div>
                <div class="text-sm p-3 bg-slate-50 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <span class="font-semibold">系统：</span> 您的营养师认证审核已通过。
                </div>
              </div>
            </div>
          </div>

          <div 
            class="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            @click="showToastMessage('打开个人中心设置')"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor" alt="User" class="w-8 h-8 rounded-full bg-indigo-100" />
            <div class="text-sm font-medium">李医生 (高级营养师)</div>
          </div>
        </div>
      </header>

      <!-- 主画布内容 (支持滚动) -->
      <main class="flex-1 overflow-y-auto p-6 scroll-smooth">
        
        <!-- 用户基础信息卡片 (顶部) -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 hover:shadow-md transition-shadow">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center text-2xl font-bold text-indigo-700">
                王
              </div>
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h2 class="text-2xl font-bold text-slate-800">王磊</h2>
                  <span class="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 依从度良好
                  </span>
                  <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                    服务中
                  </span>
                </div>
                <div class="text-sm text-slate-500 flex gap-4">
                  <span>ID: 10086</span>
                  <span>性别: 男</span>
                  <span>年龄: 42岁</span>
                  <span class="cursor-pointer hover:text-indigo-500 transition-colors">标签: 2型糖尿病, 超重 ✎</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-8 divide-x divide-slate-100">
              <div v-for="(stat, idx) in statItems" :key="idx" :class="stat.pl ? 'pl-8' : ''">
                <div class="text-xs text-slate-400 mb-1">{{ stat.label }}</div>
                <div class="flex items-baseline gap-0.5">
                  <span :class="['text-2xl font-bold', stat.color]">{{ stat.value }}</span>
                  <span class="text-xs text-slate-500 font-medium">{{ stat.sub }}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="showToastMessage('已向该患者发送今日任务提醒')"
                class="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 hover:shadow-sm active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageSquare :size="16" /> 发送提醒
              </button>
              <button 
                @click="showToastMessage('今日随访任务已一键快捷完成')"
                class="px-4 py-2 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 hover:shadow-md hover:shadow-green-200 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 :size="16" /> 快捷完成
              </button>
            </div>

          </div>
        </div>

        <!-- 阻碍记录横幅 -->
        <div v-if="obstacles.length > 0" class="space-y-3 mb-6">
          <div v-for="obs in obstacles" :key="obs.id" class="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                <AlertTriangle :size="20" />
              </div>
              <div>
                <h4 class="font-bold text-amber-700 flex items-center gap-2">
                  {{ obs.type }}
                  <span class="text-[10px] font-normal text-amber-600 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/50">{{ obs.time }}</span>
                </h4>
                <p class="text-sm text-amber-600 mt-0.5">患者反馈：{{ obs.desc }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="handleResolveObstacle(obs.id)"
                class="px-4 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 shadow-sm active:scale-95 transition-all"
              >
                跟进处理
              </button>
            </div>
          </div>
        </div>

        <!-- 网格布局：核心内容区 -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
          
          <!-- 左侧栏：生理数据与趋势看板 -->
          <div class="col-span-12 md:col-span-3">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow h-full flex flex-col">
              
              <!-- 1. 实时生理数据块 -->
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <Heart :size="18" class="text-rose-500" /> 生理体征数据
                </h3>
                <span class="text-xs text-indigo-500 cursor-pointer hover:text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded-md" @click="showToastMessage('正在获取最新体征设备数据...')">
                  同步 ↻
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-5">
                <div v-for="(block, idx) in dataBlocks" :key="idx" 
                     @click="showToastMessage(block.msg)"
                     class="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition-all cursor-pointer active:scale-95 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-1.5 text-slate-500">
                        <component :is="block.icon" :size="16" />
                        <span class="text-xs font-medium">{{ block.label }}</span>
                      </div>
                      <div :class="['text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100', block.statusColor]">
                        {{ block.status }}
                      </div>
                    </div>
                    <div class="flex items-baseline gap-1 mb-1">
                      <span class="text-lg font-bold text-slate-800">{{ block.value }}</span>
                      <span class="text-xs text-slate-400">{{ block.unit }}</span>
                    </div>
                  </div>
                  <div v-if="block.device" class="text-[10px] text-slate-400 mt-2 flex items-center gap-1 border-t border-slate-200/60 pt-2 line-clamp-1">
                    <Smartphone :size="10" class="shrink-0" /> <span class="truncate">{{ block.device }}</span>
                  </div>
                </div>
              </div>

              <hr class="border-slate-100 mb-5" />

              <!-- 2. 趋势图表区 -->
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <Activity :size="18" class="text-indigo-500" /> 趋势分析
                </h3>
                <button 
                  @click="showToastMessage('打开日期范围选择器（如：近30天、本月等）')"
                  class="text-xs flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors active:scale-95 shadow-sm"
                >
                  <CalendarIcon :size="12" />
                  近7天 
                  <ChevronDown :size="12" />
                </button>
              </div>

              <div class="space-y-5 flex-1">
                
                <!-- 折线趋势图循环 -->
                <div v-for="(chart, idx) in trendCharts" :key="idx" class="group cursor-pointer bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all" @click="showToastMessage(chart.msg)">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                        <component :is="chart.icon" :size="14" :class="chart.iconColor"/> {{ chart.label }}
                      </span>
                      <div class="flex items-baseline gap-1">
                        <span class="text-lg font-bold text-slate-800">{{ chart.value }}</span>
                        <span class="text-[10px] text-slate-400">{{ chart.unit }}</span>
                      </div>
                    </div>
                    <span :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded border', chart.statusColor]">{{ chart.status }}</span>
                  </div>
                  <div class="mt-2">
                    <svg viewBox="0 -5 100 40" class="w-full h-12 overflow-visible">
                       <polygon :points="getChartData(chart.data).areaPoints" :class="chart.fillClass" />
                       <polyline :points="getChartData(chart.data).points" fill="none" :class="chart.strokeClass" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                       <circle v-for="(pt, i) in getChartData(chart.data).dataNodes" :key="i" :cx="pt.x" :cy="pt.y" r="2.5" :class="['fill-white', chart.dotClass]" stroke-width="1.5" />
                    </svg>
                  </div>
                </div>

                <!-- 睡眠质量分析柱状图 -->
                <div class="group cursor-pointer bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all" @click="showToastMessage('查看深度睡眠与浅睡比例')">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1"><Moon :size="14" class="text-indigo-500"/> 睡眠时长评估</span>
                      <div class="flex items-baseline gap-1">
                        <span class="text-lg font-bold text-slate-800">7.0</span>
                        <span class="text-[10px] text-slate-400">小时 (平均)</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">良好</span>
                  </div>
                  <div class="mt-2 flex items-end justify-between h-12 gap-1.5 pt-2">
                    <div v-for="(bar, i) in getSleepChartData([6.5, 7.2, 5.8, 8.0, 7.5, 6.8, 7.0])" :key="i" class="w-full flex flex-col justify-end group/bar relative h-full">
                      <div class="opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 bg-white shadow-sm px-1 py-0.5 rounded transition-opacity">
                        {{ bar.val }}h
                      </div>
                      <div :class="['w-full rounded-t-sm transition-all duration-500', bar.isLow ? 'bg-amber-400' : 'bg-indigo-400']" :style="{ height: `${bar.heightPercent}%` }"></div>
                      <div :class="['w-full h-1 mt-0.5 rounded-full', bar.isLow ? 'bg-amber-100' : 'bg-indigo-100']"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- 中间栏：餐食管理 & 营养素分析 -->
          <div class="col-span-12 md:col-span-6 space-y-6">
            
            <!-- 餐食记录与上传 -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <Utensils :size="18" class="text-amber-500" /> 今日餐食记录
                </h3>
                <button 
                  @click="isDietLogOpen = true"
                  class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  饮食日志 <ChevronRight :size="16" />
                </button>
              </div>

              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div v-for="meal in meals" :key="meal.id" @click="showToastMessage(`查看 ${meal.time} 的营养成分详情`)" class="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer group">
                    <div class="relative overflow-hidden rounded-lg shrink-0">
                      <img :src="meal.img" :alt="meal.time" class="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div class="flex-1 flex flex-col justify-center">
                      <div class="flex justify-between items-start mb-1.5">
                        <span class="font-bold text-slate-800 text-sm">{{ meal.time }}</span>
                        <span class="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">{{ meal.cal }} kcal</span>
                      </div>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ meal.desc }}</p>
                    </div>
                  </div>
                </div>

                <div 
                  @click="isAddMealOpen = true"
                  class="mt-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex justify-center items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer text-slate-500 hover:text-indigo-600 active:scale-[0.99]"
                >
                  <Plus :size="18" />
                  <span class="text-sm font-medium">补充餐食记录</span>
                </div>
              </div>
            </div>

            <!-- 每日营养素摄入详情 (分段进度条) -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
               <div class="flex justify-between items-center mb-5">
                 <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <Flame :size="18" class="text-orange-500" /> 营养素摄入监控
                 </h3>
                 <div class="flex gap-2.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-400"></span>早餐</span>
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500"></span>午餐</span>
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-violet-500"></span>晚餐</span>
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-fuchsia-400"></span>加餐</span>
                 </div>
               </div>
              
              <div class="space-y-6">
                <div v-for="(bar, idx) in nutrientBars" :key="idx" class="group cursor-default">
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{{ bar.label }}</span>
                    <div class="text-xs">
                      <span class="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{{ bar.total }}</span>
                      <span class="text-slate-400"> / {{ bar.target }} {{ bar.unit }}</span>
                    </div>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5 flex overflow-hidden ring-1 ring-slate-900/5">
                    <template v-for="(seg, i) in bar.segments" :key="i">
                      <div v-if="seg.value > 0"
                        :class="['h-full border-r border-white/40 last:border-r-0 transition-all duration-1000 ease-out relative flex items-center justify-center hover:brightness-110 cursor-pointer', seg.color]"
                        :style="{ width: `${seg.percent}%` }"
                        :title="`${seg.label}: ${seg.value}${bar.unit}`"
                      >
                        <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- 右侧栏：日历 & 快捷操作 -->
          <div class="col-span-12 md:col-span-3 space-y-6">
            
            <!-- 打卡日历 -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon :size="18" class="text-indigo-500" /> 依从日历
                </h3>
                <div class="flex gap-1 items-center">
                  <button @click="changeMonth(-1)" class="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronLeft :size="16" /></button>
                  <span class="text-sm font-medium select-none w-20 text-center">2026年{{ currentMonth }}月</span>
                  <button @click="changeMonth(1)" class="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronRight :size="16" /></button>
                </div>
              </div>
              
              <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 select-none">
                <div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center text-sm">
                <div v-for="day in 31" :key="day" 
                     @click="setSelectedDate(day); showToastMessage(`已切换至 3月${day}日 的数据视图`);"
                     :class="['aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200', getDayClass(day)]">
                  {{ day }}
                </div>
              </div>
              <div class="flex justify-between items-center mt-5 text-xs text-slate-500">
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-green-200 border border-green-300"></span> 全达标</div>
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-red-100 border border-red-200"></span> 有遗漏</div>
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span> 未开始</div>
              </div>
            </div>

            <!-- 快捷操作 -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Plus :size="18" class="text-indigo-500" /> 快捷操作
              </h3>
              
              <div class="grid grid-cols-2 gap-3">
                <button v-for="action in quickActions" :key="action.label" @click="showToastMessage(action.msg)" class="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-white hover:bg-indigo-50 hover:border-indigo-100 active:scale-95 transition-all text-left group shadow-sm hover:shadow">
                  <div class="bg-slate-50 p-1.5 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <component :is="action.icon" :size="16" :class="action.colorClass" />
                  </div>
                  <span class="text-sm font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">{{ action.label }}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>

    <!-- 弹窗：补充餐食记录 -->
    <div v-if="isAddMealOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 class="font-bold text-lg text-slate-800">补充加餐记录</h3>
          <button @click="isAddMealOpen = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>
        
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">餐食照片 <span class="text-red-500">*</span></label>
            <input type="file" ref="addMealFileInputRef" class="hidden" accept="image/*" @change="handleModalFileUpload" />
            <div 
              @click="$refs.addMealFileInputRef.click()"
              :class="['w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors', newMealForm.img ? 'border-transparent' : 'border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300']"
            >
              <img v-if="newMealForm.img" :src="newMealForm.img" alt="Preview" class="w-full h-full object-cover" />
              <template v-else>
                <div class="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-400 mb-2">
                  <ImageIcon :size="20" />
                </div>
                <span class="text-sm text-slate-500 font-medium">点击上传照片</span>
              </template>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">内容描述 <span class="text-red-500">*</span></label>
              <textarea 
                v-model="newMealForm.desc"
                placeholder="例：无糖酸奶一杯，每日坚果一包..."
                class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-20"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">预估热量 (kcal)</label>
              <input 
                type="number" 
                v-model="newMealForm.cal"
                placeholder="选填，默认150"
                class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button @click="isAddMealOpen = false" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            取消
          </button>
          <button @click="handleSaveNewMeal" class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors">
            保存记录
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗：饮食日志历史 -->
    <div v-if="isDietLogOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-10">
      <div class="bg-[#F4F7FE] rounded-2xl shadow-2xl w-full max-w-2xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center p-6 bg-white border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Utensils :size="20" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-800">王磊的饮食日志</h3>
              <p class="text-xs text-slate-500">记录了所有历史餐食照片与营养数据</p>
            </div>
          </div>
          <button @click="isDietLogOpen = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <X :size="24" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 space-y-8">
          <div v-for="(day, idx) in historicalDietData" :key="idx" class="relative">
            <div class="flex justify-between items-center mb-4 sticky top-0 bg-[#F4F7FE]/90 backdrop-blur-sm py-2 z-10">
              <h4 class="font-bold text-slate-700 flex items-center gap-2">
                <CalendarIcon :size="16" class="text-indigo-500" /> {{ day.date }}
              </h4>
              <span class="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md border border-orange-200">
                总热量: {{ day.totalCal }} kcal
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(meal, mIdx) in day.meals" :key="mIdx" class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex gap-3 hover:border-indigo-200 transition-colors cursor-pointer group">
                <img :src="meal.img" :alt="meal.time" class="w-16 h-16 rounded-lg object-cover border border-slate-100 group-hover:opacity-90 transition-opacity shrink-0" />
                <div class="flex flex-col justify-center">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-bold text-slate-800">{{ meal.time }}</span>
                    <span class="text-[10px] font-semibold text-slate-500">{{ meal.cal }} kcal</span>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ meal.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center pt-4 pb-2">
            <span class="text-xs text-slate-400">仅展示近30天内的核心记录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { 
  LayoutDashboard, Users, FileText, Settings, Bell, Search, 
  UploadCloud, Calendar as CalendarIcon, Activity, Heart, 
  Droplet, Flame, Utensils, MessageSquare, Phone, Video, 
  FileSpreadsheet, Plus, AlertCircle, CheckCircle2, ChevronRight,
  ChevronLeft, PieChart, X, Smartphone, Moon, ChevronDown, Image as ImageIcon, AlertTriangle
} from 'lucide-vue-next';

// ----------------- 状态管理 -----------------
const activeTab = ref('工作台内容');
const toast = ref(null);
const showNotifications = ref(false);
const selectedDate = ref(19);
const currentMonth = ref(3);

const isAddMealOpen = ref(false);
const isDietLogOpen = ref(false);
const newMealForm = reactive({ img: null, desc: '', cal: '' });
const addMealFileInputRef = ref(null);

// 阻碍记录
const obstacles = ref([
  { id: 1, type: '饮食打卡阻碍', desc: '昨日公司聚餐，饮酒且饮食超标，未能按计划执行。', time: '今天 09:15' }
]);

// 动态餐食数据
const meals = ref([
  { id: 1, time: "早餐", cal: 350, desc: "燕麦片一碗，水煮蛋一个，脱脂牛奶250ml", img: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=100&q=80", macros: { carbs: 45, protein: 15, fat: 12, fiber: 4 } },
  { id: 2, time: "午餐", cal: 680, desc: "糙米饭一碗，香煎鸡胸肉，蒜蓉西兰花，少油少盐", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80", macros: { carbs: 75, protein: 35, fat: 18, fiber: 8 } },
  { id: 3, time: "晚餐", cal: 420, desc: "清蒸鲈鱼一条，清炒时蔬，半个水煮玉米", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80", macros: { carbs: 40, protein: 25, fat: 8, fiber: 5 } }
]);

// 历史饮食日志模拟数据
const historicalDietData = [
  {
    date: "2026年3月18日 (昨日)", totalCal: 1650,
    meals: [
      { time: "早餐", cal: 400, desc: "全麦面包两片，无糖豆浆，煎蛋", img: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=100&q=80" },
      { time: "午餐", cal: 750, desc: "牛肉荞麦面，清炒菠菜，少油", img: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=100&q=80" },
      { time: "晚餐", cal: 500, desc: "鸡胸肉沙拉，油醋汁，半个红薯", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80" }
    ]
  },
  {
    date: "2026年3月17日", totalCal: 1820,
    meals: [
      { time: "早餐", cal: 450, desc: "鲜肉包子两个，小米粥", img: "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=100&q=80" },
      { time: "午餐", cal: 820, desc: "排骨焖饭，紫菜蛋花汤", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=100&q=80" },
      { time: "晚餐", cal: 550, desc: "番茄炒蛋，小半碗米饭", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80" }
    ]
  }
];

// ----------------- 数据配置 (替换原有的多组件复用) -----------------
const navGroups = [
  { title: '工作台', items: [{ icon: LayoutDashboard, label: '系统首页' }, { icon: Activity, label: '工作台内容' }] },
  { title: '客户管理', items: [{ icon: Users, label: '客户列表' }, { icon: Heart, label: '人群监控' }] },
  { title: '业务中心', items: [{ icon: FileText, label: '方案库管理' }, { icon: PieChart, label: '健康数据大屏' }] }
];

const statItems = [
  { label: '今日任务', value: '8', sub: '项', color: 'text-slate-800', pl: false },
  { label: '已完成', value: '5', sub: '项', color: 'text-green-600', pl: true },
  { label: '待反馈', value: '3', sub: '项', color: 'text-amber-500', pl: true },
  { label: '依从率', value: '85', sub: '%', color: 'text-indigo-600', pl: true },
  { label: '代谢风险', value: '高', sub: '', color: 'text-red-500', pl: true }
];

const dataBlocks = [
  { icon: Activity, label: '心率', value: '78', unit: 'bpm', status: '正常', statusColor: 'text-green-500', device: 'Apple Watch', msg: '查看详细心率' },
  { icon: Heart, label: '血压', value: '125/82', unit: 'mmHg', status: '偏高', statusColor: 'text-orange-500', device: '欧姆龙', msg: '查看详细血压' },
  { icon: Droplet, label: '空腹血糖', value: '6.2', unit: 'mmol/L', status: '偏高', statusColor: 'text-orange-500', device: '三诺血糖仪', msg: '查看血糖记录' },
  { icon: Users, label: '体重', value: '68.5', unit: 'kg', status: '达标', statusColor: 'text-green-500', device: '华为体脂秤', msg: '查看体重曲线' }
];

const trendCharts = [
  { label: '空腹血糖变化', icon: Droplet, iconColor: 'text-orange-500', value: '6.4', unit: 'mmol/L (平均)', status: '偏高', statusColor: 'bg-orange-100 text-orange-700 border-orange-200', data: [5.8, 6.0, 7.5, 6.2, 5.9, 7.2, 6.2], strokeClass: 'stroke-orange-500', fillClass: 'fill-orange-500/10', dotClass: 'stroke-orange-500', msg: '展开血糖详细分析大图' },
  { label: '静息心率波动', icon: Activity, iconColor: 'text-rose-500', value: '75.7', unit: 'bpm (平均)', status: '正常', statusColor: 'bg-green-100 text-green-700 border-green-200', data: [72, 75, 71, 78, 82, 74, 78], strokeClass: 'stroke-rose-500', fillClass: 'fill-rose-500/10', dotClass: 'stroke-rose-500', msg: '展开静息心率详情' }
];

const quickActions = [
  { icon: Phone, label: '发起图文', colorClass: 'text-blue-500', msg: '正在拉起 IM 沟通窗口...' },
  { icon: Video, label: '视频问诊', colorClass: 'text-indigo-500', msg: '准备呼叫患者视频连线...' },
  { icon: CalendarIcon, label: '安排面诊', colorClass: 'text-emerald-500', msg: '打开排班日历表' },
  { icon: FileText, label: '发送方案', colorClass: 'text-amber-500', msg: '正在打开健康方案编辑器...' },
  { icon: Activity, label: '开立处方', colorClass: 'text-rose-500', msg: '跳转至处方开具页面' },
  { icon: FileSpreadsheet, label: '生成报告', colorClass: 'text-teal-500', msg: '正在为您生成本周期健康报告...' },
  { icon: Heart, label: '推送课程', colorClass: 'text-pink-500', msg: '打开知识库选择课程' },
  { icon: UploadCloud, label: '数据导出', colorClass: 'text-slate-500', msg: '后台正在打包导出 Excel 数据...' }
];

// 计算进度条分段
const nutrientBars = computed(() => {
  const configs = [
    { label: '卡路里', unit: 'kcal', target: 1800, key: 'cal', isMacro: false },
    { label: '碳水化合物', unit: 'g', target: 220, key: 'carbs', isMacro: true },
    { label: '蛋白质', unit: 'g', target: 80, key: 'protein', isMacro: true },
    { label: '脂肪', unit: 'g', target: 50, key: 'fat', isMacro: true },
    { label: '膳食纤维', unit: 'g', target: 25, key: 'fiber', isMacro: true },
  ];

  return configs.map(config => {
    const segs = meals.value.map(m => ({
      value: config.isMacro ? m.macros[config.key] : m[config.key],
      label: m.time,
      color: getMealColor(m.time)
    }));
    const total = segs.reduce((sum, seg) => sum + seg.value, 0);
    return {
      label: config.label,
      unit: config.unit,
      target: config.target,
      total,
      segments: segs.map(s => ({ ...s, percent: (s.value / config.target) * 100 }))
    };
  });
});

// ----------------- 方法与交互 -----------------
const showToastMessage = (msg) => {
  toast.value = msg;
  setTimeout(() => toast.value = null, 3000);
};

const handleSaveNewMeal = () => {
  if (!newMealForm.img || !newMealForm.desc) {
    showToastMessage("请上传照片并填写描述哦");
    return;
  }
  const newMeal = {
    id: Date.now(),
    time: "加餐",
    cal: Number(newMealForm.cal) || 150,
    desc: newMealForm.desc,
    img: newMealForm.img,
    macros: { carbs: 15, protein: 8, fat: 10, fiber: 2 }
  };
  meals.value.push(newMeal);
  Object.assign(newMealForm, { img: null, desc: '', cal: '' });
  isAddMealOpen.value = false;
  showToastMessage("餐食记录补充成功！");
};

const handleModalFileUpload = (e) => {
  if (e.target.files && e.target.files[0]) {
    newMealForm.img = URL.createObjectURL(e.target.files[0]);
  }
};

const handleResolveObstacle = (id) => {
  showToastMessage("已记录跟进情况，阻碍已标记为处理完成");
  obstacles.value = obstacles.value.filter(o => o.id !== id);
};

const changeMonth = (dir) => {
  const newMonth = currentMonth.value + dir;
  if (newMonth > 0 && newMonth <= 12) {
    currentMonth.value = newMonth;
    showToastMessage(`正在加载 2026年${newMonth}月 数据...`);
  }
};

// 工具方法：获取折线图绘制数据
const getChartData = (data) => {
  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data) * 0.95;
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const dataNodes = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }));

  return { points, areaPoints, dataNodes };
};

// 工具方法：获取柱状图睡眠数据
const getSleepChartData = (data) => {
  const max = Math.max(...data) > 8 ? Math.max(...data) : 8;
  return data.map(val => ({
    val,
    heightPercent: (val / max) * 100,
    isLow: val < 6.5
  }));
};

// 工具方法：颜色与日历样式
const getMealColor = (time) => {
  const colors = { "早餐": "bg-sky-400", "午餐": "bg-indigo-500", "晚餐": "bg-violet-500", "加餐": "bg-fuchsia-400" };
  return colors[time] || "bg-slate-400";
};

const getDayClass = (day) => {
  let bg = "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent";
  if (day === selectedDate.value) bg = "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-200 border-indigo-600 scale-105"; 
  else if (day < 19 && day % 4 !== 0) bg = "bg-green-50 text-green-700 hover:bg-green-100 border-green-100";
  else if (day < 19 && day % 4 === 0) bg = "bg-red-50 text-red-600 hover:bg-red-100 border-red-100";
  return bg;
};
</script>