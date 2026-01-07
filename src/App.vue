<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showHeader = computed(() => route.path !== '/home')
</script>

<template>
  <div class="app-shell">
    <header v-if="showHeader" class="app-header">
      <div class="brand">
        <div class="brand-mark">A</div>
        <div>
          <p class="brand-sub">AIYA</p>
          <h1>认证中心</h1>
        </div>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
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

.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, #f0f4ff, #f5f7fb 45%),
    radial-gradient(circle at 80% 0%, #f5f1ff, transparent 35%);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(33, 71, 133, 0.08);
  border: 1px solid #eef2f7;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a90e2, #6b5ae2);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.06em;
}

.brand-sub {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #6c7a9c;
}

h1 {
  margin: 2px 0 0;
  font-size: 20px;
  color: #1f2a44;
}

/*.app-main {
  padding: 0 16px 32px;
}*/
</style>
