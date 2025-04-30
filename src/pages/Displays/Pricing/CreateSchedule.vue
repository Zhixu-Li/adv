<template lang="html">
  <div>
    <div
      v-if="errors.length > 0"
      class="col-12 alert alert-danger"
    >
      <ul>
        <li
          v-for="(error, index) in errors"
          :key="index"
        >
          {{ error }}
        </li>
      </ul>
    </div>
    <div @keyup.enter.prevent.stop="createSchedule()">
      <b-row>
        <b-col>
          <b-form-group
            :label="$t('common.name')"
            label-for="name"
          >
            <b-form-input
              id="name"
              v-model="newSchedule.scheduleName"
              :placeholder="$t('common.name')"
            />
          </b-form-group>
        </b-col>
        <b-col lg="2">
          <b-form-group
            :label="$t('displayPricing.priority')"
            label-for="priority"
          >
            <b-form-input
              id="priority"
              v-model="newSchedule.priority"
              type="number"
              max="100"
              min="1"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="6">
          <b-card
            class="mb-3 mt-3"
            header="Schedule Duration"
          >
            <b-card-text>
              <b-form-group
                :label="$t('dateTime.sDate')"
                label-for="startDate"
              >
                <flatpickr
                  id="startDate"
                  v-model="newSchedule.startDate"
                  :placeholder="$t('dateTime.date')"
                  :options="flatpickrOptions.dateDefaults"
                />
              </b-form-group>
              <b-form-group
                :label="$t('dateTime.eDate')"
                label-for="endDate"
              >
                <flatpickr
                  id="endDate"
                  v-model="newSchedule.endDate"
                  :placeholder="$t('dateTime.date')"
                  :options="flatpickrOptions.dateDefaults"
                />
              </b-form-group>
            </b-card-text>
          </b-card>
        </b-col>
        <b-col cols="6">
          <b-card
            class="mb-3 mt-3"
            header="Daily Price Times"
          >
            <b-card-text>
              <b-form-group
                :label="$t('dateTime.sTime')"
                label-for="startTime"
              >
                <b-dropdown
                  id="startTime"
                  ref="startDropdown"
                  no-caret
                  class="w-100"
                  variant="outline-secondary"
                >
                  <template #button-content>
                    <div class="text-left">
                      {{ newSchedule.startTime }}
                    </div>
                  </template>
                  <b-button-group
                    v-for="n in 4"
                    :key="n.id"
                    size="sm"
                    class="ml-2 mr-2"
                  >
                    <b-button
                      v-for="i in 6"
                      :key="i.id"
                      class="timebutton"
                      @click="newSchedule.startTime=(((n-1)*6)+(i-1)).toString().padStart(2,'0')+':00:00';$refs.startDropdown.hide(true)"
                    >
                      {{ ((n-1)*6)+(i-1) }}:00
                    </b-button>
                  </b-button-group>
                </b-dropdown>
              </b-form-group>
              <b-form-group
                :label="$t('dateTime.eTime')"
                label-for="endTime"
              >
                <b-dropdown
                  id="endTime"
                  ref="endDropdown"
                  no-caret
                  class="w-100"
                  variant="outline-secondary"
                >
                  <template #button-content>
                    <div class="text-left">
                      {{ newSchedule.endTime }}
                    </div>
                  </template>
                  <b-button-group
                    v-for="m in 4"
                    :key="m.id"
                    size="sm"
                    class="ml-2 mr-2"
                  >
                    <b-button
                      v-for="o in 6"
                      :key="o.id"
                      class="timebutton"
                      @click="newSchedule.endTime=(((m-1)*6)+(o)).toString().padStart(2,'0')+':00:00';$refs.endDropdown.hide(true)"
                    >
                      {{ ((m-1)*6)+(o) }}:00
                    </b-button>
                  </b-button-group>
                </b-dropdown>
              </b-form-group>
            </b-card-text>
          </b-card>
        </b-col>
      </b-row>
      <hr>
      <pricing-calculator
        v-model="newSchedule.pricePerSecond"
        :block-time="display.blockTime"
        :max-time-purchasable="display.maxTimePurchasable"
      />
      <b-button
        class="float-right mt-1"
        variant="primary"
        @click="createSchedule()"
      >
        {{ $t('buttons.save') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Flatpickr from '@/components/Flatpickr.vue'
import PricingCalculator from "../Components/PricingCalculator.vue";

export default {
  components: {
    Flatpickr,
    PricingCalculator
  },
  props: {
    display: {
      type: Object,
      required: true
    },
    defaultSchedule: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      newSchedule: {
        startTime: '00:00:00',
        endTime: '23:59:59'
      },
      flatpickrOptions: {
        dateDefaults: {
          disableMobile: true,
          allowInput: true
        },
        timeDefaults: {
          enableTime: true,
          noCalendar: true,
          disableMobile: true,
          hourIncrement: 1,
          minuteIncrement: 60,
          time_24hr: true,
          allowInput: true,
          dateFormat: 'H:i:00:00',
          altInput: true,
          altFormat: 'H:i'
        }
      },
      pricingSchedules: [],
      validation: true,
      errors: []
    }
  },
  watch: {
  },
  mounted () {
    // Vue.$nextTick(this.calcBase()) To Fix
  },
  methods: {
    createSchedule () {
      if (this.newSchedule.endTime === "24:00:00") {
        this.newSchedule.endTime="23:59:59"
      }
      this.validateMe(this.newSchedule)
      if (this.validation) {
        this.newSchedule.displayDefault = false
        this.$axios.post('v1/displays/' + this.$route.params.displayId + '/pricing', this.newSchedule).then(
          () => {
            this.newSchedule = {}
            this.$emit('close')
            this.$emit('refresh')
            this.$notifications.add({
              title: 'Created',
              type: 'success',
              body: this.$t('notifications.pricingScheduleCreate'),
              timeout: true
            })
          },
          () => {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: this.$t('notifications.pricingScheduleCreateError'),
              timeout: true
            })
          }
        )
      }
    },
    validateMe (pricing) {
      this.validation = true
      this.errors = []
      this.stringTest(pricing.scheduleName, 'name', 255)
      this.validateDateTime(pricing.startDate, pricing.endDate, pricing.startTime, pricing.endTime)
      this.integerTest(pricing.priority, 'Priority')
      this.lengthTest(pricing.pricePerSecond, 'Priority', 0)
    },
    validateDateTime (startDate, endDate, startTime, endTime) {
      if (!moment(startDate).isBefore(endDate) || !startDate===endDate) {
        this.errors.push('Start date must be before the end date')
        this.validation = false
      }
      if (!moment(startTime, 'H:m:s').isBefore(moment(endTime, 'H:m:s'))) {
        this.errors.push('Start time must be before the end time')
        this.validation = false
      }

      if (!this.validateDate(startDate)) {
        this.errors.push('Invalid Start Date')
        this.validation = false
      }

      if (!this.validateDate(endDate)) {
        this.errors.push('Invalid End Date')
        this.validation = false
      }

      if (!this.validateTime(startTime)) {
        this.errors.push('Invalid Start Time')
        this.validation = false
      }

      if (!this.validateTime(endTime)) {
        this.errors.push('Invalid End Time')
        this.validation = false
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
    stringTest (value, input, max) {
      if (!value) {
        this.errors.push(input + ' is a required input')
        this.validation = false
      } else if (value.length > max) {
        this.errors.push(input + ' can only be a maxiumum of ' + max + ' characters')
        this.validation = false
      }
    },
    lengthTest (value, input, min, max) {
      if (value === undefined) {
        this.errors.push(input + ' is a required input')
        this.validation = false
        return
      }
      if (min !== undefined) {
        if (value < min) {
          this.errors.push(input + ' has to be a minimum of ' + min)
          this.validation = false
          return
        }
      }
      if (max !== undefined) {
        if (value > max) {
          this.errors.push(input + ' can only be a maximum of ' + max)
          this.validation = false
          return
        }
      }
    },
    integerTest (value, input) {
      if (value % 1 !== 0) {
        this.errors.push(input + ' can only be a whole number')
        this.validation = false
      }
    }
  }
}
</script>

<style lang="scss">
.button-textbox {
  width: 100%;
  text-align: center;
  outline-color: rgb(206, 212, 218);
  color: white;
}
</style>
