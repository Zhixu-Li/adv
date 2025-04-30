<template lang="html">
  <div>
    <div
      v-if="errors.length > 0"
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
    </div>
    <b-form-group
      :label="$t('displayCoupon.code')"
      label-for="couponCode"
    >
      <b-form-input
        id="couponCode"
        v-model="editCoupon.code"
      />
    </b-form-group>
    <b-form-group
      id="value"
      :label="$t('displayCoupon.value')"
      label-for="value"
    >
      <b-form-radio
        id="price"
        v-model="picked"
        value="price"
      >
        {{ $t('displayCoupon.price') }}
      </b-form-radio>
      <b-form-radio
        id="percent"
        v-model="picked"
        value="percent"
      >
        {{ $t('displayCoupon.percentage') }}
      </b-form-radio>
    </b-form-group>
    <b-form-group
      v-if="picked == 'price'"
      :label="$t('displayCoupon.price')"
      label-for="price"
    >
      <b-form-input
        id="price"
        v-model.number="editCoupon.price"
        type="number"
        min="0"
        step="1"
      />
    </b-form-group>
    <b-form-group
      v-else-if="picked == 'percent'"
      :label="$t('displayCoupon.percentage')"
      label-for="percent"
    >
      <b-form-input
        id="percent"
        v-model.number="percentage"
        type="number"
        min="0"
        max="100"
      />
    </b-form-group>
    <div>
      <label for="expiry">{{ $t('displayCoupon.expiry') }}</label>
      <flatpickr
        id="expiry"
        v-model="expiry"
        class="form-control"
        :placeholder="$t('dateTime.date')"
        :options="expiryOptions"
      />
    </div>
    <b-form-group
      :label="$t('displayCoupon.quantity')"
      label-for="quantity"
    >
      <b-form-input
        id="quantity"
        v-model="editCoupon.quantity"
        type="number"
        :disabled="editCoupon.unlimited"
      />
      <b-form-checkbox
        id="unlimited"
        v-model="editCoupon.unlimited"
        value="true"
      >
        {{ $t('displayCoupon.unlimited') }}
      </b-form-checkbox>
    </b-form-group>
    <b-button
      variant="primary"
      @click="save()"
    >
      Save
    </b-button>
  </div>
</template>

<script>
import Flatpickr from '@/components/Flatpickr'
export default {
  components: {
    Flatpickr
  },
  props: {
    coupon: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      expiry: '',
      expiryOptions: {
        dateFormat: 'Y-m-d',
        defaultDate: '',
        altInput: true,
        altFormat: 'd-m-Y',
        altInputClass: 'form-control',
        allowInput: true,
        disableMobile: true
      },
      picked: '',
      errors: [],
      validation: true,
      editCoupon: {...this.coupon},
      percentage: this.coupon.percent * 100
    }
  },
  watch: {
  },
  mounted () {
    this.expiryOptions.defaultDate = this.editCoupon.expiry
    this.expiry = this.editCoupon.expiry
    if (this.editCoupon.price) {
      this.picked = 'price'
    }
    else if (this.editCoupon.percent) {
      this.picked = 'percent'
    }
  },
  methods: {
    save () {
      if (this.picked === 'price') {
        delete this.editCoupon.percent
      }
      if (this.picked === 'percent') {
        delete this.editCoupon.price
      }

      if (this.editCoupon.unlimited) {
        delete this.editCoupon.quantity
      }

      this.editCoupon.expiry = this.expiry
      this.validateMe()

      if (this.validation === true) {
        if (this.picked === 'percent') {
          this.editCoupon.percent = this.percentage / 100
        }
        this.editCoupon.code = this.editCoupon.code.toUpperCase()
        this.$axios.post('v1/displays/' + this.$route.params.displayId + '/coupons/' + this.editCoupon.couponId, this.editCoupon).then(
          () => {
            this.$emit('update')
          },
          () => {
            this.$emit('update')
          }
        )
      }
    },
    validateMe () {
      this.errors = []
      this.validation = true
      if (this.picked === 'price') {
        this.lengthTest(this.editCoupon.price, 'Coupon Price', 1)
        this.integerTest(this.editCoupon.price, 'Coupon Price')
      } else {
        this.lengthTest(this.percentage, 'Coupon Percentage', 1, 100)
      }
      this.stringTest(this.editCoupon.code, 'Coupon Code', 255)
      if (this.editCoupon.unlimited === false) {
        this.lengthTest(this.editCoupon.quantity, 'Coupon Quanitity', 1)
        this.integerTest(this.editCoupon.quantity, 'Coupon Quanitity')
      }
      this.stringTest(this.editCoupon.expiry, 'Coupon Expiry', 10)
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
</style>
