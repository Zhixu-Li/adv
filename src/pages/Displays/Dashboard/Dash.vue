<template>
  <div>
    <BRow v-if="stats.status !== 'offline'" class="h-100 pt-3">
      <BCol sm="12" md="6">
        <div class="mb-3">
          <BRow>
            <BCol cols="12">
              <Preview
                class="prev"
                :display="displayStats"
                :show-live="true"
                :refresh-time="refreshRate / 60"
              />
            </BCol>
          </BRow>
        </div>
      </BCol>

      <BCol sm="12" md="6">
        <BRow class="pt-2 pb-2 text-center">
          <BCol>
            <h5>Live Stats for {{ display.name }}</h5>
          </BCol>
        </BRow>

        <BRow>
          <BCol cols="6" class="border-right">
            <BCol>
              <h5>{{ $t('displays.diskUsage') }}</h5>
              <BProgress variant="dark" :max="100" class="mb-3" height="1.5rem">
                <BProgressBar :value="disk" animated>
                  <strong class="progress-label">{{ disk }}%</strong>
                </BProgressBar>
              </BProgress>
            </BCol>
            <BCol>
              <h5>{{ $t('displays.memoryUsage') }}</h5>
              <BProgress variant="dark" :max="100" class="mb-3" height="1.5rem">
                <BProgressBar :value="memory" animated>
                  <strong class="progress-label">{{ memory }}%</strong>
                </BProgressBar>
              </BProgress>
            </BCol>
          </BCol>

          <BCol cols="6">
            <BCol>
              <h5>{{ $t('displays.wirelessSignal') }}</h5>
              <template v-if="stats.signal === 0">
                <BProgress variant="dark" :max="100" class="mb-3" height="1.5rem">
                  <BProgressBar :value="100" animated>
                    <strong class="progress-label">Plugged In</strong>
                  </BProgressBar>
                </BProgress>
              </template>
              <template v-else>
                <BProgress variant="dark" :max="100" class="mb-3" height="1.5rem">
                  <BProgressBar :value="signal" animated>
                    <strong class="progress-label">{{ signal }}%</strong>
                  </BProgressBar>
                </BProgress>
              </template>
            </BCol>
            <BCol>
              <h5>{{ $t('displays.CPULoad') }}</h5>
              <BProgress variant="dark" :max="100" class="mb-1" height="1.5rem">
                <BProgressBar :value="stats.load * 100" animated>
                  <strong class="progress-label">{{ parseInt(stats.load * 100) }}%</strong>
                </BProgressBar>
              </BProgress>
            </BCol>
          </BCol>
        </BRow>

        <BRow>
          <BCol class="pt-1 ml-2 mr-2 border-top">
            <h5>{{ $t('Brightness') }}</h5>
            <BProgress variant="dark" :max="100" class="mb-1" height="1.5rem">
              <BProgressBar :value="stats.brightness * 100" animated>
                <strong class="progress-label">{{ parseInt(stats.brightness * 100) }}%</strong>
              </BProgressBar>
            </BProgress>
          </BCol>
          <BCol class="pt-1 ml-2 mr-2 border-top">
            <h5>{{ $t('Local Time') }}</h5>
            <div>
              <BIcon icon="broadcast" animation="fade" />
              <span class="dash-text pl-1">{{ computedTime }}</span>
            </div>
          </BCol>
        </BRow>

        <BRow>
          <BCol class="pt-2 mt-2 ml-2 mr-2 border-top">
            <BButton
              v-b-toggle:advanced
              variant="light"
              class="border-success text-success"
            >
              <span class="when-open"><BIcon icon="arrow-up" /> Close Advanced</span>
              <span class="when-closed"><BIcon icon="arrow-down" /> Open Advanced</span>
            </BButton>
          </BCol>
        </BRow>
      </BCol>

      <BCollapse id="advanced">
        <BCol cols="12">
          <BListGroup class="mb-3">
            <BListGroupItem class="d-flex justify-content-between">
              Display Name:
              <span class="dash-text">{{ display.name }}</span>
            </BListGroupItem>
            <BListGroupItem class="d-flex justify-content-between">
              Uptime:
              <h5>
                <BBadge v-if="stats.status !== 'offline'" size="lg" variant="success" pill>
                  {{ computedUptime }} days
                </BBadge>
                <BBadge v-else variant="danger" pill>
                  Display Offline ({{ display.lastConnected }})
                </BBadge>
              </h5>
            </BListGroupItem>
            <BListGroupItem
              v-if="stats.status !== 'offline'"
              class="d-flex justify-content-between"
            >
              Platform:
              <span class="dash-text">
                <span v-if="stats.platform.includes('Linux')">GNU/Linux</span>
              </span>
            </BListGroupItem>
            <BListGroupItem class="d-flex justify-content-between">
              Hostname:
              <span class="dash-text pl-1">{{ stats.hostname || display.acid }}</span>
            </BListGroupItem>
            <BListGroupItem class="d-flex justify-content-between">
              {{ $t('Client Version') }}:
              <span class="dash-text">{{ stats.version }}</span>
            </BListGroupItem>
            <BListGroupItem class="d-flex justify-content-between">
              {{ $t('Hardware ID') }}:
              <span class="dash-text">{{ stats.hwid || display.hardwareId }}</span>
            </BListGroupItem>
            <BListGroupItem
              v-if="stats.status !== 'offline'"
              class="d-flex justify-content-between"
            >
              WAN IP:
              <span class="dash-text">{{ stats.wan_addr }}</span>
            </BListGroupItem>
            <BListGroupItem
              v-if="stats.status !== 'offline'"
              class="d-flex justify-content-between"
            >
              LAN IP:
              <span class="dash-text">{{ stats.lan_addr }}</span>
            </BListGroupItem>
            <BListGroupItem
              v-if="stats.status !== 'offline'"
              class="d-flex justify-content-between"
            >
              LED Port:
              <BBadge v-if="stats.ldetect" variant="success" pill>
                <strong>Detected</strong>
              </BBadge>
              <BBadge v-else variant="warning" pill>
                <strong>Not Detected</strong>
              </BBadge>
            </BListGroupItem>
          </BListGroup>
        </BCol>
      </BCollapse>
    </BRow>

    <BRow v-else>
      <BAlert class="m-4" variant="danger" show>
        <h4>Display Offline (last seen: {{ display.lastConnected }})</h4>
      </BAlert>
    </BRow>
  </div>
