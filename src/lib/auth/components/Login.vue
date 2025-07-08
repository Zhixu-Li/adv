<!-- <template>
  <div class="pt-4 pb-4">
    <div v-if="!forgot">
      <h2 class="p-2">
        {{ $t('account.loginTitle') }}
      </h2>

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

      <b-form @submit.prevent="submit()">
        <b-form-group
          class="m-2 mt-4"
          :description="$t('register.lgName')"
        >
          <b-form-input
            v-model="credentials.username"
            type="text"
            class="form-control"
            autocomplete="username"
            :placeholder="$t('user.usernameEmail')"
          />
        </b-form-group>
        <b-form-group
          class="m-2 mt-4 mb-4"
          :description="$t('register.lgPass')"
        >
          <b-form-input
            v-model="credentials.password"
            type="password"
            autocomplete="current-password"
            class="form-control"
            :placeholder="$t('user.enterPassword')"
          />
        </b-form-group>
        <div class="m-2 mt-4">
          <b-button
            variant="warning"
            type="button"
            @click="forgot=true"
          >
            {{ $t('account.forgotPassword') }}
          </b-button>
          <b-button
            variant="primary"
            class="float-right"
            type="submit"
          >
            {{ $t('account.login') }}
          </b-button>
        </div>
      </b-form>
    </div>
    <div v-else>
      <h2>{{ $t('account.passwordReset') }}</h2>
      <div v-if="!sent">
        <p>
          {{ $t('message.resetPassword') }}
        </P>
        <b-form-group class="m-2">
          <b-form-input
            v-model="forgotCredentials.email"
            type="email"
            class="form-control"
            :placeholder="$t('user.enterEmail')"
          />
        </b-form-group>
        <div class="m-2">
          <b-button
            variant="primary"
            @click="forgot=false"
          >
            {{ $t('account.backToLogin') }}
          </b-button>
          <b-button
            variant="success"
            class="float-right"
            @click="forgotPassword()"
          >
            Send
          </b-button>
        </div>
      </div>
      <p v-else>
        {{ $t('message.forgotSent') }}
      </p>
    </div>
  </div>
</template> -->

<template>
  <div class="pt-4 pb-4">
    <!-- LOGIN -->
    <div v-if="!forgot">
      <h2 class="p-2">{{ $t('account.loginTitle') }}</h2>

      <div v-if="errors.length" class="mb-3">
        <BAlert
          v-for="(error, index) in errors"
          :key="index"
          variant="danger"
          show
        >
          {{ error }}
        </BAlert>
      </div>

      <BForm @submit.prevent="submit()">
        <BFormGroup
          class="m-2 mt-4"
          :description="$t('register.lgName')"
        >
          <BFormInput
            v-model="credentials.username"
            type="text"
            autocomplete="username"
            :placeholder="$t('user.usernameEmail')"
          />
        </BFormGroup>

        <BFormGroup
          class="m-2 mt-4 mb-4"
          :description="$t('register.lgPass')"
        >
          <BFormInput
            v-model="credentials.password"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('user.enterPassword')"
          />
        </BFormGroup>

        <div class="m-2 mt-4 d-flex">
  <BButton
    variant="warning"
    type="button"
    @click="forgot = true"
  >
    {{ $t('account.forgotPassword') }}
  </BButton>
  <BButton
    variant="primary"
    class="ms-auto"
    type="submit"
  >
    {{ $t('account.login') }}
  </BButton>
</div>
      </BForm>
    </div>

    <!-- RESET PASSWORD -->
    <div v-else>
      <h2>{{ $t('account.passwordReset') }}</h2>

      <div v-if="!sent">
        <p>{{ $t('message.resetPassword') }}</p>

        <BFormGroup class="m-2">
          <BFormInput
            v-model="forgotCredentials.email"
            type="email"
            :placeholder="$t('user.enterEmail')"
            autocomplete="email"
          />
        </BFormGroup>

        <div class="m-2 d-flex">
  <BButton variant="primary" @click="forgot = false">
    {{ $t('account.backToLogin') }}
  </BButton>
  <BButton
    variant="success"
    class="ms-auto"
    @click="forgotPassword()"
  >
    Send
  </BButton>
</div>
      </div>

      <p v-else>
        {{ $t('message.forgotSent') }}
      </p>
    </div>
  </div>
</template>
<script>
import {
  BAlert,
  BForm,
  BFormGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'

// You only need to import CSS once in your app entrypoint (main.js),
// but if you haven't yet, you can also import it here:
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

export default {
  name: 'LoginForm',
  components: {
    BAlert,
    BForm,
    BFormGroup,
    BFormInput,
    BButton
  },
  data() {
    return {
      credentials: { username: '', password: '' },
      errors: [],
      forgot: false,
      forgotCredentials: { email: '' },
      sent: false
    }
  },
  beforeUnmount() {
    this.sent = false
  },
  methods: {
  resetState() {
    this.credentials = { username: '', password: '' }
    this.errors = []
    this.forgot = false
    this.sent = false
    this.forgotCredentials = { email: '' }
  },
  submit() {
    this.errors = []
    const payload = { password: this.credentials.password }
    if (this.validateEmail(this.credentials.username)) {
      payload.email = this.credentials.username
    } else {
      payload.username = this.credentials.username
    }
    this.$auth.login(this, payload, '/dashboard')
      
    setTimeout(() => {
      // this.$router.go();
      // this.$router.push({ path: '/dashboard' });
       window.location.href = '/dashboard';
    
    }, 1000)
  },
  forgotPassword() {
    this.$axios
      .post('auth/resetPassword', this.forgotCredentials)
      .then(() => { this.sent = true })
      .catch(() => { this.sent = true })
  },
  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }
}
}
</script>

<style scoped>
/* add any additional scoped styles if needed */
</style>