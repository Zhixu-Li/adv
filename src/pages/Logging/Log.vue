<template>
  <BRow>
    <BCol cols="12">
      <h2>{{ booking.campaignName }} on {{ booking.displayName }}</h2>

      <BTableSimple stacked small>
        <!-- Campaign -->
        <BTr>
          <BTh>Campaign</BTh>
          <BTd>{{ booking.campaignName }}</BTd>
        </BTr>

        <!-- Display -->
        <BTr>
          <BTh>Booking Display</BTh>
          <BTd>{{ booking.displayName }}</BTd>
        </BTr>

        <!-- Team -->
        <BTr>
          <BTh>Booking Team</BTh>
          <BTd>{{ booking.advertiser }}</BTd>
        </BTr>

        <!-- ID -->
        <BTr>
          <BTh>Booking ID</BTh>
          <BTd>{{ booking.id }}</BTd>
        </BTr>

        <!-- Dates -->
        <BTr>
          <BTh>Booking Dates</BTh>
          <BTd v-if="booking.startDate === booking.endDate">
            {{ booking.startDate }}
          </BTd>
          <BTd v-else>
            {{ booking.startDate }} to {{ booking.endDate }}
          </BTd>
        </BTr>

        <!-- Days Enabled -->
        <BTr>
          <BTh>Days Enabled</BTh>
          <BTd>
            <BBadge
              v-for="(box, idx) in daysOfWeek"
              :key="idx"
              :variant="box.variant"
              class="mr-1"
            >
              {{ box.value }}
            </BBadge>
          </BTd>
        </BTr>

        <!-- Skipped Weeks -->
        <BTr>
          <BTh>Skipped Weeks</BTh>
          <BTd v-if="booking.skippedWeeks === 0">None skipped</BTd>
          <BTd v-else-if="booking.skippedWeeks === 1">Every Second Week</BTd>
          <BTd v-else>Every Third Week</BTd>
        </BTr>

        <!-- Daily Play Times -->
        <BTr>
          <BTh>Daily Play Times</BTh>
          <BTd v-if="booking.startTime==='00:00:00' && booking.endTime==='23:59:59'">
            All Day
          </BTd>
          <BTd v-else>
            {{ booking.startTime }} to {{ booking.endTime }}
          </BTd>
        </BTr>

        <!-- Campaign Duration -->
        <BTr>
          <BTh>Campaign Duration</BTh>
          <BTd>{{ booking.duration }}</BTd>
        </BTr>

        <!-- Booking Date -->
        <BTr>
          <BTh>Booking Date</BTh>
          <BTd>{{ booking.dateScheduled }}</BTd>
        </BTr>

        <!-- Approval -->
        <BTr>
          <BTh>Approval</BTh>
          <BTd v-if="booking.approval==='pending'">
            <BBadge>Pending Approval</BBadge>
          </BTd>
          <BTd v-else-if="booking.approval==='approved'">
            <BBadge variant="success">Approved</BBadge>
          </BTd>
          <BTd v-else-if="booking.approval==='denied'">
            <BBadge variant="danger">Denied</BBadge>
          </BTd>
          <BTd v-else-if="booking.approval==='cancelled'">
            <BBadge variant="danger">Cancelled</BBadge>
          </BTd>
        </BTr>

        <!-- Status -->
        <BTr v-if="booking.approval==='approved'">
          <BTh>Status</BTh>
          <BTd v-if="isRunning"><BBadge variant="success">Running</BBadge></BTd>
          <BTd v-else-if="isFinished"><BBadge>Finished</BBadge></BTd>
          <BTd v-else><BBadge variant="warning">Pending</BBadge></BTd>
        </BTr>

        <!-- Playback Efficiency -->
        <BTr v-if="showEfficiency">
          <BTh>Total Plays To Date</BTh>
          <BTd>{{ plays }} / {{ expectedPlays }}</BTd>
        </BTr>
        <BTr v-if="showEfficiency">
          <BTh>Play Time To Date</BTh>
          <BTd>{{ ((plays*booking.duration)/60).toFixed(2) }} / {{ ((expectedPlays*booking.duration)/60).toFixed(2) }} mins</BTd>
        </BTr>
        <BTr v-if="showEfficiency">
          <BTh>Current Playback Efficiency</BTh>
          <BTd>{{ ((plays/expectedPlays)*100).toFixed(0) }}%</BTd>
        </BTr>
      </BTableSimple>
    </BCol>
  </BRow>
</template>



<script>
import moment from 'moment'
import {
  BRow,
  BCol,
  BTableSimple,
  BTr,
  BTh,
  BTd,
  BBadge
} from 'bootstrap-vue-next'
export default {
  name: 'Log',
  components: {
    BRow,
    BCol,
    BTableSimple,
    BTr,
    BTh,
    BTd,
    BBadge
  },
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
