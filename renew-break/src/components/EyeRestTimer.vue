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
            <button @click="reset">Reset</button>
            <button @click="startPause">{{ isRunning ? 'Pause' : 'Start' }}</button>
            <select v-model="setMinutes" @change="set">
                <option v-for="value in [20, 30, 40, 50, 60]" 
                        :key="value" 
                        :value="value">
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
* {
    /* border: solid 1px gray; */
    font-weight: 500;
}

.card {
    border: solid 2px gray;
    border-radius: 12px;
}

h2 {
    font-weight: 700;
    margin: 12px auto;
}

.timer {
    font-size: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .display-time {
    position: relative;
    margin: 12px 6px;
  }
  .separator {
    margin-top: -0.5rem;
  }
  
  .time-label {
    font-size: 1.25rem;
    color: #E0E0E0;
    margin-top: -1rem;
  }

.controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 20px auto;
}
button, select {
    width: 100px;
    background: transparent;
    border: solid 1px #CEEDC7;
    border-radius: 8px;
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    margin: 20px auto 0;
    padding: 12px;
    cursor: pointer;
}
select {
    font-family: "Nunito", serif;
    appearance: none; /* Removes default arrow */
}
button, select:focus {
    outline: none;
}
</style>