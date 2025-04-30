<template>
  <div>
    <div v-if="!registered">
      <h2>{{ $t('account.register') }}</h2>
      <p class="p-2">{{ $t('register.registerInfo') }}</p>

      <div v-if="errors.length > 0">
        <b-alert
          v-for="(error, index) in errors"
          :key="index"
          show
          variant="danger"
        >
          {{ error }}
        </b-alert>
      </div>

      <b-form novalidate @submit.prevent="submit()">
        <b-form-group
          :label="$t('register.registerName')"
          class="m-2"
          :description="$t('register.userNameDecs')"
        >
          <b-form-input
            id="username"
            v-model="credentials.username"
            required
            type="text"
            class="form-control"
            :placeholder="$t('register.registerName')"
            autocomplete="username"
            :state="credentials.username ? credentials.username.length < 32 : null"
          />
        </b-form-group>

        <b-form-group style="display: none;">
          <b-form-input
            v-model="dateOfBirth"
            required
            type="date"
            class="form-control"
            placeholder="dd/mm/yyyy"
          />
        </b-form-group>

        <b-form-group
          :label="$t('register.email')"
          class="m-2"
          :description="$t('register.emailDecs')"
        >
          <b-form-input
            id="email"
            v-model="credentials.email"
            required
            type="text"
            class="form-control"
            :placeholder="$t('register.email')"
            autocomplete="email"
          />
        </b-form-group>

        <hr />

        <b-row class="p-2">
          <b-col cols="6">
            <b-form-group
              :label="$t('register.password')"
              :description="$t('register.pwdDecs')"
            >
              <b-form-input
                id="password"
                v-model="credentials.password"
                required
                type="password"
                class="form-control"
                :placeholder="$t('register.password')"
                autocomplete="new-password"
                :state="credentials.password ? credentials.password.length >= 8 : null"
              />
            </b-form-group>
          </b-col>

          <b-col cols="6">
            <b-form-group
              :label="$t('register.rePws')"
              :description="$t('register.rePwsDecs')"
            >
              <b-form-input
                id="passwordConfirm"
                v-model="credentials.passwordConfirm"
                required
                type="password"
                class="form-control"
                :placeholder="$t('register.rePws')"
                autocomplete="new-password"
                :state="credentials.password && credentials.passwordConfirm && credentials.password.length >= 8 ? credentials.passwordConfirm===credentials.password : null"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <hr />

        <b-collapse v-model="usecard" class="mt-2">
          <b-card>
            <label id="cardHelp" data-placement="top">
              Payment Details <small>(what's this?)</small>
              <font-awesome-icon icon="question-circle" />
            </label>

            <b-popover target="cardHelp" triggers="hover focus">
              {{ $t('popover.registerWithCard') }}
            </b-popover>

            <a target="_blank" href="https://stripe.com">
              <img class="p-2 float-right" src="/static/powered_by_stripe.png" />
            </a>

            <div class="p-2">
              <stripe-credit-card
                v-if="Object.keys(source).length === 0"
                :submit-text="'Verify Card'"
                @token-created="source = $event"
              />
              <div v-else>
                <font-template-icon
                  v-if="source.card.object === 'card'"
                  :icon="['fab', 'cc-' + source.card.brand.toLowerCase()]"
                  scale="1"
                  class="mr-2"
                  style="color: black;"
                  size="lg"
                />
                <span> **** **** **** {{ source.card.last4 }}</span>
              </div>
            </div>
          </b-card>
        </b-collapse>

        <!-- Action Buttons Aligned to Right -->
        <div class="d-flex justify-content-between flex-wrap gap-2 mt-3">
          <b-button
            v-if="!usecard"
            @click="usecard = !usecard"
            variant="primary"
          >
            {{$t('register.addPay')}}
          </b-button>

          <b-button
            v-else
            @click="(usecard = !usecard); source = {}"
            :variant="Object.keys(source).length > 0 ? 'danger' : 'primary'"
          >
            {{ Object.keys(source).length > 0 ? 'Remove Details' : 'Cancel Adding Payment Details' }}
          </b-button>

          <b-button
            v-if="!usecard"
            v-b-popover.hover.top="'Accounts created without payment details will require manual activation.'"
            variant="primary"
            type="submit"
          >
            {{$t('register.create')}}
          </b-button>

          <b-button
            v-else-if="Object.keys(source).length > 0"
            variant="primary"
            type="submit"
          >
            {{$t('register.create')}}
          </b-button>
        </div>
      </b-form>
    </div>

    <div v-if="registered">
      <h2>{{ user.username }} {{ $t('register.registerSuc') }}</h2>
      <p v-if="Object.keys(source).length > 0">
        {{ $t('register.registerEmail') }} {{ user.email }}
      </p>
      <p v-else>
        {{ $t('register.registerActi') }}
      </p>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import StripeCreditCard from '@/components/StripeCreditCard.vue'

export default {
  components: {
    StripeCreditCard,
  },
  data () {
    return {
      credentials: {
        username: '',
        email: '',
        emailConfirm: '',
        password: '',
        passwordConfirm: ''
      },
      dateOfBirth: '',
      errors: [],
      registered: false,
      user: {},
      timeAtLoad: '',
      timeAtSubmit: '',
      source: {},
      usecard: false,
    }
  },
  mounted () {
    this.timeAtLoad = moment()
  },
  methods: {
    submit () {
      this.timeAtSubmit = moment()
      if (this.validateMe()) {
        let credentials = {
          username: this.credentials.username,
          password: this.credentials.password,
          email: this.credentials.email
        }

        if (this.source.id && this.usecard) {
          credentials.stripeToken = this.source.id
        }

        this.$auth.register(this, credentials).then(
          () => {},
          () => {
            this.source = {}
          }
        )
      }
    },
    validateMe () {
      this.errors = []
      let checkForm = this.validateForm()
      let checkEmail = this.validateEmail()
      let checkPassword = this.validatePassword()
      let checkUsername = this.validateUsername()

      return checkForm && checkEmail && checkUsername && checkPassword
    },
    validateForm () {
      if (this.timeAtSubmit - this.timeAtLoad < 2500 || this.dateOfBirth !== '') {
        this.errors.push('An error has occurred creating your account, please try again')
        this.timeAtLoad = moment()
        return false
      }
      return true
    },
    validateEmail () {
      var emailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRE.test(this.credentials.email)) {
        this.errors.push('Invalid Email')
        return false
      }
      return true
    },
    validateUsername () {
      if (this.credentials.username.length <= 0) {
        this.errors.push('Username must be a minimum of 1 character')
        return false
      } else if (this.credentials.username.length > 32) {
        this.errors.push('Username must be a maximum of 32 characters')
        return false
      }
      return true
    },
    validatePassword () {
      if (this.credentials.password.length < 8) {
        this.errors.push('Password must be a minimum of 8 characters')
        return false
      }
      if (this.credentials.password !== this.credentials.passwordConfirm) {
        this.errors.push('Passwords do not match')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
@media (max-width: 576px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: stretch;
  }

  .d-flex.justify-content-between > div {
    margin-bottom: 0.5rem;
  }
}
</style>
