<template lang="html">
  <div>
    <!-- Pricing Calculator Modal -->
    <BModal id="pricecalc" hide-footer size="lg" title="Pricing Calculator">
      <PricingCalculator
        v-model="localSchedule.pricePerSecond"
        :block-time="localDisplay.blockTime"
        :max-time-purchasable="localDisplay.maxTimePurchasable"
        show-button
        @close="$bvModal.hide('pricecalc')"
      />
    </BModal>

    <!-- Error Alert -->
    <div v-if="errors.length" class="alert alert-danger">
      <ul>
        <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <BContainer class="mt-3">
      <BRow class="h-100">
        <!-- Default & Options Panel -->
        <BCol cols="12" lg="3" v-if="!selected.schedule">
          <BRow class="mb-3">
            <BCard :header="$t('displayPricing.default')">
              <BCardText>
                <div @keyup.enter.prevent.stop="saveDefault">
                  <BFormGroup :label="$t('common.name')" label-for="defaultName">
                    <BFormInput id="defaultName" v-model="localSchedule.scheduleName" />
                  </BFormGroup>
                  <BFormGroup :label="$t('displayPricing.pps')" label-for="price">
                    <BFormInput id="price" v-model.number="localSchedule.pricePerSecond" />
                  </BFormGroup>
                </div>
                <div class="d-flex justify-content-between">
                  <BButton variant="primary" @click="$bvModal.show('pricecalc')">
                    {{ $t('buttons.pricingCal') }}
                  </BButton>
                  <BButton variant="primary" @click="saveDefault">
                    {{ $t('buttons.save') }}
                  </BButton>
                </div>
              </BCardText>
            </BCard>
          </BRow>
          <BRow class="mb-3">
            <BCard :header="$t('displayPricing.options')">
              <BCardText>
                <div @keyup.enter.prevent.stop="updateDisplay">
                  <BFormGroup :label="$t('displays.loop')" label-for="loop-time">
                    <BFormInput id="loop-time" v-model.number="localDisplay.blockTime" />
                  </BFormGroup>
                  <BFormGroup :label="$t('displays.maxTimePurchasable')" label-for="max-time">
                    <BFormInput id="max-time" v-model.number="localDisplay.maxTimePurchasable" />
                  </BFormGroup>
                </div>
                <div class="text-end">
                  <BButton variant="primary" @click="updateDisplay">
                    {{ $t('buttons.save') }}
                  </BButton>
                </div>
              </BCardText>
            </BCard>
          </BRow>
        </BCol>

        <!-- Calendar View -->
        <BCol cols="12" lg="9" v-if="!selected.schedule">
          <Calendar
            class="m-2"
            :pricing-schedules="pricingSchedules"
            :display="localDisplay"
            :default-schedule="localSchedule"
            :default-date="defaultDate"
            @selected="selected = $event"
            @refresh="fetchPricingSchedules"
          />
        </BCol>

        <!-- Day Schedule View -->
        <BCol cols="12" v-else>
          <DaySchedule
            class="m-2"
            :pricing-schedules="pricingSchedules"
            :display="localDisplay"
            :default-schedule="localSchedule"
            :date="selected"
            @finished="finish"
            @refresh="fetchPricingSchedules"
          />
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>

import {
  BModal,
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardText,
  BFormGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'
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
    PricingCalculator,
    BModal,
    BContainer,
    BRow,
    BCol,
    BCard,
    BCardText,
    BFormGroup,
    BFormInput,
    BButton,
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
