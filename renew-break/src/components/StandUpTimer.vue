<template>
    <div class="card">
        <h2>Stand Up Timer</h2>

        <select v-model="selectedOption" @change="setTimes">
            <option v-for="[focusTime, breakTime] in timeOptions" :key="focusTime" :value="focusTime">
                {{ focusTime }} Focus + {{ breakTime }} Break
            </option>
        </select>

        <section class="timer" :class="{ 'inactive': isBreakTime }">
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

        <div class="break" :class="{ 'active': isBreakTime }">
            <h3>Break</h3>
            <section class="timer">
            <div class="break-display-time">
                {{displayBreakMinutes}}
            </div>
            <div class="break-display-time break-separator">:</div>
            <div class="break-display-time">
                {{displayBreakSeconds}}
            </div>
            </section>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
    
    const timeOptions = [
        [0.5, 0.1], [25, 5], [50, 10], [75, 15]
    ]

    const selectedOption = ref(50)  // Default focus time (50 min)
    const setMinutes = computed(() => selectedOption.value)
    const minutes = ref(setMinutes.value)
    const seconds = ref(0)
    const intervalId = ref(null)

    const setBreakMinutes = computed(() => {
        const option = timeOptions.find(([focus]) => focus === selectedOption.value)
        return option[1]
    })
    const breakMinutes = ref(setBreakMinutes.value)
    const breakSeconds = ref(0)
    const isBreakTime = ref(false)
    
    const props = defineProps({
        isRunning: {
            type: Boolean,
            required: true
        },
        shouldReset: {
            type: Boolean,
            required: true
        }
    })

    const startTime = ref(0)
    const pausedTime = ref(0)
    const totalPausedTime = ref(0)

    const notificationPermission = ref(false)

    // Calculate remaining time from standup timer
    const emit = defineEmits(['updateRemainingTime'])
    const remainingTimeInSeconds = computed(() => {
        if (!isBreakTime.value) {
            return minutes.value * 60 + seconds.value
        }
        return 0 // Return 0 during break time
    })
    // Watch for changes in remaining time and emit
    watch(remainingTimeInSeconds, (newValue) => {
        emit('updateRemainingTime', newValue)
    })

    // Timers function
    watch(() => props.isRunning, (newValue) => {
        if (newValue) {
            // Start timer
            if (startTime.value === 0) {
                startTime.value = Date.now()
            } else if (pausedTime.value > 0) {
                totalPausedTime.value += Date.now() - pausedTime.value
                pausedTime.value = 0
            };
            let frameId
            const updateTimer = () => {
                const currentTime = Date.now()
                const totalSeconds = isBreakTime.value ? 
                    setBreakMinutes.value * 60 : setMinutes.value * 60
                const elapsedSeconds = Math.floor((currentTime - startTime.value - totalPausedTime.value) / 1000)
                const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0)
                
                if (remainingSeconds === 0) {
                    if (!isBreakTime.value) {
                        // Main timer finished, start break timer
                        isBreakTime.value = true
                        startTime.value = Date.now()
                        totalPausedTime.value = 0
                        // Reset main timer display
                        minutes.value = setMinutes.value
                        seconds.value = 0
                        showNotification("Focus time complete!", "Time for a break!")

                        frameId = requestAnimationFrame(updateTimer)  // Continue updating for break timer
                    } else {
                        // Break timer finished
                        cancelAnimationFrame(frameId)
                        isBreakTime.value = false
                        showNotification("Break time complete!", "Back to focus!")
                        reset()
                    }
                    return
                }

                if (isBreakTime.value) {
                    breakMinutes.value = Math.floor(remainingSeconds / 60)
                    breakSeconds.value = remainingSeconds % 60
                } else {
                    minutes.value = Math.floor(remainingSeconds / 60)
                    seconds.value = remainingSeconds % 60
                }
                frameId = requestAnimationFrame(updateTimer)
            }

            frameId = requestAnimationFrame(updateTimer)
            intervalId.value = frameId // Store the frame ID for cleanup
        } else {
            // Pause timer
            if (intervalId.value) {
                cancelAnimationFrame(intervalId.value)
            }
            pausedTime.value = Date.now()
        }
    })

    watch(() => props.shouldReset, (newValue) => {
        if (newValue) {
            reset()
        }
    })

    const resetTimerStates = () => {
    minutes.value = setMinutes.value
    breakMinutes.value = setBreakMinutes.value
    seconds.value = 0
    breakSeconds.value = 0
    isBreakTime.value = false
    startTime.value = 0
    pausedTime.value = 0
    totalPausedTime.value = 0
}

const reset = () => {
    if (intervalId.value) {
        cancelAnimationFrame(intervalId.value)
    }
    resetTimerStates()
}

const setTimes = () => {
    if (props.isRunning) {
        cancelAnimationFrame(intervalId.value)
    }
    resetTimerStates()
}

    // Cleanup function that runs when component is destroyed
    onBeforeUnmount(() => {
        if (intervalId.value) {
            cancelAnimationFrame(intervalId.value)
        }
    })

    // Computed properties for main timer
    const displayMinutes = computed(() => minutes.value.toString().padStart(2, '0'));
    const displaySeconds = computed(() => seconds.value.toString().padStart(2, '0'));
    // Computed properties for break timer
    const displayBreakMinutes = computed(() => breakMinutes.value.toString().padStart(2, '0'))
    const displayBreakSeconds = computed(() => breakSeconds.value.toString().padStart(2, '0'))

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
    const showNotification = (title, message) => {
        if ("Notification" in window && notificationPermission.value) {
            new Notification(title, {
                body: message
            })
        }
    }
</script>

<style scoped>
.timer{
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
  .inactive {
    opacity: 0.5;
  }

.break {
    margin-top: 1.5rem;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}
  .break-display-time {
    font-size: 1.75rem;
    font-weight: 500;
    position: relative;
    margin: 0 3px;
  }
  .break-separator {
    margin-top: -0.3rem;
  }
  .active {
    opacity: 1;
  }
</style>