<template lang="html">
  <div class="row row-flex row-flex-wrap">
    <b-modal
      id="create-campaign"
      size="lg"
      title="New Pricing Schedule"
      hide-footer
    >
      <create-schedule @refresh="$emit('refresh')" />
    </b-modal>
    <b-modal
      id="delete-schedule"
      size="lg"
      title="Delete Schedule"
      hide-footer
    >
      <p>Do you want to delete the selected price schedule item?</p>
      <b-button
        id="hide-delete"
        variant="primary"
        @click="$bvModal.hide('delete-schedule')"
      >
        {{ $t('buttons.back') }}
      </b-button>
      <b-button
        id="do-delete"
        variant="danger"
        class="float-right"
        @click="deleteSchedule()"
      >
        {{ $t('buttons.delete') }}
      </b-button>
    </b-modal>

    <b-modal
      id="calculator-modal"
      size="lg"
      title="Pricing Calculator"
      hide-footer
    >
      <pricing-calculator
        v-model="selected.pricePerSecond"
        :block-time="display.blockTime"
        :max-time-purchasable="display.maxTimePurchasable"
        show-button
        @close="$bvModal.hide('pricecalc')"
      />
    </b-modal>

    <b-col
      cols="12"
      class="d-flex justify-content-between"
    >
      <b-button
        id="backbutton"
        variant="primary"
        @click="$emit('finished', date)"
      >
        {{ $t('buttons.back') }}
      </b-button>
      <h2>{{ formattedDate.format('dddd, MMMM Do YYYY') }}</h2>
      <b-button
        id="show-create"
        variant="primary"
        @click="$bvModal.show('create-campaign')"
      >
        {{ $t('buttons.create') }}
      </b-button>
    </b-col>
    <b-col
      cols="12"
      class="hidden-lg-down"
    >
      <div>
        <div>
          <Grid-layout
            :layout="convertedSchedules"
            :col-num="24"
            :row-height="1"
            :is-draggable="true"
            :is-resizable="true"
            :vertical-compact="false"
            :margin="[5, 5]"
            :use-css-transforms="true"
            :max-rows="100"
          >
            <Grid-item
              v-for="(schedule, index) in convertedSchedules"
              :key="index"
              :x="schedule.x"
              :y="schedule.y"
              :w="schedule.w"
              :h="5"
              :i="schedule.i"
              :min-h="5"
              :max-h="5"
              :max-w="24"
              :min-w="schedule.default ? 24 : 1"
              :style="{'background-color': stringToColor(schedule.i), 'text-align': 'center'}"
              @click="schedule = 'test'"
            >
              {{ schedule.i }} {{ schedule.default ? '(default)' : '' }}
            </Grid-item>
          </Grid-layout>
        </div>
        <div class="d-flex justify-content-between">
          <span
            v-for="hour in 24"
            :key="hour.id"
            class="hour"
          >{{ formatTime(hour -1) }}</span> 
          <!-- {{ hour - 1 | formatTime}} -->
          <span class="hour last">0:00</span>
        </div>
        <b-button
          class="float-right"
          name="button"
          variant="primary"
          @click="saveSchedules()"
        >
          {{ $t('buttons.save') }}
        </b-button>
      </div>
    </b-col>
    <b-col
      v-if="errors.length > 0"
      cols="12"
      class="12 alert alert-danger"
    >
      <ul>
        <li
          v-for="(error, index) in errors"
          :key="index"
        >
          {{ error }}
        </li>
      </ul>
    </b-col>
    <b-col
      cols="12"
      class="pt-2"
    >
      <b-card :header="$t('common.schedule')">
        <b-card-text>
          <label for="schedules">{{ $t('displayPricing.pricingSchedule') }}</label>
          <multiselect
            v-model="selected"
            :options="pricingSchedules"
            :placeholder="$t('displayPricing.select')"
            label="scheduleName"
          />
          <div
            v-if="typeof selected === 'object' && selected !== undefined && loaded"
            @keyup.enter.prevent.stop="saveSchedule()"
          >
            <hr>
            <b-form-group
              :label="$t('common.name')"
              label-for="name"
            >
              <b-form-input
                id="name"
                v-model="selected.scheduleName"
                :disabled="selected.displayDefault"
                :placeholder="$t('common.name')"
              />
            </b-form-group>
            <label for="startDate">{{ $t('dateTime.sDate') }}</label>
            <flatpickr
              id="startDate"
              v-model="selected.startDate"
              :placeholder="$t('dateTime.date')"
              :disabled="selected.displayDefault"
              :options="startDateOptions"
            />
            <label for="endDate">{{ $t('dateTime.eDate') }}</label>
            <flatpickr
              id="endDate"
              v-model="selected.endDate"
              :placeholder="$t('dateTime.date')"
              :disabled="selected.displayDefault"
              :options="endDateOptions"
            />
            <label for="startTime">{{ $t('dateTime.sTime') }} {{ $t('dateTime.eDay') }}</label>
            <flatpickr
              id="startTime"
              v-model="selected.startTime"
              :placeholder="$t('dateTime.time')"
              :disabled="selected.displayDefault"
              :options="startTimeOptions"
            />
            <label for="endTime">{{ $t('dateTime.eTime') }} {{ $t('dateTime.eDay') }}</label>
            <flatpickr
              id="endTime"
              v-model="selected.endTime"
              :placeholder="$t('dateTime.time')"
              :disabled="selected.displayDefault"
              :options="endTimeOptions"
            />
            <b-form-group
              :label="$t('displayPricing.priority')"
              label-for="priority"
            >
              <b-form-input
                id="priority"
                v-model="selected.priority"
                type="number"
                :disabled="selected.displayDefault"
                max="100"
                min="1"
              />
            </b-form-group>
            <b-form-group
              :label="$t('displayPricing.pps')"
              label-for="pps"
            >
              <b-form-input
                id="pps"
                v-model="selected.pricePerSecond"
                type="number"
                min="0"
              />
            </b-form-group>
            <b-button
              id="show-calc"
              class="mt-1"
              variant="primary"
              @click="$bvModal.show('calculator-modal')"
            >
              {{ $t('buttons.pricingCal') }}
            </b-button>
            <div class="mt-4 float-right">
              <b-button
                v-if="!selected.displayDefault"
                variant="danger"
                class="mr-1"
                @click="$bvModal.show('delete-schedule')"
              >
                {{ $t('buttons.delete') }}
              </b-button>
              <b-button
                variant="primary"
                @click="saveSchedule()"
              >
                {{ $t('buttons.save') }}
              </b-button>
            </div>
          </div>
        </b-card-text>
      </b-card>
    </b-col>
  </div>
