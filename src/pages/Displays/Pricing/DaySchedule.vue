<template lang="html">
  <div class="row row-flex row-flex-wrap">
    <!-- Create Campaign Modal -->
    <BModal
      id="create-campaign"
      size="lg"
      title="New Pricing Schedule"
      hide-footer
    >
      <CreateSchedule @refresh="$emit('refresh')" />
    </BModal>

    <!-- Delete Schedule Modal -->
    <BModal
      id="delete-schedule"
      size="lg"
      title="Delete Schedule"
      hide-footer
    >
      <p>Do you want to delete the selected price schedule item?</p>
      <BButton
        id="hide-delete"
        variant="primary"
        @click="$bvModal.hide('delete-schedule')"
      >
        {{ $t('buttons.back') }}
      </BButton>
      <BButton
        id="do-delete"
        variant="danger"
        class="float-right"
        @click="deleteSchedule"
      >
        {{ $t('buttons.delete') }}
      </BButton>
    </BModal>

    <!-- Pricing Calculator Modal -->
    <BModal
      id="calculator-modal"
      size="lg"
      title="Pricing Calculator"
      hide-footer
    >
      <PricingCalculator
        v-model="selected.pricePerSecond"
        :block-time="display.blockTime"
        :max-time-purchasable="display.maxTimePurchasable"
        show-button
        @close="$bvModal.hide('calculator-modal')"
      />
    </BModal>

    <!-- Header Row -->
    <BCol cols="12" class="d-flex justify-content-between">
      <BButton id="backbutton" variant="primary" @click="$emit('finished', date)">
        {{ $t('buttons.back') }}
      </BButton>
      <h2>{{ formattedDate.format('dddd, MMMM Do YYYY') }}</h2>
      <BButton id="show-create" variant="primary" @click="$bvModal.show('create-campaign')">
        {{ $t('buttons.create') }}
      </BButton>
    </BCol>

    <!-- Grid Layout on Large Screens -->
    <BCol cols="12" class="hidden-lg-down">
      <GridLayout
        :layout="convertedSchedules"
        :col-num="24"
        :row-height="1"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="false"
        :margin="[5,5]"
        :use-css-transforms="true"
        :max-rows="100"
      >
        <GridItem
          v-for="(sched, idx) in convertedSchedules"
          :key="idx"
          :x="sched.x" :y="sched.y" :w="sched.w" :h="5" :i="sched.i"
          :min-h="5" :max-h="5" :max-w="24" :min-w="sched.default ? 24 : 1"
          :style="{ backgroundColor: stringToColor(sched.i), textAlign: 'center' }"
        >
          {{ sched.i }} <span v-if="sched.default">(default)</span>
        </GridItem>
      </GridLayout>
      <div class="d-flex justify-content-between">
        <span v-for="hr in 24" :key="hr" class="hour">{{ formatTime(hr-1) }}</span>
        <span class="hour last">0:00</span>
      </div>
      <BButton class="float-right" variant="primary" @click="saveSchedules">
        {{ $t('buttons.save') }}
      </BButton>
    </BCol>

    <!-- Errors -->
    <BCol v-if="errors.length" cols="12" class="alert alert-danger">
      <ul>
        <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
      </ul>
    </BCol>

    <!-- Schedule Selector & Editor -->
    <BCol cols="12" class="pt-2">
      <BCard :header="$t('common.schedule')">
        <BCardText>
          <label for="schedules">{{ $t('displayPricing.pricingSchedule') }}</label>
          <Multiselect
            v-model="selected"
            :options="pricingSchedules"
            placeholder="$t('displayPricing.select')"
            label="scheduleName"
          />

          <div v-if="selected && loaded" @keyup.enter.prevent.stop="saveSchedule">
            <hr />
            <BFormGroup :label="$t('common.name')" label-for="name">
              <BFormInput
                id="name"
                v-model="selected.scheduleName"
                :disabled="selected.displayDefault"
              />
            </BFormGroup>

            <label for="startDate">{{ $t('dateTime.sDate') }}</label>
            <flatpickr
              id="startDate"
              v-model="selected.startDate"
              :options="startDateOptions"
              :disabled="selected.displayDefault"
            />

            <label for="endDate">{{ $t('dateTime.eDate') }}</label>
            <flatpickr
              id="endDate"
              v-model="selected.endDate"
              :options="endDateOptions"
              :disabled="selected.displayDefault"
            />

            <label for="startTime">{{ $t('dateTime.sTime') }} {{ $t('dateTime.eDay') }}</label>
            <flatpickr
              id="startTime"
              v-model="selected.startTime"
              :options="startTimeOptions"
              :disabled="selected.displayDefault"
            />

            <label for="endTime">{{ $t('dateTime.eTime') }} {{ $t('dateTime.eDay') }}</label>
            <flatpickr
              id="endTime"
              v-model="selected.endTime"
              :options="endTimeOptions"
              :disabled="selected.displayDefault"
            />

            <BFormGroup :label="$t('displayPricing.priority')" label-for="priority">
              <BFormInput
                id="priority"
                v-model="selected.priority"
                type="number"
                min="1" max="100"
                :disabled="selected.displayDefault"
              />
            </BFormGroup>

            <BFormGroup :label="$t('displayPricing.pps')" label-for="pps">
              <BFormInput
                id="pps"
                v-model="selected.pricePerSecond"
                type="number"
                min="0"
              />
            </BFormGroup>

            <BButton id="show-calc" class="mt-1" variant="primary"
              @click="$bvModal.show('calculator-modal')">
              {{ $t('buttons.pricingCal') }}
            </BButton>

            <div class="mt-4 float-right">
              <BButton
                v-if="!selected.displayDefault"
                variant="danger"
                class="mr-1"
                @click="$bvModal.show('delete-schedule')"
              >
                {{ $t('buttons.delete') }}
              </BButton>
              <BButton variant="primary" @click="saveSchedule">
                {{ $t('buttons.save') }}
              </BButton>
            </div>
          </div>
        </BCardText>
      </BCard>
    </BCol>
  </div>
</template>
<script>
import {
  BModal,
  BCol,
  BButton,
  BCard,
  BCardText,
  BFormGroup,
  BFormInput
} from 'bootstrap-vue-next'
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
    PricingCalculator,
    BModal,
    BCol,
    BButton,
    BCard,
    BCardText,
    BFormGroup,
    BFormInput,
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
