<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
  <BRow>
    <BCol cols="12">
      <h4>{{ $t('user.update') }}</h4>

      <div v-if="errors.length > 0" class="col-12 alert alert-danger">
        <ul>
          <li v-for="(error, index) in errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <BFormGroup :label="$t('user.username')" label-for="username">
        <BFormInput id="username" v-model="update.username" />
      </BFormGroup>

      <BFormGroup :label="$t('user.email')" label-for="email">
        <BFormInput id="email" v-model="update.email" />
      </BFormGroup>

      <BFormGroup
        v-if="!$auth.user.admin"
        :label="$t('user.currentPassword')"
        label-for="current-password"
      >
        <BFormInput
          id="current-password"
          v-model="update.password"
          type="password"
        />
      </BFormGroup>

      <BRow>
        <BCol cols="6">
          <BFormGroup
            :label="$t('user.newPassword')"
            description="Must be at least 8 characters."
            label-for="new-password"
          >
            <BFormInput
              id="new-password"
              v-model="update.newPassword"
              type="password"
              :state="update.newPassword ? update.newPassword.length >= 8 : null"
            />
          </BFormGroup>
        </BCol>

        <BCol cols="6">
          <BFormGroup
            :label="$t('user.confirmPassword')"
            description="Re-type the password."
            label-for="confirm-password"
          >
            <BFormInput
              id="confirm-password"
              v-model="update.confirmPassword"
              type="password"
              :state="update.newPassword && update.confirmPassword && update.newPassword.length >= 8
                ? update.confirmPassword === update.newPassword
                : null"
            />
          </BFormGroup>
        </BCol>
      </BRow>

      <BButton
        class="mt-3 float-right"
        variant="primary"
        @click="updateAccount()"
      >
        {{ $t('buttons.update') }}
      </BButton>
    </BCol>
  </BRow>
</template>

<script>
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-next'
export default{
    components: {
    BRow,
    BCol,
    BFormGroup,
    BFormInput,
    BButton
  },
  name: 'EditUser',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      errors: [],
      update: {
        username: this.user.username,
        email: this.user.email,
        password: '',
        newPassword: ''
      },
      confirmPassword: '',
      updated: false
    }
  },
  methods: {
    updateAccount: function () {
      this.removeEmpties(this.update)
      if (this.validateMe()) {
        this.$axios.post('v1/users/' + this.user.userId, this.update).then(
          () => {
            this.$notifications.add({
              title: 'Account Updated',
              type: 'success',
              body: this.$t('notifications.accountUpdate'),
              timeout: true
            })
          },
          (response) => {
            this.$notifications.add({
              title: 'Error',
              type: 'danger',
              body: response.data.message,
              timeout: true
            })
          }
        )
      }
    },
    validateMe () {
      this.errors = []
      var checkEmail = false
      var checkUsername = false
      var checkPasswordChange = false
      if (this.update.email) {
        checkEmail = this.validateEmail()
      } else {
        this.errors.push('Invalid Email')
      }

      if (this.update.username) {
        checkUsername = this.validateUsername()
      } else {
        this.errors.push('Invalid Username')
      }

      if (!this.$auth.user.admin) {
        if (this.update.newPassword) {
          checkPasswordChange = this.validatePasswordChange()
        } else {
          this.errors.push('Invalid Password')
        }
      } else {
        return true
      }

      if (!checkEmail || !checkUsername || !checkPasswordChange) {
        return false
      } else {
        return true
      }
    },
    validateEmail () {
      var emailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRE.test(this.update.email)) {
        this.errors.push('Invalid Email')
        return false
      } else {
        return true
      }
    },
    validateUsername () {
      if (this.update.username.length < 1) {
        this.errors.push('Username must be a minimum of 1 character')
        return false
      } else if (this.update.username.length > 255) {
        this.errors.push('Username must be a maximum of 255 characters')
        return false
      } else {
        return true
      }
    },
    validatePasswordChange () {
      if (this.update.newPassword.length < 8) {
        this.errors.push('Password must be a minimum of 8 characters')
      }
      if (this.update.newPassword !== this.update.confirmPassword) {
        this.errors.push('Passwords do not match')
      } else if (this.update.password.length >= 8) {
        return true
      }
      return false
    },
    removeEmpties (object) {
      var key
      for (key in object) {
        if (!object[key]) {
          delete object[key]
        }
      }
    }
  }
}
</script>
<style>

</style>
