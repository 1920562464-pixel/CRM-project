<template>
  <div
    :class="`bg-white border rounded-lg p-3 hover:shadow-sm transition-all ${
      isSelected ? 'ring-2 ring-indigo-600' : 'border-slate-200'
    }`"
  >
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="$emit('select')"
        class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <Folder :size="24" :style="{ color: folder.color || '#3b82f6' }" />
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-sm truncate">{{ folder.name }}</h4>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="$emit('open')"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="打开"
        >
          <ChevronRight :size="14" class="text-slate-500" />
        </button>
        <button
          @click="startEdit"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="重命名"
        >
          <Edit :size="14" class="text-slate-500" />
        </button>
        <button
          @click="$emit('delete')"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="删除"
        >
          <Trash2 :size="14" class="text-red-600" />
        </button>
      </div>
    </div>

    <!-- 编辑输入框（行内显示） -->
    <div v-if="isEditing" class="mt-2">
      <input
        v-model="editName"
        @blur="saveRename"
        @keydown.enter="saveRename"
        @keydown.esc="isEditing = false"
        class="w-full px-2 py-1 text-sm bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ref="editInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Folder, ChevronRight, Edit, Trash2 } from 'lucide-vue-next'

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
const editInput = ref<HTMLInputElement | null>(null)

const startEdit = () => {
  isEditing.value = true
  editName.value = props.folder.name
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

const saveRename = () => {
  if (editName.value.trim() && editName.value !== props.folder.name) {
    emit('rename', editName.value.trim())
  }
  isEditing.value = false
}
</script>
