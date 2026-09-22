<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定执行此操作吗？' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

const localVisible = ref(false)

watch(
  () => props.visible,
  (v) => {
    localVisible.value = v
  },
)

function handleConfirm() {
  localVisible.value = false
  emit('confirm')
}

function handleCancel() {
  localVisible.value = false
  emit('cancel')
}

function handleBackdrop(e) {
  if (e.target === e.currentTarget) handleCancel()
}

// Keyboard shortcut
function onKeydown(e) {
  if (!localVisible.value) return
  if (e.key === 'Escape') handleCancel()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="localVisible"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
        @click="handleBackdrop"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
          <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ message }}</p>
          <div class="flex justify-end gap-2 mt-6">
            <button
              @click="handleCancel"
              class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 rounded-lg text-sm text-white transition-colors"
              :class="
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              "
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>