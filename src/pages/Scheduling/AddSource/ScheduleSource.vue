<template lang="html">
  <BRow>
    <BCol>
      <BCol
        v-if="errors.length > 0"
        cols="12"
        class="alert alert-danger"
      >
        <ul>
          <li v-for="(error, index) in errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </BCol>

      <BRow>
        <BCol cols="12">
          <h4>[E2V] {{ $t('common.schedule') }} {{ source.name }} {{ $t('article.on') }} {{ display.name }}</h4>
        </BCol>
      </BRow>

      <BRow>
        <BCol md="6">
          <BCard class="mb-3" header="Booking Duration">
            <BCardText>
              <BFormGroup :label="$t('dateTime.sDate')" label-for="startDate">
                <flatpickr
                  id="startDate"
                  v-model="bookingData.startDate"
                  :config="flatpickrConfig"
                  :options="startDateOptions"
                  :placeholder="$t('dateTime.date')"
                />
              </BFormGroup>

              <BFormGroup :label="$t('dateTime.eDate')" label-for="endDate">
                <BInputGroup>
                  <flatpickr
                    id="endDate"
                    v-model="bookingData.endDate"
                    :disabled="forever"
                    :config="flatpickrConfig"
                    :options="endDateOptions"
                    :placeholder="$t('dateTime.date')"
                  />
                  <BInputGroupAppend id="foreverBox" is-text>
                    <BFormCheckbox
                      id="forever"
                      v-model="forever"
                      name="forever"
                      :value="true"
                      :unchecked-value="false"
                    >
                      <BIconArrowRepeat />
                    </BFormCheckbox>
                  </BInputGroupAppend>
                </BInputGroup>
              </BFormGroup>

              <BPopover target="foreverBox" triggers="hover focus">
                {{ $t('popover.forever') }}
              </BPopover>
            </BCardText>
          </BCard>
        </BCol>

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
                    <div class="text-left">{{ bookingData.startTime }}</div>
                  </template>
                  <BButtonGroup v-for="n in 4" :key="n.id" size="sm" class="ml-2 mr-2">
                    <BButton
                      v-for="i in 6"
                      :key="i.id"
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
                    <div class="text-left">{{ bookingData.endTime }}</div>
                  </template>
                  <BButtonGroup v-for="m in 4" :key="m.id" size="sm" class="ml-2 mr-2">
                    <BButton
                      v-for="o in 6"
                      :key="o.id"
                      class="timebutton"
                      @click="bookingData.endTime = (((m - 1) * 6) + (o)).toString().padStart(2, '0') + ':00:00'; $refs.endDropdown.hide(true)"
                    >
                      {{ ((m - 1) * 6) + (o) }}:00
                    </BButton>
                  </BButtonGroup>
                </BDropdown>
              </BFormGroup>
            </BCardText>
          </BCard>
        </BCol>
      </BRow>

      <hr />

      <BRow>
        <BCol>
          <inspector :uri="source.uri" @changed="updateE2V">
            <BRow>
              <BCol>Time Available</BCol>
              <BCol><label>{{ timeRemaining }} seconds</label></BCol>
            </BRow>
            <BRow>
              <BCol><b>E2V Duration</b></BCol>
              <BCol>
                <BFormInput id="sourceDuration" v-model="sourceDuration" />
              </BCol>
            </BRow>
          </inspector>
        </BCol>
      </BRow>

      <BRow class="pt-4">
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
            variant="primary"
            class="float-right btn btn-primary"
            :disabled="!schedulable"
            @click="schedule()"
          >
            Connect
          </BButton>
        </BCol>
      </BRow>
    </BCol>
  </BRow>