</template>

<script>
import PricingCalculator from "../Components/PricingCalculator.vue";
import Multiselect from "vue-multiselect";
import stringToColor from "../../../mixins/stringToColor.js";
import Flatpickr from "@/components/Flatpickr.vue";
import moment from "moment";
import CreateSchedule from "./CreateSchedule.vue";
import { GridLayout, GridItem } from "vue3-grid-layout";
// let GridLayout = Grid.GridLayout;
// let GridItem = Grid.GridItem;

export default {
  name: "DayPricing",
  components: {
    GridLayout,
    GridItem,
    Flatpickr,
    Multiselect,
    CreateSchedule,
    PricingCalculator
  },
  mixins: [stringToColor],
  props: {
    pricingSchedules: {
      Type: Array,
      required: true
    },
    date: {
      type: Object,
      required: true
    },
    display: {
      type: Object,
      required: true
    },
    defaultSchedule: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      convertedSchedules: [],
      schedules: {},
      selected: "",
      edited: [],
      loaded: false,
      formattedDate: moment(),
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
          dateFormat: "H:i:00",
          altInput: true,
          altFormat: "H:i"
        }
      },
      validation: true,
      errors: []
    };
  },
  computed: {
    startTimeOptions() {
      return Object.assign({}, this.flatpickrOptions.timeDefaults, {
        defaultDate: this.selected.startTime
      });
    },
    startDateOptions() {
      return Object.assign({}, this.flatpickrOptions.dateDefaults, {
        defaultDate: this.selected.startDate
      });
    },
    endTimeOptions() {
      return Object.assign({}, this.flatpickrOptions.timeDefaults, {
        defaultDate: this.selected.endTime
      });
    },
    endDateOptions() {
      return Object.assign({}, this.flatpickrOptions.dateDefaults, {
        defaultDate: this.selected.endDate
      });
    }
  },

  // filters: {
  //   formatTime(hour) {
  //     return moment()
  //       .hour(hour)
  //       .minute(0)
  //       .format("H:mm");
  //   }
  // },
  watch: {
    schedules: {
      deep: true,
      handler() {
        this.convertedSchedules = this.convertToLayout(this.schedules);
      }
    },
    pricingSchedules: {
      deep: true,
      handler() {
        this.schedules = this.filterSchedules(this.pricingSchedules);
      }
    },
  },
  mounted() {
    this.schedules = this.filterSchedules(this.pricingSchedules);
    this.convertedSchedules = this.convertToLayout(this.schedules);
    this.selected = this.convertedSchedules[0].id;
    this.loaded = true;
  },
  methods: {
    convertToLayout(schedules) {
      let filtered = [];
      for (let index in schedules) {
        filtered.push({
          id: schedules[index].pricingScheduleId,
          x: parseInt(schedules[index].startTime.split(":")[0]),
          y: 100 - parseInt(schedules[index].priority),
          w: schedules[index].endTime === "00:00:00" ||
            schedules[index].displayDefault ?
            24 - parseInt(schedules[index].startTime.split(":")[0]) :
            parseInt(schedules[index].endTime.split(":")[0]) -
            parseInt(schedules[index].startTime.split(":")[0]),
          h: 5,
          i: schedules[index].scheduleName,
          default: schedules[index].displayDefault,
          startDate: schedules[index].startDate,
          endDate: schedules[index].endDate,
          pricePerSecond: schedules[index].pricePerSecond,
          currency: schedules[index].currency
        });
      }
      return filtered;
    },
    filterSchedules() {
      this.formattedDate = moment()
        .year(this.date.year)
        .month(this.date.month)
        .date(this.date.day);
      let schedules = {};
      for (let schedule of this.pricingSchedules) {
        if (
          this.formattedDate.isBetween(schedule.startDate, schedule.endDate)
        ) {
          schedules[schedule.pricingScheduleId] = schedule;
        }
      }
      return schedules;
    },
    saveSchedule() {
      this.validateMe(this.selected);
      if (this.validation) {
        this.$axios
          .post(
            "v1/displays/" +
            this.$route.params.displayId +
            "/pricing/" +
            this.selected.pricingScheduleId,
            this.selected
          )
          .then(
            () => {
              this.$emit("refresh");
              this.$notifications.add({
                title: "Updated",
                type: "success",
                body: this.$t("notifications.pricingScheduleUpdate"),
                timeout: true
              });
            },
            () => {
              this.$notifications.add({
                title: "Error",
                type: "danger",
                body: this.$t(
                  "notifications.notifications.pricingScheduleUpdateError"
                ),
                timeout: true
              });
            }
          );
      }
    },
    deleteSchedule() {
      this.$axios
        .delete(
          "v1/displays/" +
          this.$route.params.displayId +
          "/pricing/" +
          this.selected.pricingScheduleId,
        ).then(
          () => {
            this.$emit("refresh");
            this.$notifications.add({
              title: 'Success',
              type: 'success',
              body: "You have deleted the schedule item.",
              timeout: true
            })
            this.$bvModal.hide('delete-schedule')
          },
          (response) => {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: response.data.message || "Schedule item delete error.",
              timeout: true
            })
            this.$bvModal.hide('delete-schedule')
          });
    },
    saveSchedules() {
      let promises = [];
      for (let convertedSchedule of this.convertedSchedules) {
        let schedule = {
          scheduleName: convertedSchedule.i,
          currency: convertedSchedule.currency,
          startDate: convertedSchedule.startDate,
          endDate: convertedSchedule.endDate,
          startTime: moment()
            .locale("en")
            .hour(convertedSchedule.x)
            .format("HH:00:00"),
          endTime: moment()
            .local("en")
            .hour(convertedSchedule.x + convertedSchedule.w)
            .format("HH:00:00"),
          priority: 100 - convertedSchedule.y,
          displayDefault: convertedSchedule.default
        };

        promises.push(
          this.$axios.post(
            "v1/displays/" +
            this.$route.params.displayId +
            "/pricing/" +
            convertedSchedule.id,
            schedule
          )
        );
      }
      Promise.all(promises).then(
        () => {
          this.$emit("refresh");
          this.$notifications.add({
            title: "Updated",
            type: "success",
            body: this.$t("notifications.pricingScheduleUpdate"),
            timeout: true
          });
        },
        response => {
          if (response.data.message) {
            this.$notifications.add({
              title: "Error",
              type: "danger",
              body: response.data.message,
              timeout: true
            });
          } else {
            this.$notifications.add({
              title: "Error",
              type: "danger",
              body: this.$t("notifications.messageSaveError"),
              timeout: true
            });
          }
        }
      );
    },
    validateMe(pricing) {
      this.validation = true;
      this.errors = [];
      this.stringTest(pricing.scheduleName, "name", 255);
      this.validateDateTime(
        pricing.startDate,
        pricing.endDate,
        pricing.startTime,
        pricing.endTime
      );
      this.integerTest(pricing.priority, "Priority");
      this.lengthTest(pricing.pricePerSecond, "Priority", 0);
    },
    validateDateTime(startDate, endDate, startTime, endTime) {
      if (!moment(startDate).isBefore(endDate)) {
        this.errors.push("Start date must be before the end date");
        this.validation = false;
      }
      if (!moment(startTime, "H:m:s").isBefore(moment(endTime, "H:m:s"))) {
        this.errors.push("Start time must be before the end time");
        this.validation = false;
      }

      if (!this.validateDate(startDate)) {
        this.errors.push("Invalid Start Date");
        this.validation = false;
      }

      if (!this.validateDate(endDate)) {
        this.errors.push("Invalid End Date");
        this.validation = false;
      }

      if (!this.validateTime(startTime)) {
        this.errors.push("Invalid Start Time");
        this.validation = false;
      }

      if (!this.validateTime(endTime)) {
        this.errors.push("Invalid End Time");
        this.validation = false;
      }
    },
    validateDate(date) {
      var DateRE = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
      return DateRE.test(date);
    },
    validateTime(time) {
      var TimeRE = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
      return TimeRE.test(time);
    },
    stringTest(value, input, max) {
      if (!value) {
        this.errors.push(input + " is a required input");
        this.validation = false;
      } else if (value.length > max) {
        this.errors.push(
          input + " can only be a maxiumum of " + max + " characters"
        );
        this.validation = false;
      }
    },
    lengthTest(value, input, min, max) {
      if (value === undefined) {
        this.errors.push(input + " is a required input");
        this.validation = false;
        return;
      }
      if (min !== undefined) {
        if (value < min) {
          this.errors.push(input + " has to be a minimum of " + min);
          this.validation = false;
          return;
        }
      }
      if (max !== undefined) {
        if (value > max) {
          this.errors.push(input + " can only be a maximum of " + max);
          this.validation = false;
          return;
        }
      }
    },
    integerTest(value, input) {
      if (value % 1 !== 0) {
        this.errors.push(input + " can only be a whole number");
        this.validation = false;
      }
    },

    formatTime(hour) {
      return moment()
        .hour(hour)
        .minute(0)
        .format('H:mm')
    }
  
}
};
</script>

<style lang="scss">
.hour {
  width: 4.16666667%;
  text-align: center;
  border-left: 1px solid black;
  font-size: 0.75rem;

  &.last {
    border-right: 1px solid black;
  }
}

.border-bottom-1 {
  border-bottom: #e0e0e0 1px solid;
}
</style>
