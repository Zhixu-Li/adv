<template lang="html">
  <div>
    <h4>
      {{ source.name }}
      {{ $t('article.on') }}
      {{ localDisplay.name }}
      {{ localDisplay.status }}
    </h4>

    <BTableSimple striped responsive>
      <BThead>
        <BTr>
          <BTh>{{ $t('dateTime.runDates') }}</BTh>
          <BTh>{{ $t('dateTime.dailyTimes') }}</BTh>
          <BTh>{{ $t('dashboard.approval.status') }}</BTh>
          <BTh />
        </BTr>
      </BThead>

      <BTbody>
        <template v-for="booking in filteredSources" :key="booking.id">
          <BTr>
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

            <BTd
              v-if="
                booking.endDate >= date &&
                booking.startDate <= date &&
                booking.endTime >= time &&
                booking.startTime <= time
              "
            >
              <BBadge variant="success">Running</BBadge>
            </BTd>
            <BTd v-else>
              <BBadge variant="warning">Booked</BBadge>
            </BTd>

            <BTd>
              <BButton size="sm" variant="danger" @click="removeSource(booking)">
                {{ $t('buttons.remove') }}
              </BButton>
            </BTd>
          </BTr>

          <BTr>
            <BTd colspan="4">
              <!-- <BAspect
                :aspect="computedAspect"
                style="width: 50%; height: 250px"
                class="mx-auto"
              > -->
              <div
                class = "mx-auto"
                :style="`aspect-ratio: ${computedAspect}; width:50%; height:250px;`"
                >
                <schedule-player
                  :key="booking.id"
                  :params="JSON.parse(booking.parameters)"
                  :uri="sources.find(s => s.sourceId === booking.sourceId)?.uri"
                  width="100%"
                  height="100%"
                />
              <!-- </BAspect> -->
               </div>
            </BTd>
          </BTr>
        </template>
      </BTbody>
    </BTableSimple>

    <BButton variant="primary" @click="$emit('add')">
      {{ $t('buttons.add') }}
    </BButton>
  </div>
</template>
<script>
import {
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BBadge,
  BButton,
  // BAspect
} from 'bootstrap-vue-next';
import moment from 'moment'
import SchedulePlayer from '@/components/Player/SchedulePlayer.vue'
import aspectRatio from '@/mixins/aspectRatio'

export default {
  components: {
    SchedulePlayer,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BBadge,
    BButton,
    // BAspect

  },
  mixins: [aspectRatio],
  props: {
    sources: {
      type: Array,
      required: true
    },
    source: {
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
    computedAspect () {
      if (this.localDisplay.pixelWidth !== 0) {
        return `${this.localDisplay.pixelWidth}:${this.localDisplay.pixelHeight}`
      } else {
        return '16:9'
      }
    },
    filteredSources () {
      return this.localDisplay.e2vbookings.data.filter(source => source.sourceId === this.source.sourceId)
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
    removeSource (booking) {
      const id = booking.id
      this.$axios.delete(`v1/displays/${this.localDisplay.displayId}/sources/${id}`).then(
        () => {
          this.localDisplay.e2vbookings.data = this.localDisplay.e2vbookings.data.filter(b => b.id !== id)
          this.$emit('deleted', this.localDisplay)
          this.$notifications.add({
            title: 'Deleted',
            type: 'success',
            body: this.$t('notifications.sourceRemove'),
            timeout: true
          })
        },
        () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: this.$t('notifications.sourceRemoveError'),
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
