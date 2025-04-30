<template>
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
</template>

<script>

  export default {
    data () {
      return {
        credentials: {
          username: '',
          password: ''
        },
        errors: [],
        forgot: false,
        forgotCredentials: {
          email: ''
        },
        sent: false
      }
    },
    beforeUnmount () {
      this.sent = false
    },
    methods: {
      submit () {
        this.errors=[]
        let credentials = {
          password: this.credentials.password
        }

        if (this.validateEmail(this.credentials.username)) {
          credentials.email = this.credentials.username
        } else {
          credentials.username = this.credentials.username
        }

        this.$auth.login(this, credentials, '/dashboard')
      },
      forgotPassword () {
        this.$axios.post('auth/resetPassword', this.forgotCredentials).then(
        () => {
          this.sent = true
        },
        () => {
          this.sent = true
        })
      },
      validateEmail (email) {
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
      }
    }
  }
</script>

<style scoped>
</style>
