<template lang="html">
  <div>
    <b-card>
      <b-card-text>
        <b-row>
          <b-col>
            <h4>{{ $t('dashboard.common.network') }}</h4>
          </b-col>
          <b-col class="text-right">
            <small class="text-muted">{{ $t('dashboard.common.lastUpdated') }}</small>
          </b-col>
        </b-row>
        <b-row v-if="displays.length > 0">
          <b-col
            cols="12"
            xl="8"
            class="mx-auto"
          >
            <b-row class="">
              <b-col
                cols="4"
                class="pb-0 mb-0"
              >
                <VueApexCharts
                  id="online"
                  height="150"
                  type="radialBar"
                  :series="onlineSeries"
                  :options="onlineOptions"
                />
                <b-tooltip
                  v-if="onlineDisplays"
                  placement="bottom"
                  variant="success"
                  target="online"
                  triggers="hover"
                >
                  <div
                    v-for="d in onlineDisplays"
                    :key="d.name"
                    class="text-left"
                  >
                    <b>{{ d.name }}</b>
                  </div>
                </b-tooltip>
              </b-col>
              <b-col
                cols="4"
                class="pb-0 mb-0"
              >
                <VueApexCharts
                  id="passive"
                  height="150"
                  type="radialBar"
                  :series="passiveSeries"
                  :options="passiveOptions"
                />
                <b-tooltip
                  v-if="passiveDisplays"
                  placement="bottom"
                  variant="warning"
                  target="passive"
                  triggers="hover"
                >
                  <div
                    v-for="d in passiveDisplays"
                    :key="d.name"
                    class="text-left pb-1"
                  >
                    <div><b>{{ d.name }}</b></div><div>{{ d.lastConnected }}</div>
                  </div>
                </b-tooltip>
              </b-col>
              <b-col
                cols="4"
                class="pb-0 mb-0"
              >
                <VueApexCharts
                  id="offline"
                  height="150"
                  type="radialBar"
                  :series="offlineSeries"
                  :options="offlineOptions"
                />
                <b-tooltip
                  v-if="offlineDisplays"
                  placement="bottom"
                  variant="danger"
                  target="offline"
                  triggers="hover"
                >
                  <div
                    v-for="d in offlineDisplays"
                    :key="d.name"
                    class="text-left pb-1"
                  >
                    <div><b>{{ d.name }}</b></div><div>{{ d.lastConnected }}</div>
                  </div>
                </b-tooltip>
              </b-col>
            </b-row>
          </b-col>
          <b-col
            cols="12"
            class="m-0 p-0 text-center"
          >
            <em class="text-muted">Hover for more information.</em>
          </b-col>
        </b-row>
        <b-row v-else>
          <b-col>{{ $t('dashboard.common.noTeamDisplay') }}</b-col>
        </b-row>
      </b-card-text>
    </b-card>
  </div>
</template>

<script>
import moment from 'moment'
//import 'vue-awesome/icons/circle'
import VueApexCharts from 'vue3-apexcharts'
import teamContext from '@/mixins/teamContext'

export default {
  components: {
    VueApexCharts
  },
  mixins: [teamContext],
  props: {
    displays: {
      required: true
    }
  },
  data () {
    return {
      online: [],
      offline: [],
      loaded: true,
      updated: {},
      interval: {},
      total: '',
    }
  },
  computed: {
    onlineDisplays() {
      return this.displays.filter((d) => (this.online[d.hardwareId])).sort((a,b) => a.name.localeCompare(b.name))
    },
    offlineDisplays() {
      return this.displays.filter((d) => {
        if (this.offline[d.hardwareId]) {
          if (this.offline[d.hardwareId]['conn']) {
            if (moment().diff(moment(this.offline[d.hardwareId]['conn'], 'YYYY-MM-DD HH:mm:ss'), 'weeks', true) > 1) {
              return true
            }
          }
        }
      }).sort((a,b) => a.lastConnected.localeCompare(b.lastConnected))
    },
    passiveDisplays() {
      return this.displays.filter((d) => {
        if (this.offline[d.hardwareId]) {
          if (this.offline[d.hardwareId]['conn']) {
            if (moment().diff(moment(this.offline[d.hardwareId]['conn'], 'YYYY-MM-DD HH:mm:ss'), 'weeks', true) <= 1) {
              return true
            }
          }
        }
      }).sort((a,b) => a.lastConnected.localeCompare(b.lastConnected))
    },

    onlineSeries() {
      return [this.onlineDisplays.length / this.displays.length * 100]
    },
    offlineSeries() {
      return [this.offlineDisplays.length / this.displays.length * 100]
    },
    passiveSeries() {
      return [this.passiveDisplays.length / this.displays.length * 100]
    },

    onlineOptions() {
      return this.makeOptions(this.onlineDisplays.length, "#00CC00", "Online")
    },
    offlineOptions() {
      return this.makeOptions(this.offlineDisplays.length, "#FF0000", "Offline")
    },
    passiveOptions() {
      return this.makeOptions(this.passiveDisplays.length, "#EEEE00", "Passive")
    },
  },
  watch: {
    activeTeam() {
      this.getStats()
    },
  },
  mounted () {
    this.getStats()
    this.interval = setInterval(this.getStats, 10000)
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods: {
    makeOptions(label, fill, value) {
      return {
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                color: '#000000',
                fontSize: '2em',
                offsetY: 10,
              },
              value: {
                offsetY: 25,
                formatter: () => value,
              }
            },
            track: {
              background: '#D3D3D3'
            }
          }
        },
        fill: { colors: [ fill ] },
        labels: [ label ],
      }
    },
    getStats() {
      this.$axios.get(process.env.VUE_APP_NETWORK_ENDPOINT + 'clients', { headers: {} }).then(
        (response) => {
          this.online = response.data
        },
        () => {

        })

      this.$axios.get(process.env.VUE_APP_NETWORK_ENDPOINT + 'off_clients', { headers: {} }).then(
        (response) => {
          this.offline = response.data
        },
        () => {

        })

    },
  },
}
</script>

<style scoped lang="scss">
.status-list {
  list-style: none;
  padding: 0;
  line-height: 1rem;
}

.status-list .fa-icon {
  margin-top: -0.5em;
}

.text-left {
  white-space: pre;
}

.online {
  svg {
    color: green;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}

.passive {
  svg {
    color: yellow;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}

.offline {
  svg {
    color: red;
    padding-right: 5px;
  }

  span {
    vertical-align: super;
  }
}
</style>
