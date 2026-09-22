<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  task: { type: Object, default: null },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const formTitle = ref('')
const formDescription = ref('')
const formPriority = ref('medium')
const isEditing = ref(false)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      isEditing.value = !!props.task
      formTitle.value = props.task?.title ?? ''
      formDescription.value = props.task?.description ?? ''
      formPriority.value = props.task?.priority ?? 'medium'
    }
  },
)

function handleSubmit() {
  if (!formTitle.value.trim()) return
  emit('save', {
    id: props.task?.id,
    title: formTitle.value.trim(),
    description: formDescription.value.trim(),
    priority: formPriority.value,
  })
  emit('close')
}

function handleBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click="handleBackdrop"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ isEditing ? '编辑任务' : '新建任务' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标题 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formTitle"
              type="text"
              placeholder="输入任务标题"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autofocus
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              描述（选填）
            </label>
            <textarea
              v-model="formDescription"
              placeholder="输入任务描述"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">优先级</label>
            <select
              v-model="formPriority"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="high">高 🔴</option>
              <option value="medium">中 🟡</option>
              <option value="low">低 🟢</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {{ isEditing ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>