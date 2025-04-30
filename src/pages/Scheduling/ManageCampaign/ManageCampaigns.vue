<template lang="html">
  <div>
    <h4>{{ campaign.name }} {{ $t('article.on') }} {{ localDisplay.name }} {{ localDisplay.status }}</h4>
    <b-aspect
      :aspect="getAspect(campaign.media)"
      style="width: 50%"
      class="mx-auto"
    >
      <campaign
        style="height: 100%"
        :media="campaign.media.data"
      />
    </b-aspect>

    <b-table-simple responsive>
      <b-thead>
        <b-tr>
          <b-th>{{ $t('dateTime.runDates') }}</b-th>
          <b-th>{{ $t('dateTime.dailyTimes') }}</b-th>
          <b-th>{{ $t('dashboard.approval.status') }}</b-th>
          <b-th />
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr
          v-for="booking in filteredCampaigns"
          :key="booking.id"
        >
          <b-td v-if="booking.startDate === booking.endDate">
            {{ booking.startDate }}
          </b-td>
          <b-td v-else-if="booking.endDate >= '2037-01-01'">
            {{ booking.startDate }}, no end date
          </b-td>
          <b-td v-else>
            {{ booking.startDate }} to {{ booking.endDate }}
          </b-td>

          <b-td v-if="booking.startTime === '00:00:00' && booking.endTime === '23:59:59'">
            All Day
          </b-td>
          <b-td v-else>
            {{ booking.startTime }} to {{ booking.endTime }}
          </b-td>

          <b-td v-if="booking.approval === 'pending'">
            <b-badge>Pending Approval</b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'approved' && booking.endDate >= date && booking.startDate <= date && booking.endTime >= time && booking.startTime <= time">
            <b-badge variant="success">
              Running
            </b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'approved'">
            <b-badge variant="warning">
              Booked
            </b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'denied'">
            <b-badge variant="danger">
              Pending Denied
            </b-badge>
          </b-td>

          <b-td>
            <b-button
              size="sm"
              variant="danger"
              @click="removeCampaign(booking)"
            >
              {{ $t('buttons.remove') }}
            </b-button>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <b-button
      variant="primary"
      @click="$emit('add')"
    >
      {{ $t('buttons.add') }}
    </b-button>
  </div>
</template>

<script>
import moment from 'moment'
import Campaign from '@/components/Player/PropPlayer.vue'
import aspectRatio from '@/mixins/aspectRatio'

export default {
  components: {
    Campaign
  },
  mixins: [aspectRatio],
  props: {
    campaign: {
      type: Object,
      required: true
    },
    display: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      localDisplay: {},
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm:ss')
    }
  },
  computed: {
    filteredCampaigns () {
      return this.localDisplay.bookings.data.filter(
        campaign => campaign.campaignId === this.campaign.campaignId
      )
    }
  },
  watch: {
    display: {
      handler(newVal) {
        this.localDisplay = JSON.parse(JSON.stringify(newVal))
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    removeCampaign (booking) {
      const id = booking.id
      this.$axios.delete(`v1/displays/${this.localDisplay.displayId}/campaigns/${id}`).then(
        () => {
          this.localDisplay.bookings.data = this.localDisplay.bookings.data.filter(b => b.id !== id)
          this.$emit('deleted', this.localDisplay)
          this.$notifications.add({
            title: 'Deleted',
            type: 'success',
            body: this.$t('notifications.campaignRemove'),
            timeout: true
          })
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.campaignRemoveError'),
            timeout: true
          })
        }
      )
    }
  }
}
</script>

<style lang="css">
</style>
