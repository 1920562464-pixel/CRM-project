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

              <!-- 教练/医生分配信息 -->
              <div class="mt-3 flex flex-col gap-2">
                <!-- 教练分配区域 -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base">👨‍⚕️</span>
                  <span class="text-xs text-slate-600 font-medium">教练团队:</span>

                  <!-- 教练列表 -->
                  <template v-if="clientAssignment?.coaches && clientAssignment.coaches.length > 0">
                    <div
                      v-for="(coachAssignment, index) in clientAssignment.coaches"
                      :key="coachAssignment.coachId"
                      class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg group"
                    >
                      <span class="text-sm font-medium text-slate-900">{{ coachAssignment.coachName }}</span>
                      <span class="text-xs text-slate-500">(负载: {{ getCoachLoad(coachAssignment.coachId) }}/{{ getCoachMaxLoad(coachAssignment.coachId) }})</span>
                      <span
                        :class="[
                          'text-xs px-1.5 py-0.5 rounded',
                          coachAssignment.isNewClient ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        ]"
                      >
                        {{ coachAssignment.isNewClient ? '新用户' : '老用户' }}
                      </span>
                      <span
                        :class="[
                          'text-xs px-1.5 py-0.5 rounded',
                          coachAssignment.serviceType === 'deep' ? 'bg-indigo-100 text-indigo-700' : 'bg-cyan-100 text-cyan-700'
                        ]"
                      >
                        {{ coachAssignment.serviceType === 'deep' ? '深度' : '基础' }}
                      </span>
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          @click="openChangeCoachModal(coachAssignment.coachId)"
                          class="p-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="更换教练"
                        >
                          更换
                        </button>
                        <button
                          @click="confirmRemoveCoach(coachAssignment.coachId)"
                          class="p-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="移除教练"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </template>

                  <!-- 添加教练按钮 -->
                  <button
                    @click="openAssignCoachModal"
                    class="flex items-center gap-1 px-3 py-1.5 border border-dashed border-emerald-300 text-emerald-600 rounded-lg text-xs hover:bg-emerald-50 transition-colors font-medium"
                  >
                    <Plus :size="12" />
                    添加教练
                  </button>
                </div>

                <!-- 医生分配区域 -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base">🩺</span>
                  <span class="text-xs text-slate-600 font-medium">医生:</span>
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <template v-if="clientAssignment?.doctorId">
                      <span class="text-sm font-medium text-slate-900">{{ clientAssignment?.doctorName }}</span>
                      <span class="text-xs text-green-600">(在线)</span>
                      <button
                        @click="openChangeDoctorModal"
                        class="p-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="更换医生"
                      >
                        更换
                      </button>
                      <button
                        @click="confirmRemoveDoctor"
                        class="p-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                        title="移除医生"
                      >
                        移除
                      </button>
                  </template>
                  <template v-else>
                    <button
                      @click="openAssignDoctorModal"
                      class="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-medium"
                    >
                      + 分配医生
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <div class="flex items-center gap-2">
              <button
                @click="showNotesSidebar = true"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-100"
                title="查看备注"
              >
                <FileText :size="18" />
              </button>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              ID: {{ clientId }} | Last Active: 10m ago
            </div>
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
          <div class="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative z-10">
              <h3 class="text-xl font-bold flex items-center gap-2 mb-1">
                <BrainCircuit :size="24" class="text-indigo-100" />
                AI 生成处方
              </h3>
              <p class="text-indigo-100 text-sm opacity-90 max-w-lg">
                基于用户的 128 项健康数据（体检、设备、问卷）实时生成个性化干预方案。
              </p>
              <div class="flex items-center gap-3 mt-4">
                <button
                  @click="openAIModal('lifestyle')"
                  class="relative z-10 px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                  <Heart :size="16" />
                  生活方式医学处方
                </button>
                <button
                  @click="openAIModal('nutrition')"
                  class="relative z-10 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg shadow-sm hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/30"
                >
                  <Apple :size="16" />
                  营养素处方
                </button>
              </div>
            </div>
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
                <template v-if="!isEditMode">
                  <button
                    @click="startEditMode"
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
                </template>
                <template v-else>
                  <button
                    @click="saveInlineEdit"
                    class="flex items-center gap-1.5 text-sm text-white font-medium bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-all border border-transparent shadow-sm hover:shadow"
                  >
                    <CheckCircle2 :size="16" /> 保存
                  </button>
                  <button
                    @click="cancelEditMode"
                    class="flex items-center gap-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 px-4 py-2 rounded-lg transition-all border border-slate-200"
                  >
                    <X :size="16" /> 取消
                  </button>
                </template>
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
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.name"
                      type="text"
                      class="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入姓名"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.name }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5 hover:from-slate-100 hover:to-slate-50 transition-all">
                  <span class="text-base flex-shrink-0">⚧</span>
                  <span class="text-xs uppercase tracking-wide">性别</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <select
                      v-model="editData.gender"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.gender }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5 hover:from-slate-100 hover:to-slate-50 transition-all">
                  <span class="text-base flex-shrink-0">🎂</span>
                  <span class="text-xs uppercase tracking-wide">出生日期</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.dob"
                      type="date"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.dob }}</span>
                  </template>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📅</span>
                  <span class="text-xs uppercase tracking-wide">年龄</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model.number="editData.age"
                      type="number"
                      class="w-24 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="年龄"
                    />
                    <span class="text-xs text-slate-500">岁</span>
                  </template>
                  <template v-else>
                    <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">{{ staticInfo.age }}岁</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📞</span>
                  <span class="text-xs uppercase tracking-wide">联系电话</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.phone"
                      type="tel"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入联系电话"
                    />
                  </template>
                  <template v-else>
                    <button @click="copyToClipboard(staticInfo.phone)" class="flex-shrink-0 p-1 text-slate-400 hover:text-indigo-600 transition-colors" :title="copied ? '已复制!' : '点击复制'">
                      <CheckCircle2 v-if="copied" :size="14" class="text-green-500" />
                      <FileText v-else :size="14" />
                    </button>
                    <span class="leading-relaxed">{{ staticInfo.phone }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📏</span>
                  <span class="text-xs uppercase tracking-wide">身高(cm)</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.height"
                      type="text"
                      class="w-24 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="身高"
                    />
                    <span class="text-xs text-slate-500">cm</span>
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.height }}</span>
                  </template>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚖</span>
                  <span class="text-xs uppercase tracking-wide">体重(kg)</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.weight"
                      type="text"
                      class="w-24 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="体重"
                    />
                    <span class="text-xs text-slate-500">kg</span>
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.weight }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">📊</span>
                  <span class="text-xs uppercase tracking-wide">渠道来源</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.channel"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入渠道来源"
                    />
                  </template>
                  <template v-else>
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">{{ staticInfo.channel }}</span>
                  </template>
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
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.bodyMetrics"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入身体指标"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.bodyMetrics }}</span>
                  </template>
                </div>
              </div>

              <div class="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🧬</span>
                  <span class="text-xs uppercase tracking-wide">遗传病史</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.hereditary"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入遗传病史"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.hereditary }}</span>
                  </template>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚠</span>
                  <span class="text-xs uppercase tracking-wide">过敏源</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.allergies"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入过敏源"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.allergies }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🎯</span>
                  <span class="text-xs uppercase tracking-wide">健康目标</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all bg-indigo-50/50 text-indigo-900 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <textarea
                      v-model="editData.goal"
                      rows="2"
                      class="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                      placeholder="请输入健康目标"
                    ></textarea>
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.goal }}</span>
                  </template>
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
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.taste"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入口味偏好"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.taste }}</span>
                  </template>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🩹</span>
                  <span class="text-xs uppercase tracking-wide">运动损伤史</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.injury"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入运动损伤史"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.injury }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">🏃</span>
                  <span class="text-xs uppercase tracking-wide">运动偏好</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.sportsPref"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入运动偏好"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.sportsPref }}</span>
                  </template>
                </div>
              </div>

              <div class="flex hover:bg-slate-50/50 transition-colors">
                <div class="w-[300px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">⚽</span>
                  <span class="text-xs uppercase tracking-wide">运动爱好</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all bg-indigo-50/50 text-indigo-900 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.hobbies"
                      type="text"
                      class="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入运动爱好"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.hobbies }}</span>
                  </template>
                </div>
                <div class="w-[200px] bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">😴</span>
                  <span class="text-xs uppercase tracking-wide">睡眠情况</span>
                </div>
                <div class="flex-1 p-4 border-r border-slate-100 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.sleep"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入睡眠情况"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.sleep }}</span>
                  </template>
                </div>
                <div class="w-48 bg-gradient-to-r from-slate-50 to-white p-4 font-bold text-slate-700 border-r border-slate-200 flex-shrink-0 flex items-center gap-2.5">
                  <span class="text-base flex-shrink-0">💊</span>
                  <span class="text-xs uppercase tracking-wide">用药情况及手术史</span>
                </div>
                <div class="flex-1 p-4 flex items-center gap-2 break-words transition-all text-slate-700 hover:bg-slate-50">
                  <template v-if="isEditMode">
                    <input
                      v-model="editData.medication"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="请输入用药情况"
                    />
                  </template>
                  <template v-else>
                    <span class="leading-relaxed">{{ staticInfo.medication }}</span>
                  </template>
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
          <HealthData :clientId="route.params.id as string" />
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
                <component :is="prescriptionType === 'lifestyle' ? Heart : BrainCircuit" :size="24" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-800">
                  {{ prescriptionType === 'lifestyle' ? '生活方式医学处方' : '营养素处方' }}
                </h3>
                <p class="text-xs text-slate-500">
                  基于 128 项健康数据由 AI Agent 实时生成
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

    <!-- 备注侧边栏 -->
    <Teleport to="body">
      <div v-if="showNotesSidebar" class="fixed inset-0 z-50 flex">
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          @click="showNotesSidebar = false"
        ></div>

        <!-- 侧边栏 -->
        <div class="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <!-- 侧边栏头部 -->
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText :size="20" class="text-indigo-600" />
                客户备注
              </h2>
              <button
                @click="showNotesSidebar = false"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- 搜索框 -->
            <div class="mt-4 relative">
              <input
                v-model="searchNotes"
                type="text"
                placeholder="搜索备注..."
                class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <!-- 备注列表 -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ note.content }}</p>
                  <p class="text-xs text-slate-400 mt-2">
                    {{ new Date(note.updatedAt).toLocaleString('zh-CN') }}
                  </p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="editNote(note)"
                    class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit3 :size="14" />
                  </button>
                  <button
                    @click="deleteNote(note.id)"
                    class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredNotes.length === 0" class="flex flex-col items-center justify-center h-48 text-slate-400">
              <FileText :size="48" class="mb-2 opacity-50" />
              <p class="text-sm">暂无备注</p>
            </div>
          </div>

          <!-- 添加/编辑备注 -->
          <div class="p-4 border-t border-slate-200 bg-slate-50">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-slate-700">
                {{ editingNoteId ? '编辑备注' : '添加备注' }}
              </h3>
              <button
                v-if="editingNoteId"
                @click="cancelEdit"
                class="text-xs text-slate-500 hover:text-slate-700"
              >
                取消编辑
              </button>
            </div>
            <div class="flex gap-2">
              <textarea
                v-model="newNoteContent"
                placeholder="输入备注内容..."
                class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                rows="3"
              ></textarea>
              <button
                @click="editingNoteId ? updateNote() : addNote()"
                :disabled="!newNoteContent.trim()"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
              >
                {{ editingNoteId ? '更新' : '添加' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Toast ref="toastRef" />

    <!-- 教练分配/更换模态框 -->
    <EmployeeAssignModal
      v-model:show="showCoachModal"
      position="coach"
      :client-id="clientId"
      :client-name="client.name"
      :current-employee-id="isChangeCoachMode ? (currentChangingCoachId || '') : ''"
      @confirm="handleCoachAssignment"
    />

    <!-- 医生分配/更换模态框 -->
    <EmployeeAssignModal
      v-model:show="showDoctorModal"
      position="doctor"
      :client-id="clientId"
      :client-name="client.name"
      :current-employee-id="isChangeDoctorMode ? clientAssignment?.doctorId : ''"
      @confirm="handleDoctorAssignment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useUserTags } from '../composables/useUserTags'
import { useEmployeeData } from '../composables/useEmployeeData'
import { useSystemLog } from '../composables/useSystemLog'
import { useManagementFee } from '../composables/useManagementFee'
import EmployeeAssignModal from '../components/EmployeeAssignModal.vue'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// User tags management
const {
  getUserTags,
  addUserTag,
  removeUserTag,
  updateUserTag,
  initUserTags
} = useUserTags()
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
  FileText,
  Heart,
  Apple,
  Search,
  Trash2,
  Users,
  Stethoscope
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

// Employee & System Log composables
const {
  getClientAssignment,
  getEmployeeById,
  assignCoach,
  changeCoach,
  removeCoach,
  assignDoctor,
  changeDoctor,
  removeDoctor
} = useEmployeeData()

const {
  logAssignCoach,
  logChangeCoach,
  logRemoveCoach,
  logAssignDoctor,
  logChangeDoctor,
  logRemoveDoctor
} = useSystemLog()

const { handleAssignmentChange } = useManagementFee()

// Employee assignment state
const clientAssignment = ref(getClientAssignment(clientId.value))
const showCoachModal = ref(false)
const showDoctorModal = ref(false)
const isChangeCoachMode = ref(false)
const isChangeDoctorMode = ref(false)

// Get coach load info
const getCoachLoad = (coachId?: string) => {
  if (!coachId) return 0
  const coach = getEmployeeById(coachId)
  return coach?.load || 0
}

const getCoachMaxLoad = (coachId?: string) => {
  if (!coachId) return 0
  const coach = getEmployeeById(coachId)
  return coach?.maxLoad || 0
}

// 当前正在更换的教练ID
const currentChangingCoachId = ref<string | null>(null)

// Open assign coach modal
const openAssignCoachModal = () => {
  isChangeCoachMode.value = false
  currentChangingCoachId.value = null
  showCoachModal.value = true
}

// Open change coach modal
const openChangeCoachModal = (coachId: string) => {
  isChangeCoachMode.value = true
  currentChangingCoachId.value = coachId
  showCoachModal.value = true
}

// Handle coach assignment
const handleCoachAssignment = (employeeId: string, data: { serviceType?: 'basic' | 'deep'; firstServiceDate?: string }) => {
  if (isChangeCoachMode.value && currentChangingCoachId.value) {
    // Change coach - 移除指定的教练，添加新教练
    const result = changeCoach(clientId.value, currentChangingCoachId.value, employeeId)

    if (result.success) {
      const newCoach = getEmployeeById(employeeId)
      logChangeCoach(
        clientId.value,
        client.value.name,
        oldCoachId,
        clientAssignment.value?.coachName || '',
        employeeId,
        newCoach?.name || '',
        clientAssignment.value?.isNewClient || false
      )
      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('教练更换成功')
    } else {
      toastRef.value?.error(result.message || '更换失败')
    }
  } else {
    // Assign new coach
    const result = assignCoach(
      clientId.value,
      client.value.name,
      employeeId,
      data.serviceType || 'basic',
      data.firstServiceDate || new Date().toISOString().split('T')[0]
    )

    if (result.success) {
      const coach = getEmployeeById(employeeId)
      logAssignCoach(
        clientId.value,
        client.value.name,
        employeeId,
        coach?.name || '',
        result.isNewClient || false
      )

      // Handle management fee
      handleAssignmentChange(
        clientId.value,
        client.value.name,
        employeeId,
        coach?.name || '',
        result.isNewClient || false,
        'assign'
      )

      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('教练分配成功')
    } else {
      toastRef.value?.error(result.message || '分配失败')
    }
  }
}

// Confirm remove coach
const confirmRemoveCoach = (coachId: string) => {
  if (!clientAssignment.value?.coaches) return

  const coachDetail = clientAssignment.value.coaches.find(c => c.coachId === coachId)
  if (!coachDetail) return

  if (confirm(`确定要移除 ${coachDetail.coachName} 教练吗？`)) {
    const result = removeCoach(clientId.value, coachId)

    if (result.success) {
      logRemoveCoach(
        clientId.value,
        client.value.name,
        coachId,
        result.coachName || ''
      )
      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('教练已移除')
    } else {
      toastRef.value?.error(result.message || '移除失败')
    }
  }
}

// Open assign doctor modal
const openAssignDoctorModal = () => {
  isChangeDoctorMode.value = false
  showDoctorModal.value = true
}

// Open change doctor modal
const openChangeDoctorModal = () => {
  isChangeDoctorMode.value = true
  showDoctorModal.value = true
}

// Handle doctor assignment
const handleDoctorAssignment = (employeeId: string) => {
  if (isChangeDoctorMode.value) {
    // Change doctor
    const oldDoctorId = clientAssignment.value?.doctorId || ''
    const result = changeDoctor(clientId.value, oldDoctorId, employeeId)

    if (result.success) {
      const newDoctor = getEmployeeById(employeeId)
      logChangeDoctor(
        clientId.value,
        client.value.name,
        oldDoctorId,
        clientAssignment.value?.doctorName || '',
        employeeId,
        newDoctor?.name || ''
      )
      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('医生更换成功')
    } else {
      toastRef.value?.error(result.message || '更换失败')
    }
  } else {
    // Assign new doctor
    const result = assignDoctor(clientId.value, client.value.name, employeeId)

    if (result.success) {
      const doctor = getEmployeeById(employeeId)
      logAssignDoctor(
        clientId.value,
        client.value.name,
        employeeId,
        doctor?.name || ''
      )
      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('医生分配成功')
    } else {
      toastRef.value?.error(result.message || '分配失败')
    }
  }
}

// Confirm remove doctor
const confirmRemoveDoctor = () => {
  if (!clientAssignment.value?.doctorId) return

  if (confirm(`确定要移除 ${clientAssignment.value.doctorName} 医生吗？`)) {
    const result = removeDoctor(clientId.value)

    if (result.success) {
      logRemoveDoctor(
        clientId.value,
        client.value.name,
        clientAssignment.value.doctorId,
        result.doctorName || ''
      )
      clientAssignment.value = getClientAssignment(clientId.value)
      toastRef.value?.success('医生已移除')
    } else {
      toastRef.value?.error(result.message || '移除失败')
    }
  }
}

// State
const activeTab = ref('overview')
const showAIModal = ref(false)
const aiStep = ref<'loading' | 'result'>('loading')
const prescriptionType = ref<'lifestyle' | 'nutrition'>('lifestyle')
const showAddTag = ref(false)
const newTag = ref('')
const editingTagIndex = ref<number | null>(null)
const editingTagValue = ref('')
const copied = ref(false)
const showEditModal = ref(false)
const isEditMode = ref(false)

// 备注相关状态
const showNotesSidebar = ref(false)
const notes = ref<ClientNote[]>([])
const newNoteContent = ref('')
const editingNoteId = ref<number | null>(null)
const searchNotes = ref('')

interface ClientNote {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  clientId: string
}

// Get current user ID from route
const currentUserId = computed(() => route.params.id as string)

// 使用共享的用户标签
const tags = computed(() => {
  const userTags = getUserTags(currentUserId.value)
  // 如果没有标签，使用默认标签
  if (userTags.length === 0) {
    const defaultTags = ['高风险', '老年', '减重', '脂肪肝', '企业高管', '经常出差']
    initUserTags(currentUserId.value, defaultTags)
    return defaultTags
  }
  return userTags
})

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

const editData = ref({ ...staticInfo.value })

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
    addUserTag(currentUserId.value, newTag.value.trim())
    newTag.value = ''
    showAddTag.value = false
    toastRef.value?.success('标签添加成功')
  }
}

