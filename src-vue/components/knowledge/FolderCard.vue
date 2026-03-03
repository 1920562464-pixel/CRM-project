<template>
  <div
    :class="`group bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer ${
      isSelected ? 'ring-2 ring-indigo-600' : 'border-slate-200'
    }`"
    @dblclick="$emit('open')"
  >
    <div class="flex flex-col h-full">
      <!-- 复选框和操作按钮 -->
      <div class="flex justify-between items-start mb-2">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="$emit('select')"
          class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button class="p-1 hover:bg-slate-100 rounded" title="分享">
            <Share2 :size="12" class="text-slate-500" />
          </button>
          <button
            @click="startEdit"
            class="p-1 hover:bg-slate-100 rounded"
            title="重命名"
          >
            <Edit :size="12" class="text-slate-500" />
          </button>
          <button
            @click="$emit('delete')"
            class="p-1 hover:bg-slate-100 rounded"
            title="删除"
          >
            <Trash2 :size="12" class="text-red-600" />
          </button>
        </div>
      </div>

      <!-- 文件夹图标 -->
      <div class="flex justify-center mb-2">
        <Folder :size="36" :style="{ color: folder.color || '#3b82f6' }" />
      </div>

      <!-- 文件夹名称 -->
      <div class="flex-1 flex items-center justify-center">
        <input
          v-if="isEditing"
          v-model="editName"
          @blur="saveRename"
          @keydown.enter="saveRename"
          @keydown.esc="isEditing = false"
          class="h-5 w-full px-2 text-xs bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
        />
        <h4 v-else class="font-medium text-xs text-center truncate w-full" :title="folder.name">{{ folder.name }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Folder, Share2, Edit, Trash2 } from 'lucide-vue-next'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  color?: string
  createdAt: string
}

const props = defineProps<{
  folder: FolderNode
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
  open: []
  rename: [name: string]
  delete: []
}>()

const isEditing = ref(false)
const editName = ref(props.folder.name)

const startEdit = () => {
  isEditing.value = true
  editName.value = props.folder.name
  nextTick(() => {
    const input = document.querySelector('input') as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

const saveRename = () => {
  if (editName.value.trim() && editName.value !== props.folder.name) {
    emit('rename', editName.value.trim())
  }
  isEditing.value = false
}
</script>
