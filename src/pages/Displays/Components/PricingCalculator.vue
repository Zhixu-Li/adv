<template>
  <BContainer>
    <BRow>
      <BCol>
        <BFormGroup label="Expected Campaign Duration" label-for="duration">
          <BInputGroup id="duration" append="sec">
            <BFormInput
              v-model="durationEstimate"
              type="number"
              step="1"
              :max="maxTimePurchasable"
              min="0"
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
      <BCol>
        <BFormGroup label="Per Day" label-for="day">
          <BInputGroup id="day" prepend="$">
            <BFormInput
              v-model="perDay"
              type="number"
              step="0.1"
              min="0"
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
    </BRow>

    <BRow class="mt-3">
      <BCol>
        <BFormGroup label="Price Per Second" label-for="pricePerSecond">
          <BInputGroup id="pricePerSecond" append="¢">
            <BFormInput
              disabled
              :value="centsPerSecond"
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
      <BCol>
        <BFormGroup label="Per Week" label-for="week">
          <BInputGroup id="week" prepend="$">
            <BFormInput
              disabled
              :value="centsPerSecond === 0 ? 0 : Math.round(perDay * 7 * 10) / 10"
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
      <BCol>
        <BFormGroup label="Per Month" label-for="month">
          <BInputGroup id="month" prepend="$">
            <BFormInput
              disabled
              :value="centsPerSecond === 0 ? 0 : Math.round(perDay * 30 * 10) / 10"
            />
          </BInputGroup>
        </BFormGroup>
      </BCol>
    </BRow>

    <BButton
      v-if="showButton"
      class="float-right mt-3"
      variant="primary"
      @click="close"
    >
      {{ $t('buttons.close') }}
    </BButton>
  </BContainer>
</template>

<script>
import {
  BContainer,
  BRow,
  BCol,
  BFormGroup,
  BInputGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'

export default {
  components: {
    BContainer,
    BRow,
    BCol,
    BFormGroup,
    BInputGroup,
    BFormInput,
    BButton
  },
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
