<template lang="html">
  <div>
    <!-- Create Schedule Modal -->
    <BModal
      id="create"
      title="New Pricing Schedule"
      size="lg"
      hide-footer
    >
      <CreateSchedule
        :display="display"
        :default-schedule="defaultSchedule"
        @refresh="$emit('refresh')"
      />
    </BModal>

    <!-- Year/Month Selector and Create Button -->
    <BForm inline class="pb-2">
      <BFormInput
        v-model="year"
        type="number"
        step="1"
        min="2015"
        max="2100"
      />

      <BFormSelect
        v-model="monthValue"
        :options="months"
      />

      <BButton
        class="flex-float-right"
        variant="primary"
        @click="$bvModal.show('create')"
      >
        {{ $t('buttons.create') }}
      </BButton>
    </BForm>

    <!-- Calendar Grid -->
    <div class="month h-100">
      <!-- Day headers -->
      <div
        v-for="d in 7"
        :key="d"
        class="day day-header"
      >
        {{ formatDay(d - 1) }}
      </div>

      <!-- Leading empty cells -->
      <div
        v-for="n in firstDayOfMonth"
        :key="'pad-start-' + n"
        class="day padded"
      />

      <!-- Day cells with schedules -->
      <div
        v-for="day in days"
        :key="'day-' + day"
        class="day"
        @click="$emit('selected', { day, month, year })"
      >
        <div class="mb-1 border-top-0">
          {{ day }}
        </div>
        <div
          v-for="sched in filteredSchedules(day)"
          :key="sched.scheduleId"
        >
          <div
            class="schedule"
            :style="{ backgroundColor: stringToColor(sched.scheduleName) }"
          >
            {{ sched.scheduleName }}
          </div>
        </div>
      </div>

      <!-- Trailing empty cells -->
      <div
        v-for="n in endPadding"
        :key="'pad-end-' + n"
        class="day padded"
      />
    </div>
  </div>
</template>
<script>
import {
  BModal,
  BForm,
  BFormInput,
  BFormSelect,
  BButton
} from 'bootstrap-vue-next'
import moment from 'moment'
import stringToColor from '../../../mixins/stringToColor.js'
import CreateSchedule from './CreateSchedule.vue'
//import { formatDate } from '@vueuse/core'

export default {
  name: 'MonthPricing',
  components: {
    CreateSchedule,
    BModal,
    BForm,
    BFormInput,
    BFormSelect,
    BButton,
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
