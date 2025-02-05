<template>
    <div class="card" :class="{ 'disabled': selectedOption === 'off' }">
        <h2>Eye Rest Timer</h2>

        <select v-model="selectedOption" @change="setTimes">
            <option value="off">Off</option>
            <option value="0.2">0.2 min</option>
            <option value="20">20 min</option>
            <option value="30">30 min</option>
        </select>

        <section class="timer">
        <div class="display-time">
            {{displayMinutes}}
            <div class="time-label">min</div>
        </div>
        <div class="display-time separator">:</div>
        <div class="display-time">
            {{displaySeconds}}
            <div class="time-label">s</div>
        </div>
        </section>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
    
    const selectedOption = ref('20') // Default time (20 min)
    const setMinutes = computed(() => selectedOption.value === 'off' ? 0 : Number(selectedOption.value))
    const minutes = ref(setMinutes.value)
    const seconds = ref(0)
    const intervalId = ref(null)

    const props = defineProps({
        isRunning: {
            type: Boolean,
            required: true
        },
        shouldReset: {
            type: Boolean,
            required: true
        },
        standupTimeRemaining: {  // Get remaining time from standup timer
            type: Number,
            required: true
        }
    })

    const startTime = ref(0)
    const pausedTime = ref(0)
    const totalPausedTime = ref(0)

    const notificationPermission = ref(false)

    // Main timer function
    watch(() => props.isRunning, (newValue) => {
        if (newValue && selectedOption.value !== 'off') {
            // Start / Restart timer
            if (minutes.value === setMinutes.value && seconds.value === 0) {
                startTime.value = Date.now()
                totalPausedTime.value = 0
            } else if (pausedTime.value > 0) {
                totalPausedTime.value += Date.now() - pausedTime.value
                pausedTime.value = 0
            };
            
            const updateTimer = () => {
                const currentTime = Date.now()
                const totalSeconds = setMinutes.value * 60
                const elapsedSeconds = Math.floor((currentTime - startTime.value - totalPausedTime.value) / 1000)
                const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0)
                
                if (remainingSeconds === 0) {
                    showNotification("Time to rest your eyes!", "Relax your eyes — look 20 feet (6 meters) away for 20 seconds.")
                    
                    // Reset timer display
                    minutes.value = setMinutes.value
                    seconds.value = 0
                    
                    if (props.standupTimeRemaining >= setMinutes.value * 60) {
                        // Loop EyeRestTimer
                        startTime.value = Date.now()
                        totalPausedTime.value = 0
                        if (props.isRunning) { // Only continue if still running
                            intervalId.value = requestAnimationFrame(updateTimer)
                        }
                    } else {
                        cancelAnimationFrame(intervalId.value)
                        intervalId.value = null
                    }
                    return
                }
            
                minutes.value = Math.floor(remainingSeconds / 60)
                seconds.value = remainingSeconds % 60
                if (props.isRunning) { // Only continue if still running
                    intervalId.value = requestAnimationFrame(updateTimer)
                }
            }
            intervalId.value = requestAnimationFrame(updateTimer)
        } else {
            // Pause timer
            if (intervalId.value) {
                cancelAnimationFrame(intervalId.value)
                intervalId.value = null
            }
            if (startTime.value > 0) {  // Only set pausedTime if timer was running
                pausedTime.value = Date.now()
            }
        }
    })

    watch(() => props.shouldReset, (newValue) => {
        if (newValue) {
            reset()
        }
    })

    const resetTimerStates = () => {
        minutes.value = setMinutes.value
        seconds.value = 0
        startTime.value = 0
        pausedTime.value = 0
        totalPausedTime.value = 0
    }

    const reset = () => {
        if (intervalId.value) {
            cancelAnimationFrame(intervalId.value)
            intervalId.value = null
        }
        resetTimerStates()
        if (props.isRunning) {
            props.isRunning = false
        }
    }

    const setTimes = () => {
        if (selectedOption.value === 'off') {
            minutes.value = null
            seconds.value = null
        } else {
            minutes.value = setMinutes.value
            seconds.value = 0
        }
        if (props.isRunning) {
            cancelAnimationFrame(intervalId.value)
        }
        resetTimerStates()
    }

    // Cleanup function that runs when component is destroyed
    onBeforeUnmount(() => {
        if (intervalId.value) {
            clearInterval(intervalId.value);
        }
    })

    // Computed properties to format the display
    const displayMinutes = computed(() => 
        selectedOption.value === 'off' ? '--' : minutes.value.toString().padStart(2, '0')
    )
    const displaySeconds = computed(() => 
        selectedOption.value === 'off' ? '--' : seconds.value.toString().padStart(2, '0')
    )

    // Request notification permission
    const requestPermission = async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission()
            notificationPermission.value = permission === "granted"
        }
    }
    onMounted(() => {
        requestPermission()
    })
    // Notify user when timer is up
    const showNotification = async (title, message) => {
        if ("Notification" in window && Notification.permission === "granted") {
            try {                
                new Notification(title, {
                    body: message,
                    requireInteraction: true
                })
            } catch (error) {
                console.error('Notification failed:', error)
            }
        }
    }
</script>

<style scoped>
.disabled {
    opacity: 0.5;
    transition: opacity 0.3s ease;
}
.timer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .display-time {
    font-size: 3.5rem;
    font-weight: 500;
    position: relative;
    margin: 0 6px;
  }
  .separator {
    margin-top: -1.5rem;
  }
  .time-label {
    font-size: 1.25rem;
    font-weight: 600;
    color: #b0b0b0;
    margin-top: -1rem;
  }
</style>