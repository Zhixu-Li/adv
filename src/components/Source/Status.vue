<template lang="html">
  <BCard class="mb-2" :header="$t('sources.current')">
    <BCardText>
      <BListGroup>
        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.status') }}
          <BBadge :variant="statusType" pill>
            {{ stats.status }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.latency') }}
          <BBadge variant="success">
            {{ stats.latency }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.APIVer') }}
          <BBadge variant="light" pill>
            {{ stats.version }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.campaign') }}
          <BBadge variant="light" pill>
            {{ stats.campaigns }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.author') }}
          <BBadge variant="light" pill>
            {{ stats.author }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.campany') }}
          <BBadge variant="light" pill>
            {{ stats.company }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.email') }}
          <BBadge variant="light" pill>
            {{ stats.email }}
          </BBadge>
        </BListGroupItem>

        <BListGroupItem class="d-flex justify-content-between align-items-center">
          {{ $t('sources.phone') }}
          <BBadge variant="light" pill>
            {{ stats.phone }}
          </BBadge>
        </BListGroupItem>
      </BListGroup>

      <p class="text-right">
        <small>{{ $t('sources.update') }}</small>
      </p>
    </BCardText>
  </BCard>
</template>


<script>
import {
  BCard,
  BCardText,
  BListGroup,
  BListGroupItem,
  BBadge
} from 'bootstrap-vue-next'
export default {
  components:{
    BCard,
    BCardText,
    BListGroup,
    BListGroupItem,
    BBadge,
  },
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