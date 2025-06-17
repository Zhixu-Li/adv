<template>
  <div class="h-100 dashboard">
    <br>
    <h2 class="header-title">
      {{ $t('admin.news') }}
    </h2>
    <dash :displays="displays" />
  </div>
</template>

<script>
// import components from other vue files
import Dash from './Components/Dash.vue'

export default {
  components: {
    Dash
  },
  data () {
    return {
      displays: [],
      displaysMeta: {},
      restrict: !this.$auth.user.admin,
      displayIndex: 0,
      oldHeaders: {},
      dash: true,
      refreshTime: 5,
      interval: {}
    }
  },
  watch: {
  },
  mounted () {
  },
  beforeUnmount() {
    clearInterval(this.interval)
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
