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

        <button>Start</button>
    </div>
</template>

<script>
    export default {
        data: () => ({
            displayMinutes: 0,
            displaySeconds: 0,
        })
    };
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
    margin-top: -1rem;
  }
  
  .time-label {
    font-size: 1rem;
    color: gray;
    margin-top: -1rem;
  }

button {
    border: solid 1px #CEEDC7;
    margin: 20px auto 0;
}
</style>