import { ref, watch } from 'vue'

interface UserTags {
  [userId: string]: string[]
}

// 从localStorage加载标签数据
const loadUserTags = (): UserTags => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('userTags')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// 保存标签数据到localStorage
const saveUserTags = (tags: UserTags) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('userTags', JSON.stringify(tags))
  } catch (error) {
    console.error('Failed to save user tags:', error)
  }
}

// 全局用户标签存储
const userTags = ref<UserTags>(loadUserTags())

// 监听变化并自动保存
watch(userTags, (newTags) => {
  saveUserTags(newTags)
}, { deep: true })

export function useUserTags() {
  // 获取用户标签
  const getUserTags = (userId: string): string[] => {
    return userTags.value[userId] || []
  }

  // 设置用户标签
  const setUserTags = (userId: string, tags: string[]) => {
    userTags.value[userId] = [...tags]
  }

  // 添加标签
  const addUserTag = (userId: string, tag: string) => {
    const currentTags = getUserTags(userId)
    if (!currentTags.includes(tag)) {
      userTags.value[userId] = [...currentTags, tag]
    }
  }

  // 删除标签
  const removeUserTag = (userId: string, tagIndex: number) => {
    const currentTags = getUserTags(userId)
    userTags.value[userId] = currentTags.filter((_, i) => i !== tagIndex)
  }

  // 更新标签
  const updateUserTag = (userId: string, tagIndex: number, newTag: string) => {
    const currentTags = getUserTags(userId)
    if (tagIndex >= 0 && tagIndex < currentTags.length) {
      userTags.value[userId] = [
        ...currentTags.slice(0, tagIndex),
        newTag,
        ...currentTags.slice(tagIndex + 1)
      ]
    }
  }

  // 初始化用户默认标签（如果不存在）
  const initUserTags = (userId: string, defaultTags: string[] = []) => {
    if (!userTags.value[userId]) {
      userTags.value[userId] = [...defaultTags]
    }
  }

  return {
    userTags,
    getUserTags,
    setUserTags,
    addUserTag,
    removeUserTag,
    updateUserTag,
    initUserTags
  }
}
