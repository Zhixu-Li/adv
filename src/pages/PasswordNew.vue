<template>
  <div class="centered">
    <b-card :header="$t('account.passwordReset')">
      <b-card-text>
        <div
          v-if="errors.length > 0"
          class="alert alert-danger"
        >
          <ul>
            <li
              v-for="error in errors"
              :key="error"
            >
              {{ error }}
            </li>
          </ul>
        </div>
        <b-form
          v-if="!sent"
          @submit.prevent="submit()"
        >
          <p>
            {{ $t('message.resetPasswordDo') }}
          </P>
          <b-row class="p-2">
            <b-col cols="6">
              <b-form-group
                label="Password:"
                description="Must be at least 8 characters."
              >
                <b-form-input
                  v-model="password"
                  type="password"
                  class="mb-1"
                  :placeholder="$t('user.newPassword')"
                  :state="password ? password.length >= 8 : null"
                />
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group
                label="Confirm Password:"
                description="Re-type the password."
              >
                <b-form-input
                  v-model="confirmPassword"
                  type="password"
                  class="mb-1"
                  :placeholder="$t('user.confirmPassword')"
                  :state="password && confirmPassword && password.length >= 8 ? confirmPassword===password : null"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-button
            class="mb-3 float-right"
            variant="primary"
            type="submit"
          >
            {{ $t('account.resetPassword') }}
          </b-button>
        </b-form>
        <p v-if="sent && success">
          {{ $t('notifications.passwordSuccess') }}
        </p>
        <p v-if="sent && !success">
          {{ $t('notifications.passwordFailure') }}
        </p>
      </b-card-text>
    </b-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      errors: '',
      password: '',
      confirmPassword: '',
      sent: false,
      success: false
    }
  },
  mounted () {
  },
  methods: {
    submit () {
      if (this.validatePassword()) {
        var credentials = {
          password: this.password
        }

        this.$axios.post('auth/resetPassword/' + this.$route.params.reAuthToken, credentials).then(
        () => {
          this.sent = true
          this.success = true
        }, () => {
          this.$notifications.add({
            title: 'Alert',
            type: 'warning',
            body: 'There was a problem resetting your password',
            timeout: true
          })
        })
      }
    },
    validatePassword () {
      this.errors = []
      if (this.password.length < 8) {
        this.errors.push('Password must be a minimum of 8 characters')
      }
      if (this.password !== this.confirmPassword) {
        this.errors.push('Passwords do not match')
      } else if (this.password.length >= 8) {
        return true
      }
      return false
    }
  }
}

</script>
<style scoped>
.centered {
    left: auto;
    position: relative;
    top: 25%;
    width: 35%;
    transform: translateY(-50%);
    margin: auto;
}
</style>
