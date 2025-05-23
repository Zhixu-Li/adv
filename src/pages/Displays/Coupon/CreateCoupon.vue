<template lang="html">
  <div>
    <BAlert
      v-if="errors.length"
      variant="danger"
      show
    >
      <ul>
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </BAlert>

    <BFormGroup
      :label="$t('displayCoupon.code')"
      label-for="couponCode"
    >
      <BFormInput
        id="couponCode"
        v-model="coupon.code"
      />
    </BFormGroup>

    <BFormGroup
      id="value"
      :label="$t('displayCoupon.value')"
      label-for="value"
    >
      <BFormRadio id="price" v-model="picked" value="price">
        {{ $t('displayCoupon.price') }}
      </BFormRadio>
      <BFormRadio id="percent" v-model="picked" value="percent">
        {{ $t('displayCoupon.percentage') }}
      </BFormRadio>
    </BFormGroup>

    <BFormGroup
      v-if="picked === 'price'"
      :label="$t('displayCoupon.price')"
      label-for="price"
    >
      <BFormInput
        id="price"
        v-model.number="coupon.price"
        type="number"
        min="0"
        step="1"
      />
    </BFormGroup>

    <BFormGroup
      v-else-if="picked === 'percent'"
      :label="$t('displayCoupon.percentage')"
      label-for="percent"
    >
      <BFormInput
        id="percent"
        v-model.number="coupon.percent"
        type="number"
        min="0"
        max="100"
      />
    </BFormGroup>

    <div class="mb-3">
      <label for="expiry">{{ $t('displayCoupon.expiry') }}</label>
      <flatpickr
        id="expiry"
        v-model="expiry"
        class="form-control"
        :placeholder="$t('dateTime.date')"
        :options="expiryOptions"
      />
    </div>

    <BFormGroup
      :label="$t('displayCoupon.quantity')"
      label-for="quantity"
    >
      <BFormInput
        id="quantity"
        v-model="coupon.quantity"
        type="number"
        :disabled="coupon.unlimited"
      />
      <BFormCheckbox id="unlimited" v-model="coupon.unlimited">
        {{ $t('displayCoupon.unlimited') }}
      </BFormCheckbox>
    </BFormGroup>

    <BButton variant="primary" @click="create">
      {{ $t('buttons.createCoupon') }}
    </BButton>
  </div>
</template>

<script>
import {
  BAlert,
  BFormGroup,
  BFormInput,
  BFormRadio,
  BFormCheckbox,
  BButton
} from 'bootstrap-vue-next'
import Flatpickr from '@/components/Flatpickr'
export default {
  components: {
    Flatpickr,
    BAlert,
    BFormGroup,
    BFormInput,
    BFormRadio,
    BFormCheckbox,
    BButton
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      coupon: {
        unlimited: true,
        price: 0,
        percent: 0,
        expiry: 0,
        code: ''
      },
      expiry: '',
      expiryOptions: {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd-m-Y',
        altInputClass: 'form-control',
        allowInput: true,
        disableMobile: true
      },
      picked: 'price',
      errors: [],
      validation: true
    }
  },
  watch: {
    'coupon.price': function () {
      if (this.coupon.price < 0) {
        this.coupon.price = -this.coupon.price
      }
    }
  },
  methods: {
    close () {
      this.coupon = {
        unlimited: true
      }
      this.picked = 'price'
      this.$emit('update')
    },
    create () {
      if (this.picked === 'price') {
        delete this.coupon.percent
      }
      if (this.picked === 'percent') {
        delete this.coupon.price
      }

      if (this.coupon.unlimited) {
        delete this.coupon.quantity
      }

      this.coupon.expiry = this.expiry
      this.validateMe()
      if (this.validation) {
        if (this.picked === 'percent') {
          this.coupon.percent = this.coupon.percent / 100
        }
        this.coupon.code = this.coupon.code.toUpperCase()
        this.$axios.post('v1/displays/' + this.$route.params.displayId + '/coupons', this.coupon).then(
          () => {
            this.close()
          },
          () => {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: this.$t('notifications.couponExists'),
              timeout: true
            })
          }
        )
      }
    },
    validateMe () {
      this.errors = []
      this.validation = true
      if (this.picked === 'price') {
        this.lengthTest(this.coupon.price, 'Coupon Price', 1)
        this.integerTest(this.coupon.price, 'Coupon Price')
      } else {
        this.lengthTest(this.coupon.percent, 'Coupon percentage', 1, 100)
      }
      this.stringTest(this.coupon.code, 'Coupon Code', 255)
      if (this.coupon.unlimited === false) {
        this.lengthTest(this.coupon.quantity, 'Coupon Quanitity', 1)
        this.integerTest(this.coupon.quantity, 'Coupon Quanitity')
      }
      this.stringTest(this.coupon.expiry, 'Coupon Expiry', 10)
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
      if (!value) {
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
