<template lang="html">
  <BRow>
    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BLink :to="{ name: 'campaigns', params: {} }">
            <font-awesome-icon
              icon="expand-alt"
              class="border rounded-circle p-2 bg-light text-danger"
              style="font-size: 2rem;"
            />
          </BLink>
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ stats.total }}</strong>
          {{ $t('dashboard.campaignStats.campaigns') }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BLink :to="{ name: 'IPAM', params: {} }">
            <font-awesome-icon
              icon="play"
              class="border rounded-circle p-2 bg-light text-success"
              style="font-size: 2rem;"
            />
          </BLink>
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ stats.playing }}</strong>
          {{ $t('dashboard.campaignStats.playingCampaigns') }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <BLink :to="{ name: 'IPAM', params: {} }">
            <font-awesome-icon
              icon="calendar-check"
              class="border rounded-circle p-2 bg-light text-primary"
              style="font-size: 2rem;"
            />
          </BLink>
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ stats.scheduled }}</strong>
          {{ $t('dashboard.campaignStats.schedCampaigns') }}
        </BCol>
      </BRow>
    </BCol>

    <BCol class="text-center align-middle">
      <BRow>
        <BCol class="m-0 p-1">
          <font-awesome-icon
            icon="calendar-days"
            class="border rounded-circle p-2 bg-light text-warning"
            style="font-size: 2rem;"
          />
        </BCol>
      </BRow>
      <BRow>
        <BCol class="m-0 p-1">
          <strong>{{ stats.pending }}</strong>
          {{ $t('dashboard.campaignStats.waitApproval') }}
        </BCol>
      </BRow>
    </BCol>
  </BRow>
</template>

<script>
import { BRow, BCol, BLink } from 'bootstrap-vue-next'
// import 'vue-awesome/icons/film'
// import 'vue-awesome/icons/play'
// import 'vue-awesome/icons/calendar-check'
// import 'vue-awesome/icons/calendar-times'
// import 'vue-awesome/icons/file-image'
// import 'vue-awesome/icons/file-video'
// import 'vue-awesome/icons/file-audio'
// import 'vue-awesome/icons/hdd'

export default {
  components:{
    BRow,
    BCol,
    BLink,
  },
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
