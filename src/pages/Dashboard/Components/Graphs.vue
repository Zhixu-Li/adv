<template lang="html">
  <div v-if="displays.length > 0">
    <BContainer>
      <!-- Header -->
      <BRow>
        <BCol><h4>{{ $t('dashboard.metrics.displayMetrics') }}</h4></BCol>
        <BCol>
          <p class="text-right" style="font-size:0.75em;">
            {{ $t('schedule.lastUpdateText') }} {{ count }} {{ $t('schedule.updateUnit') }}
          </p>
        </BCol>
      </BRow>

      <!-- Range Buttons -->
      <BRow align-h="end">
        <BButtonGroup size="sm" class="pb-3">
          <BButton
            variant="outline-primary"
            :class="getActiveClass('hour')"
            @click="range('hour'); activeButton='hour'"
          >1H</BButton>
          <BButton
            variant="outline-primary"
            :class="getActiveClass('day')"
            @click="range('day'); activeButton='day'"
          >1D</BButton>
          <BButton
            variant="outline-primary"
            :class="getActiveClass('week')"
            @click="range('week'); activeButton='week'"
          >1W</BButton>
          <BButton
            variant="outline-primary"
            :class="getActiveClass('reset')"
            @click="range(); activeButton='reset'"
          >Reset</BButton>
        </BButtonGroup>
      </BRow>

      <!-- Metrics Graphs -->
      <BRow>
        <BCol>
          <Graph
            ref="memory"
            width="105%"
            height="200"
            type="line"
            :options="chartOptions"
            :series="series.orz_memory"
          />
        </BCol>
        <BCol>
          <Graph
            ref="disk"
            width="105%"
            height="200"
            type="line"
            :options="chartOptions"
            :series="series.orz_disk"
          />
        </BCol>
      </BRow>
      <BRow>
        <BCol>
          <Graph
            ref="load"
            width="105%"
            height="200"
            type="line"
            :options="chartOptions"
            :series="series.orz_load"
          />
        </BCol>
        <BCol>
          <Graph
            ref="signal"
            width="105%"
            height="200"
            type="line"
            :options="chartOptions"
            :series="series.orz_signal"
          />
        </BCol>
      </BRow>

      <!-- Campaigns Last Played -->
      <BRow>
        <BCol><h4>{{ $t('dashboard.campaigns.lastPlayed') }}</h4></BCol>
        <BCol>
          <p class="text-right" style="font-size:0.75em;">
            {{ $t('dashboard.campaigns.updateTime') }}
          </p>
        </BCol>
      </BRow>
      <BRow align-h="end">
        <BCol class="text-right">{{ campaignTable.paused }}</BCol>
        <BButton variant="primary" size="sm" @click="pause()">
          {{ $t('dashboard.campaigns.pause') }}
        </BButton>
      </BRow>
      <br>
      <BRow>
        <BTable
          class="my-table"
          small
          bordered
          responsive
          head-variant="dark"
          :fields="campaignTable.fields"
          :items="campaignTable.items"
        />
      </BRow>
      <br>
      <BRow>
        <BCol><h4>{{ $t('dashboard.campaigns.clientUptime') }}</h4></BCol>
        <BTable
          class="my-table"
          responsive
          bordered
          head-variant="dark"
          :items="upTable.items"
          :fields="upTable.fields"
          :sort-by="upTable.sort"
        />
      </BRow>
    </BContainer>
  </div>
</template>


<script>
import {
  BContainer,
  BRow,
  BCol,
  BButtonGroup,
  BButton,
  BTable
} from 'bootstrap-vue-next'
import Graph from 'vue3-apexcharts'
import moment from 'moment'

