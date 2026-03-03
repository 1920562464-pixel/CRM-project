<template>
  <div>
    <div
      class="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm hover:bg-slate-200 transition-colors group"
      :style="{ paddingLeft: `${level * 12 + 8}px` }"
    >
      <button
        v-if="children.length > 0"
        @click.stop="isExpanded = !isExpanded"
        class="p-0.5 hover:bg-slate-300 rounded"
      >
        <ChevronRight
          :size="14"
          :class="`transition-transform ${isExpanded ? 'rotate-90' : ''}`"
        />
      </button>
      <button
        @click="$emit('folderClick', folder.id)"
        :class="`flex-1 flex items-center gap-2 text-left ${
          currentFolderId === folder.id ? 'text-indigo-600 font-medium' : 'text-slate-700'
        }`"
      >
        <Folder :size="16" :style="{ color: folder.color }" />
        <input
          v-if="isEditing"
          v-model="editName"
          @blur="saveRename"
          @keydown.enter="saveRename"
          @keydown.esc="isEditing = false"
          class="h-6 px-1 text-sm bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ref="editInput"
        />
        <span v-else class="truncate">{{ folder.name }}</span>
      </button>
      <div class="hidden group-hover:flex items-center gap-0.5">
        <button
          @click="startEdit"
          class="p-1 hover:bg-slate-300 rounded"
          title="重命名"
        >
          <Edit :size="12" class="text-slate-600" />
        </button>
        <button
          @click="$emit('delete', folder.id)"
          class="p-1 hover:bg-slate-300 rounded"
          title="删除"
        >
          <Trash2 :size="12" class="text-red-600" />
        </button>
      </div>
    </div>
    <div v-if="isExpanded && children.length > 0">
      <FolderTreeItem
        v-for="child in children"
        :key="child.id"
        :folder="child"
        :folders="folders"
        :current-folder-id="currentFolderId"
        @folder-click="$emit('folderClick', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Folder, ChevronRight, Edit, Trash2 } from 'lucide-vue-next'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  children?: FolderNode[]
  color?: string
  createdAt: string
}

const props = defineProps<{
  folder: FolderNode
  folders: FolderNode[]
  currentFolderId: string | null
  level: number
}>()

const emit = defineEmits<{
  folderClick: [id: string]
  rename: [id: string, name: string]
  delete: [id: string]
}>()

const isExpanded = ref(true)
const isEditing = ref(false)
const editName = ref(props.folder.name)
const editInput = ref<HTMLInputElement | null>(null)

const children = computed(() => {
  return props.folders.filter(f => f.parentId === props.folder.id)
})

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
    emit('rename', props.folder.id, editName.value.trim())
  }
  isEditing.value = false
}
</script>
