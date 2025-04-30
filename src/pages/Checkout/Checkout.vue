<template lang="html">
  <font-awesome-icon :icon="['fas', 'question-circle']" />
  <font-awesome-icon :icon="['fas', 'trash']" />


  <font-awesome-icon :icon="['fab', 'cc-visa']" />
  <font-awesome-icon :icon="['fab', 'cc-mastercard']" />
  <font-awesome-icon :icon="['fab', 'cc-discover']" />
  <font-awesome-icon :icon="['fab', 'cc-apple-pay']" />
  <font-awesome-icon :icon="['fab', 'cc-diners-club']" />
  <font-awesome-icon :icon="['fab', 'cc-paypal']" />
  <font-awesome-icon :icon="['fab', 'cc-amex']" />
  <font-awesome-icon :icon="['fab', 'cc-amazon-pay']" />
  <font-awesome-icon :icon="['fab', 'cc-jcb']" />
  <font-awesome-icon :icon="['fab', 'cc-stripe']" />
  <b-container class="pt-3">
    <b-row
      v-if="!processing && !failed && processed.length > 0"
      class="h-100"
    >
      <b-col>
        <h2>Booking Successful</h2>
        <p>Your campaign(s) are pending approval. An invoice containing information regarding this transaction has been sent to your email address.</p>
        <b-table-simple striped>
          <b-thead>
            <b-tr>
              <b-th scope="col">
                Display
              </b-th>
              <b-th scope="col">
                Campaign
              </b-th>
              <b-th scope="col">
                Date
              </b-th>
              <b-th scope="col">
                Time (each day)
              </b-th>
              <b-th scope="col">
                Cost
              </b-th>
              <b-th scope="col">
                Discount
              </b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr
              v-for="item in processed"
              :key="item.displayName"
            >
              <b-td>{{ item.displayName }}</b-td>
              <b-td>{{ item.campaignName }}</b-td>
              <b-td v-if="item.startDate === item.endDate">
                {{ formatDate(item.startDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-else>
                {{ formatDate(item.startDate, 'MMM Do YYYY') }} - {{ formatDate(item.endDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-if="item.startTime==='00:00:00' && item.endTime==='23:59:59'">
                All Day
              </b-td>
              <b-td v-else>
                {{ item.startTime }} - {{ item.endTime }}
              </b-td>
              <b-td>${{ item.cost/100 }}</b-td>
              <b-td>${{ item.discount/100 }}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <p> Campaign(s) will not begin running until approved by the display owner. In the event of campaign disapproval, money will automatically be refunded (minus the service fee). For more information refer to your invoice.</p>
      </b-col>
    </b-row>
    <b-row
      v-else-if="!processing"
      class="h-100 checkout"
    >
      <div class="header">
        <h3>{{ $t('checkout.checkout') }}</h3>
      </div>
      <b-col
        v-if="errors.length > 0"
        cols="12"
        class="p-2"
      >
        <div class="alert alert-danger">
          <ul>
            <li
              v-for="(error, index) in errors"
              :key="index"
            >
              {{ error }}
            </li>
          </ul>
        </div>
      </b-col>
      <div
        v-if="cart.length > 0"
        class="col-12 bookings"
      >
        <h4>Your Order</h4>
        <b-table-simple striped>
          <b-thead>
            <b-tr>
              <b-th />
              <b-th>Display</b-th>
              <b-th>Campaign</b-th>
              <b-th>Date</b-th>
              <b-th>Time (each day)</b-th>
              <b-th v-if="cart.length > 0">
                Cost
              </b-th>
              <b-th v-if="cart.length > 0">
                Coupon
              </b-th>
              <b-th />
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr
              v-for="booking in cart"
              :key="booking.displayName"
            >
              <b-td>
                <span
                  v-if="booking.status === 'failed'"
                  style="color: red;"
                  data-toggle="tooltip"
                  data-placement="top"
                  :title="booking.message"
                >&#10006;</span>
              </b-td>
              <b-td>{{ booking.displayName }}</b-td>
              <b-td>{{ booking.campaignName }}</b-td>
              <b-td v-if="booking.startDate === booking.endDate">
                {{ formatDate(booking.startDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-else>
                {{ formatDate(booking.startDate, 'MMM Do YYYY') }} - {{ formatDate(booking.endDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-if="booking.startTime==='00:00:00' && booking.endTime==='23:59:59'">
                All Day
              </b-td>
              <b-td v-else>
                {{ booking.startTime }} - {{ booking.endTime }}
              </b-td>
              <b-td>${{ formatMoney(booking.cost) }}</b-td>
              <!-- <b-td> -->
              <b-td v-if="!booking.validCoupon">
                <b-input-group size="sm">
                  <b-form-input
                    v-model="booking.coupon"
                    placeholder="Coupon"
                  />
                  <b-input-group-append>
                    <b-button
                      variant="primary"
                      @click="fetchQuote(booking)"
                    >
                      Add
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
                <!-- <b-button variant="primary" size="sm" class="ml-1" name="button" @click="fetchQuote(booking)">Apply</b-button> -->
              </b-td>
              <b-td v-else>
                <span v-if="booking.discount<=0">
                  Free Booking
                </span>
                <span
                  v-else
                  class="discount"
                >
                  -${{ formatMoney(booking.discount) }}
                </span>
                <b-badge
                  variant="success"
                  pill
                >
                  {{ booking.coupon }} <span
                    class="pointer"
                    @click="deleteCoupon(booking)"
                  >&times;</span>
                </b-badge>
              </b-td>
              <b-td>
                <span
                  class="pointer"
                  @click="remove(booking)"
                ><v-icon
                  name="trash"
                  scale="1.5"
                /></span>
              </b-td>
            </b-tr>
            <b-tr
              v-for="booking in processed"
              :key="booking.displayName"
            >
              <b-td>
                <span
                  v-if="booking.status === 'success'"
                  style="color: green;"
                >&#10003;</span>
              </b-td>
              <b-td>{{ booking.displayName }}</b-td>
              <b-td>{{ booking.campaignName }}</b-td>
              <b-td v-if="booking.startDate === booking.endDate">
                {{ formatDate(booking.startDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-else>
                {{ formatDate(booking.startDate, 'MMM Do YYYY') }} - {{ formatDate(booking.endDate, 'MMM Do YYYY') }}
              </b-td>
              <b-td v-if="booking.startTime==='00:00:00' && booking.endTime==='23:59:59'">
                All Day
              </b-td>
              <b-td v-else>
                {{ booking.startTime }} - {{ booking.endTime }}
              </b-td>
              <b-td>Booked!</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>

      <div
        v-if="cart.length === 0"
        cols="12"
      >
        <h4>Your Cart is Empty</h4>
        <p>You can add items to your cart by booking a campaign onto a public display from the scheduling map. For more information please refer to the Adverpost Handbook.</p>
      </div>

      <div
        v-if="cart.length > 0"
        class="col-12 col-md-4 payment-info"
      >
        <ul class="list-group">
          <li
            v-for="source in stripe.sources.data"
            :key="source"
            class="list-group-item justify-content-between list-group-item-action"
            :class="{'active': selectedPayment === source}"
            @click="selectedPayment = source"
          >
            <span> **** **** **** {{ source.last4 }}</span>
            <v-icon
              v-if="source.object === 'card'"
              scale="1.75"
              style="color: black;"
              :name="'cc-' + source.brand.toLowerCase()"
            />
          </li>
          <li class="list-group-item justify-content-between list-group-item-action">
            <h5
              class="w-100 text-center pointer"
              @click.prevent.stop="toggleCollapse"
            >
              Add a new Card
            </h5>
            <div
              id="newCard"
              ref="collapsible"
              class="collapse w-100"
              :class="{'show': stripe.sources.data.length === 0}"
            >
              <stripe-credit-card
                @token-created="newCard"
                @click.stop=""
              />
            </div>
          </li>
        </ul>
      </div>
      <b-col
        v-if="cart.length > 0"
        cols="12"
        md="4"
        offset-md="4"
      >
        <b-card>
          <b-card-text>
            <b-row v-if="subTotal-discount>0">
              <label
                class="col-4 col-form-label"
                for=""
              >Subtotal:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(subTotal - (subTotal * 0.091)) }}
              </p>
            </b-row>
            <b-row v-if="subTotal-discount>0">
              <label
                class="col-4 col-form-label"
                for=""
              >GST:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(subTotal * 0.091) }}
              </p>
            </b-row>
            <b-row>
              <label
                class="col-4 col-form-label"
                for=""
              >Discount:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(discount * 0.01) }}
              </p>
            </b-row>
            <hr>
            <b-row>
              <label
                class="col-6 col-form-label"
                for=""
              >Total (GST Inclusive):</label>
              <p class="offset-2 col-4 form-control-static">
                ${{ formatMoney(total) }}
              </p>
            </b-row>
          </b-card-text>
        </b-card>
        <div
          v-if="cart.length > 0"
          class="pt-2 m-2"
        >
          <b-button
            variant="primary"
            class="float-right"
            :disabled="Object.keys(selectedPayment).length <= 0 && total > 0"
            @click="submit"
          >
            {{ total > 0 ? 'Pay ' + formatMoney(total * 0.01) : 'Make Booking' }}
          </b-button>
        </div>
      </b-col>
    </b-row>
    <div
      v-else-if="processing"
      class="h-100"
    >
      <div class="loader">
        <div class="spinner" />
        <span>Processing</span>
      </div>
    </div>
  </b-container>
</template>

<script>
import StripeCreditCard from '@/components/StripeCreditCard.vue'
import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
export default {
  components: {
    StripeCreditCard
  },
  data () {
    return {
      stripe: {
        sources: {
          data: []
        }
      },
      selectedPayment: {},
      cart: [],
      processed: [],
      processing: false,
      wechat: false,
      errors: [],
      failed: false
    }
  },
  computed: {
    total () {
      return _.sumBy(this.cart, 'total')
    },
    subTotal () {
      return _.sumBy(this.cart, 'cost')
    },
    discount () {
      return _.sumBy(this.cart, 'discount')
    }
  },
  watch: {
    processing () {
      this.initTooltips()
    }
  },
  mounted () {
    this.cart = this.$cart.store
    this.fetchStripeData()
    this.initTooltips()
  },
  beforeUnmount () {
    $(function () {
      $('[data-toggle="tooltip"]').tooltip('dispose')
    })
  },
  methods: {
    fetchStripeData () {
      this.$axios.get('v1/users/' + this.$auth.user.id + '/stripe').then(
        (response) => {
          this.stripe = response.data

          if (this.stripe.default_source) {
            this.selectedPayment = _.find(this.stripe.sources.data, (source) => {
              return source.id === this.stripe.default_source
            })
          }
        },
        () => {
        }
      )
    },
    formatDate(date, format = 'MMM Do YYYY') {
      return moment(date).format(format)
    },
    formatMoney(value) {
    return Number(value).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD', // Or 'AUD', 'EUR', etc.
      minimumFractionDigits: 2
    });
  },

    newCard (e) {
      let card = e.card
      card.token = e.id
      this.stripe.sources.data.push(card)
      this.selectedPayment = card

      setTimeout(() => {
        $('#newCard').collapse('hide')
      }, 500)
    },
    toggleCollapse () {
      $('#newCard').collapse('toggle')
    },
    deleteCoupon (booking) {
      delete booking.coupon
      this.fetchQuote(booking)
    },
    fetchQuote (booking) {
      this.$axios.post('v1/scheduling/quote', {
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        displayId: booking.displayId,
        campaignId: booking.campaignId,
        coupon: booking.coupon
      }).then(
        (response) => {
          booking.total = response.data.data.total
          booking.cost = response.data.data.cost
          booking.discount = response.data.data.discount

          if (response.data.data.code && booking.coupon === response.data.data.code) {
            booking.validCoupon = true
          }
          else {
            booking.validCoupon = false
          }

          if (response.data.data.message) {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: response.data.data.message,
              timeout: true
            })
          }
        },
        () => {
          // fail to get campaign-cost from API
          this.$notifications.add({
            title: 'Error',
            type: 'danger',
            body: this.$t('notifications.costFetchError'),
            timeout: true
          })
        }
      )
    },
    remove (booking) {
      this.$cart.remove(booking)
    },
    submit () {
      var scope = this
      // remove already processed ones
      let bookings = this.prepare(this.cart)
      this.errors = []
      this.processing = true
      this.$axios.post('v1/schedule', {
        'bookings': bookings,
        stripeToken: this.selectedPayment.token ? this.selectedPayment.token : this.selectedPayment.id
      }).then(
        (response) => {
          this.processing = false
          let bookings = response.data.data

          for (let booking of bookings) {
            let cartItemIndex = _.findIndex(this.cart, function (value) {
              return value.campaignId === booking.campaignId &&
                     value.displayId === booking.displayId &&
                     value.startDate === booking.startDate &&
                     value.endDate === booking.endDate &&
                     value.startTime === booking.startTime &&
                     value.endTime === booking.endTime
            })
            let cartItem = this.cart[cartItemIndex]

            if (booking.status === 'failed') {
              cartItem.status = booking.status
              cartItem.message = booking.message
              this.failed = true
            } else if (booking.id) {
              cartItem.status = 'success'
              this.processed.push(cartItem)
              this.cart.splice(cartItemIndex, 1)
            }
          }
        }).catch(
        function (error) {
          if (!error.response) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.message,
              timeout: true
            })
          } else if (error.response.status !== 404) {
            scope.$notifications.add({
              title: 'Error',
              type: 'warning',
              body: error.response.data.message,
              timeout: true
            })
          }
          this.processing = false
        }
      )
    },
    prepare (bookings) {
      let newBookings = []
      for (let booking of bookings) {
        newBookings.push(_.pick(booking, [
          'startDate',
          'startTime',
          'endDate',
          'endTime',
          'campaignId',
          'displayId',
          'coupon',
          'daysEnabled',
          'skippedWeeks'
        ]))
      }
      return newBookings
    },
    initTooltips () {
      $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
}

.pointer {
  color: black !important;
  fill: black !important;
  cursor: pointer;
}

.checkout {
  align-content: flex-start;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  .bookings {
    padding-top: 15px;
  }

  .submit {
    position: absolute;
    right: 20px;
    bottom: 20px;
  }

}
</style>
