<template lang="html">
  <b-row>
    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-link :to="{ name: 'campaigns', params: {} }">
            <!-- <b-icon class="border rounded-circle p-2 bg-light" variant="danger" icon="aspect-ratio" font-scale="3" ></b-icon> -->

            <font-awesome-icon
              icon="expand-alt"
              class="border rounded-circle p-2 bg-light text-danger"
              style="font-size: 2rem;"
            />
          </b-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ stats.total }}</b>
          {{ $t('dashboard.campaignStats.campaigns') }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-link :to="{ name: 'IPAM', params: {} }">
            <!-- <b-icon class="border rounded-circle p-2 bg-light" variant="success" icon="play-btn" font-scale="3" ></b-icon> -->
            <font-awesome-icon
              icon="play"
              class="border rounded-circle p-2 bg-light text-success"
              style="font-size: 2rem;"
            />
          </b-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ stats.playing }}</b>
          {{ $t('dashboard.campaignStats.playingCampaigns') }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <b-link :to="{ name: 'IPAM', params: {} }">
            <!-- <b-icon class="border rounded-circle p-2 bg-light" variant="primary" icon="calendar-check" font-scale="3" ></b-icon> -->
            <font-awesome-icon
              icon="calendar-check"
              class="border rounded-circle p-2 bg-light text-primary"
              style="font-size: 2rem;"
            />
          </b-link>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ stats.scheduled }}</b>
          {{ $t('dashboard.campaignStats.schedCampaigns') }}
        </b-col>
      </b-row>
    </b-col>

    <b-col class="text-center align-middle">
      <b-row>
        <b-col class="m-0 p-1">
          <!-- 0 -->
          <font-awesome-icon
            icon="calendar-days"
            class="border rounded-circle p-2 bg-light text-warning"
            style="font-size: 2rem;"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col class="m-0 p-1">
          <b>{{ stats.pending }}</b>
          {{ $t('dashboard.campaignStats.waitApproval') }}
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
// import 'vue-awesome/icons/film'
// import 'vue-awesome/icons/play'
// import 'vue-awesome/icons/calendar-check'
// import 'vue-awesome/icons/calendar-times'
// import 'vue-awesome/icons/file-image'
// import 'vue-awesome/icons/file-video'
// import 'vue-awesome/icons/file-audio'
// import 'vue-awesome/icons/hdd'

export default {
  props: {
    refreshTime: {
      type: Number,
      required: false,
      default: 5
    }
  },
  data () {
    return {
      stats: {
        total: 0,
        playing: 0,
        scheduled: 0,
        pending: 0
      },
      interval: {}
    }
  },
  watch: {
    refreshTime () {
      clearInterval(this.interval)
      this.interval = setInterval(this.fetchStats, (this.refreshTime * 60 * 1000))
    }
  },
  mounted () {
    this.fetchStats()
    this.interval = setInterval(this.fetchMediaStats, (this.refreshTime * 60 * 1000))
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods: {
    fetchStats () {
      let url = 'v1/campaigns/status?restrict=true'
      this.$axios.get(url).then(
        (response) => {
          this.stats = response.data.data
        },
        () => {
          this.stats = {
            total: 0,
            playing: 0,
            scheduled: 0,
            pending: 0
          }
        }
      )
    }
  }
}
</script>

<style lang="css">
</style>
