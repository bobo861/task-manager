import { reactive } from 'vue'
import { loadTasks, saveTasks } from '../utils/storage'

let nextId = 1
const seeded = loadTasks()
if (seeded.length > 0) {
  nextId = Math.max(...seeded.map((t) => t.id)) + 1
}

const tasks = reactive(seeded)

function persist() {
  saveTasks([...tasks])
}

export function useTasks() {
  function addTask({ title, description = '', priority = 'medium' }) {
    if (!title || !title.trim()) return
    tasks.push({
      id: nextId++,
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    persist()
  }

  function updateTask(id, patch) {
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return
    Object.assign(tasks[idx], patch, {
      updatedAt: new Date().toISOString(),
    })
    persist()
  }

  function deleteTask(id) {
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return
    tasks.splice(idx, 1)
    persist()
  }

  function moveTask(id, newStatus) {
    updateTask(id, { status: newStatus })
  }

  function getTasksByStatus(status) {
    return tasks.filter((t) => t.status === status)
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
  }
}