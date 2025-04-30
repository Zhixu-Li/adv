<template>
  <router-view :active-team="activeTeam" />
</template>

<script>
export default {
  props: {
    activeTeam: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped lang="scss">
  .nav-item {
    cursor: pointer;
  }
</style>