export default {
  components: {
    Graph,
    BContainer,
    BRow,
    BCol,
    BButtonGroup,
    BButton,
    BTable,
    },
  props: {
    displays: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      activeButton: 'hour',
      count: 0,
      clients: {},
      campaigns: {},
      displayIds: [],
      displayNames: {},
      prettyName: {
        memory: 'Memory Usage',
        disk: 'Disk Usage',
        signal: "Wireless Signal"
      },
      timeouts: {
        promTimeout: '',
        buttonTimeout: '',
        campaignTimeout: ''
      },
      updated: '',
      flag: '',
      chartOptions: {
        chart: {
          animations: {
            easing: 'easeinout',
            speed: 1500,
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          }
        },
        theme: {
            palette: 'palette3'
        },
        tooltip: {
          shared: false,
          onDatasetHover: {
            highlightDataSeries: true
          },
          x: {
              show: false
          }
        },
        legend: {
          show: false
        },
        logarithmic: true,
        stroke: {
          curve: 'smooth',
          width: 3.5
        },
        noData: {
          text: 'Loading...'
        },
        xaxis: {
          show: true,
          labels: {
            show: false
          },
          categories: [...Array(40).keys()],
          tooltip: {
              enabled: false
          }
        }
      },
      series: {
        orz_memory: [],
        orz_disk: [],
        orz_load: [],
        orz_signal: [],
        orz_thermal: []
      },
      upTable: {
        fields: [
          {
            key: 'client'
          }, 
          {
            key: 'uptime',
            formatter: (val) => {
              return this.format(val)
            }
          }
        ],
        items: [],
        sort: 'uptime',
      },
      campaignTable: {
        fields: [
          {
            key: 'display'
          },
          {
            key: 'campaign'
          },
          {
            key: 'time'
          }
        ], 
        items: [],
        plays: new Array(30),
        paused: "",
        flag: 'active'
      }
    }
  },
  mounted () {
    this.getDisplays()
    this.timeouts.listCampaignsTimeout = setTimeout(() => {this.listCampaigns()}, 1500)
    this.timeouts.updateChartTimeout = setTimeout(() => {this.updateChartOptions()}, 1500)
  },
  beforeUnmount () {
    clearTimeout(this.timeouts.promTimeout)
    clearTimeout(this.timeouts.buttonTimeout)
    clearTimeout(this.timeouts.campaignTimeout)
    clearTimeout(this.timeouts.updated)
    clearTimeout(this.timeouts.updateChartTimeout)
    clearTimeout(this.timeouts.listCampaignsTimeout)
  },
  methods: {
    prometheus (query, type, start, end, step) {
      if (type == 'campaigns') {
        return this.$axios.post(process.env.VUE_APP_API_ROOT + '/api/v1/displays/logs/latest', { "displayIds": query })
      }
      if (type == 'range') {
        return this.$axios.post(process.env.VUE_APP_PROMETHEUS_URL + 'api/v1/query_range',
        {
          'query': query,
          'start': start,
          'end': end,
          'step': step
        }, 
        {
          emulateJSON: true
        })
      }
      else {
        return this.$axios.post(process.env.VUE_APP_PROMETHEUS_URL + 'api/v1/query', { 'query': query }, { emulateJSON: true })
      }
    },
    queryGen (metric) {
      return this.displays.map(function (display){
        return metric + '{acid="' + display.hardwareId + '"}'
      }).join(' or ')
    },
    getDisplays () {
      if (this.series.orz_memory.length == 0) {
        for (let display of this.displays) {
          this.clients[display.hardwareId] = {
            orz_disk: new Array(40).fill(0), 
            orz_memory: new Array(40).fill(0),
            orz_load: new Array(40).fill(0),
            orz_signal: new Array(40).fill(0),
            orz_thermal: new Array(40).fill(0)
          }
          this.series.orz_memory.push({ name: display.name, data: [...this.clients[display.hardwareId].orz_memory] })
          this.series.orz_disk.push({ name: display.name, data: [...this.clients[display.hardwareId].orz_disk] })
          this.series.orz_load.push({ name: display.name, data: [...this.clients[display.hardwareId].orz_load] })
          this.series.orz_signal.push({ name: display.name, data: [...this.clients[display.hardwareId].orz_signal] })
          this.series.orz_thermal.push({ name: display.name, data: [...this.clients[display.hardwareId].orz_thermal] })
        }
        this.range('hour')
      }
    },
    fetchPromData (stop) {
      if (!stop) {
      for (let metric of ['orz_memory', 'orz_load', 'orz_disk', 'orz_signal']) {
        this.prometheus(this.queryGen(metric)).then(
          (response) => {
            let results = {}
            for (let result of response.data.data.result) {
              results[result.metric.acid] = result.value[1]
            }
            let i = 0
            for (let display of this.displays) {
              if (results[display.hardwareId] == undefined) {
                this.series[metric].splice(i, 1)
              }
              if (results[display.hardwareId] != undefined) {
                this.clients[display.hardwareId][metric].push(results[display.hardwareId])
                this.clients[display.hardwareId][metric].shift()
                // this.$set(this.series[metric], i, {
                //   name: display.name,
                //   data: [...this.clients[display.hardwareId][metric]]
                // })
                this.series[metric][i] = {
                  name: display.name,
                  data: [...this.clients[display.hardwareId][metric]]
                }
                i++
              }
            }
          },
          () => {
            this.clients = {}
          }
        )
      }
      if (this.upTable.items.length == 0) {
        this.prometheus(this.queryGen('orz_uptime')).then(
          (response) => {
            let results = {}
            for (let result of response.data.data.result) {
              results[result.metric.acid] = {
                name: result.metric.name,
                value: result.value[1]
              }
            }
            for (let display of this.displays) {
              if(results[display.hardwareId] != undefined) {
                this.upTable.items.push({client: display.name, uptime: results[display.hardwareId].value})
              }
            }
          },
          () => {}
        )
      }
      clearTimeout(this.timeouts.updated)
      this.count = 0
      this.counter(0)
      this.timeouts.promTimeout = setTimeout(() => this.fetchPromData(), 4000)
      }
    },
    format (duration) {
      let weeks = Math.floor(duration/604800)
      duration -= weeks * 604800
      let days = Math.floor(duration/86400)
      duration -= days * 86400
      let hours = Math.floor(duration/3600)%24
      duration -= hours * 3600
      let minutes = Math.floor(duration/60)%60
      duration -= minutes * 60

      let week = weeks > 0 ? (weeks + 'w ') : ''
      let day = days > 0 ? (days + 'd ') : ''
      let hour = hours > 0 ? (hours + 'h ') : ''
      let minute = minutes > 0 ? (minutes + 'm') : ''

      return week + day + hour + minute 
    },
    counter (val) {
      this.count += val
      this.timeouts.updated = setTimeout(() => {this.counter(1)}, 1000)
    },
    range (val) {
      if (val) {
        this.graphFlag = 'stopped'
        clearTimeout(this.timeouts.promTimeout)
        clearTimeout(this.timeouts.buttonTimeout)
        clearTimeout(this.timeouts.updated)
        this.counter()
        this.fetchPromData(stop)
        let end = Date.now()/1000
        let start
        let step
        switch (val) {
          case 'hour':
            this.count = 0
            start = end-3540
            step = '20s'
            break;
          case 'day':
            this.count = 0
            start = end-(3540*24)
            step = '8m'
            break;
          case 'week':
            this.count = 0
            start = end-(3540*24*7)
            step = '90m'
            break;
        }
        for (let metric of ['orz_memory', 'orz_disk', 'orz_load', 'orz_signal']) {
          this.prometheus(this.queryGen(metric), 'range', start, end, step).then(
            (response) => {
              let results = {}
              for (let result of response.data.data.result) {
                results[result.metric.acid] = { data: new Array() }
                for (let i = 0; i < result.values.length; i++) {
                  results[result.metric.acid].data.push(result.values[i][1])
                }
              }
              let i = 0
              for (let display of this.displays) {
                if (results[display.hardwareId] == undefined) {
                  this.series[metric].splice(i, 1)
                }
                if (results[display.hardwareId] != undefined) {
                  // this.$set(this.series[metric], i, {
                  //   name: display.name,
                  //   data: [...results[display.hardwareId].data]
                  // })
                  this.series[metric][i] = {
                    name: display.name,
                    data: [...results[display.hardwareId].data]
                  }
                  i++
                }
              }
            }
          )
        }
        this.timeouts.buttonTimeout = setTimeout(() => {this.range(val)}, 10000)
      }
      else if (this.graphFlag == 'stopped') {
        clearTimeout(this.timeouts.buttonTimeout)
        this.fetchPromData()
        this.graphFlag = 'active'
      }
    },
    getActiveClass (id){
      if (id === this.activeButton) {
        return "btn btn-primary active"
      }
      else {
        return "btn btn-outline-primary"
      }
    },
    listCampaigns () {
      let url = 'v1/campaigns?limit=all'
      this.$axios.get(url).then(
        (response) => {
          let result = response.data.data
          for (let campaign of result) {
            this.campaigns[campaign.campaignId] = { name: campaign.name }
          }
          for (let display of this.displays) {
            this.displayIds.push(display.displayId)
            this.displayNames[display.displayId] = { name: display.name }
          }
          this.lastCampaign()
      })
    },
    lastCampaign () {
      this.prometheus(this.displayIds, 'campaigns').then(
        (response) => {
          let result = response.data.data
          let logCache = []
          for (let display of result) {
            if (display.latestBookingLog.length != 0 && this.campaigns[display.latestBookingLog[0].campaign_id] != undefined) {
              logCache.push(
                {
                  display: this.displayNames[display.latestBookingLog[0].display_id].name,
                  campaign: this.campaigns[display.latestBookingLog[0].campaign_id].name,
                  time: display.latestBookingLog[0].playback_start
                }
              )
            }
          }
          logCache.sort(function(x, y){
            if(y.time > x.time){
              return 1
            }else {
              return -1
            }
          })
          for (let displays of logCache) {
            this.campaignTable.plays.unshift(
              {
                display: displays.display,
                campaign: displays.campaign,
                time: displays.time
              }
            )
            this.campaignTable.plays.pop()
          }
          for (let i = 0; i < this.campaignTable.plays.length; i++) {
            if (this.campaignTable.plays[i] != undefined){
              // this.$set(this.campaignTable.items, i, { 
              //   key: i,
              //   display: this.campaignTable.plays[i].display,
              //   campaign: this.campaignTable.plays[i].campaign,
              //   time: this.convertTimestamp(this.campaignTable.plays[i].time)
              // })
              this.campaignTable.items[i] = { 
                key: i,
                display: this.campaignTable.plays[i].display,
                campaign: this.campaignTable.plays[i].campaign,
                time: this.convertTimestamp(this.campaignTable.plays[i].time)
              }
            }
          }
        }
      )
      clearTimeout(this.timeouts.campaignTimeout)
      this.timeouts.campaignTimeout = setTimeout(() => {this.lastCampaign()}, 30000)
    },
    pause () {
      if (this.campaignTable.flag != 'stopped') {
        clearTimeout(this.timeouts.campaignTimeout)
        this.campaignTable.flag = 'stopped'
        this.campaignTable.paused = 'Paused'
      }
      else {
        this.lastCampaign()
        this.campaignTable.flag = 'active'
        this.campaignTable.paused = ''
      }
    },
    convertTimestamp (time) {
      return moment.unix(time).tz('Australia/Adelaide').format('HH:mm DD/MM')
    },
    updateChartOptions () {
      for (let metric of ["memory", "disk", "signal"]) {
        this.$refs[metric].updateOptions({
          title: {
            text: this.prettyName[metric],
            align: 'left'
          },
          yaxis: {
            labels: {
              formatter: (value) => value.toFixed(0) + '%'
            }
          }
        })
      }
      this.$refs.load.updateOptions({
        title: {
          text: 'System Load',
          align: 'left'
        }
      })
      // this.$refs.thermal.updateOptions({
      //   title: {
      //     text: 'Temperature',
      //     align: 'left'
      //   }
      // })
    }
  }
}
</script>

<style>
  .my-table {
    max-height: 300px;
    overflow-y: scroll;
  }
</style>
