<script setup>
import AuthView from './views/auth.vue'
</script>

<template>
  <div class="app-container">
    <AuthView />
  </div>
</template>

<style>
:root {
  color: #1f2a44;
  background-color: #f5f7fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f7fb;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
