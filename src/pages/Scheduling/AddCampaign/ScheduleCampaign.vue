<template>
  <BRow>
    <BCol
      v-if="errors.length > 0"
      cols="12"
      class="alert alert-danger"
    >
      <ul>
        <li
          v-for="(error, index) in errors"
          :key="index"
        >
          {{ error }}
        </li>
      </ul>
    </BCol>

    <BCol cols="12">
      <h4>{{ $t('common.schedule') }} {{ campaign.name }} {{ $t('article.on') }} {{ display.name }} </h4>
    </BCol>

    <!-- Booking Duration -->
    <BCol md="6">
      <BCard class="mb-3" header="Booking Duration">
        <BCardText>
          <BFormGroup :label="$t('dateTime.sDate')" label-for="startDate">
            <Flatpickr
              id="startDate"
              v-model="bookingData.startDate"
              :config="flatpickrConfig"
              :options="startDateOptions"
              :placeholder="$t('dateTime.date')"
            />
          </BFormGroup>

          <BFormGroup :label="$t('dateTime.eDate')" label-for="endDate">
            <BInputGroup>
              <Flatpickr
                id="endDate"
                v-model="bookingData.endDate"
                :disabled="forever"
                :config="flatpickrConfig"
                :options="endDateOptions"
                :placeholder="$t('dateTime.date')"
              />
              <template #append>
                <BFormCheckbox
                  id="forever"
                  v-model="forever"
                  name="forever"
                  :value="true"
                  :unchecked-value="false"
                >
                  <!-- <BIconArrowRepeat /> // below is the check-->
                  <font-awesome-icon icon="arrow-repeat" />
                </BFormCheckbox>
              </template>
            </BInputGroup>
          </BFormGroup>

          <BPopover target="forever" triggers="hover focus">
            {{ $t('popover.forever') }}
          </BPopover>

          <br />
          <p class="warning">
            {{ dayOfWeekStatus }}
          </p>

          <BButtonGroup size="sm" class="pb-3">
            <!-- have not used v-model yet, i have to use @click to toggle -->
            <BButton
              v-for="(btn, idx) in buttons"
              v-show="btn.visible"
              :key="idx"
              :pressed="btn.state"
              :disabled="btn.disable"
              :variant="btn.variant"
              @click="btn.state = !btn.state"
              @mouseover="hover(true, btn)"
              @mouseleave="hover(false, btn)"
            >
              {{ btn.value }}
            </BButton>
          </BButtonGroup>
          <p><small>{{ dayCount ? dayCount : 'No' }} days selected.</small></p>

          <BFormGroup>
            {{ $t('dateTime.weekSkip') }}
            <BDropdown
              size="sm"
              variant="outline-primary"
              :text="bookingData.skippedWeeks"
            >
              <BDropdownItem @click="bookingData.skippedWeeks = 'Do Not Skip'">
                Do Not Skip
              </BDropdownItem>
              <BDropdownItem @click="bookingData.skippedWeeks = 'Second Week'">
                Second Week
              </BDropdownItem>
              <BDropdownItem @click="bookingData.skippedWeeks = 'Third Week'">
                Third Week
              </BDropdownItem>
            </BDropdown>
          </BFormGroup>
        </BCardText>
      </BCard>
    </BCol>

    <!-- Daily Run Times -->
    <BCol md="6">
      <BCard class="mb-3" header="Daily Run Times">
        <BCardText>
          <BFormGroup :label="$t('dateTime.sTime')" label-for="startTime">
            <BDropdown
              id="startTime"
              ref="startDropdown"
              no-caret
              class="w-100 text-left"
              variant="outline-secondary"
            >
              <template #button-content>
                <div class="text-left">
                  {{ bookingData.startTime }}
                </div>
              </template>

              <BButtonGroup v-for="n in 4" :key="n" size="sm" class="ml-2 mr-2">
                <BButton
                  v-for="i in 6"
                  :key="i"
                  class="timebutton"
                  @click="bookingData.startTime = (((n - 1) * 6) + (i - 1)).toString().padStart(2, '0') + ':00:00'; $refs.startDropdown.hide(true)"
                >
                  {{ ((n - 1) * 6) + (i - 1) }}:00
                </BButton>
              </BButtonGroup>
            </BDropdown>
          </BFormGroup>

          <BFormGroup :label="$t('dateTime.eTime')" label-for="endTime">
            <BDropdown
              id="endTime"
              ref="endDropdown"
              no-caret
              class="w-100"
              variant="outline-secondary"
            >
              <template #button-content>
                <div class="text-left">
                  {{ bookingData.endTime }}
                </div>
              </template>

              <BButtonGroup v-for="m in 4" :key="m" size="sm" class="ml-2 mr-2">
                <BButton
                  v-for="o in 6"
                  :key="o"
                  class="timebutton"
                  @click="bookingData.endTime = (((m - 1) * 6) + o).toString().padStart(2, '0') + ':00:00'; $refs.endDropdown.hide(true)"
                >
                  {{ ((m - 1) * 6) + o }}:00
                </BButton>
              </BButtonGroup>
            </BDropdown>
          </BFormGroup>
        </BCardText>
      </BCard>
    </BCol>

    <!-- Display Utilization -->
    <BCol cols="12" class="pb-2">
      <BCard header="Display Utilization">
        <div v-if="timeRemaining !== -1">
          <div v-if="campaignDuration > display.blockTime">
            <p class="text-danger">
              This campaign is too long for this display with its current settings, even when
              nothing is booked.
            </p>
            <p>
              <small>
                Campaign Length: {{ campaignDuration }} sec <br /> Display Block Limit: {{ display.blockTime }} sec
              </small>
            </p>
          </div>
          <div v-else>
            <BProgress :max="display.blockTime" height="2rem">
              <BProgressBar variant="primary" :value="display.blockTime - timeRemaining">
                <span><strong>{{ display.blockTime - timeRemaining }} sec used</strong></span>
              </BProgressBar>
              <BProgressBar animated variant="success" :value="timeRemaining < campaignDuration ? 0 : campaignDuration">
                <span><strong>Booking</strong></span>
              </BProgressBar>
              <BProgressBar
                :variant="timeRemaining < campaignDuration ? 'danger' : 'light'"
                :animated="timeRemaining < campaignDuration"
                :value="timeRemaining < campaignDuration ? timeRemaining : timeRemaining - campaignDuration"
              >
                <span v-if="timeRemaining < campaignDuration"><strong>Insufficient Space</strong></span>
              </BProgressBar>
            </BProgress>
            <small>
              <span :class="{ 'text-danger': timeRemaining < campaignDuration }">
                Total Available Time: {{ timeRemaining }}/{{ display.blockTime }} {{ $t('dateTime.seconds') }}
              </span>
              <br />
              <span :class="{ 'text-danger': campaignDuration <= 0 }">
                {{ $t('schedule.campaignDuration') }}: {{ campaignDuration }} {{ $t('dateTime.seconds') }}
              </span>
            </small>
          </div>
        </div>
        <div v-else class="d-flex justify-content-center mb-3">
          <BSpinner label="Loading..." />
        </div>
      </BCard>
    </BCol>

    <!-- Action Buttons -->
    <BCol cols="12">
      <BButton
        v-if="!selectDisabled"
        variant="primary"
        class="float-left btn btn-primary"
        @click="back"
      >
        {{ $t('buttons.back') }}
      </BButton>

      <BButton
        id="schedule"
        variant="primary"
        class="float-right btn btn-primary"
        :disabled="!schedulable"
        @click="schedule()"
      >
        {{ $t('buttons.schedule') }}
      </BButton>
    </BCol>
  </BRow>
