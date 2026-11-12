<script setup lang="ts">
const { data, status } = useLatestRating()
</script>

<template>
  <WidgetFrame title="Ultima pagella" bare :loading="status === 'pending' && data === undefined">
    <RatingCard v-if="data?.player" :score="Number(data.score)" :player="fullName(data.player)" :review="data.review"
      :attributes="data.attributes" :context="data.match ? `vs ${data.match.opponent?.name}` : undefined" />
    <EmptyState v-else title="Nessuna pagella ancora" text="Il giudice è in ritardo." />
  </WidgetFrame>
</template>
