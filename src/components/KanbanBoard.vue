<script setup>
import { ref, computed } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskCard from './TaskCard.vue'
import TaskForm from './TaskForm.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const { tasks, addTask, updateTask, deleteTask, moveTask, getTasksByStatus } = useTasks()

const statuses = [
  { key: 'todo', label: '待办' },
  { key: 'in-progress', label: '进行中' },
  { key: 'done', label: '完成' },
]

const statusColors = {
  todo: 'border-t-blue-500',
  'in-progress': 'border-t-amber-500',
  done: 'border-t-emerald-500',
}

const showForm = ref(false)
const editingTask = ref(null)

// Search & sort
const searchQuery = ref('')
const sortBy = ref('created-desc')

const sortOptions = [
  { value: 'created-desc', label: '最新创建' },
  { value: 'created-asc', label: '最早创建' },
  { value: 'priority-desc', label: '优先级高→低' },
  { value: 'priority-asc', label: '优先级低→高' },
]

const priorityRank = { high: 3, medium: 2, low: 1 }

// Filtered + sorted tasks per status
function getFilteredTasks(statusKey) {
  let list = getTasksByStatus(statusKey)

  // Filter by search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q),
    )
  }

  // Sort
  const sorted = [...list]
  switch (sortBy.value) {
    case 'created-desc':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'created-asc':
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'priority-desc':
      sorted.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])
      break
    case 'priority-asc':
      sorted.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      break
  }
  return sorted
}

// Computed stats
const totalCount = computed(() => tasks.length)
const doneCount = computed(() => getTasksByStatus('done').length)

// Confirm dialog
const confirmVisible = ref(false)
const confirmTask = ref(null)

// Confirm for clear completed
const clearConfirmVisible = ref(false)

// Drag-over
const dragOverCol = ref(null)

function openNew() {
  editingTask.value = null
  showForm.value = true
}

function openEdit(task) {
  editingTask.value = task
  showForm.value = true
}

function handleSave(data) {
  if (data.id) {
    updateTask(data.id, {
      title: data.title,
      description: data.description,
      priority: data.priority,
    })
  } else {
    addTask(data)
  }
}

function askDelete(task) {
  confirmTask.value = task
  confirmVisible.value = true
}

function handleConfirmDelete() {
  if (confirmTask.value) {
    deleteTask(confirmTask.value.id)
    confirmTask.value = null
  }
  confirmVisible.value = false
}

function handleClearCompleted() {
  const doneTasks = [...getTasksByStatus('done')]
  doneTasks.forEach((t) => deleteTask(t.id))
  clearConfirmVisible.value = false
}

function onDragStart(e, task) {
  e.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, status: task.status }))
  e.dataTransfer.effectAllowed = 'move'
  e.target.classList.add('opacity-50')
}

function onDragEnd(e) {
  e.target.classList.remove('opacity-50')
  dragOverCol.value = null
}

function onDrop(e, targetStatus) {
  e.preventDefault()
  dragOverCol.value = null
  try {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (data.status !== targetStatus) {
      moveTask(data.id, targetStatus)
    }
  } catch {
    // ignore bad data
  }
}

function onDragOver(e, colKey) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOverCol.value = colKey
}

function onDragLeave(colKey) {
  if (dragOverCol.value === colKey) {
    dragOverCol.value = null
  }
}
</script>

<template>
  <div>
    <!-- Toolbar: search + sort + new task -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <!-- Search -->
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索任务标题或描述…"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <!-- Sort -->
      <select
        v-model="sortBy"
        class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- New task -->
      <button
        @click="openNew"
        class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
      >
        ＋ 新建任务
      </button>
    </div>

    <!-- Stats bar -->
    <div class="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
      <span>📊 共 <strong class="text-gray-700 dark:text-gray-200">{{ totalCount }}</strong> 个任务</span>
      <span>｜已完成 <strong class="text-emerald-600 dark:text-emerald-400">{{ doneCount }}</strong></span>
      <span>｜待完成 <strong class="text-blue-600 dark:text-blue-400">{{ totalCount - doneCount }}</strong></span>

      <button
        v-if="doneCount > 0"
        @click="clearConfirmVisible = true"
        class="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400 underline underline-offset-2"
      >
        清空已完成
      </button>
    </div>

    <!-- Search results info -->
    <div
      v-if="searchQuery.trim() && tasks.length > 0"
      class="mb-3 text-sm text-gray-500 dark:text-gray-400"
    >
      搜索「{{ searchQuery }}」共找到
      <strong>{{ getFilteredTasks('todo').length + getFilteredTasks('in-progress').length + getFilteredTasks('done').length }}</strong> 个结果
    </div>

    <!-- Kanban columns -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="col in statuses"
        :key="col.key"
        @drop="onDrop($event, col.key)"
        @dragover="onDragOver($event, col.key)"
        @dragleave="onDragLeave(col.key)"
        class="rounded-xl p-4 min-h-[300px] border-t-4 transition-all duration-200"
        :class="[
          statusColors[col.key],
          dragOverCol === col.key
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 shadow-inner scale-[1.01]'
            : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
        ]"
      >
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span>{{ col.label }}</span>
          <span
            class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium"
            :class="{
              'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': col.key === 'todo',
              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': col.key === 'in-progress',
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300': col.key === 'done',
            }"
          >
            {{ getFilteredTasks(col.key).length }}
          </span>
        </h3>

        <TransitionGroup name="card" tag="div" class="space-y-3" appear>
          <TaskCard
            v-for="task in getFilteredTasks(col.key)"
            :key="task.id"
            :task="task"
            @edit="openEdit"
            @delete="askDelete"
            @dragstart="onDragStart"
            @dragend="onDragEnd"
          />
        </TransitionGroup>

        <div
          v-if="getFilteredTasks(col.key).length === 0"
          class="text-center py-10 text-sm text-gray-400 dark:text-gray-500"
        >
          <div class="text-2xl mb-2 opacity-40">
            {{ searchQuery.trim() ? '🔍' : col.key === 'todo' ? '📝' : col.key === 'in-progress' ? '🔄' : '✅' }}
          </div>
          <p>{{ searchQuery.trim() ? '无匹配结果' : '暂无任务' }}</p>
        </div>
      </div>
    </div>

    <TaskForm :task="editingTask" :visible="showForm" @close="showForm = false" @save="handleSave" />

    <!-- Delete single task -->
    <ConfirmDialog
      :visible="confirmVisible"
      title="删除任务"
      :message="`确定要删除「${confirmTask?.title}」吗？此操作不可恢复。`"
      confirmText="删除"
      :danger="true"
      @confirm="handleConfirmDelete"
      @cancel="confirmVisible = false"
    />

    <!-- Clear all completed -->
    <ConfirmDialog
      :visible="clearConfirmVisible"
      title="清空已完成"
      :message="`确定要删除所有 ${doneCount} 个已完成任务吗？此操作不可恢复。`"
      confirmText="全部删除"
      :danger="true"
      @confirm="handleClearCompleted"
      @cancel="clearConfirmVisible = false"
    />
  </div>
</template>

<style scoped>
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.card-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
.card-move {
  transition: transform 0.3s ease;
}
</style>