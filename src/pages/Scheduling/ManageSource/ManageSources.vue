<template lang="html">
  <div>
    <h4>{{ source.name }} {{ $t('article.on') }} {{ localDisplay.name }} {{ localDisplay.status }}</h4>
    <b-table-simple
      striped
      responsive
    >
      <b-thead>
        <b-tr>
          <b-th>{{ $t('dateTime.runDates') }}</b-th>
          <b-th>{{ $t('dateTime.dailyTimes') }}</b-th>
          <b-th>{{ $t('dashboard.approval.status') }}</b-th>
          <b-th />
        </b-tr>
      </b-thead>
      <b-tbody>
        <template
          v-for="booking in filteredSources"
          :key="booking.id"
        >
          <b-tr>
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

            <b-td v-if="booking.endDate >= date && booking.startDate <= date && booking.endTime >= time && booking.startTime <= time">
              <b-badge variant="success">
                Running
              </b-badge>
            </b-td>
            <b-td v-else>
              <b-badge variant="warning">
                Booked
              </b-badge>
            </b-td>

            <b-td>
              <b-button
                size="sm"
                variant="danger"
                @click="removeSource(booking)"
              >
                {{ $t('buttons.remove') }}
              </b-button>
            </b-td>
          </b-tr>

          <b-tr>
            <b-td colspan="4">
              <b-aspect
                :aspect="computedAspect"
                style="width: 50%; height: 250px"
                class="mx-auto"
              >
                <schedule-player
                  :key="booking.id"
                  :params="JSON.parse(booking.parameters)"
                  :uri="sources.find(s => s.sourceId === booking.sourceId)?.uri"
                  :width="'100%'"
                  :height="'100%'"
                />
              </b-aspect>
            </b-td>
          </b-tr>
        </template>
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
import SchedulePlayer from '@/components/Player/SchedulePlayer.vue'
import aspectRatio from '@/mixins/aspectRatio'

export default {
  components: {
    SchedulePlayer
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
