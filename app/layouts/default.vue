<template>
  <div class="shell">
    <ScrollMeter />
    <DesktopNavigation />
    <div class="col">
      <MobileTopBar />
      <TickerBar />
      <main id="main" class="main"><slot /></main>
    </div>
    <MobileBottomNav />
  </div>
</template>

<style scoped>
.shell { min-height: 100dvh; }
.col { min-width: 0; }
.main { padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--space-5)); }
@media (min-width: 1051px) {
  .shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); }
  .main { padding-bottom: var(--space-7); }
}
</style>
