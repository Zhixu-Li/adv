<template lang="html">
  <div>
    <BCard>
      <BCardText>
        <BRow>
          <BCol><h4>{{ $t('dashboard.common.network') }}</h4></BCol>
          <BCol class="text-right">
            <small class="text-muted">{{ $t('dashboard.common.lastUpdated') }}</small>
          </BCol>
        </BRow>

        <BRow v-if="displays.length > 0">
          <BCol cols="12" xl="8" class="mx-auto">
            <BRow>
              <BCol cols="4" class="pb-0 mb-0">
                <VueApexCharts
                  id="online"
                  height="150"
                  type="radialBar"
                  :series="onlineSeries"
                  :options="onlineOptions"
                />
                <BTooltip
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
                    <strong>{{ d.name }}</strong>
                  </div>
                </BTooltip>
              </BCol>

              <BCol cols="4" class="pb-0 mb-0">
                <VueApexCharts
                  id="passive"
                  height="150"
                  type="radialBar"
                  :series="passiveSeries"
                  :options="passiveOptions"
                />
                <BTooltip
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
                    <div><strong>{{ d.name }}</strong></div>
                    <div>{{ d.lastConnected }}</div>
                  </div>
                </BTooltip>
              </BCol>

              <BCol cols="4" class="pb-0 mb-0">
                <VueApexCharts
                  id="offline"
                  height="150"
                  type="radialBar"
                  :series="offlineSeries"
                  :options="offlineOptions"
                />
                <BTooltip
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
                    <div><strong>{{ d.name }}</strong></div>
                    <div>{{ d.lastConnected }}</div>
                  </div>
                </BTooltip>
              </BCol>
            </BRow>
          </BCol>

          <BCol cols="12" class="m-0 p-0 text-center">
            <em class="text-muted">Hover for more information.</em>
          </BCol>
        </BRow>

        <BRow v-else>
          <BCol>{{ $t('dashboard.common.noTeamDisplay') }}</BCol>
        </BRow>
      </BCardText>
    </BCard>
  </div>
</template>

<script>
import moment from 'moment'
//import 'vue-awesome/icons/circle'
import VueApexCharts from 'vue3-apexcharts'
import teamContext from '@/mixins/teamContext'
import {
  BCard,
  BCardText,
  BRow,
  BCol,
  BTooltip
} from 'bootstrap-vue-next'
export default {
  components: {
    VueApexCharts,
    BCard,
    BCardText,
    BRow,
    BCol,
    BTooltip,
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
