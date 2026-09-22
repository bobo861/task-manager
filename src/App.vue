<script setup>
import NavBar from './components/NavBar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import { useDarkMode } from './composables/useDarkMode'

const { isDark } = useDarkMode()
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <NavBar />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <KanbanBoard />
    </main>
  </div>
</template>