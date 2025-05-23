<template lang="html">
  <div class="d-flex flex-wrap justify-content-center">
    <div
      v-for="display in computedDisplays"
      :key="display.displayId"
      class=""
    >
      <BButton
        v-b-modal="'display_' + display.displayId"
        variant="light"
        class="display m-1 p-2 border rounded"
      >
        <display-preview
          class="preview"
          :display="display"
          :refresh-time="refreshTime"
        />
        <div :style="{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }">
          <small>{{ display.name }}</small>
        </div>
      </BButton>

      <BModal
        :id="'display_' + display.displayId"
        size="lg"
        no-fade
        hide-header
        hide-header-close
        hide-footer
        centered
      >
        <display-dashboard :display="display" />
      </BModal>
    </div>
  </div>
</template>
<script>
import DisplayPreview from './DisplayPreview.vue'
import DisplayDashboard from '@/pages/Displays/Dashboard/Dash.vue'
import extendedViewports from '@/mixins/extendedViewports'
import { BButton, BModal } from 'bootstrap-vue-next'
export default {
  components: {
    DisplayDashboard,
    DisplayPreview,
    BButton, 
    BModal
  },
  mixins: [extendedViewports],
  props: {
    displays: {
      type: Array,
      required: true
    },
    refreshTime: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      online: {},
      offline: {},
      stats: {},
      timer: {},
      currentRow: 0,
      isShowing: false,
      selectedDisplay: {},
    }
  },
  computed: {
    computedDisplays() {
      return this.displays.filter(d => this.online[d.hardwareId])
    },
    viewportCols() {
      if      (this.viewport === 'xs') { return 12 }
      else if (this.viewport === 'sm') { return 6 }
      else if (this.viewport === 'md') { return 6 }
      else if (this.viewport === 'lg') { return 4 }
      else if (this.viewport === 'xl') { return 2 }
      else { return 12 }

    },
  },
  mounted () {
    this.getAvailable()
    this.getOffline()
    this.timer = setInterval( () => { this.getAvailable(); this.getOffline() }, 10000)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  },
  methods: {
    getAvailable() {
      this.$axios.get(process.env.VUE_APP_NETWORK_ENDPOINT + 'clients', { headers: {} }).then(
        (response) => {
          this.online = response.data
          this.queryDisplays()
        },
        () => {
          console.log('error?')
        })
    },
    getOffline() {
      this.$axios.get(process.env.VUE_APP_NETWORK_ENDPOINT + 'clients', { headers: {} }).then(
        (response) => {
          this.offline = response.data
        },
        () => {

        })
    },
    queryDisplays () {
      for (let display of this.displays) {
        this.queryDisplay(display)
      }
    },
    queryDisplay (display) {
      if (display.acid) {
        let url = process.env.VUE_APP_NETWORK_ENDPOINT + 'collate?client=' + display.acid
        this.$axios.get(url, { headers: {} }).then(
          (response) => {
            this.stats[display.hardwareId] = response.data
          },
          () => {
            this.stats[display.hardwareId] = {}
          }
        )
      }
    },
  }
}
</script>

<style scoped lang="scss">

// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
.display {
  height: 20vh;
  width: 20vh;
}

.preview {
  height: calc(100% - 1em);
  background: #000;
}

</style>
