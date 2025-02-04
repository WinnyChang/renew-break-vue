<template>
  <div>
    <h1>RenewBreak</h1>
    <EyeRestTimer :isRunning="isRunning" :shouldReset="shouldReset" />
    <StandUpTimer :isRunning="isRunning" :shouldReset="shouldReset" />
    <div class="controls">
        <button class="reset-btn" @click="reset">Reset</button>
        <button class="start-btn" :class="{ 'pause' : isRunning }" @click="startPause">
            {{ isRunning ? 'Pause' : 'Start' }}
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StandUpTimer from './components/StandUpTimer.vue';
import EyeRestTimer from './components/EyeRestTimer.vue';

const isRunning = ref(false)
const shouldReset = ref(false)

const startPause = () => {
  isRunning.value = !isRunning.value
}

const reset = () => {
  isRunning.value = false
  shouldReset.value = true
  setTimeout(() => {
    shouldReset.value = false
  }, 100)
}
</script>

<style scoped>
.controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
}
.start-btn {
    color: #e2ffdb;
    background-color: #19570a;
}
.start-btn.pause {
    color: #fff6Bd;
    background-color: #615100;
}
</style>