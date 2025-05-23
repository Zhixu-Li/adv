<template lang="html">
  <div>
    <h4>
      {{ campaign.name }}
      {{ $t('article.on') }}
      {{ localDisplay.name }}
      {{ localDisplay.status }}
    </h4>

    <BAspect
      :aspect="getAspect(campaign.media)"
      style="width: 50%"
      class="mx-auto"
    >
      <Campaign
        style="height: 100%"
        :media="campaign.media.data"
      />
    </BAspect>

    <BTableSimple responsive>
      <BThead>
        <BTr>
          <BTh>{{ $t('dateTime.runDates') }}</BTh>
          <BTh>{{ $t('dateTime.dailyTimes') }}</BTh>
          <BTh>{{ $t('dashboard.approval.status') }}</BTh>
          <BTh />
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="booking in filteredCampaigns"
          :key="booking.id"
        >
          <BTd v-if="booking.startDate === booking.endDate">
            {{ booking.startDate }}
          </BTd>
          <BTd v-else-if="booking.endDate >= '2037-01-01'">
            {{ booking.startDate }}, no end date
          </BTd>
          <BTd v-else>
            {{ booking.startDate }} to {{ booking.endDate }}
          </BTd>

          <BTd
            v-if="booking.startTime === '00:00:00' && booking.endTime === '23:59:59'"
          >
            All Day
          </BTd>
          <BTd v-else>
            {{ booking.startTime }} to {{ booking.endTime }}
          </BTd>

          <BTd v-if="booking.approval === 'pending'">
            <BBadge>Pending Approval</BBadge>
          </BTd>
          <BTd
            v-else-if="
              booking.approval === 'approved' &&
              booking.endDate >= date &&
              booking.startDate <= date &&
              booking.endTime >= time &&
              booking.startTime <= time
            "
          >
            <BBadge variant="success">Running</BBadge>
          </BTd>
          <BTd v-else-if="booking.approval === 'approved'">
            <BBadge variant="warning">Booked</BBadge>
          </BTd>
          <BTd v-else-if="booking.approval === 'denied'">
            <BBadge variant="danger">Pending Denied</BBadge>
          </BTd>

          <BTd>
            <BButton size="sm" variant="danger" @click="removeCampaign(booking)">
              {{ $t('buttons.remove') }}
            </BButton>
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>

    <BButton variant="primary" @click="$emit('add')">
      {{ $t('buttons.add') }}
    </BButton>
  </div>
</template>
<script>
import {
  BAspect,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BBadge,
  BButton
} from 'bootstrap-vue-next'
import moment from 'moment'
import Campaign from '@/components/Player/PropPlayer.vue'
import aspectRatio from '@/mixins/aspectRatio'

export default {
  components: {
    Campaign,
      BAspect,
      BTableSimple,
      BThead,
      BTr,
      BTh,
      BTbody,
      BTd,
      BBadge,
      BButton,
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
