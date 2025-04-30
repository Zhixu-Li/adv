<template lang="html">
  <b-card
    class="mb-2"
    :header="$t('sources.current')"
  >
    <b-card-text>
      <b-list-group>
        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.status') }}
          <b-badge
            :variant="statusType"
            pill
          >
            {{ stats.status }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.latency') }}
          <b-badge variant="success">
            {{ stats.latency }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.APIVer') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.version }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.campaign') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.campaigns }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.author') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.author }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.campany') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.company }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.email') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.email }}
          </b-badge>
        </b-list-group-item>

        <b-list-group-item class="d-flex justify-content-between align-items-center">
          {{ $t('sources.phone') }}
          <b-badge
            variant="light"
            pill
          >
            {{ stats.phone }}
          </b-badge>
        </b-list-group-item>
      </b-list-group>

      <p class="text-right">
        <small>{{ $t('sources.update') }}</small>
      </p>
    </b-card-text>
  </b-card>
</template>

<script>
export default {
  props: {
    source: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      timer: '',
      poll_interval: 5000,
      startTime: '',
      flags: {
          isLoading: true,
          isAvailable: true,
          isGoodLatency: true,
          isGoodCampaigns: true,
      },
      stats: {
          status: '',
          latency: '',
          version: '',
          campaigns: '',
          author: '',
          company: '',
          email: '',
          phone: ''
      },
    }
  },
  computed: {
      statusType: function()
      {
          if (this.flags.isLoading === true) {
            return 'warning'
          }
          else {
            if (this.flags.isAvailable === true) {
                return 'success'
            }
            else {
                return 'danger'
            }
          }
      }
  },
  mounted () {
    this.stats.status = 'LOADING'
    this.flags.isLoading = true
    this.fetchStats()
  },
  beforeUnmounted() {
    clearTimeout(this.timer)
  },
  methods: {
    fetchStats() {
        if (this.source.uri !== null) {
            this.startTime = new Date;
            this.$axios.get(this.source.uri, {
                params: { _path: '/status' },
            }).then(
                (response) => {
                    let currentTime = new Date
                    if (response.data) {
                        // we don't need to sanitise anything here, just don't treat it as html
                        this.stats.author = response.data.author
                        this.stats.campaigns = response.data.campaigns
                        this.stats.version = response.data.version
                        this.stats.email = response.data.email
                        this.stats.phone = response.data.phone
                        this.stats.company = response.data.company
                        this.stats.latency = (currentTime - this.startTime)
                        this.stats.status = 'AVAILABLE'
                        this.flags.isLoading = false
                        this.flags.isAvailable = true
                    }
                    else {
                        this.stats.status = 'UNAVAILABLE'
                        this.stats.author = ''
                        this.stats.campaigns = ''
                        this.stats.version = ''
                        this.stats.email = ''
                        this.stats.phone = ''
                        this.stats.company = ''
                        this.flags.isLoading = false
                        this.flags.isAvailable = false
                        this.stats.latency = (currentTime - this.startTime)
                    }
                },
                () => {
                    this.stats.status = 'UNAVAILABLE'
                    this.flags.isLoading = false
                    this.flags.isAvailable = false
                    let currentTime = new Date
                    this.stats.author = ''
                    this.stats.campaigns = ''
                    this.stats.version = ''
                    this.stats.email = ''
                    this.stats.phone = ''
                    this.stats.company = ''
                    this.stats.latency = (currentTime - this.startTime)
                },
            )
        }
        else {
            this.stats.status = 'WAITING'
            this.flags.isLoading = true
            this.flags.isAvailable = false
            this.stats.author = ''
            this.stats.campaigns = ''
            this.stats.version = ''
            this.stats.email = ''
            this.stats.phone = ''
            this.stats.company = ''
            this.stats.latency = ''
        }
        this.timer = setTimeout( () => { this.fetchStats() }, this.poll_interval)
    },
  }
}
</script>