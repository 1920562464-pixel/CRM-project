<template>
  <div class="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
    <!-- Top Header Section -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-4">
          <button
            @click="goBack"
            class="mt-1 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft :size="20" />
          </button>

          <div class="flex items-start gap-4">
            <div
              :class="`w-14 h-14 rounded-full ${client.avatarColor} flex items-center justify-center text-xl font-bold text-white shadow-md ring-2 ring-slate-50`"
            >
              {{ client.name.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-slate-800">
                  {{ client.name }}
                </h1>
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-100">
                  {{ client.level }} 等级
                </span>
                <span class="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-100 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  活跃中
                </span>
              </div>

              <div class="mt-2 flex flex-wrap gap-2 items-center">
                <!-- 标签列表 - 支持编辑和删除 -->
                <template v-for="(tag, i) in tags" :key="i">
                  <!-- 编辑模式 -->
                  <input
                    v-if="editingTagIndex === i"
                    v-model="editingTagValue"
                    @blur="saveEditingTag"
                    @keydown.enter="saveEditingTag"
                    @keydown.esc="cancelEditingTag"
                    class="w-20 px-2 py-0.5 text-xs border border-indigo-300 rounded focus:outline-none"
                    ref="editTagInput"
                  />
                  <!-- 显示模式 -->
                  <div v-else class="group relative">
                    <span
                      @click="startEditingTag(i, tag)"
                      class="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 font-medium hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      #{{ tag }}
                    </span>
                    <button
                      @click.stop="deleteTag(i)"
                      class="absolute -top-1.5 -right-1.5 bg-slate-400 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X :size="8" />
                    </button>
                  </div>
                </template>

                <!-- 添加新标签 -->
                <div v-if="showAddTag" class="flex items-center gap-1">
                  <input
                    v-model="newTag"
                    @keydown.enter="handleAddTag"
                    type="text"
                    class="w-20 px-2 py-0.5 text-xs border border-indigo-300 rounded focus:outline-none"
                    placeholder="输入标签..."
                    ref="addTagInput"
                  />
                  <button @click="handleAddTag" class="text-indigo-600 hover:text-indigo-700">
                    <CheckCircle2 :size="14" />
                  </button>
                  <button @click="showAddTag = false" class="text-slate-400 hover:text-slate-600">
                    <X :size="14" />
                  </button>
                </div>

                <button
                  v-if="!showAddTag"
                  @click="openAddTag"
                  class="px-2 py-0.5 border border-dashed border-slate-300 text-slate-400 rounded-full text-xs hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center gap-1"
                >
                  <Plus :size="12" /> 添加
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div class="flex items-center gap-2">
            <button
              @click="handleShare"
              class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-100"
              title="分享客户档案"
            >
              <Share2 :size="18" />
            </button>
          </div>
          <div class="text-[10px] text-slate-400 font-mono">
            ID: {{ clientId }} | Last Active: 10m ago
          </div>
        </div>
      </div>

      <div class="flex items-center gap-6 mt-4 border-b border-transparent">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600 translate-y-[1px]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`"
        >
          <component :is="tab.icon" :size="18" />
          {{ tab.label }}
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto h-full">
        <!-- 概览 Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <!-- AI Prescription Trigger Section -->
          <div class="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative z-10">
              <h3 class="text-xl font-bold flex items-center gap-2 mb-1">
                <BrainCircuit :size="24" class="text-indigo-100" />
                AI 生活方式处方
              </h3>
              <p class="text-indigo-100 text-sm opacity-90 max-w-lg">
                基于用户的 128 项健康数据（体检、设备、问卷）实时生成个性化干预方案。
              </p>
            </div>
            <button
              @click="openAIModal"
              class="relative z-10 px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <BrainCircuit :size="18" />
              立即生成报告
            </button>
          </div>

          <!-- Static Health Info -->
          <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-sm">
                  <User :size="20" class="text-white" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-lg">静态健康信息</h3>
                  <p class="text-xs text-slate-500 mt-0.5">完整记录用户基础健康档案</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="openEditModal"
                  class="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-indigo-200 shadow-sm hover:shadow"
                >
                  <Edit3 :size="16" /> 编辑档案
                </button>
                <button
                  @click="handleExportData"
                  class="flex items-center gap-1.5 text-sm text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-700 px-4 py-2 rounded-lg transition-all border border-slate-200"
                >
                  <Download :size="16" /> 导出数据
                </button>
              </div>
            </div>

            <div class="text-sm">
              <!-- 基础信息区块 -->
              <div class="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 px-4 py-2 border-b border-blue-100">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">基础信息</span>
                </div>
              </div>

              <!-- 基础信息行 -->
              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5 hover:from-slate-100 hover:to-slate-50 transition-all">
                  <span class="text-base flex-shrink-0">👤</span>
                  <span class="text-xs uppercase tracking-wide">姓名</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all bg-indigo-50/50 text-indigo-900 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.name }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5 hover:from-slate-100 hover:to-slate-50 transition-all">
                  <span class="text-base flex-shrink-0">⚧</span>
                  <span class="text-xs uppercase tracking-wide">性别</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.gender }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5 hover:from-slate-100 hover:to-slate-50 transition-all">
                  <span class="text-base flex-shrink-0">🎂</span>
                  <span class="text-xs uppercase tracking-wide">出生日期</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.dob }}</span>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📅</span>
                  <span class="text-xs uppercase tracking-wide">年龄</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">{{ staticInfo.age }}岁</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📞</span>
                  <span class="text-xs uppercase tracking-wide">联系电话</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <button @click="copyToClipboard(staticInfo.phone)" class="flex-shrink-0 p-1 text-slate-400 hover:text-indigo-600 transition-colors" :title="copied ? '已复制!' : '点击复制'">
                    <CheckCircle2 v-if="copied" :size="14" class="text-green-500" />
                    <FileText v-else :size="14" />
                  </button>
                  <span class="leading-relaxed">{{ staticInfo.phone }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📏</span>
                  <span class="text-xs uppercase tracking-wide">身高(cm)</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.height }}</span>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚖</span>
                  <span class="text-xs uppercase tracking-wide">体重(kg)</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.weight }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📊</span>
                  <span class="text-xs uppercase tracking-wide">渠道来源</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">{{ staticInfo.channel }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🕐</span>
                  <span class="text-xs uppercase tracking-wide">创建时间</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.createTime }}</span>
                </div>
              </div>

              <!-- 健康状况区块 -->
              <div class="bg-gradient-to-r from-orange-50/50 to-red-50/30 px-4 py-2 border-b border-orange-100">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span class="text-xs font-bold text-orange-700 uppercase tracking-wider">健康状况</span>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🔄</span>
                  <span class="text-xs uppercase tracking-wide">更新时间</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.updateTime }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🏥</span>
                  <span class="text-xs uppercase tracking-wide">身体指标及疾病情况</span>
                </div>
                <div :class="`flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all hover:bg-slate-50 ${staticInfo.bodyMetrics !== '无数据' ? 'bg-orange-50/50 text-orange-900' : 'text-slate-700'}`">
                  <span class="leading-relaxed">{{ staticInfo.bodyMetrics }}</span>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🧬</span>
                  <span class="text-xs uppercase tracking-wide">遗传病史</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.hereditary }}</span>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚠</span>
                  <span class="text-xs uppercase tracking-wide">过敏源</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.allergies }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🎯</span>
                  <span class="text-xs uppercase tracking-wide">健康目标</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all bg-indigo-50/50 text-indigo-900 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.goal }}</span>
                </div>
              </div>

              <!-- 生活习惯区块 -->
              <div class="bg-gradient-to-r from-green-50/50 to-emerald-50/30 px-4 py-2 border-b border-green-100">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-xs font-bold text-green-700 uppercase tracking-wider">生活习惯</span>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🍽</span>
                  <span class="text-xs uppercase tracking-wide">口味偏好及用餐方式</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.taste }}</span>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🩹</span>
                  <span class="text-xs uppercase tracking-wide">运动损伤史</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.injury }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🏃</span>
                  <span class="text-xs uppercase tracking-wide">运动偏好</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.sportsPref }}</span>
                </div>
              </div>

              <div class="flex hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚽</span>
                  <span class="text-xs uppercase tracking-wide">运动爱好</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all bg-indigo-50/50 text-indigo-900 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.hobbies }}</span>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">😴</span>
                  <span class="text-xs uppercase tracking-wide">睡眠情况</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.sleep }}</span>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">💊</span>
                  <span class="text-xs uppercase tracking-wide">用药情况及手术史</span>
                </div>
                <div class="flex-1 p-4 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <span class="leading-relaxed">{{ staticInfo.medication }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 其他 Tab -->
        <div v-else-if="activeTab === 'intervention'">
          <InterventionManager />
        </div>

        <div v-else-if="activeTab === 'health'">
          <HealthData />
        </div>

        <div v-else-if="activeTab === 'datacenter'">
          <DataCenter />
        </div>

        <div v-else-if="activeTab === 'labeling'">
          <ConversationLabeling />
        </div>

        <div v-else-if="activeTab === 'config'">
          <ContentConfig />
        </div>

        <!-- 占位 Tab -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BrainCircuit :size="32" class="text-slate-400" />
            </div>
            <h3 class="text-lg font-semibold text-slate-700 mb-2">{{ currentTabLabel }}</h3>
            <p class="text-slate-500">该功能模块正在开发中...</p>
          </div>
        </div>
      </div>
    </main>

    <!-- AI Prescription Modal -->
    <Teleport to="body">
      <div v-if="showAIModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
        <div class="bg-white rounded-2xl w-[800px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2 rounded-lg shadow-sm">
                <BrainCircuit :size="24" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-800">
                  AI 生活方式处方
                </h3>
                <p class="text-xs text-slate-500">
                  基于 128 项健康数据由 Agent 实时生成
                </p>
              </div>
            </div>
            <button
              @click="closeAIModal"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X :size="24" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-8">
            <div v-if="aiStep === 'loading'" class="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 :size="48" class="text-indigo-600 animate-spin" />
              <div class="text-slate-600 font-medium animate-pulse">
                正在分析用户画像与健康数据...
              </div>
              <div class="text-xs text-slate-400">
                检索关联案例库 / 匹配医学指南 / 生成个性化建议
              </div>
            </div>

            <div v-else class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h4 class="font-bold text-indigo-900 mb-2">
                  综合评估结论
                </h4>
                <p class="text-indigo-800/80 leading-relaxed text-sm">
                  用户当前处于
                  <span class="font-bold">
                    代谢综合征高风险期
                  </span>
                  ，主要表现为BMI超标（26.5）及空腹血糖波动。建议立即启动为期
                  12 周的{" "}
                  <span class="font-bold">
                    "低碳水 + 间歇性断食"
                  </span>{" "}
                  干预计划，重点改善胰岛素敏感性。
                </p>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <!-- 饮食处方 -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-xl">🥗</div>
                    <h4 class="font-bold text-slate-800">饮食处方 (Diet)</h4>
                  </div>
                  <ul class="space-y-2">
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">实行 16:8 间歇性断食 (10:00-18:00 进食)</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">每日碳水限制在 100g 以内，晚餐杜绝精制碳水</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">增加十字花科蔬菜摄入，每日 > 500g</span>
                    </li>
                  </ul>
                </div>

                <!-- 运动处方 -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-xl">🏃</div>
                    <h4 class="font-bold text-slate-800">运动处方 (Exercise)</h4>
                  </div>
                  <ul class="space-y-2">
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">每周 3 次 Zone 2 有氧训练 (心率 130-140bpm, 45min)</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">餐后 30 分钟内散步 15 分钟 (尤其是晚餐后)</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">增加抗阻训练，重点强化下肢肌群</span>
                    </li>
                  </ul>
                </div>

                <!-- 睡眠处方 -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-xl">😴</div>
                    <h4 class="font-bold text-slate-800">睡眠处方 (Sleep)</h4>
                  </div>
                  <ul class="space-y-2">
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">固定上床时间：23:00 前</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">睡前 1 小时避免蓝光 (手机/电脑)</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">补充镁剂 300mg 助眠 (需遵医嘱)</span>
                    </li>
                  </ul>
                </div>

                <!-- 正念处方 -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-xl">🧘</div>
                    <h4 class="font-bold text-slate-800">正念处方 (Mindfulness)</h4>
                  </div>
                  <ul class="space-y-2">
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">每日 5 分钟腹式呼吸练习</span>
                    </li>
                    <li class="flex items-start gap-2 text-sm text-slate-600">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                      <span class="leading-relaxed">建立'进食觉察'机制，避免情绪性进食</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="aiStep === 'result'" class="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              @click="regenerateAIReport"
              class="px-4 py-2 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all"
            >
              重新生成
            </button>
            <button
              @click="applyAIReport"
              class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 :size="18" />
              采纳并应用到计划
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 编辑档案弹窗 -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200"
        @click.self="closeEditModal"
      >
        <div
          class="bg-white rounded-xl p-6 w-[600px] shadow-2xl animate-in zoom-in-95 duration-200"
          @click.stop
        >
          <h3 class="text-xl font-bold text-slate-800 mb-4">
            编辑档案信息
          </h3>
          <p class="text-slate-500 mb-6">
            此处为模拟编辑弹窗，实际可集成 Form 表单。
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">姓名</label>
              <input v-model="editForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">性别</label>
                <select v-model="editForm.gender" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>男</option>
                  <option>女</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">年龄</label>
                <input v-model.number="editForm.age" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
              <input v-model="editForm.phone" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="closeEditModal"
              class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              取消
            </button>
            <button
              @click="saveEdit"
              class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  ArrowLeft,
  User,
  Settings,
  Activity,
  BrainCircuit,
  Plus,
  Share2,
  Download,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  FileText
} from 'lucide-vue-next'
import InterventionManager from '../components/InterventionManager.vue'
import HealthData from '../components/HealthData.vue'
import DataCenter from '../components/DataCenter.vue'
import ConversationLabeling from '../components/ConversationLabeling.vue'
import ContentConfig from '../components/ContentConfig.vue'
import Toast from '../components/shared/Toast.vue'

const router = useRouter()
const route = useRoute()
const toastRef = ref<InstanceType<typeof Toast>>()

// 返回导航函数
const goBack = () => {
  // 检查是否有from参数，如果有则返回到该页面
  const fromPath = route.query.from as string
  if (fromPath) {
    router.push(fromPath)
  } else {
    // 默认返回到客户列表
    router.push('/client-list')
  }
}

const clientId = computed(() => route.params.id as string)

// State
const activeTab = ref('overview')
const showAIModal = ref(false)
const aiStep = ref<'loading' | 'result'>('loading')
const tags = ref(['高风险', '老年', '减重', '脂肪肝', '企业高管', '经常出差'])
const showAddTag = ref(false)
const newTag = ref('')
const editingTagIndex = ref<number | null>(null)
const editingTagValue = ref('')
const copied = ref(false)
const showEditModal = ref(false)

// Mock client data
const client = ref({
  name: '王磊',
  avatarColor: 'bg-indigo-500',
  level: 'L1',
  status: 'active',
  age: 38,
  gender: 'M'
})

const staticInfo = ref({
  name: '王磊',
  gender: '男',
  dob: '1988-01-27',
  age: 38,
  phone: '13811268064',
  height: '178.4',
  weight: '84.4',
  channel: '瑞承-线下活动-顾问',
  createTime: '2026-01-25 19:26:53',
  updateTime: '无',
  bodyMetrics: '无数据',
  hereditary: '无',
  allergies: '无',
  goal: '一年最想收获：减重、健康生活方式 主要健康诉求：轻度脂肪肝',
  taste: '未填写',
  injury: '无',
  sportsPref: '无',
  hobbies: '打篮球，每周2次',
  sleep: '无',
  medication: '无'
})

const editForm = ref({
  name: '王磊',
  gender: '男',
  age: 38,
  phone: '13811268064'
})

const TABS = [
  { id: 'overview', label: '档案概览', icon: User },
  { id: 'intervention', label: '干预管理', icon: BrainCircuit },
  { id: 'health', label: '健康指标', icon: Activity },
  { id: 'datacenter', label: '数据中心', icon: null },
  { id: 'labeling', label: '对话标注', icon: null },
  { id: 'config', label: '内容配置', icon: Settings }
]

// Computed
const currentTabLabel = computed(() => {
  return TABS.find(t => t.id === activeTab.value)?.label || ''
})

// Refs
const editTagInput = ref<HTMLInputElement>()
const addTagInput = ref<HTMLInputElement>()

// Methods
const openAddTag = () => {
  showAddTag.value = true
  nextTick(() => {
    addTagInput.value?.focus()
  })
}

const handleAddTag = () => {
  if (newTag.value.trim()) {
    tags.value.push(newTag.value.trim())
    newTag.value = ''
    showAddTag.value = false
    toastRef.value?.show('标签添加成功', 'success')
  }
}

const deleteTag = (index: number) => {
  tags.value.splice(index, 1)
  toastRef.value?.show('标签已删除', 'info')
}

const startEditingTag = (index: number, value: string) => {
  editingTagIndex.value = index
  editingTagValue.value = value
  nextTick(() => {
    editTagInput.value?.focus()
  })
}

const saveEditingTag = () => {
  if (editingTagIndex.value !== null && editingTagValue.value.trim()) {
    tags.value[editingTagIndex.value] = editingTagValue.value.trim()
    editingTagIndex.value = null
    toastRef.value?.show('标签已更新', 'success')
  }
}

const cancelEditingTag = () => {
  editingTagIndex.value = null
  editingTagValue.value = ''
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  copied.value = true
  toastRef.value?.show('已复制到剪贴板', 'success')
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleShare = () => {
  // 模拟分享功能
  const url = window.location.href
  navigator.clipboard.writeText(url)
  toastRef.value?.show('分享链接已复制到剪贴板', 'success')
}

const openEditModal = () => {
  editForm.value = {
    name: staticInfo.value.name,
    gender: staticInfo.value.gender,
    age: staticInfo.value.age,
    phone: staticInfo.value.phone
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveEdit = () => {
  staticInfo.value.name = editForm.value.name
  staticInfo.value.gender = editForm.value.gender
  staticInfo.value.age = editForm.value.age
  staticInfo.value.phone = editForm.value.phone
  client.value.name = editForm.value.name
  showEditModal.value = false
  toastRef.value?.show('档案信息已保存', 'success')
}

const handleExportData = () => {
  // 模拟导出功能
  const data = JSON.stringify(staticInfo.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `客户档案_${client.value.name}_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toastRef.value?.show('档案数据已导出', 'success')
}

const openAIModal = () => {
  showAIModal.value = true
  aiStep.value = 'loading'
  setTimeout(() => {
    aiStep.value = 'result'
  }, 2000)
}

const closeAIModal = () => {
  showAIModal.value = false
}

const regenerateAIReport = () => {
  aiStep.value = 'loading'
  setTimeout(() => {
    aiStep.value = 'result'
    toastRef.value?.show('AI 报告已重新生成', 'success')
  }, 2000)
}

const applyAIReport = () => {
  showAIModal.value = false
  toastRef.value?.show('AI 处方已应用到干预计划', 'success')
}
</script>
