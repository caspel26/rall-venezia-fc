<script setup lang="ts">
const { data, status } = useStaff()
</script>

<template>
  <WidgetFrame v-if="data?.length || status === 'pending'" title="Lo staff" icon="shield" to="/team" link-label="Squadra" :loading="status === 'pending' && !data">
    <ul class="staff">
      <li v-for="(m, i) in data" :key="m.id" v-reveal="i"><StaffCard :member="m" compact /></li>
    </ul>
  </WidgetFrame>
</template>

<style scoped>
.staff { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
</style>
