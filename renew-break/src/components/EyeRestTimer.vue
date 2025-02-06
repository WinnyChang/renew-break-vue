<template>
    <div class="card" :class="{ 'disabled': selectedOption === 'off' }">
        <h2>Eye Rest Timer</h2>

        <select v-model="selectedOption" @change="reset">
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
    import { ref, computed, watch, inject, onBeforeUnmount } from 'vue'
    
    const worker = inject('timerWorker');

    const props = defineProps({
        notificationPermission: {
            type: Boolean,
            required: true
        },
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

    // EyeRestTimer state
    const selectedOption = ref('20'); // Default time (20 min)
    const setMinutes = computed(() => selectedOption.value === 'off' ? null : Number(selectedOption.value));
    const minutes = ref(setMinutes.value);
    const seconds = ref(0);
    
    // Display formatting
    const displayMinutes = computed(() => 
        selectedOption.value === 'off' || minutes.value === null ? 
            '--' : minutes.value.toString().padStart(2, '0')
    );
    const displaySeconds = computed(() => 
        selectedOption.value === 'off' || seconds.value === null ? 
            '--' : seconds.value.toString().padStart(2, '0')
    );


    // Helper functions
    const messageHandler = (e) => {
        const { type, timerType, remaining } = e.data;
        console.log('EyeRestTimer received:', type, timerType, remaining);
        
        if (timerType === 'eyeRest') {
            if (type === 'tick' && props.isRunning && selectedOption.value !== 'off') {
                // Update timer display
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                console.log('Updating EyeRestTimer display:', mins, secs);
                minutes.value = mins;
                seconds.value = secs;
            } else if (type === 'complete') {
                // Send notification upon timer completion
                console.log('Timer complete');
                showNotification("Time to rest your eyes!", 
                    "Relax your eyes — look 20 feet (6 meters) away for 20 seconds.");
                
                // Reset
                reset();
                
                // Restart if there's enough time for another round
                if (props.isRunning && props.standupTimeRemaining >= setMinutes.value * 60) {
                    worker.value?.postMessage({
                        action: 'start',
                        data: {
                            timerType: 'eyeRest',
                            timerLength: setMinutes.value * 60 * 1000
                        }
                    });
                }
            }
        }
    };

    const reset = () => {
        // Reset timer in worker
        worker.value?.postMessage({
            action: 'reset',
            data: {
                timerType: 'eyeRest'
            }
        });

        // Reset timer's values
        minutes.value = setMinutes.value;  // 'off' ? null : Number(selectedOption.value)
        seconds.value = 0;
    };
    
    const showNotification = (title, message) => {
        if ("Notification" in window && props.notificationPermission) {
            try {                
                new Notification(title, {
                    body: message,
                    requireInteraction: true
                });
            } catch (error) {
                console.error('Notification failed:', error);
            }
        }
    };

    // Watchers
    // 1. Set up message handler
    watch(() => worker.value, (newWorker) => {
        if (newWorker) {
            console.log('Worker now available for EyeRestTimer. Setting up message handler.');
            newWorker.addEventListener('message', messageHandler);
        }
    }, { immediate: true });
    
    // 2. Start / Pause timer based on isRunning value
    watch(() => props.isRunning, (newValue) => {
        if (!worker.value) {
            console.warn('No worker available for EyeRestTimer');
            return;
        }

        if (newValue && selectedOption.value === 'off') {
            console.log('(eyeRest timer is off)');
            return;
        }

        const timerType = 'eyeRest';
        const timerLength = setMinutes.value * 60 * 1000;
        
        const action = newValue ? 'start' : 'pause';
        console.log(`${newValue ? 'Starting' : 'Pausing'} ${timerType} timer (timerLength: ${timerLength})`);
        worker.value.postMessage({
            action,
            data: {
                timerType,
                ...(newValue && { timerLength })
            }
        });
    });

    // 3. Reset timer
    watch(() => props.shouldReset, (newValue) => {
        if (newValue) {
            reset();
        }
    });

    
    // Clean up when component unmounts
    onBeforeUnmount(() => {
        if (worker.value) {
            worker.value.removeEventListener('message', messageHandler);
        }
    });
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