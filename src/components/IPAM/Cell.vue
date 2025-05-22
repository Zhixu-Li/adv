<template>
  <BTd
    class="text-center"
    style="vertical-align: middle"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
  >
    <template v-if="loaded">
      <template v-if="filteredBookings.length > 0">
        <template v-if="content.cc.campaignId">
          <BButton
            size="sm"
            :variant="running ? 'success' : 'warning'"
            @click="$emit('triggerModal','manageCampaign',content.cc,content.dc)"
          >
            BOOKED
            <BBadge v-if="filteredBookings.length > 1" variant="light">
              {{ filteredBookings.length }}
            </BBadge>
          </BButton>
        </template>
        <template v-else>
          <BButton
            size="sm"
            :variant="running ? 'success' : 'warning'"
            @click="$emit('triggerModal','manageSource',content.cc,content.dc)"
          >
            CONNECTED
            <BBadge v-if="filteredBookings.length > 1" variant="light">
              {{ filteredBookings.length }}
            </BBadge>
          </BButton>
        </template>
      </template>
      <template v-else-if="showButt">
        <template v-if="content.cc.campaignId">
          <BButton
            size="sm"
            @click="$emit('triggerModal','addCampaign',content.cc,content.dc)"
          >
            BOOK
          </BButton>
        </template>
        <template v-else>
          <BButton
            size="sm"
            @click="$emit('triggerModal','addSource',content.cc,content.dc)"
          >
            CONNECT
          </BButton>
        </template>
      </template>
    </template>
  </BTd>
</template>


<script>
// {{ booking.campaignId === content.cc.campaignId ? 'BOOKED' : '' }}
// grey out column if display prop is offline

import moment from 'moment'
import { BTd, BButton, BBadge } from 'bootstrap-vue-next'


export default {
    name: 'IpamCell',
    components: {
      BTd,
      BButton,
      BBadge,
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