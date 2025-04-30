<template>
  <b-row>
    <b-col cols="12">
      <h2>{{ booking.campaignName }} on {{ booking.displayName }}</h2>
      <b-table-simple
        stacked
        small
      >
        <b-tr>
          <b-th>
            Campaign
          </b-th>
          <b-td>
            {{ booking.campaignName }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Booking Display
          </b-th>
          <b-td>
            {{ booking.displayName }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Booking Team
          </b-th>
          <b-td>
            {{ booking.advertiser }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Booking ID
          </b-th>
          <b-td>{{ booking.id }}</b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Booking Dates
          </b-th>
          <b-td v-if="booking.startDate === booking.endDate">
            {{ booking.startDate }}
          </b-td>
          <b-td v-else>
            {{ booking.startDate }} to {{ booking.endDate }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Days Enabled
          </b-th>
          <b-td>
            <b-badge 
              v-for="(box, idx) in daysOfWeek"
              :key="idx"
              :variant="box.variant"
            >
              {{ box.value }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Skipped Weeks
          </b-th>
          <b-td v-if="booking.skippedWeeks == 0">
            None skipped
          </b-td>
          <b-td v-else-if="booking.skippedWeeks == 1">
            Every Second Week
          </b-td>
          <b-td v-else>
            Every Third Week
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Daily Play Times
          </b-th>
          <b-td v-if="booking.startTime === '00:00:00' && booking.endTime === '23:59:59'">
            All Day
          </b-td>
          <b-td v-else>
            {{ booking.startTime }} to {{ booking.endTime }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Campaign Duration
          </b-th>
          <b-td>
            {{ booking.duration }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Booking Date
          </b-th>
          <b-td>
            {{ booking.dateScheduled }}
          </b-td>
        </b-tr>
        <b-tr>
          <b-th>
            Approval
          </b-th>
          <b-td v-if="booking.approval === 'pending'">
            <b-badge>Pending Approval</b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'approved'">
            <b-badge variant="success">
              Approved
            </b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'denied'">
            <b-badge variant="danger">
              Pending Denied
            </b-badge>
          </b-td>
          <b-td v-else-if="booking.approval === 'cancelled'">
            <b-badge variant="danger">
              Cancelled
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="booking.approval==='approved'">
          <b-th>
            Status
          </b-th>
          <b-td
            v-if="(booking.endDate > date && booking.startDate < date) || (booking.endDate ===date && booking.endTime <= time ) || (booking.startDate ===date && booking.startTime >= time )"
          >
            <b-badge variant="success">
              Running
            </b-badge>
          </b-td>
          <b-td v-else-if="booking.endDate < date || (booking.endDate ===date && booking.endTime > time )">
            <b-badge>Finished</b-badge>
          </b-td>
          <b-td v-else-if="booking.startDate > date || (booking.startDate ===date && booking.startTime < time )">
            <b-badge variant="warning">
              Pending
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="booking.startDate <= date && booking.startTime <= time && (plays > 0 || booking.approval==='approved')">
          <b-th>
            Total Plays To Date
          </b-th>
          <b-td>{{ plays }} / {{ expectedPlays }}</b-td>
        </b-tr>
        <b-tr v-if="booking.startDate <= date && booking.startTime <= time && (plays > 0 || booking.approval==='approved')">
          <b-th>
            Play Time To Date
          </b-th>
          <b-td>{{ ((plays * booking.duration) /60).toFixed(2) }} / {{ ((expectedPlays * booking.duration)/60).toFixed(2) }} mins</b-td>
        </b-tr>
        <b-tr v-if="booking.startDate <= date && booking.startTime <= time && (plays > 0 || booking.approval==='approved')">
          <b-th>
            Current Playback Efficiency
          </b-th>
          <b-td>
            {{ (plays/expectedPlays * 100).toFixed(0) }}%
          </b-td>
        </b-tr>
      </b-table-simple>
    </b-col>
  </b-row>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Log',
  components: {},
  props: {
    booking: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:MM:SS'),
      errors: [],
      plays: '',
      fullstat: [],
      tableFields: ['playback_start', 'frame_counter', 'brightness', 'total_playback'],
      rootUrl: process.env.VUE_APP_API_ROOT,
      daysOfWeek: [
        { value: "M", variant: "secondary" },
        { value: "T", variant: "secondary" },
        { value: "W", variant: "secondary" },
        { value: "T", variant: "secondary" },
        { value: "F", variant: "secondary" },
        { value: "S", variant: "secondary" },
        { value: "S", variant: "secondary" }
      ]
    }
  },
  computed: {
    expectedPlays() {
      let days = moment(this.booking.endDate).diff(moment(this.booking.startDate), 'days') + 1
      let hours = moment(this.booking.endTime, "HH:mm:ss").diff(moment(this.booking.startTime, "HH:mm:ss"), 'hours') + 1
      return (days * hours * 60 * 60) / this.booking.blockTime
    }
  },
  beforeUnmount() {
    this.$emit('refresh')
  },
  mounted() {
    this.fetchPlaycount()
    this.activeDays()
  },
  methods: {
    // openReport(id) {
    //   this.$router.push({
    //     name: 'report',
    //     params: {
    //       bookingId: id
    //     }
    //   })
    // },
    fetchPlaycount () {
      var scope = this
      this.$axios.get('v1/scheduling/' + this.booking.id + '/logtotal').then((response) => {
        this.plays = response.data.playback_count
      }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
          scope.loaded = true
        }
      )
    },
    activeDays () {
      let days = parseInt(this.booking.daysEnabled)

      const mon = 0b0000001
      const tues = 0b0000010
      const wed = 0b0000100
      const thurs = 0b0001000
      const fri = 0b0010000
      const sat = 0b0100000
      const sun = 0b1000000

      if (days & mon) {
        this.daysOfWeek[0].variant = "primary"
      }
      if (days & tues) {
        this.daysOfWeek[1].variant = "primary"
      }
      if (days & wed) {
        this.daysOfWeek[2].variant = "primary"
      }
      if (days & thurs) {
        this.daysOfWeek[3].variant = "primary"
      }
      if (days & fri) {
        this.daysOfWeek[4].variant = "primary"
      }
      if (days & sat) {
        this.daysOfWeek[5].variant = "primary"
      }
      if (days & sun) {
        this.daysOfWeek[6].variant = "primary"
      }
    }
  }
}
</script>
