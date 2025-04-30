<template lang="html">
  <div>
    <b-modal id="pricecalc" hide-footer size="lg" title="Pricing Calculator">
      <pricing-calculator
        v-model="localSchedule.pricePerSecond"
        :blockTime="localDisplay.blockTime"
        :maxTimePurchasable="localDisplay.maxTimePurchasable"
        showButton
        @close="$bvModal.hide('pricecalc')"
      />
    </b-modal>

    <div class="alert alert-danger" v-if="errors.length > 0">
      <ul>
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>

    <b-container class="mt-3">
      <b-row class="h-100">
        <b-col cols="12" lg="3" v-if="Object.keys(selected).length === 0">
          <b-row class="mb-3">
            <b-card :header="$t('displayPricing.default')">
              <b-card-text>
                <div @keyup.enter.prevent.stop="saveDefault">
                  <b-form-group :label="$t('common.name')" label-for="defaultName">
                    <b-form-input id="defaultName" v-model="localSchedule.scheduleName" />
                  </b-form-group>
                  <b-form-group :label="$t('displayPricing.pps')" label-for="price">
                    <b-form-input id="price" v-model.number="localSchedule.pricePerSecond" />
                  </b-form-group>
                </div>
                <b-button class="float-left mt-1" @click="$bvModal.show('pricecalc')" variant="primary">
                  Pricing Calculator
                </b-button>
                <b-button class="float-right mt-1" variant="primary" @click="saveDefault">
                  {{$t('buttons.save')}}
                </b-button>
              </b-card-text>
            </b-card>
          </b-row>

          <b-row class="mb-3">
            <b-card :header="$t('displayPricing.options')">
              <b-card-text>
                <div @keyup.enter.prevent.stop="saveDefault">
                  <b-form-group :label="$t('displays.loop')" label-for="loop-time">
                    <b-form-input id="loop-time" v-model.number="localDisplay.blockTime" />
                  </b-form-group>
                  <b-form-group :label="$t('displays.maxTimePurchasable')" label-for="max-time">
                    <b-form-input id="max-time" v-model.number="localDisplay.maxTimePurchasable" />
                  </b-form-group>
                  <b-button class="float-right mt-1" variant="primary" @click="updateDisplay">
                    {{$t('buttons.save')}}
                  </b-button>
                </div>
              </b-card-text>
            </b-card>
          </b-row>
        </b-col>

        <b-col cols="12" lg="9" v-if="Object.keys(selected).length === 0">
          <calendar
            class="m-2"
            :pricingSchedules="pricingSchedules"
            :display="localDisplay"
            :defaultSchedule="localSchedule"
            :defaultDate="defaultDate"
            @selected="selected = $event"
            @refresh="fetchPricingSchedules"
          />
        </b-col>

        <b-col cols="12" v-if="Object.keys(selected).length !== 0">
          <day-schedule
            class="m-2"
            :pricingSchedules="pricingSchedules"
            :display="localDisplay"
            :defaultSchedule="localSchedule"
            :date="selected"
            @finished="finish"
            @refresh="fetchPricingSchedules"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import moment from "moment";
import Calendar from "./Pricing/Calendar.vue";
import DaySchedule from "./Pricing/DaySchedule.vue";
import PricingCalculator from "./Components/PricingCalculator.vue";