const deleteTag = (index: number) => {
  removeUserTag(currentUserId.value, index)
  toastRef.value?.info('标签已删除')
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
    updateUserTag(currentUserId.value, editingTagIndex.value, editingTagValue.value.trim())
    editingTagIndex.value = null
    toastRef.value?.success('标签已更新')
  }
}

const cancelEditingTag = () => {
  editingTagIndex.value = null
  editingTagValue.value = ''
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  copied.value = true
  toastRef.value?.success('已复制到剪贴板')
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleShare = () => {
  // 模拟分享功能
  const url = window.location.href
  navigator.clipboard.writeText(url)
  toastRef.value?.success('分享链接已复制到剪贴板')
}

// 备注相关函数
const loadNotes = () => {
  const saved = localStorage.getItem(`client_notes_${currentUserId.value}`)
  if (saved) {
    try {
      notes.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load notes:', e)
      notes.value = []
    }
  }
}

const saveNotes = () => {
  localStorage.setItem(`client_notes_${currentUserId.value}`, JSON.stringify(notes.value))
}

// 监听客户ID变化，加载备注数据
watch(currentUserId, (newClientId) => {
  if (newClientId) {
    loadNotes()
  }
}, { immediate: true })

const addNote = () => {
  if (!newNoteContent.value.trim()) return

  const newNote: ClientNote = {
    id: Date.now(),
    content: newNoteContent.value.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: currentUserId.value
  }

  notes.value.unshift(newNote)
  newNoteContent.value = ''
  saveNotes()
  toastRef.value?.success('备注已添加')
}

const updateNote = () => {
  if (editingNoteId.value === null || !newNoteContent.value.trim()) return

  const noteIndex = notes.value.findIndex(n => n.id === editingNoteId.value)
  if (noteIndex !== -1) {
    notes.value[noteIndex].content = newNoteContent.value.trim()
    notes.value[noteIndex].updatedAt = new Date().toISOString()
    saveNotes()
    toastRef.value?.success('备注已更新')
  }

  editingNoteId.value = null
  newNoteContent.value = ''
}

const deleteNote = (noteId: number) => {
  if (confirm('确定要删除这条备注吗？')) {
    notes.value = notes.value.filter(n => n.id !== noteId)
    saveNotes()
    toastRef.value?.success('备注已删除')
  }
}

const editNote = (note: ClientNote) => {
  editingNoteId.value = note.id
  newNoteContent.value = note.content
}

const cancelEdit = () => {
  editingNoteId.value = null
  newNoteContent.value = ''
}

const filteredNotes = computed(() => {
  if (!searchNotes.value) return notes.value
  return notes.value.filter(n =>
    n.content.toLowerCase().includes(searchNotes.value.toLowerCase())
  )
})

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
  toastRef.value?.success('档案信息已保存')
}

// 内联编辑模式函数
const startEditMode = () => {
  editData.value = { ...staticInfo.value }
  isEditMode.value = true
  toastRef.value?.info('进入编辑模式，可直接修改表格内容')
}

const cancelEditMode = () => {
  isEditMode.value = false
  editData.value = { ...staticInfo.value }
}

const saveInlineEdit = () => {
  // 验证必填字段
  if (!editData.value.name || !editData.value.phone) {
    toastRef.value?.error('姓名和电话为必填项')
    return
  }

  // 保存数据
  staticInfo.value = { ...editData.value }
  client.value.name = editData.value.name
  isEditMode.value = false
  toastRef.value?.success('档案信息已保存')
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
  toastRef.value?.success('档案数据已导出')
}

const openAIModal = (type: 'lifestyle' | 'nutrition' = 'lifestyle') => {
  prescriptionType.value = type
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
    toastRef.value?.success('AI 报告已重新生成')
  }, 2000)
}

const applyAIReport = () => {
  showAIModal.value = false
  toastRef.value?.success('AI 处方已应用到干预计划')
}
</script>
