<template lang="html">
  <b-td
    class="text-center"
    style="vertical-align: middle"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
  >
    <template v-if="loaded">
      <template v-if="filteredBookings.length > 0">
        <template v-if="content.cc.campaignId">
          <b-button
            size="sm"
            :variant="running ? 'success' : 'warning'"
            @click="$emit('triggerModal', 'manageCampaign', content.cc, content.dc)"
          >
            BOOKED <b-badge
              v-if="filteredBookings.length > 1"
              variant="light"
            >
              {{ filteredBookings.length }}
            </b-badge>
          </b-button>
        </template>
        <template v-else>
          <b-button
            size="sm"
            :variant="running ? 'success' : 'warning'"
            @click="$emit('triggerModal', 'manageSource', content.cc, content.dc)"
          >
            CONNECTED <b-badge
              v-if="filteredBookings.length > 1"
              variant="light"
            >
              {{ filteredBookings.length }}
            </b-badge>
          </b-button>
        </template>
      </template>
      <template v-else-if="showButt">
        <!-- ideally this emit would just return the ccid and dcid instead of wasting cpu passing around shit -->
        <template v-if="content.cc.campaignId">
          <b-button
            size="sm"
            @click="$emit('triggerModal', 'addCampaign', content.cc, content.dc)"
          >
            BOOK
          </b-button>
        </template>
        <template v-else>
          <b-button
            size="sm"
            @click="$emit('triggerModal', 'addSource', content.cc, content.dc)"
          >
            CONNECT
          </b-button>
        </template>
      </template>
    </template>
  </b-td>
</template>

<script>
// {{ booking.campaignId === content.cc.campaignId ? 'BOOKED' : '' }}
// grey out column if display prop is offline

import moment from 'moment'


export default {
    name: 'IpamCell',
    components: {
    },
    props: {
        content: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            loaded: false,
            showButt: false,
        }
    },
    computed: {
        filteredBookings: function() {
            if (this.loaded) {
                return this.content.dc.bookings.data.filter(
                    booking => booking.campaignId === this.content.cc.campaignId && moment.tz(booking.endDate + ' ' + booking.endTime, this.content.dc.timezone).local().format('YYYY-MM-DD') >= this.content.date
                ).concat(this.content.dc.e2vbookings.data.filter(
                    booking => booking.sourceId === this.content.cc.sourceId && moment.tz(booking.endDate + ' ' + booking.endTime, this.content.dc.timezone).local().format('YYYY-MM-DD') >= this.content.date)
                )
            }
            return null
        },
        running: function() {
            if (this.loaded) {
                let running = false
                for (let booking of this.content.dc.bookings.data) {
                    if (moment.tz(booking.endDate + ' ' + booking.endTime, this.content.dc.timezone).local().format('YYYY-MM-DD') >= this.content.date && moment.tz(booking.startDate + ' ' + booking.startTime, this.content.dc.timezone).local().format('YYYY-MM-DD') <= this.content.date)
                        if (moment.tz(booking.endDate + ' ' + booking.endTime, this.content.dc.timezone).local().format('HH:mm:ss') >= this.content.time && moment.tz(booking.startDate + ' ' + booking.startTime, this.content.dc.timezone).local().format('HH:mm:ss') <= this.content.time)
                            running = true
                }
                return running;
            }
            return null;
        }
    },
    watch: {
    },
    mounted() {
        this.$nextTick(() => {
            this.loaded = true
        })
    },
    methods: {
        mouseOver() {
            this.showButt = true
        },
        mouseLeave() {
            this.showButt = false
        },
    }
}
</script>