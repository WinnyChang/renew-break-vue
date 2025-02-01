<script setup>
import StandUpTimer from './components/StandUpTimer.vue';
import EyeRestTimer from './components/EyeRestTimer.vue';
</script>

<template>
  <div>
    <h1>RenewBreak</h1>
    <EyeRestTimer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=42dot+Sans:wght@300..800&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
* {
  font-family: "Nunito", serif;
}
h1 {
    font-weight: 700;
}
</style>