</template>


<script>
import {BRow, BCol, BCard, BCardText, BFormGroup, BInputGroup, BFormCheckbox, BButton, BButtonGroup, BDropdown, BDropdownItem, BPopover, BProgress, BProgressBar, BSpinner} from 'bootstrap-vue-next'

import flatpickr from '@/components/Flatpickr.vue'
import moment from 'moment'
import _ from 'lodash'

export default {
  components: {
    flatpickr,
    BRow, 
    BCol, 
    BCard, 
    BCardText, 
    BFormGroup, 
    BInputGroup, 
    BFormCheckbox, 
    BButton, 
    BButtonGroup, 
    BDropdown, 
    BDropdownItem, 
    BPopover, 
    BProgress, 
    BProgressBar, 
    BSpinner, 
    // BIconArrowRepeat

  },
  props: {
    selectDisabled: {
      type: Boolean,
      default: false
    },
    campaign: {
      type: Object
    },
    display: {
      type: Object
    },
    savedBooking: {
      type: Object
    }
  },
  data () {
    return {
      buttons: [
        { value: 'Mon', state: true, full: "Monday", visible: true, variant: "outline-primary" },
        { value: 'Tue', state: true, full: "Tuesday", visible: true, variant: "outline-primary" },
        { value: 'Wed', state: true, full: "Wednesday", visible: true, variant: "outline-primary" },
        { value: 'Thu', state: true, full: "Thursday", visible: true, variant: "outline-primary" },
        { value: 'Fri', state: true, full: "Friday", visible: true, variant: "outline-primary" },
        { value: 'Sat', state: true, full: "Saturday", visible: true, variant: "outline-primary" },
        { value: 'Sun', state: true, full: "Sunday", visible: true, variant: "outline-primary" }
      ],
      dayOfWeekStatus: '',
      openTimePicker: false,
      flatpickrOptions: {
        disableMobile: true,
        allowInput: true,
      },
      flatpickrConfig: {
        dateFormat: 'Y-m-d',
        altFormat: 'd-m-Y',
        altInput: true,
        enableTime: false,
        clickOpens: true
      },
      time: {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        altFormat: 'H:i',
        minuteIncrement: 1,
        time_24hr: true,
        clickOpens: false
      },
      bookingData: {
        startTime: '00:00:00',
        endTime: '23:59:59',
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(30, 'days').format('YYYY-MM-DD'),
        displayId: 0,
        campaignId: 0,
        daysEnabled: '',
        skippedWeeks: 'Do Not Skip'
      },
      errors: [],
      timeRemaining: -1,
      campaignDuration: 0,
      forever: false,
      loaded: false,
    }
  },
  computed: {
    startDateOptions () {
      return Object.assign({defaultDate: this.bookingData.startDate}, this.flatpickrOptions, this.date)
    },
    endDateOptions () {
      return Object.assign({defaultDate: this.bookingData.endDate}, this.flatpickrOptions, this.date)
    },
    schedulable () {
      return (this.timeRemaining >= this.campaignDuration) && (this.campaignDuration !== 0) && this.dayCount
    },
    dayCount () {
      return this.buttons.filter(button => button.state).length
    }
  },
  mounted () {
    if (Object.keys(this.savedBooking).length > 0) {
      this.bookingData = this.savedBooking
    } else {
      this.bookingData.campaignId = this.campaign.campaignId
      this.bookingData.displayId = this.display.displayId
    }

    this.fetchCampaignTime()
    this.fetchTimeRemaining()

    this.$watch('bookingData.startDate', function () {
      this.getDays()
    })
    this.$watch('bookingData.endDate', function () {
      this.getDays()
    })
  },
  methods: {
    back () {
      this.$emit('back')
    },
    validateDateTime () {
      this.errors = []
      // validation
      // if (!moment(this.bookingData.startDate).isBefore(this.bookingData.endDate)) {
      //   this.errors.push('Start date must be before the end date')
      // }
      if (!moment(this.bookingData.startTime, 'H:m:s').isBefore(moment(this.bookingData.endTime, 'H:m:s'))) {
        this.errors.push('Start time must be before the end time')
      }

      if (!this.validateDate(this.bookingData.startDate)) {
        this.errors.push('Invalid Start Date')
      }

      if (!this.validateDate(this.bookingData.endDate) && !this.forever) {
        this.errors.push('Invalid End Date')
      }

      if (!this.validateTime(this.bookingData.startTime)) {
        this.errors.push('Invalid Start Time')
      }

      if (!this.validateTime(this.bookingData.endTime)) {
        this.errors.push('Invalid End Time')
      }
    },
    validateDate (date) {
      var DateRE = /^\d{4}[./-]\d{2}[./-]\d{2}$/
      return (DateRE.test(date))
    },
    validateTime (time) {
      var TimeRE = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/
      return (TimeRE.test(time))
    },
    schedule () {
      if (this.bookingData.endTime === "24:00:00") {
        this.bookingData.endTime="23:59:59"
      }

      this.bookingData.daysEnabled = this.getDaysOfWeek()

      if (this.bookingData.daysEnabled == 0) {
        return this.dayOfWeekStatus = "Please select day(s) of the week."
      }

      let setWeeks = this.getSkippedWeeks(this.bookingData.skippedWeeks);

      this.validateDateTime()

      if (this.errors.length === 0) {
        this.bookingData.campaignId = this.campaign.campaignId
        this.bookingData.displayId = this.display.displayId
        this.bookingData.displayName = this.display.name
        this.bookingData.campaignName = this.campaign.name

        if (this.forever) {
          this.bookingData.endDate = '2037-01-01'
        }

        if ((this.$auth.user.hasAccessInTeam(this.display.teamId, 'owner') ||
             this.$auth.user.hasAccessInTeam(this.display.teamId, 'campaign') ||
             this.$auth.user.hasAccessInTeam(this.display.teamId, 'display') ||
             this.$auth.user.admin) &&
             (this.timeRemaining >= this.campaignDuration && this.campaignDuration > 0)) {
          this.$axios.post('v1/schedule', {
            startDate: this.bookingData.startDate,
            endDate: this.bookingData.endDate,
            startTime: this.bookingData.startTime,
            endTime: this.bookingData.endTime,
            displayId: this.bookingData.displayId,
            campaignId: this.bookingData.campaignId,
            daysEnabled: this.bookingData.daysEnabled,
            skippedWeeks: setWeeks
          }).then(
            (response) => {
              let booking = response.data.data[0]

              if (booking.status === 'failed') {
                this.$notifications.add({
                  title: 'Error',
                  type: 'danger',
                  body: booking.message,
                  timeout: true
                })
              } else {
                this.$notifications.add({
                  title: 'Success',
                  type: 'success',
                  body: this.$t('notifications.campaignBook'),
                  timeout: true
                })
                this.$emit('done')
              }
            },
            () => {
              this.$notifications.add({
                title: 'Error',
                type: 'danger',
                body: this.$t('notifications.campaignBookError'),
                timeout: true
              })
            }
          )
        }
      }
    },
    getDaysOfWeek () {
      let daysEnabled = []
      for (let days of this.buttons) {
        if (days.state === true) {
          daysEnabled.unshift(1)
        }
        else {
          daysEnabled.unshift(0)
        }
      }
      daysEnabled.unshift(0)
      return daysEnabled.join('')
    },
    getDays () {
      for (let days of this.buttons) {
        days.state = false
        days.visible = true
      }

      let start = moment(this.bookingData.startDate).format('dddd')
      let difference = moment(this.bookingData.endDate).diff(moment(this.bookingData.startDate), 'days')

      if (difference > 6) {
        for (let days of this.buttons) {
          days.state = true
        }
        return true
      }
      else {
        let startDay
        for (let days in this.buttons) {
          if (this.buttons[days].full === start) {
            startDay = days
            this.buttons[days].state = true
            break
          }
        }
        startDay++
        for (let i = 0; i < difference; i++) {
          if (startDay > 6) {
            startDay = 0
          }
          this.buttons[startDay].state = true
          startDay++
        }
      }
      for (let days of this.buttons) {
        if (!days.state) {
          days.visible = false
        }
      }
    },
    getSkippedWeeks (weeks) {
      if (weeks == "Do Not Skip") {
        return 0
      }
      else if (weeks == "Second Week") {
        return 1
      }
      else {
        return 2
      }
    },
    fetchTimeRemaining: _.debounce(
      function () {
        this.$axios.post('v1/displays/' + this.display.displayId + '/time', this.bookingData).then(
          (response) => {
            this.timeRemaining = response.data.timeLeft
          },
          () => {
          }
        )
      }, 500
    ),
    fetchCampaignTime () {
      this.$axios.get('v1/campaigns/' + this.campaign.campaignId + '/media?limit=all').then(
        (response) => {
          let media = response.data.data
          for (let item of media) {
            this.campaignDuration = parseInt(item.end) > this.campaignDuration ? parseInt(item.end) : this.campaignDuration
          }
        },
        () => {
        }
      )
    },
    hover (status, button) {
      if (status === true) {
        button.variant = "bg-outline-primary"
      }
      else {
        button.variant = "outline-primary"
      }
    },
  },
  watch: {
    bookingData: {
      deep: true,
      handler () {
        this.$emit('dataChange', this.bookingData)   // does this still do something?
        this.fetchTimeRemaining()
      }
    },
  }
}
</script>

<style lang="scss">
.warning {
  color: red;
}

.timebutton {
  width: 3.9em;
  height: 2em;
  margin-bottom: 5px;
}


.rightbutton {
  margin-right: 5px;
}

.timedropdown {
  padding-right: 5px;
  // border: blue 1px;
  // margin-right: 5px;
}


.form-group {
  margin-bottom: 0rem;
}
</style>
