<template>
  <div class="container">
    <div class="content">
      <div class="timer-section">
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
      </div>

      <div class="info-section">
        <section>
          <h2>About</h2>
          <p>RenewBreak reminds you to rest your eyes and stand up. Stay healthy with regular breaks!</p>
        </section>

        <section>
          <h2>Before You Start</h2>
          <p>Please enable browser notification for this site. Click the button below:</p>
          <button 
            @click="requestPermission" 
            class="notification-btn"
            :disabled="notificationPermission"
          >
            {{ notificationPermission ? 'Notifications Enabled' : 'Enable Notifications' }}
          </button>
          <p class="note">Mac users: You may need to visit <b>Settings → Notifications → Application Notifications</b> and allow notifications for your browser. Select <b>Banners</b> or <b>Alerts</b> for the best experience.</p>
        </section>

        <section>
          <h2>I'd Love Your Feedback!</h2>
          <p>
            This is the initial public release of my web app — I'd love to hear your thoughts! Feel free to fill out the feedback form 
            <a href="url" target="_blank">here</a>.
          </p>
        </section>
      </div>
    </div>
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
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content {
  display: flex;
  gap: 4rem;
}

.timer-section {
  max-width: 320px;
  margin: 0 auto;
}
.info-section {
  max-width: 640px;
  text-align: left;
  margin: 6.8rem auto;
}

.info-section section {
  margin-bottom: 2rem;
}
.info-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}
.info-section p {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  line-height: 1.5;
}
.note {
  font-size: 1rem;
  opacity: 0.9;
}

/* Responsive layout */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    gap: 2rem;
    margin-top: 1rem;
  }
  .timer-section {
    margin: 0 auto; /* Ensure centering in mobile view */
  }
  .info-section {
    text-align: center;
  }
}

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
    margin: 12px 0;
    opacity: 1;
    transition: opacity 0.25s ease;
}
.notification-btn:disabled {
    pointer-events: none;  /* Disables all hover/active effects */
    opacity: 0.6;
    cursor: default;
}
</style>