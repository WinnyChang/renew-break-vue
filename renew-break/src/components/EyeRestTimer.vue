<template>
    <div class="card">
        <h2>Eye Rest Timer</h2>

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

        <div class="controls">
            <button class="reset-btn" @click="reset">Reset</button>
            <button class="start-btn" :class="{ 'pause' : isRunning }" @click="startPause">
                {{ isRunning ? 'Pause' : 'Start' }}
            </button>
            <select v-model="setMinutes" @change="set">
                <option v-for="value in [20, 30, 40, 50, 60]" :key="value" :value="value">
                    {{ value }} min
                </option>
            </select>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onBeforeUnmount } from 'vue'
    
    const setMinutes = ref(20)  // Default time
    const minutes = ref(setMinutes.value)
    const seconds = ref(0)
    const intervalId = ref(null)
    const isRunning = ref(false)

    // Main timer function
    const startPause = () => {
        if (isRunning.value) {
            // Pause timer
            isRunning.value = false;
            clearInterval(intervalId.value);
        } else {
            // Start timer
            isRunning.value = true;
            intervalId.value = setInterval(() => {
                if (seconds.value === 0) {
                    // When reaches 00:00, stop the timer
                    if (minutes.value === 0) {
                        isRunning.value = false;
                        clearInterval(intervalId.value)
                        reset()   // Auto reset
                        return
                    }
                    // When reaches MM:00 (MM > 00), decrease minutes and reset seconds
                    minutes.value--
                    seconds.value = 59
                } else {  // Otherwise just decrease seconds
                    seconds.value--
                }
            }, 1000)  // Run every 1000 ms (1 second)
        }
    }

    const reset = () => {
        clearInterval(intervalId.value)
        minutes.value = setMinutes.value
        seconds.value = 0
        isRunning.value = false
    }

    const set = () => {
        minutes.value = setMinutes.value
        seconds.value = 0
        // Timer stops and resets if a new minutes is set while running
        if (isRunning.value) {
            clearInterval(intervalId.value)
            isRunning.value = false
        }
    }

    // Cleanup function that runs when component is destroyed
    onBeforeUnmount(() => {
        if (intervalId.value) {
            clearInterval(intervalId.value);
        }
    })

    // Computed properties to format the display
    const displayMinutes = computed(() => minutes.value.toString().padStart(2, '0'));
    const displaySeconds = computed(() => seconds.value.toString().padStart(2, '0'));
</script>

<style scoped>
.timer {
    font-size: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 24px auto 36px;
  }
  .display-time {
    font-weight: 500;
    position: relative;
    margin: 12px 6px;
  }
  .separator {
    margin-top: -0.75rem;
  }
  .time-label {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-top: -1rem;
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
</style>