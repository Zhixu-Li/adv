<template lang="html">
  <div>
    <b-modal
      id="create"
      hide-footer
      size="lg"
      title="New Pricing Schedule"
    >
      <create-schedule
        :display="display"
        :default-schedule="defaultSchedule"
        @refresh="$emit('refresh')"
      />
    </b-modal>

    <b-form
      inline
      class="pb-2"
    >
      <b-form-input
        v-model="year"
        type="number"
        step="1"
        min="2015"
        max="2100"
      />

      <b-form-select
        id="month"
        v-model="monthValue"
        :options="months"
      />
              

      <b-button
        class="flex-float-right"
        variant="primary"
        @click="$bvModal.show('create')"
      >
        {{ $t('buttons.create') }}
      </b-button>
    </b-form>
    <div class="month h-100">
      <div
        v-for="day in 7"
        :key="day"
        class="day day-header"
      >
        <!-- {{day-1 | dayString}} -->
        {{ formatDay(day-1) }}
      </div>
      <div
        v-for="day in firstDayOfMonth"
        :key="day"
        class="day padded"
      >
        <!-- this is warning about unused variable day -->
        {{ day }}
      </div>
      <div
        v-for="day in days"
        :key="day"
        class="day"
        @click="$emit('selected', { day: day, month: month, year: year })"
      >
        <div class="mb-1 border-top-0">
          {{ day }}
        </div>
        <div
          v-for="schedule in filteredSchedules(day)"
          :key="schedule.scheduleId"
          class=""
        >
          <div
            class="schedule"
            :style="'background-color:' + stringToColor(schedule.scheduleName)"
          >
            {{ schedule.scheduleName }}
          </div>
        </div>
      </div>
      <div
        v-for="day in endPadding"
        :key="day"
        class="day padded"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import stringToColor from '../../../mixins/stringToColor.js'
import CreateSchedule from './CreateSchedule.vue'
//import { formatDate } from '@vueuse/core'

export default {
  name: 'MonthPricing',
  components: {
    CreateSchedule
  },
  filters: {
    dayString (value) {
      return moment().day(value).format('dddd')
    }
  },
  mixins: [stringToColor],
  props: {
    display: {
      type: Object,
      required: true
    },
    pricingSchedules: {
      type: Array,
      required: true
    },
    defaultSchedule: {
      type: Object,
      required: true
    },
    defaultDate: {
      type: Object,
      required: false,
      default: () => {
        return {
          month: 0,
          year: 2017
        }
      }
    }
  },
  data () {
    return {
      months: moment.months(), // ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      days: 0,
      firstDayOfMonth: 0,
      month: '',
      year: 2017,
      monthValue: 'January',
      show: false
    }
  },
  computed: {
    endPadding () {
      let value = 7 - ((this.days + this.firstDayOfMonth) % 7)
      if (value === 7) {
        return 0
      } else {
        return value
      }
    }
  },
  watch: {
    monthValue () {
      let selected = moment().month(this.monthValue).year(this.year)
      this.month = selected.month()
      this.days = selected.daysInMonth()
      this.year = selected.year()
      this.firstDayOfMonth = selected.startOf('month').weekday()
    },
    year () {
      let selected = moment().month(this.monthValue).year(this.year)
      this.month = selected.month()
      this.days = selected.daysInMonth()
      this.firstDayOfMonth = selected.startOf('month').weekday()
    }
  },
  mounted () {
    this.month = this.defaultDate.month
    this.year = this.defaultDate.year
    this.monthValue = moment().month(this.month).format('MMMM')

    let now = moment().month(this.month).year(this.year)
    this.days = now.daysInMonth()
    this.month = now.month()
    this.year = now.year()
    this.firstDayOfMonth = now.startOf('month').weekday()
  },
  methods: {
    weekDay (value) {
      return moment().month(this.month).year(this.year).date(value).format('dddd')
    },
    formatDay(day){
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[day]
    },
    filteredSchedules (day) {
      let date = moment().year(this.year).month(this.month).date(day)
      let schedules = []
      for (let schedule of this.pricingSchedules) {
        if (date.isBetween(schedule.startDate, schedule.endDate)) {
          schedules.push(schedule)
        }
      }
      return schedules
    }
  }
}
</script>

<style lang="scss">
.flex-float-right {
    margin-left: auto;
}

.month {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #e6e6e6;
}

.day {
  flex-grow: 1;
  flex-basis: 13.28%;
  border: 1px solid #e6e6e6;
  height: 125px;
  border-left: 0;
  border-right: 0;

  &:hover {
    background-color: #e6e6e6;
  }

  &.padded {
    background-color: #f7f7f7;
  }
}

.day-header {
  height: 1.75rem;
}

.schedule {
  line-height: 1.25rem;
  mix-blend-mode: difference;
  text-align: center;
}
</style>
