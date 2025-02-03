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

    const startTime = ref(0)
    const pausedTime = ref(0)
    const totalPausedTime = ref(0)

    // Main timer function
    const startPause = () => {
        if (isRunning.value) {
            // Pause timer
            isRunning.value = false;
            clearInterval(intervalId.value);
            pausedTime.value = Date.now();
        } else {
            // Start timer
            isRunning.value = true;
            if (startTime.value === 0) {
                startTime.value = Date.now()
            } else if (pausedTime.value > 0) {
                totalPausedTime.value += Date.now() - pausedTime.value
            };
            intervalId.value = setInterval(() => {
                const currentTime = Date.now()
                const totalSeconds = setMinutes.value * 60
                const elapsedSeconds = Math.floor((currentTime - startTime.value - totalPausedTime.value) / 1000)
                const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0)
                
                if (remainingSeconds === 0) {
                    isRunning.value = false
                    clearInterval(intervalId.value)
                    reset()   // Auto reset
                    return
                }
            
                minutes.value = Math.floor(remainingSeconds / 60)
                seconds.value = remainingSeconds % 60
            }, 1000)
        }
    }

    const reset = () => {
        clearInterval(intervalId.value)
        minutes.value = setMinutes.value
        seconds.value = 0
        isRunning.value = false
        startTime.value = 0
        pausedTime.value = 0
        totalPausedTime.value = 0
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