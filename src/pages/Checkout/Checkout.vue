<template>
  <BContainer>
    <BRow v-if="!processing && !failed && processed.length > 0" class="h-100">
      <BCol>
        <h2>Booking Successful</h2>
        <p>
          Your campaign(s) are pending approval. An invoice containing
          information regarding this transaction has been sent to your email address.
        </p>

        <BTableSimple striped>
          <BThead>
            <BTr>
              <BTh scope="col">Display</BTh>
              <BTh scope="col">Campaign</BTh>
              <BTh scope="col">Date</BTh>
              <BTh scope="col">Time (each day)</BTh>
              <BTh scope="col">Cost</BTh>
              <BTh scope="col">Discount</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="item in processed" :key="item.displayName">
              <BTd>{{ item.displayName }}</BTd>
              <BTd>{{ item.campaignName }}</BTd>
              <BTd v-if="item.startDate === item.endDate">
                {{ formatDate(item.startDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-else>
                {{ formatDate(item.startDate,'MMM Do YYYY') }} -
                {{ formatDate(item.endDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-if="item.startTime==='00:00:00'&&item.endTime==='23:59:59'">
                All Day
              </BTd>
              <BTd v-else>
                {{ item.startTime }} - {{ item.endTime }}
              </BTd>
              <BTd>${{ item.cost/100 }}</BTd>
              <BTd>${{ item.discount/100 }}</BTd>
            </BTr>
          </BTbody>
        </BTableSimple>

        <p>
          Campaign(s) will not begin running until approved by the display owner.
          In the event of campaign disapproval, money will automatically be refunded
          (minus the service fee). For more information refer to your invoice.
        </p>
      </BCol>
    </BRow>

    <BRow v-else-if="!processing" class="h-100 checkout">
      <div class="header">
        <h3>{{ $t('checkout.checkout') }}</h3>
      </div>

      <BCol v-if="errors.length" cols="12" class="p-2">
        <BAlert variant="danger" show>
          <ul>
            <li v-for="(error, idx) in errors" :key="idx">{{ error }}</li>
          </ul>
        </BAlert>
      </BCol>

      <div v-if="cart.length" class="col-12 bookings">
        <h4>Your Order</h4>
        <BTableSimple striped>
          <BThead>
            <BTr>
              <BTh />
              <BTh>Display</BTh>
              <BTh>Campaign</BTh>
              <BTh>Date</BTh>
              <BTh>Time (each day)</BTh>
              <BTh v-if="cart.length">Cost</BTh>
              <BTh v-if="cart.length">Coupon</BTh>
              <BTh />
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="booking in cart" :key="booking.displayName">
              <BTd>
                <span
                  v-if="booking.status==='failed'"
                  class="text-danger"
                  v-b-tooltip.hover.top="{ title: booking.message }"
                >&#10006;</span>
              </BTd>
              <BTd>{{ booking.displayName }}</BTd>
              <BTd>{{ booking.campaignName }}</BTd>
              <BTd v-if="booking.startDate===booking.endDate">
                {{ formatDate(booking.startDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-else>
                {{ formatDate(booking.startDate,'MMM Do YYYY') }} -
                {{ formatDate(booking.endDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-if="booking.startTime==='00:00:00'&&booking.endTime==='23:59:59'">
                All Day
              </BTd>
              <BTd v-else>
                {{ booking.startTime }} - {{ booking.endTime }}
              </BTd>
              <BTd>${{ formatMoney(booking.cost) }}</BTd>
              <BTd v-if="!booking.validCoupon">
                <BInputGroup size="sm">
                  <BFormInput v-model="booking.coupon" placeholder="Coupon" />
                  <BInputGroupAppend>
                    <BButton variant="primary" @click="fetchQuote(booking)">
                      Add
                    </BButton>
                  </BInputGroupAppend>
                </BInputGroup>
              </BTd>
              <BTd v-else>
                <span v-if="booking.discount<=0">Free Booking</span>
                <span v-else class="discount">
                  -${{ formatMoney(booking.discount) }}
                </span>
                <BBadge variant="success" pill class="ms-2">
                  {{ booking.coupon }}
                  <span class="pointer" @click="deleteCoupon(booking)"
                    >&times;</span
                  >
                </BBadge>
              </BTd>
              <BTd>
                <span class="pointer" @click="remove(booking)">
                  <v-icon name="trash" scale="1.5" />
                </span>
              </BTd>
            </BTr>
            <BTr v-for="booking in processed" :key="booking.displayName+'ok'">
              <BTd>
                <span v-if="booking.status==='success'" class="text-success"
                  >&#10003;</span
                >
              </BTd>
              <BTd>{{ booking.displayName }}</BTd>
              <BTd>{{ booking.campaignName }}</BTd>
              <BTd v-if="booking.startDate===booking.endDate">
                {{ formatDate(booking.startDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-else>
                {{ formatDate(booking.startDate,'MMM Do YYYY') }} -
                {{ formatDate(booking.endDate,'MMM Do YYYY') }}
              </BTd>
              <BTd v-if="booking.startTime==='00:00:00'&&booking.endTime==='23:59:59'">
                All Day
              </BTd>
              <BTd v-else>
                {{ booking.startTime }} - {{ booking.endTime }}
              </BTd>
              <BTd>Booked!</BTd>
            </BTr>
          </BTbody>
        </BTableSimple>
      </div>

      <div v-else class="col-12">
        <h4>Your Cart is Empty</h4>
        <p>
          You can add items to your cart by booking a campaign onto a public
          display from the scheduling map. For more information please refer to
          the Adverpost Handbook.
        </p>
      </div>

      <div v-if="cart.length" class="col-12 col-md-4 payment-info">
        <ul class="list-group">
          <li
            v-for="source in stripe.sources.data"
            :key="source.id"
            class="list-group-item list-group-item-action d-flex justify-content-between"
            :class="{active: selectedPayment===source}"
            @click="selectedPayment=source"
          >
            <span> **** **** **** {{ source.last4 }}</span>
            <v-icon
              v-if="source.object==='card'"
              :name="'cc-'+source.brand.toLowerCase()"
              scale="1.75"
              style="color:black;"
            />
          </li>
          <li class="list-group-item list-group-item-action">
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
              :class="{show:stripe.sources.data.length===0}"
            >
              <stripe-credit-card @token-created="newCard" />
            </div>
          </li>
        </ul>
      </div>

      <BCol
        v-if="cart.length"
        cols="12"
        md="4"
        offset-md="4"
      >
        <BCard>
          <BCardText>
            <BRow v-if="subTotal-discount>0">
              <label class="col-4 col-form-label">Subtotal:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(subTotal-(subTotal*0.091)) }}
              </p>
            </BRow>
            <BRow v-if="subTotal-discount>0">
              <label class="col-4 col-form-label">GST:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(subTotal*0.091) }}
              </p>
            </BRow>
            <BRow>
              <label class="col-4 col-form-label">Discount:</label>
              <p class="offset-4 col-4 form-control-static">
                ${{ formatMoney(discount*0.01) }}
              </p>
            </BRow>
            <hr />
            <BRow>
              <label class="col-6 col-form-label">Total (GST Inclusive):</label>
              <p class="offset-2 col-4 form-control-static">
                ${{ formatMoney(total) }}
              </p>
            </BRow>
          </BCardText>
        </BCard>
        <div v-if="cart.length" class="pt-2 m-2">
          <BButton
            variant="primary"
            class="float-right"
            :disabled="!selectedPayment && total>0"
            @click="submit"
          >
            {{ total>0 ? 'Pay '+formatMoney(total*0.01) : 'Make Booking' }}
          </BButton>
        </div>
      </BCol>
    </BRow>

    <div v-else-if="processing" class="h-100">
      <div class="loader">
        <div class="spinner" />
        <span>Processing</span>
      </div>
    </div>
  </BContainer>
</template>

<script>
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BCardText,
  BButton,
  BTableSimple,
  BThead,
  BTr,
  BTh,
  BTbody,
  BTd,
  BInputGroup,
  BFormInput,
  BInputGroupAppend,
  BBadge,
  BAlert
} from 'bootstrap-vue-next'
import StripeCreditCard from '@/components/StripeCreditCard.vue'
import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
export default {
  components: {
    StripeCreditCard,
    BContainer,
    BRow,
    BCol,
    BCard,
    BCardText,
    BButton,
    BTableSimple,
    BThead,
    BTr,
    BTh,
    BTbody,
    BTd,
    BInputGroup,
    BFormInput,
    BInputGroupAppend,
    BBadge,
    BAlert,
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
