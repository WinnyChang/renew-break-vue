console.log('Worker initialized');

// Create an object to store timers' info:
// length of countdown, (fresh) start timestamp, paused timestamp, totalPausedTime
let timers = {
    eyeRest: { timerLength: null, startAt: null, pausedAt: null, totalPausedTime: 0 },
    standUp: { timerLength: null, startAt: null, pausedAt: null, totalPausedTime: 0 },
    break: { timerLength: null, startAt: null, pausedAt: null, totalPausedTime: 0 }
};

let checkInterval = null;

// Receive messages from main app
self.onmessage = function(e) {
    // action: start / pause / reset
    // data: timer's type and its length
    const { action, data } = e.data;
    const timer = timers[data.timerType];
    
    switch(action) {
        case 'start':
            console.log('Starting', data.timerType, 'timer');
            timer.timerLength = data.timerLength;

            if (!timer.startAt) {  // Fresh Start
                timer.startAt = Date.now();
                timer.totalPausedTime = 0;
            } else if (timer.pausedAt) {  // Resume
                timer.totalPausedTime += Date.now() - timer.pausedAt
                timer.pausedAt = null
            };
            
            if (!checkInterval) {
                console.log('Starting check interval');
                checkInterval = setInterval(() => checkTimers(), 1000);  // Check the timers every 500ms
            }
            break;
            
        case 'pause':
            console.log('Pausing', data.timerType, 'timer');
            timer.pausedAt = Date.now();
            break;
            
        case 'reset':
            console.log('Resetting', data.timerType, 'timer');
            if (Array.isArray(data.timerType)) {
                // Reset multiple timers (StandUp & Break)
                data.timerType.forEach(timerType => {
                    timers[timerType].startAt = null;
                    timers[timerType].timerLength = null;
                    timers[timerType].pausedAt = null;
                    timers[timerType].totalPausedTime = 0;
                });
            } else {
                // Handle single timer reset (EyeRest)
                timers[data.timerType].startAt = null;
                timers[data.timerType].timerLength = null;
                timers[data.timerType].pausedAt = null;
                timers[data.timerType].totalPausedTime = 0;
            }
            break;
    }
};

function checkTimers() {
    const currentTime = Date.now();
    
    // Check each timer
    Object.entries(timers).forEach(([timerType, timer]) => {
        // If timer is running and not paused
        if (timer.timerLength && timer.startAt && !timer.pausedAt) {
            // Calculate time elapsed and time remaining
            const elapsed = currentTime - timer.startAt - timer.totalPausedTime;
            const remaining = Math.max(0, timer.timerLength - elapsed);
            
            console.log(`Checking ${timerType}:`, {
                elapsed,
                remaining,
                timerLength: timer.timerLength
            });

            // Send tick message to main app for UI update
            self.postMessage({
                type: 'tick',
                timerType: timerType,
                remaining: remaining
            });
            
            // Timer completed
            if (remaining === 0) {
                const formattedTime = new Intl.DateTimeFormat('en-CA', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false
                  }).format(currentTime).replace(",", "");
                
                console.log(timerType, 'timer completed');
                self.postMessage({
                    type: 'complete',
                    timerType: timerType,
                    time: formattedTime
                });
                // Stop checking this timer until it's started again
                timer.startAt = null;
                timer.totalPausedTime = 0;
                return;  // Exit the check for this timer
            }
        }
    });
}