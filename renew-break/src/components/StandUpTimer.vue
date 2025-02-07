<template>
    <div class="card">
        <h2>Stand Up Timer</h2>

        <select v-model="selectedOption" @change="onSelectOption">
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
    import { ref, computed, watch, inject, onBeforeUnmount } from 'vue'
    
    const worker = inject('timerWorker');
    const emit = defineEmits(['selectOption', 'timeSetting', 'updateRemainingTime', 'timerComplete']);
    
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
        }
    })

    // Timer options and state
    const timeOptions = [[0.5, 0.1], [25, 5], [50, 10], [75, 15]];
    const selectedOption = ref(50);  // Default: 50 Focus + 10 Break
    const isBreakTime = ref(false);
    
    // StandUpTimer state
    const setMinutes = computed(() => selectedOption.value);
    const minutes = ref(setMinutes.value);
    const seconds = ref(0);

    // BreakTimer state
    const setBreakMinutes = computed(() => {
        const option = timeOptions.find(([focus]) => focus === selectedOption.value);
        return option[1];
    });
    const breakMinutes = ref(setBreakMinutes.value);
    const breakSeconds = ref(0);

    // Display formatting
    // StandUpTimer
    const displayMinutes = computed(() => minutes.value.toString().padStart(2, '0'));
    const displaySeconds = computed(() => seconds.value.toString().padStart(2, '0'));
    // BreakTimer
    const displayBreakMinutes = computed(() => breakMinutes.value.toString().padStart(2, '0'));
    const displayBreakSeconds = computed(() => breakSeconds.value.toString().padStart(2, '0'));

    
    // Helper functions
    const getCurrentTimerType = () => !isBreakTime.value ? 'standUp' : 'break';
    const getCurrentTimerLength = () => (!isBreakTime.value ? setMinutes.value : setBreakMinutes.value) * 60 * 1000;
    
    const messageHandler = (e) => {
        const { type, timerType, remaining, time } = e.data;
        
        if (timerType === 'standUp' || timerType === 'break') {
            if (type === 'tick' && props.isRunning) {
                console.log('StandUpTimer received:', type, timerType, 'remaining', remaining);
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                
                if (!isBreakTime.value) {
                    console.log('Updating StandUpTimer display:', mins, secs);
                    minutes.value = mins;
                    seconds.value = secs;
                    // Emit remaining time for EyeRestTimer
                    emit('updateRemainingTime', mins * 60 + secs);
                } else {
                    console.log('Updating BreakTimer display:', mins, secs);
                    breakMinutes.value = mins;
                    breakSeconds.value = secs;
                }
            } else if (type === 'complete') {
                console.log('StandUpTimer received:', type, timerType, 'at', time);
                if (!isBreakTime.value) {  // StandUpTimer finished
                    minutes.value = 0;
                    seconds.value = 0;
                    showNotification("Focus session done!", "Great job! Stand up, stretch, and take a break!");
                    
                    // Triggers BreakTimer to start
                    isBreakTime.value = true;
                    if (props.isRunning) {
                        worker.value?.postMessage({
                            action: 'start',
                            data: {
                                timerType: 'break',
                                timerLength: setBreakMinutes.value * 60 * 1000
                            }
                        });
                    }
                } else {  // BreakTimer finished
                    showNotification("Break's over!", "Tap 'Start' when you're ready to focus again!");
                    isBreakTime.value = false;
                    reset();
                    emit('timerComplete');
                }
            }
        }
    };

    const onSelectOption = () => {
        emit('selectOption');
        emit('timeSetting', setMinutes.value);
    };

    const reset = () => {
        // Reset both timers in worker
        worker.value?.postMessage({
            action: 'reset',
            data: {
                timerType: ['standUp', 'break']  // Send array of timer types
            }
        });
        
        // Reset timers' values
        minutes.value = setMinutes.value;
        seconds.value = 0;
        breakMinutes.value = setBreakMinutes.value;
        breakSeconds.value = 0;
        isBreakTime.value = false;

        emit('updateRemainingTime', 0);
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
            console.log('Worker now available for StandUpTimer. Setting up message handler.');
            newWorker.addEventListener('message', messageHandler);
        }
    }, { immediate: true });

    // 2. Start / Pause timer based on isRunning value
    watch(() => props.isRunning, (newValue) => {
        if (!worker.value) {
            console.warn('No worker available for StandUpTimer');
            return;
        }

        const timerType = getCurrentTimerType();
        const timerLength = getCurrentTimerLength();

        const action = newValue ? 'start' : 'pause';
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