<script setup>
import { ref } from 'vue'
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

// Confirm dialog state
const confirmVisible = ref(false)
const confirmTask = ref(null)

// Drag-over state
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
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">📋 看板</h2>
      <button
        @click="openNew"
        class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
      >
        ＋ 新建任务
      </button>
    </div>

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
            {{ getTasksByStatus(col.key).length }}
          </span>
        </h3>

        <TransitionGroup name="card" tag="div" class="space-y-3" appear>
          <TaskCard
            v-for="task in getTasksByStatus(col.key)"
            :key="task.id"
            :task="task"
            @edit="openEdit"
            @delete="askDelete"
            @dragstart="onDragStart"
            @dragend="onDragEnd"
          />
        </TransitionGroup>

        <div
          v-if="getTasksByStatus(col.key).length === 0"
          class="text-center py-10 text-sm text-gray-400 dark:text-gray-500"
        >
          <div class="text-2xl mb-2 opacity-40">
            {{ col.key === 'todo' ? '📝' : col.key === 'in-progress' ? '🔄' : '✅' }}
          </div>
          <p>暂无任务</p>
        </div>
      </div>
    </div>

    <TaskForm :task="editingTask" :visible="showForm" @close="showForm = false" @save="handleSave" />

    <ConfirmDialog
      :visible="confirmVisible"
      title="删除任务"
      :message="`确定要删除「${confirmTask?.title}」吗？此操作不可恢复。`"
      confirmText="删除"
      :danger="true"
      @confirm="handleConfirmDelete"
      @cancel="confirmVisible = false"
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