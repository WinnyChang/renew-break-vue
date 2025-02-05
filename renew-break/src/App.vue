<template>
  <div>
    <h1>RenewBreak</h1>
    <EyeRestTimer 
      :notificationPermission="notificationPermission"
      :isRunning="isRunning"
      :shouldReset="shouldReset"
      :standupTimeRemaining="standupTimeRemaining"
    />
    <StandUpTimer 
      :notificationPermission="notificationPermission"
      :isRunning="isRunning"
      :shouldReset="shouldReset"
      @updateRemainingTime="updateStandupTimeRemaining"
      @timerComplete="onTimerComplete"
    />
    <div class="controls">
      <button class="reset-btn" @click="reset">Reset</button>
      <button class="start-btn" :class="{ 'pause' : isRunning }" @click="startPause">
          {{ isRunning ? 'Pause' : 'Start' }}
      </button>
    </div>
    <button 
      @click="requestPermission" 
      class="notification-btn"
      :disabled="notificationPermission"
    >
      {{ notificationPermission ? 'Notifications Enabled' : 'Enable Notifications' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StandUpTimer from './components/StandUpTimer.vue';
import EyeRestTimer from './components/EyeRestTimer.vue';

const notificationPermission = ref(false)
const isRunning = ref(false)
const shouldReset = ref(false)
const standupTimeRemaining = ref(0)

const requestPermission = async () => {
    if ("Notification" in window) {
        try {
            // Check if it's Edge browser
            const isEdge = navigator.userAgent.includes("Edg")
            
            if (isEdge) {
                // Guide users to Edge settings for notifications
                alert("Please enable notifications for this site in Edge settings:\n\n" +
                      "1. Click the 'View site information' icon in the left of address bar\n" +
                      "2. Click 'Permissions for this site'\n" +
                      "3. Allow notifications (the bell icon)\n\n" +
                      "Or go to edge://settings/content/notifications")
                // Check permission again after alert
                const permission = Notification.permission
                notificationPermission.value = permission === "granted"
            } else {
                // For other browsers
                const permission = await Notification.requestPermission()
                notificationPermission.value = permission === "granted"
            }
        } catch (error) {
            console.error('Failed to request notification permission:', error)
        }
    }
}
onMounted(() => {
    if ("Notification" in window) {
        notificationPermission.value = Notification.permission === "granted"
    }
})

const startPause = () => {
  isRunning.value = !isRunning.value
}

const reset = () => {
  isRunning.value = false
  shouldReset.value = true
  standupTimeRemaining.value = 0
  setTimeout(() => {
    shouldReset.value = false
  }, 100)
}

const updateStandupTimeRemaining = (time) => {
    standupTimeRemaining.value = time
}

const onTimerComplete = () => {
  isRunning.value = false
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

.notification-btn {
    width: 250px;
    margin: 12px;
    opacity: 1;
    transition: opacity 0.25s ease;
}
.notification-btn:disabled {
    pointer-events: none;  /* Disables all hover/active effects */
    opacity: 0.6;
    cursor: default;
}
</style>