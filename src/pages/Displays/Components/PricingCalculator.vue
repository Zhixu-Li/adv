<template lang="html">
  <b-container>
    <b-row>
      <b-col>
        <b-form-group
          label="Expected Campaign Duration"
          label-for="duration"
        >
          <b-input-group
            id="duration"
            append="sec"
          >
            <b-form-input
              v-model="durationEstimate"
              type="number"
              step="1"
              :max="maxTimePurchasable"
              min="0"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          label="Per Day"
          label-for="day"
        >
          <b-input-group
            id="day"
            prepend="$"
          >
            <b-form-input
              v-model="perDay"
              type="number"
              step="0.1"
              min="0"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col>
        <b-form-group
          label="Price Per Second"
          label-for="pricePerSecond"
        >
          <b-input-group
            id="pricePerSecond"
            append="¢"
          >
            <b-form-input
              disabled
              :value="centsPerSecond"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          label="Per Week"
          label-for="week"
        >
          <b-input-group
            id="week"
            prepend="$"
          >
            <b-form-input
              disabled
              :value="centsPerSecond == 0 ? 0 : (Math.round((perDay * 7 ) * 10) / 10)"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          label="Per Month"
          label-for="month"
        >
          <b-input-group
            id="month"
            prepend="$"
          >
            <b-form-input
              disabled
              :value="centsPerSecond == 0 ? 0 : (Math.round((perDay * 30 ) * 10) / 10)"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-button
      v-if="showButton"
      class="float-right mt-3"
      name="button"
      variant="primary"
      @click="close()"
    >
      {{ $t('buttons.close') }}
    </b-button>
  </b-container>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    },
    blockTime: {
      type: Number,
      required: true
    },
    maxTimePurchasable: {
      type: Number,
      required: true
    },
    showButton: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      durationEstimate: 10,
      perDay: ((parseFloat(this.value) * 24 * 10 * (3600 / parseFloat(this.blockTime))) / 100),
    }
  },
  computed: {
    centsPerSecond() {
      if (this.blockTime == 0 || this.perDay == 0 || this.durationEstimate == 0) {
        return 0
      }
      return (parseInt(this.perDay) * 100) / 24 / parseInt(this.durationEstimate) / (3600 / parseInt(this.blockTime))
    },
  },
  watch: {
    centsPerSecond: {
      handler() {
        this.$emit('input', this.centsPerSecond)
      }
    }
  },
  mounted() {

  },
  methods: {
    close() {
      this.$emit('close')
    }
  },
}
</script>
<style lang="css">

</style>
