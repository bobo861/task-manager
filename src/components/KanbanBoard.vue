<script setup>
import { ref } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskCard from './TaskCard.vue'
import TaskForm from './TaskForm.vue'

const { tasks, addTask, deleteTask, getTasksByStatus } = useTasks()

const statuses = [
  { key: 'todo', label: '待办' },
  { key: 'in-progress', label: '进行中' },
  { key: 'done', label: '完成' },
]

const showForm = ref(false)
const editingTask = ref(null)

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
    const idx = tasks.findIndex((t) => t.id === data.id)
    if (idx !== -1) {
      tasks[idx].title = data.title
      tasks[idx].description = data.description
      tasks[idx].priority = data.priority
      tasks[idx].updatedAt = new Date().toISOString()
    }
  } else {
    addTask(data)
  }
}

function handleDelete(task) {
  if (confirm(`确定删除「${task.title}」？`)) {
    deleteTask(task.id)
  }
}

function onDragStart(e, task) {
  e.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, status: task.status }))
  e.dataTransfer.effectAllowed = 'move'
}

function onDrop(e, targetStatus) {
  e.preventDefault()
  try {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const task = tasks.find((t) => t.id === data.id)
    if (task && task.status !== targetStatus) {
      task.status = targetStatus
      task.updatedAt = new Date().toISOString()
    }
  } catch {
    // ignore bad data
  }
}

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">看板</h2>
      <button
        @click="openNew"
        class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        + 新建任务
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="col in statuses"
        :key="col.key"
        @drop="onDrop($event, col.key)"
        @dragover="onDragOver"
        class="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 min-h-[300px]"
      >
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          {{ col.label }}
          <span class="ml-1 text-xs font-normal text-gray-400">({{ getTasksByStatus(col.key).length }})</span>
        </h3>

        <div class="space-y-3">
          <TaskCard
            v-for="task in getTasksByStatus(col.key)"
            :key="task.id"
            :task="task"
            @edit="openEdit"
            @delete="handleDelete"
            @dragstart="onDragStart"
          />
        </div>

        <div
          v-if="getTasksByStatus(col.key).length === 0"
          class="text-center py-8 text-sm text-gray-400 dark:text-gray-500"
        >
          暂无任务
        </div>
      </div>
    </div>

    <TaskForm :task="editingTask" :visible="showForm" @close="showForm = false" @save="handleSave" />
  </div>
</template>