export default {
  name: "DisplayPricing",
  props: {
    display: {
      type: Object,
      required: true
    }
  },
  components: {
    Calendar,
    DaySchedule,
    PricingCalculator
  },
  data() {
    return {
      pricingSchedules: [],
      defaultScheduleRaw: { scheduleName: "Baseline Price" },
      localSchedule: {},
      localDisplay: {},
      errors: [],
      validation: true,
      selected: {},
      defaultDate: {
        month: moment().format("MMMM"),
        year: moment().format("YYYY"),
        day: moment().format("d")
      },
    };
  },
  watch: {
    display: {
      handler(newVal) {
        this.localDisplay = { ...newVal };
      },
      immediate: true,
      deep: true
    },
    defaultScheduleRaw: {
      handler(newVal) {
        this.localSchedule = { ...newVal };
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.fetchPricingSchedules();
  },
  methods: {
    fetchPricingSchedules() {
      this.$axios.get(`v1/displays/${this.$route.params.displayId}/pricing`).then(
        response => {
          this.pricingSchedules = response.data.data;
          this.defaultScheduleRaw = this.pricingSchedules.find(s => s.displayDefault) || { scheduleName: "Baseline Price" };
        },
        error => {
          const message = error.response?.data?.message || error.message;
          this.$notifications.add({ title: 'Error', type: 'warning', body: message, timeout: true });
        }
      );
    },
    saveDefault() {
      this.validateMe();
      if (!this.validation) return;

      const scheduleToSave = {
        ...this.localSchedule,
        priority: 0,
        startTime: "00:00:00",
        endTime: "23:59:59",
        startDate: moment().startOf('month').format("YYYY-MM-DD"),
        endDate: moment().year("2037").format("YYYY-MM-DD"),
        displayDefault: true,
        displayId: this.$route.params.displayId,
      };

      let url = `v1/displays/${this.$route.params.displayId}/pricing/`;
      if (scheduleToSave.pricingScheduleId) {
        url += scheduleToSave.pricingScheduleId;
      }

      this.$axios.post(url, scheduleToSave).then(() => {
        this.$notifications.add({
          title: "Updated",
          type: "success",
          body: this.$t("notifications.pricingDefaultUpdate"),
          timeout: true
        });
        this.fetchPricingSchedules();
      });
    },
    updateDisplay() {
      this.validateDisplay();
      if (!this.validation) return;

      this.$axios.post(`v1/displays/${this.localDisplay.displayId}`, this.localDisplay).then(() => {
        this.$notifications.add({
          title: "Updated",
          type: "success",
          body: this.$t("notifications.displayUpdate"),
          timeout: true
        });
      }, () => {
        this.$notifications.add({
          title: "Error",
          type: "danger",
          body: this.$t("notifications.displayUpdateError"),
          timeout: true
        });
      });
    },
    finish(date) {
      this.defaultDate = { ...date };
      this.selected = {};
    },
    validateMe() {
      this.errors = [];
      this.validation = true;
      this.stringTest(this.localSchedule.scheduleName, "Baseline Price Name", 255); //local storage to avoid mutaution value is only read-only 
      // while passed so store it in a local instance and refer and then pass to props
      this.lengthTest(this.localSchedule.pricePerSecond, "Default Price Per Second", 0);
    },
    validateDisplay() {
      this.errors = [];
      this.validation = true;
      this.lengthTest(this.localDisplay.blockTime, "loop time", 10, 3600);
      this.lengthTest(this.localDisplay.maxTimePurchasable, "max purchasable time", 10, 3600);
      this.integerTest(this.localDisplay.blockTime, "loop time");
      this.integerTest(this.localDisplay.maxTimePurchasable, "max purchasable time");
    },
    stringTest(value, input, max) {
      if (!value) {
        this.errors.push(`${input} is a required input`);
        this.validation = false;
      } else if (value.length > max) {
        this.errors.push(`${input} can only be a maximum of ${max} characters`);
        this.validation = false;
      }
    },
    lengthTest(value, input, min, max) {
      if (value === undefined) {
        this.$notifications.add({
          title: "Error",
          type: "warning",
          body: `${input} is a required input`,
          timeout: true
        });
        this.validation = false;
        return;
      }
      if (min !== undefined && value < min) {
        this.$notifications.add({
          title: "Error",
          type: "warning",
          body: `${input} has to be a minimum of ${min}`,
          timeout: true
        });
        this.validation = false;
      }
      if (max !== undefined && value > max) {
        this.$notifications.add({
          title: "Error",
          type: "warning",
          body: `${input} can only be a maximum of ${max}`,
          timeout: true
        });
        this.validation = false;
      }
    },
    integerTest(value, input) {
      if (value % 1 !== 0) {
        this.errors.push(`${input} can only be a whole number`);
        this.validation = false;
      }
    }
  }
};
</script>

<style lang="scss">
.update {
  padding: 15px;
}
</style>
