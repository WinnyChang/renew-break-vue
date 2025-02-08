<template>
  <div class="container">
    <div class="content">
      <div class="timer-section">
        <h1>RenewBreak</h1>
        <EyeRestTimer 
          :notificationPermission="notificationPermission"
          :isRunning="isRunning"
          :shouldReset="shouldReset"
          :standupTimeSetting="standupTimeSetting"
          :standupTimeRemaining="standupTimeRemaining"
          @selectOption="reset"
        />
        <StandUpTimer 
          :notificationPermission="notificationPermission"
          :isRunning="isRunning"
          :shouldReset="shouldReset"
          @updateRemainingTime="updateStandupTimeRemaining"
          @timerComplete="reset"
          @selectOption="reset"
          @timeSetting="sendSetting"
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
          <p>Inspired by the 20-20-20 rule, RenewBreak reminds you to rest your eyes and stand up during computer work. Stay healthy with regular breaks!</p>
          <p class="note">Note: This web app is designed for <b>computer web browsers</b>, and some features may not work properly on mobile devices.</p>
        </section>

        <section>
          <h2>Timer Settings</h2>
          <ul>
            <li>Eye Rest Timer: Off / 20 / 30 min intervals (auto-repeats until focus time ends)</li>
            <li>Stand Up Timer: 25 / 50 / 75 min focus + 5 / 10 / 15 min break</li>
            <li>Default Setting: 20 min eye rest loop, 50 min focus + 10 min break<br>
              <p class="example">Under default setting, you'll get reminders at:
                20 min & 40 min for eye rest, 50 min for stand-up break, and 60 min to resume focus.</p>
            </li>
          </ul>
        </section>

        <section>
          <h2>Before You Start</h2>
          <p>Please <b>enable browser notifications</b> for this site. Click the button below:</p>
          <button 
            @click="requestPermission" 
            class="notification-btn"
            :disabled="notificationPermission"
          >
            {{ notificationPermission ? 'Notifications Enabled' : 'Enable Notifications' }}
          </button>
          <p>Please also <b>allow system notifications</b> from your browser.</p>
          <p class="note">Windows users: Go to <b>Settings → System → Notifications</b>, under <b>Notifications from apps and other senders</b>, select your browser, turn on notification and make sure <b>Show notification banners</b> is checked for the best experience.</p>
          <p class="note">MacOS users: Go to <b>System Settings → Notifications</b>, under <b>Application Notifications</b>, select your browser, allow notifications and select <b>Alerts</b> for the best experience.</p>
        </section>

        <section>
          <h2>I'd Love Your Feedback!</h2>
          <p>
            This is the initial public release of my web app, and I'd love to hear your thoughts! Feel free to fill out the feedback form 
            <a href="https://forms.gle/thmp2eGWhjhP5kur7" target="_blank">here</a>.
          </p>
        </section>
      </div>
    </div>
    <!-- Footer with counter -->
    <footer class="footer">
      <span>Version 1.0.1</span> ・ <span>Visitors </span>
      <a href="https://www.stylemap.co.jp/counter/taiwan/"><img src="https://www.f-counter.net/j/65/1738906000/" alt="visitor-counter"></a>
    </footer>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import StandUpTimer from './components/StandUpTimer.vue'
import EyeRestTimer from './components/EyeRestTimer.vue'

// Worker setup
const timerWorker = ref(null);
provide('timerWorker', timerWorker);  // Make the worker available to child components

// State / refs
const notificationPermission = ref(false);
const isRunning = ref(false);
const shouldReset = ref(false);
const standupTimeSetting = ref(50); // Default 50 min
const standupTimeRemaining = ref(0);

const requestPermission = async () => {
    if ("Notification" in window) {
        try {
            // Check if it's Edge browser
            const isEdge = navigator.userAgent.includes("Edg");
            
            if (isEdge) {
                // Guide users to Edge settings for notifications
                alert("Please enable notifications for this site in Edge settings:\n\n" +
                      "1. Click 'View site information' to the left of your address bar.\n" +
                      "2. Select 'Permissions for this site'.\n" +
                      "3. Allow notifications.\n\n" +
                      "Or go to: \nedge://settings/content/notifications \nand add this site under 'Allow'.");
                // Check permission again after alert
                const permission = Notification.permission;
                notificationPermission.value = permission === "granted";
            } else {
                // For other browsers
                const permission = await Notification.requestPermission();
                notificationPermission.value = permission === "granted";
            }
        } catch (error) {
            console.error('Failed to request notification permission:', error);
        }
    }
};


// Timer control functions
const startPause = () => {
  console.log(`${!isRunning.value ? 'Starting' : 'Pausing'} all timers`);
  isRunning.value = !isRunning.value;
};

const reset = () => {
  console.log('Resetting all timers');
  isRunning.value = false;
  shouldReset.value = true;
  standupTimeRemaining.value = 0;
  setTimeout(() => {
    shouldReset.value = false;
  }, 100);
};

const sendSetting = (time) => {
    standupTimeSetting.value = time;
};

const updateStandupTimeRemaining = (time) => {
    standupTimeRemaining.value = time;
};


onMounted(() => {
    timerWorker.value = new Worker(    
        new URL('./workers/timer-worker.js', import.meta.url),
            { type: 'module' }
    )
    if ("Notification" in window) {
        notificationPermission.value = Notification.permission === "granted";
    }
});

onBeforeUnmount(() => {
    if (timerWorker.value) {
        timerWorker.value.terminate();  // Stop the worker when component unmounts
    }
});
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
  margin: 0.5rem auto;
}

.info-section section {
  margin: 0 0 1.5rem;
}
.info-section h2 {
  margin: 0 0 0.4rem;
  font-size: 1.5rem;
}
.info-section p {
  margin: 0.4rem 0;
  font-size: 1.2rem;
  line-height: 1.4;
}
.info-section p.note {
  font-size: 0.9rem;
  opacity: 0.9;
}
.info-section ul {
  margin: 0.4rem 0;
  font-size: 1.05rem;
  line-height: 1.6;
  padding-left: 1.75rem;
}
.info-section p.example {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

/* Responsive layout for narrow browser window */
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
    margin: 6rem auto;
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

.footer {
  margin-top: auto;  /* Pushes footer to bottom */
  padding: 10px 0;
  text-align: center;
  width: 100%;
}
</style>