<template>
  <a-layout-header :style="headerStyle">
    <div :style="brandBox">
      <a-avatar :style="{ backgroundColor: '#111827' }" shape="square" size="small">🍱</a-avatar>
      <a-typography-title :level="4" :style="brandTitle">NUSHungry</a-typography-title>
    </div>

    <a-input-search
      allow-clear
      :style="searchStyle"
      size="large"
      placeholder="Search for canteens, stalls, or dishes..."
    />

    <a-button type="primary" ghost :style="signInBtn">Sign In</a-button>
  </a-layout-header>
</template>

<script setup>
const headerStyle = {
  background: '#ffffff',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #f1f5f9',
  position: 'fixed',
  top: '0',
  left: 0,
  right: 0,
  width: '100%',
  /* Ensure header sits above map tiles and other content */
  zIndex: 9999,
  /* create a new stacking context to avoid interference from descendants */
  transform: 'translateZ(0)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
}

const brandBox = { display: 'flex', alignItems: 'center' }
const brandTitle = { margin: 0, marginLeft: '8px', color: '#111827', fontWeight: 700 }
const searchStyle = { maxWidth: '720px', flex: 1, margin: '0 24px' }
const signInBtn = { borderColor: '#111827', color: '#111827' }
</script>
