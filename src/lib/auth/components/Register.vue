<template>
  <div>
    <div v-if="!registered">
      <h2>{{ $t('account.register') }}</h2>
      <p class="p-2">{{ $t('register.registerInfo') }}</p>

      <div v-if="errors.length > 0" class="mb-3">
        <div 
          v-for="(error, index) in errors" 
          :key="index" 
          class="alert alert-danger" 
          role="alert"
        >
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="submit" novalidate>
        <div class="mb-3">
          <label for="username" class="form-label">{{ $t('register.registerName') }}</label>
          <small class="form-text text-muted">{{ $t('register.userNameDecs') }}</small>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            class="form-control"
            :class="{'is-invalid': usernameInvalid}"
            :placeholder="$t('register.registerName')"
            autocomplete="username"
            required
            maxlength="32"
          />
          <div class="invalid-feedback" v-if="usernameInvalid">
            {{ usernameInvalidMessage }}
          </div>
        </div>

        <!-- Hidden date of birth for bot prevention -->
        <input 
          v-model="dateOfBirth"
          type="hidden"
          autocomplete="off"
        />

        <div class="mb-3">
          <label for="email" class="form-label">{{ $t('register.email') }}</label>
          <small class="form-text text-muted">{{ $t('register.emailDecs') }}</small>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            class="form-control"
            :class="{'is-invalid': emailInvalid}"
            :placeholder="$t('register.email')"
            autocomplete="email"
            required
          />
          <div class="invalid-feedback" v-if="emailInvalid">
            Invalid Email
          </div>
        </div>

        <hr />

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="password" class="form-label">{{ $t('register.password') }}</label>
            <small class="form-text text-muted">{{ $t('register.pwdDecs') }}</small>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              class="form-control"
              :class="{'is-invalid': passwordInvalid}"
              :placeholder="$t('register.password')"
              autocomplete="new-password"
              required
            />
            <div class="invalid-feedback" v-if="passwordInvalid">
              {{ passwordInvalidMessage }}
            </div>
          </div>

          <div class="col-md-6">
            <label for="passwordConfirm" class="form-label">{{ $t('register.rePws') }}</label>
            <small class="form-text text-muted">{{ $t('register.rePwsDecs') }}</small>
            <input
              id="passwordConfirm"
              v-model="credentials.passwordConfirm"
              type="password"
              class="form-control"
              :class="{'is-invalid': passwordConfirmInvalid}"
              :placeholder="$t('register.rePws')"
              autocomplete="new-password"
              required
            />
            <div class="invalid-feedback" v-if="passwordConfirmInvalid">
              Passwords do not match
            </div>
          </div>
        </div>

        <hr />

        <div>
          <div class="form-check mb-2">
            <input
              id="usecard"
              type="checkbox"
              v-model="usecard"
              class="form-check-input"
            />
            <label for="usecard" class="form-check-label">
              Payment Details <small>(what's this?)</small>
              <i
                class="fa fa-question-circle"
                tabindex="0"
                data-bs-toggle="popover"
                data-bs-trigger="hover focus"
                data-bs-content="{{ $t('popover.registerWithCard') }}"
                aria-label="Payment info"
              ></i>
            </label>
          </div>

          <a target="_blank" href="https://stripe.com">
            <img class="p-2 float-end" src="/static/powered_by_stripe.png" alt="Stripe" />
          </a>

          <div class="p-2" v-if="usecard">
            <stripe-credit-card
              v-if="Object.keys(source).length === 0"
              :submit-text="'Verify Card'"
              @token-created="source = $event"
            />
            <div v-else class="d-flex align-items-center">
              <font-awesome-icon
                v-if="source.card?.object === 'card'"
                :icon="['fab', 'cc-' + source.card.brand.toLowerCase()]"
                style="color: black; margin-right: 8px;"
                size="lg"
              />
              <span> **** **** **** {{ source.card.last4 }}</span>
              <button
                type="button"
                class="btn btn-sm btn-danger ms-3"
                @click="removeCard"
              >
                Remove Details
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3 flex-wrap">
          <button
            v-if="!usecard"
            type="button"
            class="btn btn-primary"
            @click="usecard = true"
          >
            {{ $t('register.addPay') }}
          </button>

          <button
            v-if="!usecard"
            type="submit"
            class="btn btn-primary"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Accounts created without payment details will require manual activation."
          >
            {{ $t('register.create') }}
          </button>

          <button
            v-if="usecard && Object.keys(source).length > 0"
            type="submit"
            class="btn btn-primary"
          >
            {{ $t('register.create') }}
          </button>

          <button
            v-if="usecard && Object.keys(source).length === 0"
            type="button"
            class="btn btn-secondary"
            @click="usecard = false"
          >
            Cancel Adding Payment Details
          </button>
        </div>
      </form>
    </div>

    <div v-else>
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
import * as bootstrap from 'bootstrap'

export default {
  components: {
    StripeCreditCard,
  },
  data() {
    return {
      credentials: {
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
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
  computed: {
    usernameInvalid() {
      return this.credentials.username.length === 0 || this.credentials.username.length > 32
    },
    usernameInvalidMessage() {
      if (this.credentials.username.length === 0) return 'Username must be a minimum of 1 character'
      if (this.credentials.username.length > 32) return 'Username must be a maximum of 32 characters'
      return ''
    },
    emailInvalid() {
      const emailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return !emailRE.test(this.credentials.email)
    },
    passwordInvalid() {
      return this.credentials.password.length < 8
    },
    passwordInvalidMessage() {
      if (this.credentials.password.length < 8) return 'Password must be a minimum of 8 characters'
      return ''
    },
    passwordConfirmInvalid() {
      return (
        this.credentials.password.length >= 8 &&
        this.credentials.passwordConfirm !== this.credentials.password
      )
    },
  },
  mounted() {
    this.timeAtLoad = moment()
    // Enable Bootstrap tooltips and popovers
    this.initBootstrapTooltips()
  },
  methods: {
    initBootstrapTooltips() {
      // Bootstrap 5 tooltips and popovers init
      const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl)
      })
      const popoverTriggerList = [...document.querySelectorAll('[data-bs-toggle="popover"]')]
      popoverTriggerList.forEach(popoverTriggerEl => {
        new bootstrap.Popover(popoverTriggerEl)
      })
    },
    resetState() {
  this.credentials = { username: '', password: '', email: '', passwordConfirm: '' }
  this.errors = []
  this.registered = false
  this.source = {}
  this.usecard = false
  this.dateOfBirth = ''
  this.timeAtLoad = moment()
  this.timeAtSubmit = ''
},
    submit() {
      this.timeAtSubmit = moment()
      this.errors = []

      if (!this.validateForm()) {
        this.errors.push('An error has occurred creating your account, please try again')
        return
      }
      if (this.usernameInvalid) {
        this.errors.push(this.usernameInvalidMessage)
      }
      if (this.emailInvalid) {
        this.errors.push('Invalid Email')
      }
      if (this.passwordInvalid) {
        this.errors.push(this.passwordInvalidMessage)
      }
      if (this.passwordConfirmInvalid) {
        this.errors.push('Passwords do not match')
      }

      if (this.errors.length > 0) return

      let credentials = {
        username: this.credentials.username,
        password: this.credentials.password,
        email: this.credentials.email,
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
    },
    validateForm() {
      if (this.timeAtSubmit - this.timeAtLoad < 2500 || this.dateOfBirth !== '') {
        this.timeAtLoad = moment()
        return false
      }
      return true
    },
    removeCard() {
      this.source = {}
      this.usecard = false
    },
  },
}
</script>

<style scoped>
@media (max-width: 576px) {
  .d-flex.justify-content-end {
    flex-direction: column;
    align-items: stretch;
  }

  .d-flex.justify-content-end > * {
    margin-bottom: 0.5rem;
  }
}
</style>
