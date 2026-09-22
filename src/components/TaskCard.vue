<script setup>
defineProps({
  task: { type: Object, required: true },
})

defineEmits(['edit', 'delete', 'dragstart', 'dragend'])

const priorityColors = {
  high: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
  medium: 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300',
  low: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
}

const priorityLabels = { high: '高', medium: '中', low: '低' }
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
    draggable="true"
    @dragstart="$emit('dragstart', $event, task)"
    @dragend="$emit('dragend', $event)"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-medium text-gray-900 dark:text-white text-sm leading-snug break-words">{{ task.title }}</h3>
      <span
        class="shrink-0 text-xs px-2 py-0.5 rounded border font-medium"
        :class="priorityColors[task.priority]"
      >
        {{ priorityLabels[task.priority] }}
      </span>
    </div>

    <p v-if="task.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
      {{ task.description }}
    </p>

    <div class="mt-2 flex items-center justify-end gap-1">
      <button
        @click.stop="$emit('edit', task)"
        class="text-xs px-2 py-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        编辑
      </button>
      <button
        @click.stop="$emit('delete', task)"
        class="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        删除
      </button>
    </div>
  </div>
</template>