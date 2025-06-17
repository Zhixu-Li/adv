<template>
  <div class="h-100 dashboard p-2">
    <h2 class="">
      {{ $t('dashboard.headers.dashboard') }}
    </h2>
    <h4 class="">
      for <i>{{ activeTeam.name }}</i>
    </h4>
    <dash
      :displays="filteredDisplays"
      :active-team="activeTeam"
      :refresh-time="refreshTime"
    />
  </div>
</template>

<script>
import Dash from './Components/Dash.vue'
import teamContext from '@/mixins/teamContext'

export default {
  components: {
    Dash
  },
  mixins: [teamContext],
  data () {
    return {
      displays: [],
      node:[],
      displaysMeta: {},
      displayIndex: 0,
      oldHeaders: {},
      dash: true,
      refreshTime: 5,
      interval: {}
    }
  },
  computed: {
    filteredDisplays() {
      return this.displays.filter((display) => {
        if (display.teamId == this.activeTeam.id) {
          return true
        }
      })
    },
  },
  watch: {
    refreshTime () {
      clearInterval(this.interval)
      this.interval = setInterval(this.fetchDisplays, (this.refreshTime * 60 * 1000))
    }
  },
  mounted () {
    this.fetchDisplays()
    this.interval = setInterval(this.fetchDisplays, (this.refreshTime * 60 * 1000))
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods: {
    fetchDisplays () {
      var scope = this
      let url = 'v1/displays?limit=all'
      this.$axios.get(url).then(
        (response) => {
          let displays = response.data.data
          this.displays = displays
          this.displaysMeta = response.data.meta
        }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
          scope.displays = []
        }
      )
    },
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