</template>
<script>
import {
  BRow,
  BCol,
  BProgress,
  BProgressBar,
  BCollapse,
  BListGroup,
  BListGroupItem,
  BAlert,
  BBadge,
  BIcon,
  BButton
} from 'bootstrap-vue-next'
import Preview from '@/pages/Dashboard/Components/DisplayPreview.vue'
import _ from 'lodash'

export default {
  components: {
    BRow,
    BCol,
    BProgress,
    BProgressBar,
    BCollapse,
    BListGroup,
    BListGroupItem,
    BAlert,
    BBadge,
    BIcon,
    BButton,
    Preview,
  },
  props: {
    display: {
      type: Object,
      required: true
    },
    wall: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      refreshRate: 10,
      interval: {},
      stats: {
        status: 'offline',
        load: 0,
        memory: 0,
        signal: 0,
        disk: 0,
        platform: '',
        date: '',
        uptime: ''
      },
      load: 0,
      memory: 0,
      signal: 0,
      disk: 0,
    }
  },
  computed: {
    displayStats () {
      let display = this.display
      display.stats = this.stats
      return display
    },
    computedTime() {
      let dt = this.stats.date.match(/\d\d:\d\d/g)
      if (dt) {
        return dt[0]
      }
      else {
        return ''
      }
    },
    computedUptime() {
      if (this.stats?.uptime) {
        return (this.stats.uptime / 60 / 60 / 24).toFixed(3)
      }
      else {
        return 'n/a'
      }
    }
  },
  watch: {
    'stats.load': {
      handler () {
        this.load = this.clean(this.stats.load)
      }
    },
    'stats.memory': {
      handler () {
        this.memory = this.clean(this.stats.memory)
      }
    },
    'stats.signal': {
      handler () {
        this.signal = this.clean(this.stats.signal)
      }
    },
    'stats.disk': {
      handler () {
        this.disk = this.clean(this.stats.disk)
      }
    },
    'display.displayId': {
      handler () {
        this.queryDisplay()
      }
    }
  },
  mounted () {
    setTimeout(this.queryDisplay, 500)
    this.interval = setInterval(this.queryDisplay, this.refreshRate * 1000)
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods: {
    queryDisplay () {
      if (this.display.acid) {
        let url = process.env.VUE_APP_NETWORK_ENDPOINT + 'collate?client=' + this.display.acid
        this.$axios.get(url, { headers: {}, timeout: 1000 }).then(
          (response) => {
            _.assignWith(this.stats, response.data, function (objValue, srcValue) {
              if (srcValue && srcValue !== 'undef') {
                return srcValue
              } else if (objValue === undefined && srcValue === 'undef') {
                return null
              } else {
                return objValue
              }
            })
          },
          () => {
            this.stats.status = 'offline'
          }
        )
      } else {
        this.stats = {
          status: 'offline'
        }
      }
    },
    clean (data) {
      return parseInt(data.trim().replace('%', ''))
    },
    setRefresh () {
      clearInterval(this.interval)

      if (this.refreshRate < 10) {
        this.refreshRate = 10
      }

      if (this.refreshRate) {
        this.interval = setInterval(this.queryDisplay, this.refreshRate * 1000)
      } else {
        this.interval = setInterval(this.queryDisplay, 1000 * 1000)
      }
    }
  }
}
</script>

<style lang="scss">

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
.dash-text {
  font-family: monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.live-text {
  border: 1px dashed #000;
}

.prev {
  background: #000;
  height: 33.33vh;
  margin-bottom: 1em;
  padding-bottom: 1.5em;
}

.progress-label {
  font-size: 125%;
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}

</style>
