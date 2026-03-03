<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="rounded-2xl p-6 shadow-lg" :style="{
      background: isBlackGold.value ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' : 'linear-gradient(to right, #1e293b, #0f172a)',
      color: 'white'
    }">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 rounded-lg backdrop-blur-sm" :style="{ background: 'rgba(255, 255, 255, 0.2)' }">
          <Settings :size="24" />
        </div>
        <h1 class="text-2xl font-bold">系统管理</h1>
      </div>
      <p class="text-sm" :style="{ color: 'rgba(255, 255, 255, 0.7)' }">
        管理系统用户、角色权限、配置参数等核心功能
      </p>
    </div>

    <!-- Tabs -->
    <div class="rounded-xl shadow-sm p-2" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center gap-2 p-4 rounded-lg transition-all"
          :style="activeTab === tab.id ? {
            background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : 'rgba(79, 70, 229, 0.1)',
            color: isBlackGold.value ? '#D4A84A' : '#4f46e5'
          } : {
            color: 'var(--text-secondary)'
          }"
        >
          <component :is="tab.icon" :size="24" :stroke-width="activeTab === tab.id ? 2.5 : 2" />
          <div class="text-center">
            <p class="text-sm font-medium" :style="{ fontWeight: activeTab === tab.id ? 'bold' : 'normal' }">
              {{ tab.label }}
            </p>
            <p class="text-xs hidden md:block" :style="{ color: 'var(--text-disabled)' }">{{ tab.description }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="rounded-xl shadow-sm p-6" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" :style="{ color: 'var(--text-placeholder)' }" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索用户名、邮箱..."
                class="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 w-80 text-sm"
                :style="{
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
                }"
              />
            </div>
            <select
              v-model="userStatusFilter"
              class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          <button
            @click="openAddUserDialog"
            class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm"
            :style="{
              background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
            }"
          >
            <Plus :size="16" />
            添加用户
          </button>
        </div>

        <div class="rounded-lg overflow-hidden" :style="{ border: '1px solid var(--border)' }">
          <table class="w-full text-left">
            <thead :style="{
              background: 'var(--fill-light)',
              borderBottom: '1px solid var(--border)'
            }">
              <tr>
                <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">用户信息</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">角色</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">部门</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">状态</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">最后登录</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase text-right" :style="{ color: 'var(--text-secondary)' }">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                      {{ user.avatar }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-800">{{ user.name }}</p>
                      <p class="text-xs text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeClass(user.role)}`">{{ user.role }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ user.department }}</td>
                <td class="px-6 py-4">
                  <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`">
                    {{ user.status === 'active' ? '活跃' : '非活跃' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ user.lastLogin }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="editUser(user)"
                      class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit :size="16" />
                    </button>
                    <button
                      @click="confirmDeleteUser(user.id)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 角色权限 -->
      <div v-else-if="activeTab === 'roles'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">共 {{ roles.length }} 个角色</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="role in roles"
            :key="role.id"
            class="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div :class="`p-3 bg-${role.color}-100 rounded-lg`">
                <span class="text-2xl">{{ role.icon }}</span>
              </div>
              <button
                @click="editRolePermissions(role)"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="编辑权限"
              >
                <Lock :size="16" />
              </button>
            </div>
            <h3 class="font-bold text-slate-800 mb-2">{{ role.name }}</h3>
            <p class="text-sm text-slate-500 mb-4">{{ role.description }}</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">用户数量</span>
                <span class="font-medium text-slate-800">{{ role.userCount }} 人</span>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(perm, key) in getEnabledPermissions(role)"
                  :key="String(key)"
                  class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                >
                  {{ perm }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作日志 -->
      <div v-else-if="activeTab === 'logs'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <select
              v-model="logModuleFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">全部模块</option>
              <option value="用户管理">用户管理</option>
              <option value="系统配置">系统配置</option>
            </select>
            <select
              v-model="logStatusFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="success">成功</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <button
            @click="exportLogs"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <Download :size="16" />
            导出日志
          </button>
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b">
              <tr>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">操作人</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">操作动作</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">模块</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">IP地址</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">时间</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 text-sm font-medium text-slate-800">{{ log.operator }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ log.action }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{{ log.module }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ log.ip }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ log.time }}</td>
                <td class="px-6 py-4">
                  <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`">
                    {{ log.status === 'success' ? '成功' : '失败' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 系统配置 -->
      <div v-else-if="activeTab === 'config'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">共 {{ configs.length }} 条配置</p>
          <button
            @click="openAddConfigDialog"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <Plus :size="16" />
            添加配置
          </button>
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b">
              <tr>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">配置键</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">配置值</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">说明</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">分类</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">更新时间</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="config in configs" :key="config.id" class="hover:bg-slate-50">
                <td class="px-6 py-4">
                  <code class="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {{ config.key }}
                  </code>
                </td>
                <td class="px-6 py-4 text-sm text-slate-800 font-medium">{{ config.value }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ config.description }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{{ config.category }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ config.updateTime }}</td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="editConfig(config)"
                    class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 数据字典 -->
      <div v-else-if="activeTab === 'dictionary'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <select
              v-model="dictionaryTypeFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">全部类型</option>
              <option value="客户状态">客户状态</option>
              <option value="客户等级">客户等级</option>
            </select>
          </div>
          <button
            @click="openAddDictionaryDialog"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <Plus :size="16" />
            添加字典项
          </button>
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b">
              <tr>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">类型</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">编码</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">标签</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">排序</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="dict in filteredDictionaries" :key="dict.id" class="hover:bg-slate-50">
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{{ dict.type }}</span>
                </td>
                <td class="px-6 py-4">
                  <code class="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {{ dict.code }}
                  </code>
                </td>
                <td class="px-6 py-4 text-sm text-slate-800 font-medium">{{ dict.label }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ dict.sort }}</td>
                <td class="px-6 py-4">
                  <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                    dict.status === 'enabled' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`">
                    {{ dict.status === 'enabled' ? '启用' : '禁用' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="editDictionary(dict)"
                      class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit :size="16" />
                    </button>
                    <button
                      @click="confirmDeleteDictionary(dict.id)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 通知公告 -->
      <div v-else-if="activeTab === 'notifications'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <select
              v-model="notificationTypeFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">全部类型</option>
              <option value="system">系统通知</option>
              <option value="notice">公告</option>
              <option value="urgent">紧急</option>
            </select>
            <select
              v-model="notificationStatusFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
          <button
            @click="openAddNotificationDialog"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <Plus :size="16" />
            发布公告
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div :class="`p-2 rounded-lg ${
                  notification.type === 'urgent' ? 'bg-red-50' :
                  notification.type === 'system' ? 'bg-blue-50' :
                  'bg-green-50'
                }`">
                  <Bell :size="20" :class="{
                    'text-red-600': notification.type === 'urgent',
                    'text-blue-600': notification.type === 'system',
                    'text-green-600': notification.type === 'notice'
                  }" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-800">{{ notification.title }}</h3>
                  <p class="text-xs text-slate-500 mt-1">
                    {{ notification.publisher }} · {{ notification.publishTime }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`">
                  {{ notification.status === 'published' ? '已发布' : '草稿' }}
                </span>
                <button
                  @click="editNotification(notification)"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreVertical :size="16" />
                </button>
              </div>
            </div>
            <p class="text-sm text-slate-600 mb-3">{{ notification.content }}</p>
            <div class="flex items-center gap-4 text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <Eye :size="14" />
                阅读 {{ notification.readCount }}
              </span>
              <span :class="`px-2 py-1 rounded text-xs ${
                notification.type === 'urgent' ? 'bg-red-100 text-red-800' :
                notification.type === 'system' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`">
                {{ notification.type === 'urgent' ? '紧急' :
                   notification.type === 'system' ? '系统' : '公告' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户编辑/新增弹窗 -->
    <Teleport to="body">
      <div v-if="showUserDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
            <button @click="showUserDialog = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">姓名 *</label>
              <input v-model="userForm.name" type="text" placeholder="请输入姓名" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">邮箱 *</label>
              <input v-model="userForm.email" type="email" placeholder="请输入邮箱" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">角色</label>
                <select v-model="userForm.role" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">请选择角色</option>
                  <option v-for="roleOption in roles" :key="roleOption.id" :value="roleOption.name">{{ roleOption.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">部门</label>
                <select v-model="userForm.department" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">请选择部门</option>
                  <option value="技术">技术</option>
                  <option value="运营">运营</option>
                  <option value="教练">教练</option>
                  <option value="财务">财务</option>
                  <option value="前台">前台</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">状态</label>
              <select v-model="userForm.status" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="active">活跃</option>
                <option value="inactive">非活跃</option>
              </select>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button @click="showUserDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
            <button @click="saveUser" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 角色权限编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showRolePermissionDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
            <div class="flex items-center gap-3">
              <div :class="`p-2 rounded-lg bg-${editingRole?.color}-100`">
                <Shield :size="24" :class="`text-${editingRole?.color}-600`" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900">编辑角色权限</h3>
                <p class="text-sm text-slate-500">{{ editingRole?.name }} · {{ editingRole?.description }}</p>
              </div>
            </div>
            <button @click="showRolePermissionDialog = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>
          <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <!-- 权限分组 -->
            <div v-for="(permissions, category) in groupedPermissions" :key="category" class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-1 h-5 bg-indigo-500 rounded-full"></div>
                <h4 class="font-semibold text-slate-800">{{ category }}</h4>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                <label
                  v-for="(perm, key) in permissions"
                  :key="String(key)"
                  class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  :class="{ 'border-indigo-300 bg-indigo-50': rolePermissionForm[key as keyof typeof rolePermissionForm] }"
                >
                  <input
                    type="checkbox"
                    :checked="rolePermissionForm[key as keyof typeof rolePermissionForm]"
                    @change="togglePermission(key as keyof RoleConfig['permissions'])"
                    class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-700">{{ perm.label }}</p>
                  </div>
                  <Check v-if="rolePermissionForm[key as keyof typeof rolePermissionForm]" :size="16" class="text-indigo-600" />
                </label>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 bg-white rounded-b-2xl">
            <div class="text-sm text-slate-500">
              已选择 <span class="font-semibold text-indigo-600">{{ enabledPermissionsCount }}</span> / {{ totalPermissionsCount }} 项权限
            </div>
            <div class="flex items-center gap-3">
              <button @click="showRolePermissionDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
              <button @click="saveRolePermissions" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">保存权限</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import { ROLE_CONFIGS, type RoleConfig, type UserRole } from '../composables/useRole'
import {
  Users,
  Shield,
  ScrollText,
  Settings,
  BookOpen,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  MoreVertical,
  Check,
  Lock,
  Unlock
} from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

type TabType = 'users' | 'roles' | 'logs' | 'config' | 'dictionary' | 'notifications'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive'
  lastLogin: string
  avatar: string
}

interface Role {
  id: UserRole
  name: string
  description: string
  color: string
  icon: string
  permissions: {
    showCoachSettlement: boolean
    showDoctorSettlement: boolean
    showCommissionSettlement: boolean
    showIncomeManagement: boolean
    showAccountReceivable: boolean
    showAccountPayable: boolean
    showFundsManagement: boolean
    showReimbursement: boolean
    showMemberList: boolean
    showPotentialMembers: boolean
    showInventory: boolean
    showProductLibrary: boolean
    showSystemManagement: boolean
  }
  userCount: number
}

interface Log {
  id: string
  operator: string
  action: string
  module: string
  ip: string
  time: string
  status: 'success' | 'failed'
}

interface SystemConfig {
  id: string
  key: string
  value: string
  description: string
  category: string
  updateTime: string
}

interface Dictionary {
  id: string
  type: string
  code: string
  label: string
  sort: number
  status: 'enabled' | 'disabled'
}

interface Notification {
  id: string
  title: string
  content: string
  type: 'system' | 'notice' | 'urgent'
  publishTime: string
  publisher: string
  status: 'published' | 'draft'
  readCount: number
}

const toast = useToast()

// Tabs
const tabs = [
  { id: 'users' as TabType, label: '用户管理', icon: Users, description: '管理系统用户及权限' },
  { id: 'roles' as TabType, label: '角色权限', icon: Shield, description: '配置角色与权限矩阵' },
  { id: 'logs' as TabType, label: '操作日志', icon: ScrollText, description: '查看系统操作审计记录' },
  { id: 'config' as TabType, label: '系统配置', icon: Settings, description: '全局参数与业务规则设置' },
  { id: 'dictionary' as TabType, label: '数据字典', icon: BookOpen, description: '维护系统基础数据字典' },
  { id: 'notifications' as TabType, label: '通知公告', icon: Bell, description: '发布系统通知与公告' }
]

const activeTab = ref<TabType>('users')

// Filters
const searchQuery = ref('')
const userStatusFilter = ref('all')
const logModuleFilter = ref('all')
const logStatusFilter = ref('all')
const dictionaryTypeFilter = ref('all')
const notificationTypeFilter = ref('all')
const notificationStatusFilter = ref('all')

// Dialog states
const showUserDialog = ref(false)
const showGenericDialog = ref(false)
const showRolePermissionDialog = ref(false)
const editingUser = ref<User | null>(null)
const editingRole = ref<Role | null>(null)
const genericDialogTitle = ref('')

// Forms
const userForm = ref({
  name: '',
  email: '',
  role: '',
  department: '',
  status: 'active' as 'active' | 'inactive'
})

const genericForm = ref({
  name: '',
  description: ''
})

// 角色权限表单
const rolePermissionForm = ref<RoleConfig['permissions']>({
  showCoachSettlement: false,
  showDoctorSettlement: false,
  showCommissionSettlement: false,
  showIncomeManagement: false,
  showAccountReceivable: false,
  showAccountPayable: false,
  showFundsManagement: false,
  showReimbursement: false,
  showMemberList: false,
  showPotentialMembers: false,
  showInventory: false,
  showProductLibrary: false,
  showSystemManagement: false
})

// Mock data
const users = ref<User[]>([
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: '管理员', department: '技术', status: 'active', lastLogin: '2024-01-15 14:30', avatar: 'ZS' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: '教练', department: '教练', status: 'active', lastLogin: '2024-01-15 10:20', avatar: 'LS' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: '医生', department: '医疗', status: 'active', lastLogin: '2024-01-14 16:45', avatar: 'WW' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', role: '财务', department: '财务', status: 'active', lastLogin: '2024-01-10 09:15', avatar: 'ZL' },
  { id: '5', name: '孙七', email: 'sunqi@example.com', role: '顾问', department: '销售', status: 'active', lastLogin: '2024-01-12 11:00', avatar: 'SQ' },
  { id: '6', name: '周八', email: 'zhouba@example.com', role: '前台', department: '前台', status: 'active', lastLogin: '2024-01-13 15:30', avatar: 'ZB' }
])
// 使用统一的角色配置
const roles = ref<Role[]>(
  Object.values(ROLE_CONFIGS).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    color: r.color,
    icon: r.icon,
    permissions: { ...r.permissions },
    userCount: Math.floor(Math.random() * 15) + 1
  }))
)

// 权限配置定义
const PERMISSION_DEFINITIONS = {
  // 人力结算权限
  showCoachSettlement: { label: '教练结算', category: '人力结算' },
  showDoctorSettlement: { label: '医生结算', category: '人力结算' },
  showCommissionSettlement: { label: '佣金结算', category: '人力结算' },
  // 财务中心权限
  showIncomeManagement: { label: '收入管理', category: '财务中心' },
  showAccountReceivable: { label: '应收账款', category: '财务中心' },
  showAccountPayable: { label: '应付账款', category: '财务中心' },
  showFundsManagement: { label: '资金管理', category: '财务中心' },
  showReimbursement: { label: '报销管理', category: '财务中心' },
  // 会员管理权限
  showMemberList: { label: '会员列表', category: '会员管理' },
  showPotentialMembers: { label: '潜在客户', category: '会员管理' },
  // 库存管理权限
  showInventory: { label: '库存管理', category: '库存管理' },
  showProductLibrary: { label: '商品库', category: '库存管理' },
  // 系统管理权限
  showSystemManagement: { label: '系统管理', category: '系统管理' }
}

const logs = ref<Log[]>([
  { id: '1', operator: '张三', action: '删除用户', module: '用户管理', ip: '192.168.1.100', time: '2024-01-15 14:30:25', status: 'success' },
  { id: '2', operator: '李四', action: '修改系统配置', module: '系统配置', ip: '192.168.1.101', time: '2024-01-15 14:25:18', status: 'success' },
  { id: '3', operator: '王五', action: '登录系统', module: '认证', ip: '192.168.1.102', time: '2024-01-15 14:20:10', status: 'failed' },
  { id: '4', operator: '赵六', action: '导出数据', module: '数据管理', ip: '192.168.1.103', time: '2024-01-15 14:15:05', status: 'success' }
])

const configs = ref<SystemConfig[]>([
  { id: '1', key: 'system.title', value: '惯能健康CRM', description: '系统标题', category: '基础设置', updateTime: '2024-01-01' },
  { id: '2', key: 'session.timeout', value: '30', description: '会话超时时间（分钟）', category: '安全设置', updateTime: '2024-01-01' },
  { id: '3', key: 'upload.maxSize', value: '10', description: '文件上传最大大小（MB）', category: '文件设置', updateTime: '2024-01-01' }
])

const dictionaries = ref<Dictionary[]>([
  { id: '1', type: '客户状态', code: 'active', label: '活跃', sort: 1, status: 'enabled' },
  { id: '2', type: '客户状态', code: 'inactive', label: '非活跃', sort: 2, status: 'enabled' },
  { id: '3', type: '客户等级', code: 'vip', label: 'VIP客户', sort: 1, status: 'enabled' },
  { id: '4', type: '客户等级', code: 'normal', label: '普通客户', sort: 2, status: 'enabled' }
])

const notifications = ref<Notification[]>([
  { id: '1', title: '系统维护通知', content: '系统将于本周六凌晨2点进行维护升级', type: 'system', publishTime: '2024-01-15 10:00', publisher: '系统管理员', status: 'published', readCount: 128 },
  { id: '2', title: '功能更新公告', content: '新增AI智能分析功能', type: 'notice', publishTime: '2024-01-14 15:30', publisher: '产品经理', status: 'published', readCount: 256 },
  { id: '3', title: '紧急通知', content: '关于数据备份的紧急提醒', type: 'urgent', publishTime: '2024-01-13 09:00', publisher: '系统管理员', status: 'draft', readCount: 0 }
])

// Computed
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.name.includes(searchQuery.value) || user.email.includes(searchQuery.value)
    const matchesStatus = userStatusFilter.value === 'all' || user.status === userStatusFilter.value
    return matchesSearch && matchesStatus
  })
})

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesModule = logModuleFilter.value === 'all' || log.module === logModuleFilter.value
    const matchesStatus = logStatusFilter.value === 'all' || log.status === logStatusFilter.value
    return matchesModule && matchesStatus
  })
})

const filteredDictionaries = computed(() => {
  return dictionaries.value.filter(dict => {
    return dictionaryTypeFilter.value === 'all' || dict.type === dictionaryTypeFilter.value
  })
})

const filteredNotifications = computed(() => {
  return notifications.value.filter(notification => {
    const matchesType = notificationTypeFilter.value === 'all' || notification.type === notificationTypeFilter.value
    const matchesStatus = notificationStatusFilter.value === 'all' || notification.status === notificationStatusFilter.value
    return matchesType && matchesStatus
  })
})

// 角色权限相关计算属性
const groupedPermissions = computed(() => {
  const groups: Record<string, Record<string, { label: string }>> = {}
  for (const [key, perm] of Object.entries(PERMISSION_DEFINITIONS)) {
    if (!groups[perm.category]) {
      groups[perm.category] = {}
    }
    groups[perm.category][key] = { label: perm.label }
  }
  return groups
})

const enabledPermissionsCount = computed(() => {
  return Object.values(rolePermissionForm.value).filter(v => v === true).length
})

const totalPermissionsCount = computed(() => {
  return Object.keys(rolePermissionForm.value).length
})

// Methods
const openAddUserDialog = () => {
  editingUser.value = null
  userForm.value = { name: '', email: '', role: '', department: '', status: 'active' }
  showUserDialog.value = true
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = { ...user }
  showUserDialog.value = true
}

const saveUser = () => {
  if (!userForm.value.name || !userForm.value.email) {
    toast.error('验证失败', '请填写必填项')
    return
  }

  if (editingUser.value) {
    Object.assign(editingUser.value, userForm.value)
    toast.success('更新成功', `用户 "${userForm.value.name}" 信息已更新`)
  } else {
    users.value.push({
      id: `user-${Date.now()}`,
      avatar: userForm.value.name.slice(0, 2).toUpperCase(),
      ...userForm.value,
      lastLogin: new Date().toLocaleString('zh-CN', { hour12: false })
    })
    toast.success('添加成功', `用户 "${userForm.value.name}" 已添加`)
  }

  showUserDialog.value = false
}

const confirmDeleteUser = (id: string) => {
  const user = users.value.find(u => u.id === id)
  if (!user) return

  if (confirm(`确定要删除用户 "${user.name}" 吗？此操作不可恢复。`)) {
    users.value = users.value.filter(u => u.id !== id)
    toast.success('删除成功', `用户 "${user.name}" 已删除`)
  }
}

const openAddRoleDialog = () => {
  toast.info('提示', '角色由系统预设，如需修改请联系技术管理员')
}

const editRolePermissions = (role: Role) => {
  editingRole.value = role
  rolePermissionForm.value = { ...role.permissions }
  showRolePermissionDialog.value = true
}

const togglePermission = (key: keyof RoleConfig['permissions']) => {
  rolePermissionForm.value[key] = !rolePermissionForm.value[key]
}

const saveRolePermissions = () => {
  if (editingRole.value) {
    // 更新角色权限
    const roleIndex = roles.value.findIndex(r => r.id === editingRole.value!.id)
    if (roleIndex !== -1) {
      roles.value[roleIndex].permissions = { ...rolePermissionForm.value }
      toast.success('保存成功', `角色 "${editingRole.value.name}" 权限已更新`)
    }
  }
  showRolePermissionDialog.value = false
}

const getEnabledPermissions = (role: Role) => {
  const enabled: Record<string, string> = {}
  for (const [key, value] of Object.entries(role.permissions)) {
    if (value && PERMISSION_DEFINITIONS[key as keyof typeof PERMISSION_DEFINITIONS]) {
      enabled[key] = PERMISSION_DEFINITIONS[key as keyof typeof PERMISSION_DEFINITIONS].label
    }
  }
  return enabled
}

const getRoleBadgeClass = (roleName: string): string => {
  const role = roles.value.find(r => r.name === roleName)
  if (!role) return 'bg-slate-100 text-slate-700'
  return `bg-${role.color}-500 text-white`
}

const openAddConfigDialog = () => {
  genericForm.value = { name: '', description: '' }
  genericDialogTitle.value = '添加配置'
  showGenericDialog.value = true
}

const editConfig = (config: SystemConfig) => {
  genericForm.value = { name: config.value, description: config.description }
  genericDialogTitle.value = '编辑配置'
  showGenericDialog.value = true
}

const openAddDictionaryDialog = () => {
  genericForm.value = { name: '', description: '' }
  genericDialogTitle.value = '添加字典项'
  showGenericDialog.value = true
}

const editDictionary = (dict: Dictionary) => {
  genericForm.value = { name: dict.label, description: dict.type }
  genericDialogTitle.value = '编辑字典项'
  showGenericDialog.value = true
}

const confirmDeleteDictionary = (id: string) => {
  const dict = dictionaries.value.find(d => d.id === id)
  if (!dict) return

  if (confirm(`确定要删除字典项 "${dict.label}" 吗？`)) {
    dictionaries.value = dictionaries.value.filter(d => d.id !== id)
    toast.success('删除成功', '字典项已删除')
  }
}

const openAddNotificationDialog = () => {
  genericForm.value = { name: '', description: '' }
  genericDialogTitle.value = '发布公告'
  showGenericDialog.value = true
}

const editNotification = (notification: Notification) => {
  genericForm.value = { name: notification.title, description: notification.content }
  genericDialogTitle.value = '编辑公告'
  showGenericDialog.value = true
}

const saveGeneric = () => {
  toast.success('保存成功', '操作已完成')
  showGenericDialog.value = false
}

const exportLogs = () => {
  toast.info('导出中', '正在导出操作日志...')
  setTimeout(() => {
    toast.success('导出成功', '操作日志已导出')
  }, 1500)
}
</script>