</template>
<script>
import Flatpickr from '@/components/Flatpickr.vue'
import moment from 'moment'
import _ from 'lodash'
// import Multiselect from 'vue-multiselect'
import Inspector from '@/components/Player/Inspector.vue'
import {
  BButton,
  BButtonGroup,
  BCard,
  BCardText,
  BCol,
  BDropdown,
  BFormCheckbox,
  BFormGroup,
  BFormInput,
  BInputGroup,
  BInputGroupAppend,
  BPopover,
  BRow
} from 'bootstrap-vue-next';
export default {
  components: {
    Flatpickr,
    Inspector,
    BButton,
    BButtonGroup,
    BCard,
    BCardText,
    BCol,
    BDropdown,
    BFormCheckbox,
    BFormGroup,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BPopover,
    BRow
    // Multiselect
  },
  props: {
    selectDisabled: {
      type: Boolean,
      default: false
    },
    source: {
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
      e2v: {},
      errors: {},
      scheduleState: null,
      totalCampaigns: 0,
      minimumDuration: 0,
      maximumDuration: 0,
      timeRemaining: 0,
      sourceDuration: 0,
      parameters: [],
      selectedCampaign:'',
      selectCheck: false,
      parametersLoaded: false,
      scheduleLoaded: false,
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
        sourceId: 0,
        total: 0,
      },
      forever: false
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
      return (this.timeRemaining >= this.sourceDuration) && (this.sourceDuration !== 0)
    }
  },
  mounted () {
    if (Object.keys(this.savedBooking).length > 0) {
      this.bookingData = this.savedBooking
    } else {
      this.bookingData.sourceId = this.source.sourceId
      this.bookingData.displayId = this.display.displayId
    }

    this.fetchTimeRemaining()
  },
  methods: {
    updateE2V(e2v) {
      this.e2v = e2v
    },
    fetchSchedule() {
      // serialise the parameters first
      // console.log(JSON.stringify(this.e2v))
      let temp = {
        _path: '/getSchedule',
        api_key: this.source.api_key,
      }
      Object.assign(temp, this.e2v)
      this.$axios.post(this.source.uri, JSON.stringify(this.e2v), {responseType: 'json', params: temp}).then(
        (response) => {
          // this needs to be clarified
          if (response.data != '0') {
            if (response.data.errors){
              this.scheduleState = false
              this.errors = response.data.errors
            }
            else if (response.data.DisplayGroup.Sequence) {
              this.scheduleState = true
              let campaigns = response.data.DisplayGroup.Sequence[0].Campaign
              // TODO: add min/max calculations
              // let min = 0
              // let max = 0
              // for (let campaign of campaigns) {
              //   console.log(campaign)
              // }
              this.totalCampaigns = campaigns.length
            }
          }
        },
        () => {
          console.log('retrieving failed')
        }
      )
    },
    fetchParameters() {
      /* stuff to do eventually:
         - site verification
         - check cors shit
      */
      this.$axios.get(this.source.uri, {
        params: {
          _path: '/parameters',
          api_key: this.source.api_key
        }
      }).then(
        (response) => {
          this.parameters = JSON.parse(response.dataText)
          for (let param of this.parameters) {
            // this.$set(this.e2v, param.slug, '')
            this.e2v[param.slug] = ''
          }
          this.parametersLoaded = true
          this.fetchSchedule()
        },
        () => {
          console.log('retrieving failed')
        }
      )
    },
    back () {
      this.$emit('back')
    },
    validateDateTime () {
      this.errors = []
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

      this.validateDateTime()

      if (this.errors.length === 0) {
        this.bookingData.sourceId = this.source.sourceId
        this.bookingData.displayId = this.display.displayId
        this.bookingData.displayName = this.display.name
        this.bookingData.sourceName = this.source.name
        this.bookingData.parameters = this.e2v
        this.bookingData.maxDuration = this.sourceDuration

        if (this.forever) {
          this.bookingData.endDate = '2037-01-01'
        }


        // if the own or have access to the display then schedule it now
        // otherwise add it to the cart
        if ((this.$auth.user.hasAccessInTeam(this.display.teamId, 'owner') ||
             this.$auth.user.hasAccessInTeam(this.display.teamId, 'source') ||
             this.$auth.user.hasAccessInTeam(this.display.teamId, 'display') ||
             this.$auth.user.admin) &&
             (this.timeRemaining >= this.sourceDuration && this.sourceDuration > 0)) {
          this.$axios.post('v1/scheduleSource', 
            this.bookingData
          // {
            // startDate: this.bookingData.startDate,
            // endDate: this.bookingData.endDate,
            // startTime: this.bookingData.startTime,
            // endTime: this.bookingData.endTime,
            // displayId: this.bookingData.displayId,
            // sourceId: this.bookingData.sourceId,
          // }
          ).then(
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
                  body: this.$t('notifications.sourceBook'),
                  timeout: true
                })
                this.$emit('done')
              }
            },
            () => {
              this.$notifications.add({
                title: 'Error',
                type: 'danger',
                body: this.$t('notifications.sourceBookError'),
                timeout: true
              })
            }
          )
        } else {
          // if cart returns false booking is not unique
          if (this.$cart.add(this.bookingData)) {
            // create a new object with all the old ones stuff
            this.bookingData = Object.assign({}, this.bookingData)
            this.$notifications.add({
              title: 'Success',
              type: 'success',
              body: this.$t('notifications.cartAdd'),
              timeout: true
            })
          } else {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: this.$t('notifications.cartAddError'),
              timeout: true
            })
          }
        }
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
  },
  watch: {
    e2v: {
      deep: true,
      handler: _.debounce(function() {
        this.fetchSchedule()
        }, 500)
    },
    bookingData: {
      deep: true,
      handler () {
        this.$emit('dataChange', this.bookingData)   // does this still do something?
        this.fetchTimeRemaining()
      }
    }
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
