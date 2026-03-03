<template>
  <div>
    <button
      @click="$emit('select', folder.id)"
      :class="`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 transition-colors ${
        selectedId === folder.id ? 'bg-indigo-50 text-indigo-600' : ''
      }`"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
    >
      <ChevronRight
        v-if="children.length > 0"
        :size="14"
        :class="`transition-transform ${isExpanded ? 'rotate-90' : ''}`"
        @click.stop="isExpanded = !isExpanded"
      />
      <span v-else class="w-3.5"></span>
      <Folder :size="16" :style="{ color: folder.color || '#3b82f6' }" />
      <span class="flex-1 text-left">{{ folder.name }}</span>
      <CheckCircle2 v-if="selectedId === folder.id" :size="16" class="text-indigo-600" />
    </button>
    <div v-if="isExpanded && children.length > 0">
      <FolderSelectItem
        v-for="child in children"
        :key="child.id"
        :folder="child"
        :folders="folders"
        :selected-id="selectedId"
        @select="$emit('select', $event)"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, ChevronRight, CheckCircle2 } from 'lucide-vue-next'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  color?: string
  createdAt: string
}

const props = defineProps<{
  folder: FolderNode
  folders: FolderNode[]
  selectedId: string
  level: number
}>()

defineEmits<{
  select: [id: string]
}>()

const isExpanded = ref(false)

const children = computed(() => {
  return props.folders.filter(f => f.parentId === props.folder.id)
})
</script>
