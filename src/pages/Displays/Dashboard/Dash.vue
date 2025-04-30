<template lang="html">
  <b-row
    v-if="stats.status != 'offline'"
    class="h-100 pt-3"
  >
    <b-col
      sm="12"
      md="6"
    >
      <div class="mb-3">
        <b-row>
          <b-col cols="12">
            <preview
              class="prev"
              :display="displayStats"
              :show-live="true"
              :refresh-time="refreshRate / 60"
            />
          </b-col>
        </b-row>
      </div>
    </b-col>
    <b-col
      sm="12"
      md="6"
    >
      <b-row class="pt-2 pb-2 text-center">
        <b-col>
          <h5 class="text-center">
            Live Stats for {{ display.name }}
          </h5>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          cols="6"
          class="border-right"
        >
          <b-col>
            <h5>{{ $t('displays.diskUsage') }}</h5>
            <b-progress
              variant="dark"
              :max="100"
              class="mb-3"
              height="1.5rem"
            >
              <b-progress-bar
                :value="disk"
                animated
              >
                <strong class="progress-label">{{ disk }}%</strong>
              </b-progress-bar>
            </b-progress>
          </b-col>
          <b-col>
            <h5>{{ $t('displays.memoryUsage') }}</h5>
            <b-progress
              variant="dark"
              :max="100"
              class="mb-3"
              height="1.5rem"
            >
              <b-progress-bar
                :value="memory"
                animated
              >
                <strong class="progress-label">{{ memory }}%</strong>
              </b-progress-bar>
            </b-progress>
          </b-col>
        </b-col>
        <b-col
          cols="6"
          class=""
        >
          <b-col>
            <h5>{{ $t('displays.wirelessSignal') }}</h5>
            <template v-if="stats.signal == 0">
              <b-progress
                variant="dark"
                :max="100"
                class="mb-3"
                height="1.5rem"
              >
                <b-progress-bar
                  :value="100"
                  animated
                >
                  <strong class="progress-label">Plugged In</strong>
                </b-progress-bar>
              </b-progress>
            </template>
            <template v-else>
              <b-progress
                variant="dark"
                :max="100"
                class="mb-3"
                height="1.5rem"
              >
                <b-progress-bar
                  :value="signal"
                  animated
                >
                  <strong class="progress-label">{{ signal }}%</strong>
                </b-progress-bar>
              </b-progress>
            </template>
          </b-col>
          <b-col>
            <h5>{{ $t('displays.CPULoad') }}</h5>
            <b-progress
              variant="dark"
              :max="100"
              class="mb-1"
              height="1.5rem"
            >
              <b-progress-bar
                :value="stats.load * 100"
                animated
              >
                <strong class="progress-label">{{ parseInt(stats.load * 100) }}%</strong>
              </b-progress-bar>
            </b-progress>
          </b-col>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="pt-1 ml-2 mr-2 border-top">
          <h5>{{ $t('Brightness') }}</h5>
          <b-progress
            variant="dark"
            :max="100"
            class="mb-1"
            height="1.5rem"
          >
            <b-progress-bar
              :value="stats.brightness * 100"
              animated
            >
              <strong class="progress-label">{{ parseInt(stats.brightness * 100) }}%</strong>
            </b-progress-bar>
          </b-progress>
        </b-col>
        <b-col class="pt-1 ml-2 mr-2 border-top">
          <h5>{{ $t('Local Time') }}</h5>
          <div class="">
            <b-icon
              icon="broadcast"
              animation="fade"
            />
            <span class="dash-text pl-1">{{ computedTime }}</span>
          </div>
        </b-col>
      </b-row>
      <b-row class="">
        <b-col class="pt-2 mt-2 ml-2 mr-2 border-top">
          <b-button
            v-b-toggle.advanced
            variant="light"
            class="border-success text-success"
          >
            <span class="when-open"><b-icon icon="arrow-up" /> Close Advanced</span>
            <span class="when-closed"><b-icon icon="arrow-down" /> Open Advanced</span>
          </b-button>
        </b-col>
      </b-row>
    </b-col>
    <b-collapse id="advanced">
      <b-col cols="12">
        <b-list-group class="mb-3">
          <b-list-group-item class="d-flex justify-content-between">
            Display Name:
            <span class="dash-text">{{ display.name }}</span>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between">
            Uptime:
            <h5>
              <b-badge
                v-if="stats.status != 'offline'"
                size="lg"
                variant="success"
                pill
              >
                {{ computedUptime }} days
              </b-badge>
              <b-badge
                v-else
                variant="danger"
                pill
              >
                Display Offline ({{ display.lastConnected }})
              </b-badge>
            </h5>
          </b-list-group-item>
          <b-list-group-item
            v-if="stats.status != 'offline'"
            class="d-flex justify-content-between"
          >
            Platform:
            <span class="dash-text"><span
              v-if="stats.platform.includes('Linux')"
              name="linux"
            >GNU/Linux</span><br>
            </span>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between">
            Hostname:
            <span class="dash-text pl-1">{{ stats.hostname || display.acid }}</span>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between">
            {{ $t('Client Version') }}:
            <span class="dash-text">{{ stats.version }}</span>
          </b-list-group-item>
          <b-list-group-item class="d-flex justify-content-between">
            {{ $t('Hardware ID') }}:
            <span class="dash-text">{{ stats.hwid || display.hardwareId }}</span>
          </b-list-group-item>
          <b-list-group-item
            v-if="stats.status != 'offline'"
            class="d-flex justify-content-between"
          >
            WAN IP:
            <span class="dash-text">{{ stats.wan_addr }}</span>
          </b-list-group-item>
          <b-list-group-item
            v-if="stats.status != 'offline'"
            class="d-flex justify-content-between"
          >
            LAN IP:
            <span class="dash-text">{{ stats.lan_addr }}</span>
          </b-list-group-item>
          <b-list-group-item
            v-if="stats.status != 'offline'"
            class="d-flex justify-content-between"
          >
            LED Port:
            <b-badge
              v-if="stats.ldetect"
              variant="success"
              pill
            >
              <strong>Detected</strong>
            </b-badge>
            <b-badge
              v-else
              variant="warning"
              pill
            >
              <strong>Not Detected</strong>
            </b-badge>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-collapse>
  </b-row>
  <b-row v-else>
    <b-alert
      class="m-4"
      variant="danger"
      show
    >
      <h4>Display Offline (last seen: {{ display.lastConnected }})</h4>
    </b-alert>
  </b-row>
</template>

<script>
import Preview from '@/pages/Dashboard/Components/DisplayPreview.vue'
import _ from 'lodash'

export default {
  components: {
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
